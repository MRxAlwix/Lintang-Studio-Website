-- Add anti-spam columns to chat_rooms table
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS spam_score INTEGER DEFAULT 0;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS last_message_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS consecutive_messages INTEGER DEFAULT 0;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS is_input_disabled BOOLEAN DEFAULT false;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS disabled_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS user_status TEXT DEFAULT 'active' CHECK (user_status IN ('active', 'frequent_asker', 'spam_warning', 'temporarily_blocked', 'unpaid'));

-- Add rate limiting columns to chats table
ALTER TABLE chats ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT false;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS spam_reason TEXT;

-- Create chat_user_stats table for tracking user behavior
CREATE TABLE IF NOT EXISTS chat_user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  total_messages INTEGER DEFAULT 0,
  messages_without_admin_reply INTEGER DEFAULT 0,
  last_message_time TIMESTAMP WITH TIME ZONE,
  rate_limit_violations INTEGER DEFAULT 0,
  spam_warnings INTEGER DEFAULT 0,
  is_rate_limited BOOLEAN DEFAULT false,
  rate_limit_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_email)
);

-- Create chat_screening table for pre-chat form
CREATE TABLE IF NOT EXISTS chat_screening (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'urgent')),
  issue_category TEXT NOT NULL CHECK (issue_category IN ('general', 'technical', 'billing', 'revision', 'timeline', 'other')),
  description TEXT NOT NULL,
  expected_response_time TEXT,
  has_files BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE chat_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_screening ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_user_stats
