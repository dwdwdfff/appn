/*
  # Fix Neighborhoods RLS Policies for Public Access

  ## Problem
  The neighborhoods table has RLS policies that require authentication,
  but the app is designed to work without authentication using the anonymous key.

  ## Solution
  - Drop existing restrictive policies that require authentication
  - Create new policies allowing public access for all operations
  - This aligns with the existing policies for developers, areas, and projects tables

  ## Security Note
  - These policies allow public access for development/demo purposes
  - For production, implement proper authentication and update policies accordingly
*/

-- Drop existing restrictive policies for neighborhoods
DROP POLICY IF EXISTS "Anyone can view neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Authenticated users can insert neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Authenticated users can update neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Authenticated users can delete neighborhoods" ON neighborhoods;

-- Create new public access policies for neighborhoods
CREATE POLICY "Public can view neighborhoods"
  ON neighborhoods FOR SELECT
  USING (true);

CREATE POLICY "Public can insert neighborhoods"
  ON neighborhoods FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update neighborhoods"
  ON neighborhoods FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete neighborhoods"
  ON neighborhoods FOR DELETE
  USING (true);

-- Also fix units and dynamic_fields tables to be consistent
-- Drop existing restrictive policies for units
DROP POLICY IF EXISTS "Anyone can view units" ON units;
DROP POLICY IF EXISTS "Authenticated users can insert units" ON units;
DROP POLICY IF EXISTS "Authenticated users can update units" ON units;
DROP POLICY IF EXISTS "Authenticated users can delete units" ON units;

-- Create new public access policies for units
CREATE POLICY "Public can view units"
  ON units FOR SELECT
  USING (true);

CREATE POLICY "Public can insert units"
  ON units FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update units"
  ON units FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete units"
  ON units FOR DELETE
  USING (true);

-- Drop existing restrictive policies for dynamic_fields
DROP POLICY IF EXISTS "Anyone can view dynamic_fields" ON dynamic_fields;
DROP POLICY IF EXISTS "Authenticated users can insert dynamic_fields" ON dynamic_fields;
DROP POLICY IF EXISTS "Authenticated users can update dynamic_fields" ON dynamic_fields;
DROP POLICY IF EXISTS "Authenticated users can delete dynamic_fields" ON dynamic_fields;

-- Create new public access policies for dynamic_fields
CREATE POLICY "Public can view dynamic_fields"
  ON dynamic_fields FOR SELECT
  USING (true);

CREATE POLICY "Public can insert dynamic_fields"
  ON dynamic_fields FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update dynamic_fields"
  ON dynamic_fields FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete dynamic_fields"
  ON dynamic_fields FOR DELETE
  USING (true);