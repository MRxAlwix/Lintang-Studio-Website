-- Create plugins table
CREATE TABLE IF NOT EXISTS plugins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('autocad', 'sketchup')),
  file_url TEXT,
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0,
  features JSONB DEFAULT '[]',
  preview_images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plugin purchases table
CREATE TABLE IF NOT EXISTS plugin_purchases (
  id TEXT PRIMARY KEY,
  plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'cancelled')),
  payment_token TEXT,
  payment_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for plugin files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('plugin-files', 'plugin-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_purchases ENABLE ROW LEVEL SECURITY;

-- Anyone can view active plugins
CREATE POLICY "Anyone can view active plugins" ON plugins
  FOR SELECT USING (is_active = true);

-- Admins can manage all plugins
CREATE POLICY "Admins can manage plugins" ON plugins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Anyone can create plugin purchases
CREATE POLICY "Anyone can create plugin purchases" ON plugin_purchases
  FOR INSERT WITH CHECK (true);

-- Customers can view their own purchases
CREATE POLICY "Customers can view own purchases" ON plugin_purchases
  FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases" ON plugin_purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Storage policies for plugin files
CREATE POLICY "Admins can upload plugin files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'plugin-files' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can download plugin files" ON storage.objects
  FOR SELECT USING (bucket_id = 'plugin-files');

-- Update webhook handler to include plugin purchases
CREATE OR REPLACE FUNCTION handle_payment_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle plugin purchases
  IF EXISTS (SELECT 1 FROM plugin_purchases WHERE id = NEW.order_id) THEN
    UPDATE plugin_purchases 
    SET 
      status = CASE 
        WHEN NEW.transaction_status IN ('capture', 'settlement') THEN 'paid'
        WHEN NEW.transaction_status = 'pending' THEN 'pending_payment'
        ELSE 'cancelled'
      END,
      payment_status = NEW.transaction_status,
      updated_at = NOW()
    WHERE id = NEW.order_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
