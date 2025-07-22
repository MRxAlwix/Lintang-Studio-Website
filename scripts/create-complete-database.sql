-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'client', 'moderator');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE chat_room_status AS ENUM ('active', 'closed', 'archived');
CREATE TYPE message_type AS ENUM ('text', 'file', 'image', 'system');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  role user_role DEFAULT 'client',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'autocad', 'sketchup', 'rab', 'plugin'
  base_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  price_per_m2 DECIMAL(10,2) DEFAULT 0,
  min_area INTEGER DEFAULT 1,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plugins table
CREATE TABLE plugins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  category TEXT NOT NULL, -- 'autocad', 'sketchup'
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  file_url TEXT,
  file_size BIGINT,
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  features JSONB DEFAULT '[]',
  preview_images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service_id UUID REFERENCES services(id),
  plugin_id UUID REFERENCES plugins(id),
  area DECIMAL(10,2),
  description TEXT,
  files JSONB DEFAULT '[]',
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  total_amount DECIMAL(12,2) NOT NULL,
  promo_code TEXT,
  promo_discount DECIMAL(10,2) DEFAULT 0,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  payment_token TEXT,
  payment_url TEXT,
  invoice_url TEXT,
  deadline DATE,
  estimated_duration INTEGER, -- in days
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT,
  payment_provider TEXT, -- 'midtrans', 'tripay'
  transaction_id TEXT UNIQUE,
  status payment_status DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plugin purchases table
CREATE TABLE plugin_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  promo_code TEXT,
  promo_discount DECIMAL(10,2) DEFAULT 0,
  payment_status payment_status DEFAULT 'pending',
  payment_token TEXT,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat rooms table
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status chat_room_status DEFAULT 'active',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat room members table
CREATE TABLE chat_room_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  sender_name TEXT NOT NULL,
  sender_type TEXT NOT NULL, -- 'admin', 'client'
  message_type message_type DEFAULT 'text',
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  is_spam BOOLEAN DEFAULT false,
  spam_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate limiting table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_identifier TEXT NOT NULL, -- email or IP
  room_id UUID REFERENCES chat_rooms(id),
  action_type TEXT NOT NULL, -- 'message', 'file_upload'
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_identifier, room_id, action_type, window_start)
);

-- Anti-spam tracking
CREATE TABLE spam_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_identifier TEXT NOT NULL,
  room_id UUID REFERENCES chat_rooms(id),
  consecutive_messages INTEGER DEFAULT 0,
  spam_score INTEGER DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_blocked BOOLEAN DEFAULT false,
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_identifier, room_id)
);

-- Promo codes table
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'percentage', 'fixed'
  value DECIMAL(10,2) NOT NULL,
  min_amount DECIMAL(12,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  applicable_to TEXT DEFAULT 'all', -- 'all', 'services', 'plugins'
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promo usage tracking
CREATE TABLE promo_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  plugin_purchase_id UUID REFERENCES plugin_purchases(id),
  customer_email TEXT NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio table
CREATE TABLE portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  project_url TEXT,
  client_name TEXT,
  completion_date DATE,
  technologies JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_company TEXT,
  client_avatar TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  project_type TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WhatsApp logs table
CREATE TABLE wa_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_phone TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  message_content TEXT NOT NULL,
  status TEXT NOT NULL, -- 'sent', 'failed', 'delivered'
  provider TEXT NOT NULL, -- 'wablas', 'zenziva', 'ultramsg'
  response_data JSONB DEFAULT '{}',
  error_message TEXT,
  order_id UUID REFERENCES orders(id),
  plugin_purchase_id UUID REFERENCES plugin_purchases(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id),
  plugin_purchase_id UUID REFERENCES plugin_purchases(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  service_type TEXT,
  plugin_name TEXT,
  subtotal DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'paid',
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_rate_limits_user_room ON rate_limits(user_identifier, room_id);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_plugin_purchases_email ON plugin_purchases(customer_email);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Services policies (public read, admin write)
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Plugins policies (public read, admin write)
CREATE POLICY "Anyone can view active plugins" ON plugins
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plugins" ON plugins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Orders policies
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (
    customer_email = (SELECT email FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Chat policies
CREATE POLICY "Room members can view messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_room_members 
      WHERE room_id = chat_messages.room_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Room members can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_room_members 
      WHERE room_id = chat_messages.room_id 
      AND user_id = auth.uid()
    )
  );

-- Portfolio and testimonials (public read, admin write)
CREATE POLICY "Anyone can view portfolio" ON portfolio
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view approved testimonials" ON testimonials
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Admins can manage portfolio" ON portfolio
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage testimonials" ON testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Functions and triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugins_updated_at BEFORE UPDATE ON plugins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@lintangstudio.com' THEN 'admin'
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@lintangstudio.com' THEN 'admin'
      ELSE 'client'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to create chat room after order payment
CREATE OR REPLACE FUNCTION create_chat_room_for_order()
RETURNS TRIGGER AS $$
DECLARE
  room_id UUID;
  admin_profile_id UUID;
BEGIN
  -- Only create chat room when payment status changes to 'paid'
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    -- Get admin profile ID
    SELECT id INTO admin_profile_id 
    FROM profiles 
    WHERE role = 'admin' 
    LIMIT 1;

    -- Create chat room
    INSERT INTO chat_rooms (order_id, title, description, created_by)
    VALUES (
      NEW.id,
      'Order #' || NEW.id,
      'Chat room for order: ' || COALESCE(NEW.description, 'Custom project'),
      admin_profile_id
    )
    RETURNING id INTO room_id;

    -- Add admin as member
    IF admin_profile_id IS NOT NULL THEN
      INSERT INTO chat_room_members (room_id, user_id, role)
      VALUES (room_id, admin_profile_id, 'admin');
    END IF;

    -- Add customer as member (if they have a profile)
    INSERT INTO chat_room_members (room_id, user_id, role)
    SELECT room_id, p.user_id, 'member'
    FROM profiles p
    WHERE p.email = NEW.customer_email;

  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for chat room creation
CREATE TRIGGER create_chat_room_on_payment
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_chat_room_for_order();

-- Function to update plugin download count
CREATE OR REPLACE FUNCTION increment_plugin_downloads()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE plugins 
  SET download_count = download_count + 1
  WHERE id = NEW.plugin_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for plugin download tracking
CREATE TRIGGER increment_downloads_on_purchase
  AFTER UPDATE ON plugin_purchases
  FOR EACH ROW
  WHEN (NEW.download_count > OLD.download_count)
  EXECUTE FUNCTION increment_plugin_downloads();
