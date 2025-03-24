-- Get the UUID of the admin user
DO $$
DECLARE
    admin_uuid uuid;
BEGIN
    -- Get the UUID of the admin user from auth.users
    SELECT id INTO admin_uuid FROM auth.users WHERE email = 'admin@dps.com';
    
    -- Delete any existing admin user in public.users
    DELETE FROM public.users WHERE email = 'admin@dps.com';
    
    -- Insert the admin user with the correct UUID
    INSERT INTO public.users (id, email, role)
    VALUES (admin_uuid, 'admin@dps.com', 'admin')
    ON CONFLICT (email) DO NOTHING;
END $$;

-- Insert default subjects
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
ON CONFLICT ON CONSTRAINT subjects_grade_name_key DO NOTHING; 