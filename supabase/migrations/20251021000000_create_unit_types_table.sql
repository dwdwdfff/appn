-- Create unit_types table for managing unit types
CREATE TABLE IF NOT EXISTS unit_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on unit_types table
ALTER TABLE unit_types ENABLE ROW LEVEL SECURITY;

-- Policies for unit_types table
CREATE POLICY "Anyone can view unit_types"
  ON unit_types FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert unit_types"
  ON unit_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update unit_types"
  ON unit_types FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete unit_types"
  ON unit_types FOR DELETE
  TO authenticated
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_unit_types_name ON unit_types(name);

-- Insert some default unit types
INSERT INTO unit_types (name) VALUES
('شقة'),
('فيلا'),
('استوديو'),
('دوبلكس'),
('بنتهاوس'),
('تاون هاوس'),
('شاليه'),
('محل تجاري'),
('مكتب'),
('عيادة')
ON CONFLICT (name) DO NOTHING;

-- Add dynamic_data column to units table if it doesn't exist
ALTER TABLE units 
ADD COLUMN IF NOT EXISTS dynamic_data jsonb DEFAULT '{}'::jsonb;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_unit_types_updated_at 
    BEFORE UPDATE ON unit_types 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();