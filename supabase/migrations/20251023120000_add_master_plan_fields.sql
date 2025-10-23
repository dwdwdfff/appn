-- Add master plan fields to projects and units tables

-- Add master plan field to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS master_plan_url text;

-- Add master plan and video fields to units table
ALTER TABLE units ADD COLUMN IF NOT EXISTS master_plan_url text;
ALTER TABLE units ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE units ADD COLUMN IF NOT EXISTS layout_image_url text;

-- Add comment for documentation
COMMENT ON COLUMN projects.master_plan_url IS 'URL for project master plan (PDF or image)';
COMMENT ON COLUMN units.master_plan_url IS 'URL for unit master plan (PDF or image)';
COMMENT ON COLUMN units.video_url IS 'URL for unit video';
COMMENT ON COLUMN units.layout_image_url IS 'URL for unit internal layout image';