-- This script should be run after creating the admin user in auth.users
-- Replace the UUID with the actual UUID from auth.users

-- First, delete the placeholder admin user if it exists
DELETE FROM public.users WHERE email = 'admin@dps.com';

-- Then insert the admin user with the correct UUID
-- Replace 'YOUR-ADMIN-UUID' with the actual UUID from auth.users
INSERT INTO public.users (id, email, role)
VALUES (
    'YOUR-ADMIN-UUID', -- Replace this with the actual UUID from auth.users
    'admin@dps.com',
    'admin'
);

-- Insert some default subjects
INSERT INTO public.subjects (grade, name) VALUES
    (9, 'Mathematics'),
    (9, 'Science'),
    (9, 'English'),
    (9, 'Social Studies'),
    (10, 'Mathematics'),
    (10, 'Science'),
    (10, 'English'),
    (10, 'Social Studies'),
    (11, 'Physics'),
    (11, 'Chemistry'),
    (11, 'Biology'),
    (11, 'Mathematics'),
    (11, 'English'),
    (12, 'Physics'),
    (12, 'Chemistry'),
    (12, 'Biology'),
    (12, 'Mathematics'),
    (12, 'English')
ON CONFLICT (grade, name) DO NOTHING; 