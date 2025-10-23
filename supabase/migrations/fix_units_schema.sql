-- Quick fix for units table column name issues
-- Run this in your Supabase SQL Editor

-- The units table already has the correct column names:
-- - unit_type (not type)
-- - area_sqm (not area)

-- This script is just for verification - no changes needed to the database
-- The issue was in the frontend code which has been fixed

-- Verify the units table structure:
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'units' 
ORDER BY ordinal_position;

-- Sample query to test units data:
SELECT id, unit_type, area_sqm, price, project_id 
FROM units 
LIMIT 5;