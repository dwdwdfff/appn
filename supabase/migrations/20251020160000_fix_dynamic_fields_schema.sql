/*
  # Fix Dynamic Fields Schema

  ## Problem
  The dynamic_fields table is missing the field_label column that the frontend code expects.
  Also, the frontend uses 'options' but the database has 'field_options'.

  ## Solution
  - Add field_label column to store display labels
  - Update existing records to have proper field_label values
  - Ensure applies_to field has default values for existing records

  ## Changes
  - Add field_label column
  - Update existing records with appropriate labels
  - Set applies_to to 'projects' for existing records (since they were inserted for projects)
*/

-- Add the missing field_label column
ALTER TABLE dynamic_fields 
ADD COLUMN IF NOT EXISTS field_label text;

-- Update existing records to have proper field_label values
-- These are the default fields that were inserted in the previous migration
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

-- Make field_label required for new records
ALTER TABLE dynamic_fields 
ALTER COLUMN field_label SET NOT NULL;