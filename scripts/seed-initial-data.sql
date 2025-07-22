-- Insert initial services
INSERT INTO services (name, description, category, base_price, price_per_m2, min_area, features, is_active, sort_order) VALUES
(
  'AutoCAD 2D Basic',
  'Gambar teknik 2D profesional untuk kebutuhan konstruksi dasar',
  'autocad',
  300000,
  15000,
  36,
  '["Denah lantai", "Tampak depan/belakang", "Potongan A-A", "Detail konstruksi dasar", "File DWG original"]',
  true,
  1
),
(
  'AutoCAD 2D Premium',
  'Paket lengkap gambar teknik 2D dengan detail konstruksi kompleks',
  'autocad',
  500000,
  25000,
  36,
  '["Denah lengkap semua lantai", "Tampak 4 sisi", "Potongan memanjang & melintang", "Detail konstruksi lengkap", "Rencana pondasi", "Rencana atap", "File DWG + PDF"]',
  true,
  2
),
(
  'SketchUp 3D Basic',
  'Visualisasi 3D sederhana untuk presentasi proyek',
  'sketchup',
  400000,
  20000,
  36,
  '["3D modeling eksterior", "Rendering basic", "3-5 angle view", "Material dasar", "File SKP original"]',
  true,
  3
),
(
  'SketchUp 3D Premium',
  'Visualisasi 3D lengkap dengan rendering fotorealistis',
  'sketchup',
  750000,
  35000,
  36,
  '["3D modeling interior & eksterior", "Rendering fotorealistis", "Walkthrough animation", "Material library lengkap", "Multiple camera angles", "File SKP + video"]',
  true,
  4
),
(
  'RAB Sederhana',
  'Rencana Anggaran Biaya untuk proyek konstruksi sederhana',
  'rab',
  250000,
  12000,
  36,
  '["Analisa harga satuan", "Bill of Quantity (BOQ)", "Rekapitulasi biaya", "Format Excel + PDF"]',
  true,
  5
),
(
  'RAB Lengkap',
  'Paket RAB komprehensif dengan time schedule dan cash flow',
  'rab',
  400000,
  18000,
  36,
  '["Analisa harga satuan detail", "Bill of Quantity lengkap", "Time schedule (kurva S)", "Cash flow diagram", "Laporan Excel + PDF", "Konsultasi gratis"]',
  true,
  6
);

-- Insert initial plugins
INSERT INTO plugins (name, description, version, category, price, features, is_active) VALUES
(
  'AutoCAD Dimension Pro',
  'Plugin untuk otomatisasi dimensioning dan annotasi di AutoCAD',
  '2.1.0',
  'autocad',
  250000,
  '["Auto dimensioning", "Smart annotation", "Batch processing", "Custom dimension styles", "Layer management"]',
  true
),
(
  'SketchUp Material Manager',
  'Plugin untuk manajemen material dan texture di SketchUp',
  '1.5.2',
  'sketchup',
  300000,
  '["Material library", "Texture mapping tools", "Batch material assignment", "Material report generator", "Custom material creator"]',
  true
),
(
  'CAD Block Library Pro',
  'Koleksi block dan symbol untuk AutoCAD',
  '3.0.1',
  'autocad',
  400000,
  '["1000+ CAD blocks", "Furniture library", "Electrical symbols", "Plumbing fixtures", "Architectural elements"]',
  true
),
(
  'SketchUp Render Engine',
  'Plugin rendering canggih untuk SketchUp',
  '2.3.0',
  'sketchup',
  500000,
  '["Photorealistic rendering", "Advanced lighting", "Material editor", "Batch rendering", "Animation support"]',
  true
);

