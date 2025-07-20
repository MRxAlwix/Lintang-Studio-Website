-- Create services table for dynamic pricing
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  price_per_m2 DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_area DECIMAL(8,2) NOT NULL DEFAULT 36,
  complexity_factor DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  category TEXT NOT NULL CHECK (category IN ('autocad', 'sketchup', 'rab', 'plugin')),
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default services
INSERT INTO services (name, description, base_price, price_per_m2, min_area, complexity_factor, category, features) VALUES
('AutoCAD 2D Basic', 'Gambar teknik 2D dasar untuk proyek konstruksi', 300000, 15000, 36, 1.0, 'autocad', '["Denah Bangunan", "Tampak Depan/Belakang", "Potongan", "Detail Konstruksi"]'),
('AutoCAD 2D Premium', 'Gambar teknik 2D lengkap dengan detail konstruksi', 500000, 25000, 36, 1.2, 'autocad', '["Denah Lengkap", "Tampak 4 Sisi", "Potongan A-A & B-B", "Detail Konstruksi", "Shop Drawing", "As Built Drawing"]'),
('SketchUp 3D Basic', 'Visualisasi 3D sederhana untuk presentasi', 400000, 20000, 36, 1.1, 'sketchup', '["3D Modeling", "Basic Rendering", "2-3 View Angle", "Basic Material"]'),
('SketchUp 3D Premium', 'Visualisasi 3D premium dengan rendering realistis', 750000, 35000, 36, 1.5, 'sketchup', '["3D Modeling Detail", "Realistic Rendering", "Multiple View Angles", "Advanced Material", "Lighting Setup", "Walkthrough Animation"]'),
('RAB Sederhana', 'Rencana Anggaran Biaya untuk proyek kecil', 250000, 12000, 36, 1.0, 'rab', '["Analisa Harga Satuan", "Bill of Quantity", "Rekapitulasi Biaya"]'),
('RAB Lengkap', 'Rencana Anggaran Biaya lengkap dengan time schedule', 400000, 18000, 36, 1.3, 'rab', '["Analisa Harga Satuan Detail", "Bill of Quantity", "Rekapitulasi Biaya", "Time Schedule", "Cash Flow", "Kurva S"]');

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Anyone can view active services
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT USING (is_active = true);

-- Admins can manage all services
CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to get table info (for database viewer)
CREATE OR REPLACE FUNCTION get_table_info()
RETURNS TABLE(table_name TEXT, row_count BIGINT, size TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::TEXT,
    COALESCE(s.n_tup_ins - s.n_tup_del, 0) as row_count,
    pg_size_pretty(pg_total_relation_size(c.oid))::TEXT as size
  FROM information_schema.tables t
  LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
  LEFT JOIN pg_class c ON c.relname = t.table_name
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT LIKE '%_pkey'
    AND t.table_name NOT LIKE 'pg_%'
  ORDER BY t.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
