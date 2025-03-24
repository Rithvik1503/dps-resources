import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  try {
    // Test database connection
    console.log('Testing database connection...')
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .limit(1)

    if (subjectsError) {
      console.error('Database connection error:', subjectsError)
      return
    }
    console.log('Database connection successful!')

    // Test storage connection
    console.log('\nTesting storage connection...')
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()

    if (bucketsError) {
      console.error('Storage connection error:', bucketsError)
      return
    }

    console.log('Available buckets:', buckets.map(b => b.name))
    
    // Check if resources bucket exists
    const resourcesBucket = buckets.find(b => b.name === 'resources')
    if (!resourcesBucket) {
      console.error('Resources bucket not found!')
      return
    }
    console.log('Resources bucket found!')

    // Test file upload
    console.log('\nTesting file upload...')
    const testFile = new Blob(['test content'], { type: 'text/plain' })
    const { error: uploadError } = await supabase
      .storage
      .from('resources')
      .upload('test.txt', testFile)

    if (uploadError) {
      console.error('File upload error:', uploadError)
      return
    }
    console.log('File upload successful!')

    // Clean up test file
    const { error: deleteError } = await supabase
      .storage
      .from('resources')
      .remove(['test.txt'])

    if (deleteError) {
      console.error('File deletion error:', deleteError)
      return
    }
    console.log('Test file cleaned up successfully!')

    console.log('\nAll tests passed successfully!')
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testSupabaseConnection() 