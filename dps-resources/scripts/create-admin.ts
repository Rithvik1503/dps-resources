import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  try {
    // Create the user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@dps.com',
      password: '123456',
      email_confirm: true,
    })

    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log('Admin user already exists')
      } else {
        throw authError
      }
    }

    // Get the user's UUID
    const userId = authData?.user?.id

    if (userId) {
      // Insert the user into public.users
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: 'admin@dps.com',
          role: 'admin',
        })

      if (dbError) {
        throw dbError
      }

      console.log('Admin user created successfully')
    }
  } catch (error) {
    console.error('Error creating admin user:', error)
  }
}

createAdminUser() 