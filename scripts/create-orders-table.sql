-- Create orders table for the new order system
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  service_type TEXT NOT NULL,
  area DECIMAL(10,2) NOT NULL,
  notes TEXT,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'in_progress', 'completed', 'cancelled')),
  payment_status TEXT,
  payment_token TEXT,
  files JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for order files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('order-files', 'order-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public to insert orders (for new customers)
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow customers to view their own orders
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

-- Allow admins to view and manage all orders
CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for order files storage
CREATE POLICY "Anyone can upload order files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'order-files');

CREATE POLICY "Admins can view all order files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'order-files' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
