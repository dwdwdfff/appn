/*
  # Real Estate Application Database Schema

  ## New Tables
  
  ### `developers`
  Developer/company information table
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Developer name
  - `logo_url` (text, optional) - Company logo URL
  - `established_date` (date) - Company establishment date
  - `description` (text) - Company description
  - `portfolio` (jsonb) - Previous projects portfolio
  - `contact_info` (jsonb) - Contact details (phone, email, website)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `areas`
  Geographic areas/locations table
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Area name
  - `city` (text) - City name
  - `description` (text, optional) - Area description
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `projects`
  Real estate projects table
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Project name
  - `developer_id` (uuid) - Reference to developer
  - `area_id` (uuid) - Reference to area
  - `description` (text) - Project description
  - `price_min` (numeric) - Minimum price
  - `price_max` (numeric) - Maximum price
  - `down_payment_min` (numeric) - Minimum down payment
  - `down_payment_max` (numeric) - Maximum down payment
  - `installment_years` (integer) - Years for installment
  - `has_clubhouse` (boolean) - Has clubhouse facility
  - `amenities` (jsonb) - Project amenities (pool, gym, etc)
  - `unit_types` (jsonb) - Unit types (apartment, villa, etc)
  - `delivery_date` (date) - Expected delivery date
  - `status` (text) - Project status (planning, under_construction, completed)
  - `images` (jsonb) - Project images URLs
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage data
*/

-- Create developers table
CREATE TABLE IF NOT EXISTS developers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  established_date date,
  description text,
  portfolio jsonb DEFAULT '[]'::jsonb,
  contact_info jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create areas table
CREATE TABLE IF NOT EXISTS areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  developer_id uuid REFERENCES developers(id) ON DELETE CASCADE,
  area_id uuid REFERENCES areas(id) ON DELETE SET NULL,
  description text,
  price_min numeric,
  price_max numeric,
  down_payment_min numeric,
  down_payment_max numeric,
  installment_years integer,
  has_clubhouse boolean DEFAULT false,
  amenities jsonb DEFAULT '[]'::jsonb,
  unit_types jsonb DEFAULT '[]'::jsonb,
  delivery_date date,
  status text DEFAULT 'planning',
  images jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policies for developers table
CREATE POLICY "Anyone can view developers"
  ON developers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert developers"
  ON developers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update developers"
  ON developers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete developers"
  ON developers FOR DELETE
  TO authenticated
  USING (true);

-- Policies for areas table
CREATE POLICY "Anyone can view areas"
  ON areas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert areas"
  ON areas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update areas"
  ON areas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete areas"
  ON areas FOR DELETE
  TO authenticated
  USING (true);

-- Policies for projects table
CREATE POLICY "Anyone can view projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_developer ON projects(developer_id);
CREATE INDEX IF NOT EXISTS idx_projects_area ON projects(area_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);