-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  service_type TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL, -- 'admin' or client email
  sender_name TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'client')),
  message TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-files', 'chat-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_order_id ON chat_rooms(order_id);
CREATE INDEX IF NOT EXISTS idx_chats_room_id ON chats(room_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Clients can view own chat rooms" ON chat_rooms
  FOR SELECT USING (client_email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can view all chat rooms" ON chat_rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for chats
CREATE POLICY "Users can view chats in their rooms" ON chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE id = chats.room_id 
      AND (client_email = auth.jwt() ->> 'email' OR 
           EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Users can insert chats in their rooms" ON chats
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE id = chats.room_id 
      AND (client_email = auth.jwt() ->> 'email' OR 
           EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Users can update their own chats" ON chats
  FOR UPDATE USING (
    sender_id = COALESCE(auth.jwt() ->> 'email', 'admin') OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Storage policies for chat files
CREATE POLICY "Users can upload chat files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chat-files');

CREATE POLICY "Users can view chat files" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-files');

-- Function to create chat room after successful payment
CREATE OR REPLACE FUNCTION create_chat_room_after_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create chat room for paid orders
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    INSERT INTO chat_rooms (order_id, client_name, client_email, service_type)
    VALUES (NEW.id, NEW.customer_name, NEW.customer_email, NEW.service_type);
    
    -- Insert welcome message from admin
    INSERT INTO chats (
      room_id, 
      sender_id, 
      sender_name, 
      sender_type, 
      message
    )
    SELECT 
      cr.id,
      'admin',
      'Lintang Studio',
      'admin',
      'Selamat datang! Terima kasih atas kepercayaan Anda. Tim kami akan segera memulai pengerjaan proyek Anda. Silakan gunakan chat ini untuk komunikasi selama proses pengerjaan.'
    FROM chat_rooms cr
    WHERE cr.order_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for orders table
CREATE OR REPLACE TRIGGER trigger_create_chat_room
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_chat_room_after_payment();
