import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Types for our database tables
export type User = {
  id: string
  email: string
  role: 'admin' | 'student'
  created_at: string
}

export type Resource = {
  id: string
  title: string
  description: string
  grade: number
  subject: string
  file_url: string
  created_at: string
}

export type Subject = {
  id: string
  grade: number
  name: string
  created_at: string
} 