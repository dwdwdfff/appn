-- Quick fix for dynamic_fields table - Run this in your Supabase SQL Editor
-- This will add the missing field_label column and update existing records

-- Add the missing field_label column
ALTER TABLE dynamic_fields 
ADD COLUMN IF NOT EXISTS field_label text;

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

-- Make field_label required for new records (optional - you can skip this if you want)
-- ALTER TABLE dynamic_fields ALTER COLUMN field_label SET NOT NULL;