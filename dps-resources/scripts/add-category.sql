-- Add category column to resources table
ALTER TABLE resources
ADD COLUMN category text NOT NULL DEFAULT 'notes'
CHECK (category IN ('notes', 'pyqs', 'projects'));

-- Update existing resources to have a default category
UPDATE resources
SET category = 'notes'
WHERE category IS NULL; 