-- Insert sample services
INSERT INTO services (name, description, price, category, features) VALUES
('AutoCAD 2D Basic', 'Gambar teknik 2D dasar untuk proyek konstruksi', 500000, 'autocad', '["Denah Bangunan", "Tampak Depan/Belakang", "Potongan", "Detail Konstruksi"]'),
('AutoCAD 2D Premium', 'Gambar teknik 2D lengkap dengan detail konstruksi', 1000000, 'autocad', '["Denah Lengkap", "Tampak 4 Sisi", "Potongan A-A & B-B", "Detail Konstruksi", "Shop Drawing", "As Built Drawing"]'),
('SketchUp 3D Basic', 'Visualisasi 3D sederhana untuk presentasi', 750000, 'sketchup', '["3D Modeling", "Basic Rendering", "2-3 View Angle", "Basic Material"]'),
('SketchUp 3D Premium', 'Visualisasi 3D premium dengan rendering realistis', 1500000, 'sketchup', '["3D Modeling Detail", "Realistic Rendering", "Multiple View Angles", "Advanced Material", "Lighting Setup", "Walkthrough Animation"]'),
('RAB Sederhana', 'Rencana Anggaran Biaya untuk proyek kecil', 400000, 'rab', '["Analisa Harga Satuan", "Bill of Quantity", "Rekapitulasi Biaya"]'),
('RAB Lengkap', 'Rencana Anggaran Biaya lengkap dengan time schedule', 800000, 'rab', '["Analisa Harga Satuan Detail", "Bill of Quantity", "Rekapitulasi Biaya", "Time Schedule", "Cash Flow", "Kurva S"]);

-- Insert sample plugins
INSERT INTO plugins (name, description, version, price, category, file_url) VALUES
('AutoCAD Dimension Pro', 'Plugin untuk dimensioning otomatis di AutoCAD', '2.1.0', 250000, 'autocad', '/plugins/autocad-dimension-pro-v2.1.0.zip'),
('SketchUp Material Manager', 'Plugin untuk manajemen material di SketchUp', '1.5.2', 300000, 'sketchup', '/plugins/sketchup-material-manager-v1.5.2.zip'),
('CAD Block Library', 'Library block AutoCAD untuk arsitektur', '3.0.1', 400000, 'autocad', '/plugins/cad-block-library-v3.0.1.zip'),
('SketchUp Render Plus', 'Plugin rendering advanced untuk SketchUp', '2.3.0', 500000, 'sketchup', '/plugins/sketchup-render-plus-v2.3.0.zip'),
('AutoCAD Smart Blocks', 'Plugin smart blocks dengan parameter otomatis', '1.8.5', 350000, 'autocad', '/plugins/autocad-smart-blocks-v1.8.5.zip'),
('SketchUp Layout Pro', 'Plugin untuk layout dan dokumentasi profesional', '4.1.2', 450000, 'sketchup', '/plugins/sketchup-layout-pro-v4.1.2.zip');

-- Create admin user (you'll need to register this user first through Supabase Auth)
-- Then update their profile to admin role
-- UPDATE profiles SET role = 'admin' WHERE user_id = 'your-admin-user-id';
