-- Create promos table
CREATE TABLE IF NOT EXISTS promos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('flat', 'percentage')),
  value DECIMAL(10,2) NOT NULL,
  min_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_to VARCHAR(20) DEFAULT 'all' CHECK (applicable_to IN ('all', 'services', 'plugins')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_time_configs table
CREATE TABLE IF NOT EXISTS project_time_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_category VARCHAR(50) NOT NULL,
  base_days INTEGER NOT NULL DEFAULT 1,
  days_per_100m2 DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  complexity_multiplier DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add promo_code and discount_amount to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_completion_days INTEGER;

-- Add promo_code and discount_amount to plugin_purchases table
ALTER TABLE plugin_purchases ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50);
ALTER TABLE plugin_purchases ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- Insert default project time configurations
INSERT INTO project_time_configs (service_category, base_days, days_per_100m2, complexity_multiplier) VALUES
('autocad', 2, 1.5, 1.0),
('sketchup', 3, 2.0, 1.2),
('rab', 1, 0.5, 1.0),
('plugin', 0, 0.0, 1.0)
ON CONFLICT DO NOTHING;

-- Insert sample promo codes
INSERT INTO promos (code, name, description, type, value, min_amount, max_discount, usage_limit, valid_until, applicable_to) VALUES
('DISKON50', 'Diskon Flat 50K', 'Potongan langsung Rp 50.000 untuk semua layanan', 'flat', 50000, 200000, NULL, 100, NOW() + INTERVAL '3 months', 'all'),
('JULI20', 'Diskon Juli 20%', 'Diskon 20% untuk bulan Juli (max 100K)', 'percentage', 20, 100000, 100000, 50, NOW() + INTERVAL '1 month', 'all'),
('PLUGIN10', 'Diskon Plugin 10%', 'Diskon khusus 10% untuk semua plugin', 'percentage', 10, 50000, 50000, 200, NOW() + INTERVAL '6 months', 'plugins'),
('NEWCLIENT', 'Welcome Bonus', 'Diskon Rp 25.000 untuk klien baru', 'flat', 25000, 150000, NULL, 500, NOW() + INTERVAL '1 year', 'services')
ON CONFLICT (code) DO NOTHING;

-- Create function to validate and apply promo
CREATE OR REPLACE FUNCTION apply_promo_discount(
  promo_code_input VARCHAR(50),
  order_amount DECIMAL(10,2),
  order_type VARCHAR(20) DEFAULT 'all'
)
RETURNS JSON AS $$
DECLARE
  promo_record promos%ROWTYPE;
  discount_amount DECIMAL(10,2) := 0;
  final_amount DECIMAL(10,2);
  result JSON;
BEGIN
  -- Get promo details
  SELECT * INTO promo_record 
  FROM promos 
  WHERE code = promo_code_input 
    AND is_active = true 
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND (applicable_to = 'all' OR applicable_to = order_type)
    AND (usage_limit IS NULL OR used_count < usage_limit);

  -- Check if promo exists and is valid
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'message', 'Kode promo tidak valid atau sudah expired',
      'discount_amount', 0,
      'final_amount', order_amount
    );
  END IF;

  -- Check minimum amount
  IF order_amount < promo_record.min_amount THEN
    RETURN json_build_object(
      'valid', false,
      'message', 'Minimum pembelian Rp ' || promo_record.min_amount || ' untuk menggunakan kode ini',
      'discount_amount', 0,
      'final_amount', order_amount
    );
  END IF;

  -- Calculate discount
  IF promo_record.type = 'flat' THEN
    discount_amount := promo_record.value;
  ELSIF promo_record.type = 'percentage' THEN
    discount_amount := (order_amount * promo_record.value / 100);
    -- Apply max discount limit
    IF promo_record.max_discount IS NOT NULL AND discount_amount > promo_record.max_discount THEN
      discount_amount := promo_record.max_discount;
    END IF;
  END IF;

  -- Ensure discount doesn't exceed order amount
  IF discount_amount > order_amount THEN
    discount_amount := order_amount;
  END IF;

  final_amount := order_amount - discount_amount;

  RETURN json_build_object(
    'valid', true,
    'message', promo_record.description,
    'discount_amount', discount_amount,
    'final_amount', final_amount,
    'promo_name', promo_record.name,
    'promo_type', promo_record.type,
    'promo_value', promo_record.value
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate project completion time
CREATE OR REPLACE FUNCTION calculate_project_time(
  service_category_input VARCHAR(50),
  area_m2 DECIMAL(10,2),
  complexity_factor DECIMAL(3,1) DEFAULT 1.0
)
RETURNS JSON AS $$
DECLARE
  config_record project_time_configs%ROWTYPE;
  estimated_days DECIMAL(5,1);
  working_days INTEGER;
  completion_date DATE;
  result JSON;
BEGIN
  -- Get time configuration
  SELECT * INTO config_record 
  FROM project_time_configs 
  WHERE service_category = service_category_input 
    AND is_active = true;

  -- Use default if not found
  IF NOT FOUND THEN
    config_record.base_days := 3;
    config_record.days_per_100m2 := 1.5;
    config_record.complexity_multiplier := 1.0;
  END IF;

  -- Calculate estimated days
  estimated_days := config_record.base_days + (area_m2 / 100.0 * config_record.days_per_100m2);
  estimated_days := estimated_days * complexity_factor * config_record.complexity_multiplier;
  
  -- Round up to nearest working day
  working_days := CEIL(estimated_days);
  
  -- Calculate completion date (excluding weekends)
  completion_date := CURRENT_DATE;
  FOR i IN 1..working_days LOOP
    completion_date := completion_date + INTERVAL '1 day';
    -- Skip weekends
    WHILE EXTRACT(DOW FROM completion_date) IN (0, 6) LOOP
      completion_date := completion_date + INTERVAL '1 day';
    END LOOP;
  END LOOP;

  RETURN json_build_object(
    'estimated_days', working_days,
    'completion_date', completion_date,
    'description', working_days || ' hari kerja (estimasi selesai: ' || TO_CHAR(completion_date, 'DD Mon YYYY') || ')'
  );
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_time_configs ENABLE ROW LEVEL SECURITY;

-- Allow public to read active promos
CREATE POLICY "Allow public to read active promos" ON promos
  FOR SELECT USING (is_active = true);

-- Allow public to read time configs
CREATE POLICY "Allow public to read time configs" ON project_time_configs
  FOR SELECT USING (is_active = true);

-- Allow admin full access to promos
CREATE POLICY "Allow admin full access to promos" ON promos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow admin full access to time configs
CREATE POLICY "Allow admin full access to time configs" ON project_time_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
