-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  plugin_purchase_id UUID REFERENCES plugin_purchases(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  service_type VARCHAR(100),
  plugin_name VARCHAR(255),
  subtotal DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'paid' CHECK (status IN ('paid', 'cancelled')),
  pdf_url TEXT,
  backup_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wa_logs table for WhatsApp notifications
CREATE TABLE IF NOT EXISTS wa_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  provider VARCHAR(20) DEFAULT 'wablas' CHECK (provider IN ('wablas', 'zenziva', 'ultramsg')),
  response_data JSONB,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  plugin_purchase_id UUID REFERENCES plugin_purchases(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update chat_rooms to support multiple members
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS room_type VARCHAR(20) DEFAULT 'order' CHECK (room_type IN ('order', 'support', 'group'));
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS room_name VARCHAR(255);
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS description TEXT;

-- Create chat_room_members table
CREATE TABLE IF NOT EXISTS chat_room_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('admin', 'client', 'support', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(room_id, user_email)
);

-- Update chats table to support better user identification
ALTER TABLE chats ADD COLUMN IF NOT EXISTS sender_role VARCHAR(20) DEFAULT 'client' CHECK (sender_role IN ('admin', 'client', 'support', 'member'));

-- Create backup_files table
CREATE TABLE IF NOT EXISTS backup_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_type VARCHAR(50) NOT NULL, -- 'invoice', 'order_attachment', 'plugin_file'
  original_url TEXT NOT NULL,
  backup_url TEXT,
  google_drive_id VARCHAR(255),
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  plugin_purchase_id UUID REFERENCES plugin_purchases(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  backup_status VARCHAR(20) DEFAULT 'pending' CHECK (backup_status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for invoices
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_plugin_purchase_id ON invoices(plugin_purchase_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_wa_logs_phone_number ON wa_logs(phone_number);
CREATE INDEX IF NOT EXISTS idx_wa_logs_status ON wa_logs(status);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room_id ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_email ON chat_room_members(user_email);
CREATE INDEX IF NOT EXISTS idx_backup_files_file_type ON backup_files(file_type);
CREATE INDEX IF NOT EXISTS idx_backup_files_backup_status ON backup_files(backup_status);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can view all invoices" ON invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for wa_logs (admin only)
CREATE POLICY "Admins can manage wa_logs" ON wa_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for chat_room_members
CREATE POLICY "Users can view room members if they are members" ON chat_room_members
  FOR SELECT USING (
    user_email = auth.jwt() ->> 'email' OR
    EXISTS (
      SELECT 1 FROM chat_room_members crm 
      WHERE crm.room_id = chat_room_members.room_id 
      AND crm.user_email = auth.jwt() ->> 'email'
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all room members" ON chat_room_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for backup_files (admin only)
CREATE POLICY "Admins can manage backup files" ON backup_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Storage policies for invoices
CREATE POLICY "Users can view their own invoices" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'invoices' AND
    (auth.jwt() ->> 'email') IN (
      SELECT customer_email FROM invoices 
      WHERE pdf_url LIKE '%' || name || '%'
    )
  );

CREATE POLICY "Admins can manage all invoices" ON storage.objects
  FOR ALL WITH CHECK (
    bucket_id = 'invoices' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  current_month TEXT;
  sequence_num INTEGER;
  invoice_num TEXT;
BEGIN
  current_year := TO_CHAR(NOW(), 'YYYY');
  current_month := TO_CHAR(NOW(), 'MM');
  
  -- Get next sequence number for this month
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(invoice_number FROM 'INV-' || current_year || current_month || '-(\d+)') 
      AS INTEGER
    )
  ), 0) + 1
  INTO sequence_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || current_year || current_month || '-%';
  
  invoice_num := 'INV-' || current_year || current_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Function to create invoice after payment
CREATE OR REPLACE FUNCTION create_invoice_after_payment()
RETURNS TRIGGER AS $$
DECLARE
  invoice_num TEXT;
  service_name TEXT;
  plugin_name TEXT;
BEGIN
  -- Only create invoice for paid orders/purchases
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    invoice_num := generate_invoice_number();
    
    -- Check if this is an order or plugin purchase
    IF TG_TABLE_NAME = 'orders' THEN
      -- Get service name
      SELECT name INTO service_name FROM services WHERE id = NEW.service_id;
      
      INSERT INTO invoices (
        invoice_number,
        order_id,
        customer_name,
        customer_email,
        service_type,
        subtotal,
        discount_amount,
        total_amount
      ) VALUES (
        invoice_num,
        NEW.id,
        NEW.customer_name,
        NEW.customer_email,
        COALESCE(service_name, NEW.service_type),
        NEW.amount + COALESCE(NEW.discount_amount, 0),
        COALESCE(NEW.discount_amount, 0),
        NEW.amount
      );
      
    ELSIF TG_TABLE_NAME = 'plugin_purchases' THEN
      -- Get plugin name
      SELECT name INTO plugin_name FROM plugins WHERE id = NEW.plugin_id;
      
      INSERT INTO invoices (
        invoice_number,
        plugin_purchase_id,
        customer_name,
        customer_email,
        plugin_name,
        subtotal,
        discount_amount,
        total_amount
      ) VALUES (
        invoice_num,
        NEW.id,
        NEW.customer_name,
        NEW.customer_email,
        plugin_name,
        NEW.amount + COALESCE(NEW.discount_amount, 0),
        COALESCE(NEW.discount_amount, 0),
        NEW.amount
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for invoice generation
DROP TRIGGER IF EXISTS trigger_create_invoice_order ON orders;
CREATE TRIGGER trigger_create_invoice_order
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_invoice_after_payment();

DROP TRIGGER IF EXISTS trigger_create_invoice_plugin ON plugin_purchases;
CREATE TRIGGER trigger_create_invoice_plugin
  AFTER UPDATE ON plugin_purchases
  FOR EACH ROW
  EXECUTE FUNCTION create_invoice_after_payment();

-- Function to add member to chat room
CREATE OR REPLACE FUNCTION add_chat_room_member(
  room_id_param UUID,
  user_email_param VARCHAR(255),
  user_name_param VARCHAR(255),
  role_param VARCHAR(20) DEFAULT 'member'
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO chat_room_members (room_id, user_email, user_name, role)
  VALUES (room_id_param, user_email_param, user_name_param, role_param)
  ON CONFLICT (room_id, user_email) 
  DO UPDATE SET 
    user_name = EXCLUDED.user_name,
    role = EXCLUDED.role,
    is_active = true,
    joined_at = NOW();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Update existing chat rooms to have members
INSERT INTO chat_room_members (room_id, user_email, user_name, role)
SELECT 
  cr.id,
  cr.client_email,
  cr.client_name,
  'client'
FROM chat_rooms cr
WHERE NOT EXISTS (
  SELECT 1 FROM chat_room_members crm 
  WHERE crm.room_id = cr.id AND crm.user_email = cr.client_email
);

-- Add admin as member to all chat rooms
INSERT INTO chat_room_members (room_id, user_email, user_name, role)
SELECT 
  cr.id,
  'admin@lintangstudio.com',
  'Lintang Studio Admin',
  'admin'
FROM chat_rooms cr
WHERE NOT EXISTS (
  SELECT 1 FROM chat_room_members crm 
  WHERE crm.room_id = cr.id AND crm.user_email = 'admin@lintangstudio.com'
);
