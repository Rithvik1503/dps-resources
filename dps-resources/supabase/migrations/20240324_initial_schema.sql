-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    grade INTEGER NOT NULL CHECK (grade BETWEEN 9 AND 12),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT subjects_grade_name_key UNIQUE (grade, name)
);

-- Create resources table
CREATE TABLE IF NOT EXISTS public.resources (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject_id INTEGER NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    grade INTEGER NOT NULL CHECK (grade BETWEEN 9 AND 12),
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users policies
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Only admins can insert users" ON public.users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Subjects policies
CREATE POLICY "Enable read access for all users" ON public.subjects
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.subjects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.subjects
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.subjects
    FOR DELETE USING (auth.role() = 'authenticated');

-- Resources policies
CREATE POLICY "Enable read access for all users" ON public.resources
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.resources
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.resources
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.resources
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert default admin user (this will be updated after creating the user in auth.users)
INSERT INTO public.users (id, email, role)
VALUES (
    '00000000-0000-0000-0000-000000000000', -- This will be replaced with the actual UUID
    'admin@dps.com',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Create storage bucket for resources
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'resources' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update their files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'resources' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete their files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'resources' AND
    auth.role() = 'authenticated'
); 