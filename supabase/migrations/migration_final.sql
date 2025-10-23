-- Final migration for Real Estate App
-- This migration includes all the required tables and updates

-- Create neighborhoods table
CREATE TABLE IF NOT EXISTS neighborhoods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create units table
CREATE TABLE IF NOT EXISTS units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- apartment, villa, duplex, penthouse, studio
  area DECIMAL NOT NULL,
  price DECIMAL NOT NULL,
  down_payment DECIMAL,
  monthly_installment DECIMAL,
  installment_years INTEGER DEFAULT 10,
  floor_number INTEGER,
  room_count INTEGER,
  bathroom_count INTEGER,
  has_balcony BOOLEAN DEFAULT FALSE,
  has_parking BOOLEAN DEFAULT FALSE,
  description TEXT,
  images TEXT[], -- Array of image URLs
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dynamic_fields table for custom fields
CREATE TABLE IF NOT EXISTS dynamic_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL, -- text, number, boolean, select, date
  options TEXT[], -- For select type fields
  is_required BOOLEAN DEFAULT FALSE,
  applies_to TEXT NOT NULL, -- projects, developers, units
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dynamic_field_values table to store dynamic field values
CREATE TABLE IF NOT EXISTS dynamic_field_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  field_id UUID REFERENCES dynamic_fields(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL, -- ID of the project, developer, or unit
  entity_type TEXT NOT NULL, -- projects, developers, units
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(field_id, entity_id, entity_type)
);

-- Update developers table to add logo support
ALTER TABLE developers 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS social_media JSONB;

-- Update projects table to add more fields
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS images TEXT[], -- Array of image URLs
ADD COLUMN IF NOT EXISTS price_min DECIMAL,
ADD COLUMN IF NOT EXISTS price_max DECIMAL,
ADD COLUMN IF NOT EXISTS delivery_date TEXT,
ADD COLUMN IF NOT EXISTS has_clubhouse BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS amenities TEXT[],
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'residential'; -- residential, commercial, mixed

-- Update areas table to add more location details
ALTER TABLE areas 
ADD COLUMN IF NOT EXISTS neighborhood_id UUID REFERENCES neighborhoods(id),
ADD COLUMN IF NOT EXISTS latitude DECIMAL,
ADD COLUMN IF NOT EXISTS longitude DECIMAL,
ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_units_project_id ON units(project_id);
CREATE INDEX IF NOT EXISTS idx_units_type ON units(type);
CREATE INDEX IF NOT EXISTS idx_units_price ON units(price);
CREATE INDEX IF NOT EXISTS idx_units_area ON units(area);
CREATE INDEX IF NOT EXISTS idx_units_available ON units(is_available);

CREATE INDEX IF NOT EXISTS idx_dynamic_field_values_entity ON dynamic_field_values(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_dynamic_field_values_field ON dynamic_field_values(field_id);

CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_price_min ON projects(price_min);
CREATE INDEX IF NOT EXISTS idx_projects_price_max ON projects(price_max);

CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX IF NOT EXISTS idx_areas_neighborhood ON areas(neighborhood_id);

-- Insert some sample dynamic fields
INSERT INTO dynamic_fields (name, label, field_type, applies_to, is_active) VALUES
('club_house', 'نادي صحي', 'boolean', 'projects', true),
('swimming_pool', 'حمام سباحة', 'boolean', 'projects', true),
('gym', 'صالة رياضية', 'boolean', 'projects', true),
('security', 'أمن وحراسة', 'boolean', 'projects', true),
('parking', 'موقف سيارات', 'boolean', 'projects', true),
('garden', 'حديقة', 'boolean', 'projects', true),
('playground', 'ملعب أطفال', 'boolean', 'projects', true),
('commercial_area', 'منطقة تجارية', 'boolean', 'projects', true)
ON CONFLICT DO NOTHING;

-- Insert some sample neighborhoods
INSERT INTO neighborhoods (name, city, description) VALUES
('المعادي', 'القاهرة', 'منطقة راقية في القاهرة'),
('الزمالك', 'القاهرة', 'منطقة سكنية مميزة'),
('مدينة نصر', 'القاهرة', 'منطقة حديثة ومتطورة'),
('الشيخ زايد', 'الجيزة', 'مدينة جديدة متكاملة'),
('6 أكتوبر', 'الجيزة', 'مدينة صناعية وسكنية'),
('العبور', 'القليوبية', 'مدينة جديدة شرق القاهرة'),
('الرحاب', 'القاهرة', 'مجتمع سكني متكامل'),
('التجمع الخامس', 'القاهرة', 'منطقة سكنية حديثة')
ON CONFLICT DO NOTHING;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_neighborhoods_updated_at ON neighborhoods;
CREATE TRIGGER update_neighborhoods_updated_at BEFORE UPDATE ON neighborhoods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_units_updated_at ON units;
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dynamic_fields_updated_at ON dynamic_fields;
CREATE TRIGGER update_dynamic_fields_updated_at BEFORE UPDATE ON dynamic_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dynamic_field_values_updated_at ON dynamic_field_values;
CREATE TRIGGER update_dynamic_field_values_updated_at BEFORE UPDATE ON dynamic_field_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_field_values ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON neighborhoods FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON units FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON dynamic_fields FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON dynamic_field_values FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON neighborhoods TO authenticated;
GRANT ALL ON units TO authenticated;
GRANT ALL ON dynamic_fields TO authenticated;
GRANT ALL ON dynamic_field_values TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;