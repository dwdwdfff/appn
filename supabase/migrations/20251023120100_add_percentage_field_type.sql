-- Add percentage field type support to dynamic_fields table

-- Update the field_type column to include percentage type
-- This is informational - the actual validation will be handled in the application

-- Add a comment to document the new percentage field type
COMMENT ON COLUMN dynamic_fields.field_type IS 'Field type: text, number, boolean, select, percentage. Percentage fields store numbers but display as percentages with % symbol';