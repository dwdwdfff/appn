-- Apply all database fixes
-- Run this in your Supabase SQL Editor

-- 1. Fix RLS policies for public access
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

-- 2. Fix dynamic_fields schema
-- Add the missing field_label column
ALTER TABLE dynamic_fields 
ADD COLUMN IF NOT EXISTS field_label text;

-- Add is_required column if it doesn't exist
ALTER TABLE dynamic_fields 
ADD COLUMN IF NOT EXISTS is_required boolean DEFAULT false;

-- Update existing records to have proper field_label values
UPDATE dynamic_fields SET 
  field_label = CASE 
    WHEN field_name = 'club_house' THEN 'نادي صحي'
    WHEN field_name = 'swimming_pool' THEN 'مسبح'
    WHEN field_name = 'gym' THEN 'صالة رياضية'
    WHEN field_name = 'parking' THEN 'موقف سيارات'
    WHEN field_name = 'security' THEN 'أمن وحراسة'
    WHEN field_name = 'garden' THEN 'حديقة'
    WHEN field_name = 'playground' THEN 'ملعب أطفال'
    WHEN field_name = 'commercial_area' THEN 'منطقة تجارية'
    ELSE field_name
  END,
  applies_to = COALESCE(applies_to, 'projects')
WHERE field_label IS NULL OR applies_to IS NULL;

-- 3. Ensure projects table has dynamic_data column
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS dynamic_data jsonb DEFAULT '{}'::jsonb;

-- Success message
SELECT 'All database fixes applied successfully!' as status;