-- Insert sample portfolio items
INSERT INTO portfolio (title, description, category, client_name, completion_date, technologies, is_featured, sort_order) VALUES
(
  'Rumah Minimalis 2 Lantai',
  'Desain rumah minimalis modern dengan konsep open space dan pencahayaan alami optimal',
  'Residential',
  'Bapak Sutrisno',
  '2024-01-15',
  '["AutoCAD 2D", "SketchUp 3D", "V-Ray Rendering"]',
  true,
  1
),
(
  'Kantor Modern 3 Lantai',
  'Desain kantor modern dengan konsep sustainable building dan energy efficient',
  'Commercial',
  'PT. Maju Bersama',
  '2023-12-20',
  '["AutoCAD 2D", "SketchUp 3D", "RAB Lengkap"]',
  true,
  2
),
(
  'Ruko 3 Lantai Strategis',
  'Desain ruko dengan fungsi ganda: retail di lantai 1, office di lantai 2-3',
  'Commercial',
  'CV. Berkah Jaya',
  '2023-11-10',
  '["AutoCAD 2D", "SketchUp 3D"]',
  false,
  3
),
(
  'Villa Resort Bali Style',
  'Desain villa dengan konsep tropical modern dan material lokal',
  'Hospitality',
  'Bali Resort Group',
  '2023-10-05',
  '["AutoCAD 2D", "SketchUp 3D", "Landscape Design"]',
  true,
  4
);

-- Insert sample testimonials
INSERT INTO testimonials (client_name, client_company, rating, content, project_type, is_featured, is_approved) VALUES
(
  'Budi Santoso',
  'PT. Konstruksi Jaya',
  5,
  'Pelayanan sangat memuaskan! Gambar teknik yang dihasilkan sangat detail dan sesuai dengan kebutuhan proyek kami. Tim Lintang Studio sangat responsif dan profesional.',
  'AutoCAD 2D Premium',
  true,
  true
),
(
  'Sari Dewi',
  'CV. Bangun Indah',
  5,
  'Hasil rendering 3D nya luar biasa! Klien kami langsung tertarik dengan visualisasi yang dibuat. Highly recommended untuk yang butuh jasa desain berkualitas.',
  'SketchUp 3D Premium',
  true,
  true
),
(
  'Ahmad Fauzi',
  'Kontraktor Mandiri',
  4,
  'RAB yang dibuat sangat akurat dan membantu kami dalam perencanaan budget proyek. Terima kasih Lintang Studio!',
  'RAB Lengkap',
  false,
  true
),
(
  'Maya Sari',
  'Arsitek Freelance',
  5,
  'Plugin AutoCAD yang dibeli sangat membantu mempercepat pekerjaan drawing. Worth it banget untuk investasi produktivitas.',
  'Plugin AutoCAD',
  true,
  true
);

-- Insert sample promo codes
INSERT INTO promo_codes (code, name, description, type, value, min_amount, max_discount, usage_limit, applicable_to, valid_from, valid_until, is_active) VALUES
(
  'WELCOME2024',
  'Welcome Discount 2024',
  'Diskon 15% untuk pelanggan baru',
  'percentage',
  15,
  500000,
  200000,
  100,
  'all',
  NOW(),
  NOW() + INTERVAL '3 months',
  true
),
(
  'PLUGIN50',
  'Plugin Discount',
  'Diskon Rp 50.000 untuk pembelian plugin',
  'fixed',
  50000,
  200000,
  50000,
  50,
  'plugins',
  NOW(),
  NOW() + INTERVAL '2 months',
  true
),
(
  'AUTOCAD20',
  'AutoCAD Special',
  'Diskon 20% untuk jasa AutoCAD',
  'percentage',
  20,
  300000,
  300000,
  30,
  'services',
  NOW(),
  NOW() + INTERVAL '1 month',
  true
);

-- Create admin user profile (this will be created automatically via trigger when admin registers)
-- But we can insert a placeholder for reference
INSERT INTO profiles (id, user_id, full_name, email, phone, role, is_active) VALUES
(
  uuid_generate_v4(),
  uuid_generate_v4(), -- This should be replaced with actual auth.users.id when admin registers
  'Abimanyu Lintang Wibowo',
  'admin@lintangstudio.com',
  '+62812345678',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;
