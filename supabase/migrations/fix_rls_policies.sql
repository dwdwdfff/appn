-- Quick fix for RLS policies - Run this in your Supabase SQL Editor
-- This will allow public access to neighborhoods, units, and dynamic_fields tables

-- Fix neighborhoods table policies
DROP POLICY IF EXISTS "Anyone can view neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Authenticated users can insert neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Authenticated users can update neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Authenticated users can delete neighborhoods" ON neighborhoods;

CREATE POLICY "Public can view neighborhoods" ON neighborhoods FOR SELECT USING (true);
CREATE POLICY "Public can insert neighborhoods" ON neighborhoods FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update neighborhoods" ON neighborhoods FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete neighborhoods" ON neighborhoods FOR DELETE USING (true);

-- Fix units table policies
DROP POLICY IF EXISTS "Anyone can view units" ON units;
DROP POLICY IF EXISTS "Authenticated users can insert units" ON units;
DROP POLICY IF EXISTS "Authenticated users can update units" ON units;
DROP POLICY IF EXISTS "Authenticated users can delete units" ON units;

CREATE POLICY "Public can view units" ON units FOR SELECT USING (true);
CREATE POLICY "Public can insert units" ON units FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update units" ON units FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete units" ON units FOR DELETE USING (true);

-- Fix dynamic_fields table policies
DROP POLICY IF EXISTS "Anyone can view dynamic_fields" ON dynamic_fields;
DROP POLICY IF EXISTS "Authenticated users can insert dynamic_fields" ON dynamic_fields;
DROP POLICY IF EXISTS "Authenticated users can update dynamic_fields" ON dynamic_fields;
DROP POLICY IF EXISTS "Authenticated users can delete dynamic_fields" ON dynamic_fields;

CREATE POLICY "Public can view dynamic_fields" ON dynamic_fields FOR SELECT USING (true);
CREATE POLICY "Public can insert dynamic_fields" ON dynamic_fields FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update dynamic_fields" ON dynamic_fields FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete dynamic_fields" ON dynamic_fields FOR DELETE USING (true);