/*
  # Update RLS Policies for Public Access

  ## Changes
  - Drop existing restrictive policies that require authentication
  - Create new policies allowing public access for all operations
  - This enables the app to work without authentication system

  ## Security Note
  - These policies allow public access for development/demo purposes
  - For production, implement proper authentication and update policies accordingly
*/

-- Drop existing policies for developers
DROP POLICY IF EXISTS "Anyone can view developers" ON developers;
DROP POLICY IF EXISTS "Authenticated users can insert developers" ON developers;
DROP POLICY IF EXISTS "Authenticated users can update developers" ON developers;
DROP POLICY IF EXISTS "Authenticated users can delete developers" ON developers;

-- Drop existing policies for areas
DROP POLICY IF EXISTS "Anyone can view areas" ON areas;
DROP POLICY IF EXISTS "Authenticated users can insert areas" ON areas;
DROP POLICY IF EXISTS "Authenticated users can update areas" ON areas;
DROP POLICY IF EXISTS "Authenticated users can delete areas" ON areas;

-- Drop existing policies for projects
DROP POLICY IF EXISTS "Anyone can view projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON projects;

-- Create new public access policies for developers
CREATE POLICY "Public can view developers"
  ON developers FOR SELECT
  USING (true);

CREATE POLICY "Public can insert developers"
  ON developers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update developers"
  ON developers FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete developers"
  ON developers FOR DELETE
  USING (true);

-- Create new public access policies for areas
CREATE POLICY "Public can view areas"
  ON areas FOR SELECT
  USING (true);

CREATE POLICY "Public can insert areas"
  ON areas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update areas"
  ON areas FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete areas"
  ON areas FOR DELETE
  USING (true);

-- Create new public access policies for projects
CREATE POLICY "Public can view projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Public can insert projects"
  ON projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update projects"
  ON projects FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete projects"
  ON projects FOR DELETE
  USING (true);