CREATE POLICY "Users can view own stats" ON chat_user_stats
  FOR SELECT USING (
    user_email = auth.jwt() ->> 'email' OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can manage stats" ON chat_user_stats
  FOR ALL USING (true);

-- RLS Policies for chat_screening
CREATE POLICY "Users can view own screening" ON chat_screening
  FOR SELECT USING (
    customer_email = auth.jwt() ->> 'email' OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create screening" ON chat_screening
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage screening" ON chat_screening
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Function to check rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(p_room_id UUID, p_user_email TEXT)
RETURNS JSONB AS $$
DECLARE
  v_stats RECORD;
  v_room RECORD;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
  v_rate_limit_seconds INTEGER := 5;
  v_max_consecutive INTEGER := 10;
  v_result JSONB;
BEGIN
  -- Get room info
  SELECT * INTO v_room FROM chat_rooms WHERE id = p_room_id;
  
  -- Check if room exists and payment is confirmed
  IF v_room IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'room_not_found');
  END IF;
  
  -- Check if user has paid (room exists means payment was successful)
  -- Additional check: ensure order is actually paid
  IF NOT EXISTS (
    SELECT 1 FROM orders 
    WHERE id = v_room.order_id 
    AND status IN ('paid', 'in_progress', 'completed')
  ) THEN
    UPDATE chat_rooms SET user_status = 'unpaid' WHERE id = p_room_id;
    RETURN jsonb_build_object('allowed', false, 'reason', 'payment_not_confirmed');
  END IF;
  
  -- Get or create user stats
  INSERT INTO chat_user_stats (room_id, user_email)
  VALUES (p_room_id, p_user_email)
  ON CONFLICT (room_id, user_email) DO NOTHING;
  
  SELECT * INTO v_stats FROM chat_user_stats 
  WHERE room_id = p_room_id AND user_email = p_user_email;
  
  -- Check if user is currently rate limited
  IF v_stats.is_rate_limited AND v_stats.rate_limit_until > v_now THEN
    RETURN jsonb_build_object(
      'allowed', false, 
      'reason', 'rate_limited',
      'retry_after', EXTRACT(EPOCH FROM (v_stats.rate_limit_until - v_now))
    );
  END IF;
  
  -- Check if room input is disabled
  IF v_room.is_input_disabled AND v_room.disabled_until > v_now THEN
    RETURN jsonb_build_object(
      'allowed', false, 
      'reason', 'input_disabled',
      'retry_after', EXTRACT(EPOCH FROM (v_room.disabled_until - v_now))
    );
  END IF;
  
  -- Check rate limiting (5 seconds between messages)
  IF v_stats.last_message_time IS NOT NULL AND 
     v_stats.last_message_time + INTERVAL '5 seconds' > v_now THEN
    
    -- Increment rate limit violations
    UPDATE chat_user_stats 
    SET rate_limit_violations = rate_limit_violations + 1,
        updated_at = v_now
    WHERE room_id = p_room_id AND user_email = p_user_email;
    
    -- If too many violations, temporarily block
    IF v_stats.rate_limit_violations >= 3 THEN
      UPDATE chat_user_stats 
      SET is_rate_limited = true,
          rate_limit_until = v_now + INTERVAL '1 minute',
          updated_at = v_now
      WHERE room_id = p_room_id AND user_email = p_user_email;
      
      UPDATE chat_rooms 
      SET user_status = 'spam_warning'
      WHERE id = p_room_id;
    END IF;
    
    RETURN jsonb_build_object(
      'allowed', false, 
      'reason', 'rate_limit_exceeded',
      'retry_after', 5
    );
  END IF;
  
  -- Check consecutive messages without admin reply
  IF v_stats.messages_without_admin_reply >= v_max_consecutive THEN
    UPDATE chat_rooms 
    SET is_input_disabled = true,
        disabled_until = v_now + INTERVAL '30 minutes',
        user_status = 'temporarily_blocked'
    WHERE id = p_room_id;
    
    RETURN jsonb_build_object(
      'allowed', false, 
      'reason', 'too_many_consecutive_messages',
      'retry_after', 1800
    );
  END IF;
  
  -- All checks passed
  RETURN jsonb_build_object('allowed', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user stats after sending message
CREATE OR REPLACE FUNCTION update_user_stats_after_message(p_room_id UUID, p_user_email TEXT, p_sender_type TEXT)
RETURNS VOID AS $$
DECLARE
  v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  IF p_sender_type = 'client' THEN
    -- Update user stats
    UPDATE chat_user_stats 
    SET total_messages = total_messages + 1,
        messages_without_admin_reply = messages_without_admin_reply + 1,
        last_message_time = v_now,
        updated_at = v_now
    WHERE room_id = p_room_id AND user_email = p_user_email;
    
    -- Update room stats
    UPDATE chat_rooms 
    SET consecutive_messages = consecutive_messages + 1,
        last_message_time = v_now,
        spam_score = CASE 
          WHEN consecutive_messages > 5 THEN spam_score + 1
          ELSE spam_score
        END
    WHERE id = p_room_id;
    
    -- Update user status based on behavior
    UPDATE chat_rooms 
    SET user_status = CASE
      WHEN consecutive_messages > 15 THEN 'temporarily_blocked'
      WHEN consecutive_messages > 8 THEN 'frequent_asker'
      WHEN spam_score > 5 THEN 'spam_warning'
      ELSE 'active'
    END
    WHERE id = p_room_id;
    
  ELSIF p_sender_type = 'admin' THEN
    -- Reset consecutive messages when admin replies
    UPDATE chat_user_stats 
    SET messages_without_admin_reply = 0,
        updated_at = v_now
    WHERE room_id = p_room_id AND user_email = p_user_email;
    
    UPDATE chat_rooms 
    SET consecutive_messages = 0,
        spam_score = GREATEST(0, spam_score - 2),
        is_input_disabled = false,
        disabled_until = NULL,
        user_status = CASE
          WHEN user_status = 'temporarily_blocked' THEN 'active'
          WHEN user_status = 'spam_warning' THEN 'active'
          ELSE user_status
        END
    WHERE id = p_room_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update stats when message is sent
CREATE OR REPLACE FUNCTION trigger_update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_user_stats_after_message(NEW.room_id, NEW.sender_id, NEW.sender_type);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_chat_stats_update
  AFTER INSERT ON chats
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_user_stats();

-- Function to get user status summary for admin
CREATE OR REPLACE FUNCTION get_user_status_summary(p_room_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_room RECORD;
  v_stats RECORD;
  v_order RECORD;
  v_result JSONB;
BEGIN
  -- Get room info
  SELECT * INTO v_room FROM chat_rooms WHERE id = p_room_id;
  
  -- Get user stats
  SELECT * INTO v_stats FROM chat_user_stats 
  WHERE room_id = p_room_id AND user_email = v_room.client_email;
  
  -- Get order info
  SELECT * INTO v_order FROM orders WHERE id = v_room.order_id;
  
  v_result := jsonb_build_object(
    'user_status', COALESCE(v_room.user_status, 'active'),
    'payment_status', COALESCE(v_order.status, 'unknown'),
    'spam_score', COALESCE(v_room.spam_score, 0),
    'consecutive_messages', COALESCE(v_room.consecutive_messages, 0),
    'total_messages', COALESCE(v_stats.total_messages, 0),
    'messages_without_reply', COALESCE(v_stats.messages_without_admin_reply, 0),
    'rate_limit_violations', COALESCE(v_stats.rate_limit_violations, 0),
    'is_input_disabled', COALESCE(v_room.is_input_disabled, false),
    'is_rate_limited', COALESCE(v_stats.is_rate_limited, false),
    'last_message_time', v_room.last_message_time,
    'disabled_until', v_room.disabled_until,
    'rate_limit_until', v_stats.rate_limit_until
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
