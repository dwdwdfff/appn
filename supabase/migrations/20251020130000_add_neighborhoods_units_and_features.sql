/*
  # Enhanced Real Estate Application Database Schema
  
  ## New Tables
  
  ### `neighborhoods`
  Neighborhoods within areas table
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Neighborhood name
  - `area_id` (uuid) - Reference to area
  - `description` (text, optional) - Neighborhood description
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `units`
  Property units table
  - `id` (uuid, primary key) - Unique identifier
  - `project_id` (uuid) - Reference to project
  - `unit_type` (text) - Unit type (apartment, villa, studio, etc.)
  - `area_sqm` (numeric) - Unit area in square meters
  - `bedrooms` (integer) - Number of bedrooms
  - `bathrooms` (integer) - Number of bathrooms
  - `price` (numeric) - Unit price
  - `down_payment` (numeric) - Down payment amount
  - `monthly_installment` (numeric) - Monthly installment
  - `quarterly_installment` (numeric) - Quarterly installment
  - `semi_annual_installment` (numeric) - Semi-annual installment
  - `annual_installment` (numeric) - Annual installment
  - `installment_years` (integer) - Number of installment years
  - `floor_number` (integer) - Floor number
  - `unit_number` (text) - Unit number/identifier
  - `status` (text) - Unit status (available, reserved, sold)
  - `features` (jsonb) - Unit features
  - `images` (jsonb) - Unit images URLs
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `dynamic_fields`
  Dynamic fields configuration table
  - `id` (uuid, primary key) - Unique identifier
  - `field_name` (text) - Field name
  - `field_type` (text) - Field type (text, number, boolean, select)
  - `field_options` (jsonb) - Field options for select type
  - `applies_to` (text) - What entity this field applies to (projects, developers, units)
  - `is_active` (boolean) - Whether field is active
  - `display_order` (integer) - Display order
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ## Enhanced Tables
  
  ### Enhanced `developers` table
  - Add `min_price` (numeric) - Minimum price across all projects
  - Add `min_down_payment` (numeric) - Minimum down payment
  - Add `min_installment` (numeric) - Minimum installment
  - Add `dynamic_data` (jsonb) - Dynamic field data

  ### Enhanced `projects` table
  - Add `area_min` (numeric) - Minimum unit area
  - Add `area_max` (numeric) - Maximum unit area
  - Add `neighborhood_id` (uuid) - Reference to neighborhood
  - Add `dynamic_data` (jsonb) - Dynamic field data
*/

-- Create neighborhoods table
CREATE TABLE IF NOT EXISTS neighborhoods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  area_id uuid REFERENCES areas(id) ON DELETE CASCADE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create units table
CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  unit_type text NOT NULL,
  area_sqm numeric,
  bedrooms integer DEFAULT 0,
  bathrooms integer DEFAULT 0,
  price numeric,
  down_payment numeric,
  monthly_installment numeric,
  quarterly_installment numeric,
  semi_annual_installment numeric,
  annual_installment numeric,
  installment_years integer DEFAULT 10,
  floor_number integer,
  unit_number text,
  status text DEFAULT 'available',
  features jsonb DEFAULT '[]'::jsonb,
  images jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create dynamic_fields table
CREATE TABLE IF NOT EXISTS dynamic_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  field_options jsonb DEFAULT '[]'::jsonb,
  applies_to text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to developers table
ALTER TABLE developers 
ADD COLUMN IF NOT EXISTS min_price numeric,
ADD COLUMN IF NOT EXISTS min_down_payment numeric,
ADD COLUMN IF NOT EXISTS min_installment numeric,
ADD COLUMN IF NOT EXISTS dynamic_data jsonb DEFAULT '{}'::jsonb;

-- Add new columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS area_min numeric,
ADD COLUMN IF NOT EXISTS area_max numeric,
ADD COLUMN IF NOT EXISTS neighborhood_id uuid REFERENCES neighborhoods(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS dynamic_data jsonb DEFAULT '{}'::jsonb;

-- Enable RLS on new tables
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_fields ENABLE ROW LEVEL SECURITY;

-- Policies for neighborhoods table
CREATE POLICY "Anyone can view neighborhoods"
  ON neighborhoods FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert neighborhoods"
  ON neighborhoods FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update neighborhoods"
  ON neighborhoods FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete neighborhoods"
  ON neighborhoods FOR DELETE
  TO authenticated
  USING (true);

-- Policies for units table
CREATE POLICY "Anyone can view units"
  ON units FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert units"
  ON units FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update units"
  ON units FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete units"
  ON units FOR DELETE
  TO authenticated
  USING (true);

-- Policies for dynamic_fields table
CREATE POLICY "Anyone can view dynamic_fields"
  ON dynamic_fields FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert dynamic_fields"
  ON dynamic_fields FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update dynamic_fields"
  ON dynamic_fields FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete dynamic_fields"
  ON dynamic_fields FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_neighborhoods_area ON neighborhoods(area_id);
CREATE INDEX IF NOT EXISTS idx_units_project ON units(project_id);
CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);
CREATE INDEX IF NOT EXISTS idx_units_type ON units(unit_type);
CREATE INDEX IF NOT EXISTS idx_projects_neighborhood ON projects(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_fields_applies_to ON dynamic_fields(applies_to);
CREATE INDEX IF NOT EXISTS idx_dynamic_fields_active ON dynamic_fields(is_active);

-- Insert some default dynamic fields
INSERT INTO dynamic_fields (field_name, field_type, applies_to, display_order) VALUES
('club_house', 'boolean', 'projects', 1),
('swimming_pool', 'boolean', 'projects', 2),
('gym', 'boolean', 'projects', 3),
('parking', 'boolean', 'projects', 4),
('security', 'boolean', 'projects', 5),
('garden', 'boolean', 'projects', 6),
('playground', 'boolean', 'projects', 7),
('commercial_area', 'boolean', 'projects', 8);