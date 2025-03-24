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

async function testDatabaseSchema() {
  try {
    // Test subjects table
    console.log('Testing subjects table...')
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')

    if (subjectsError) {
      console.error('Subjects table error:', subjectsError)
      return
    }
    console.log('Subjects table:', subjects)

    // Test resources table
    console.log('\nTesting resources table...')
    const { data: resources, error: resourcesError } = await supabase
      .from('resources')
      .select('*')

    if (resourcesError) {
      console.error('Resources table error:', resourcesError)
      return
    }
    console.log('Resources table:', resources)

    // Test table relationships
    console.log('\nTesting table relationships...')
    const { data: resourcesWithSubjects, error: joinError } = await supabase
      .from('resources')
      .select(`
        *,
        subjects (
          name
        )
      `)

    if (joinError) {
      console.error('Table relationships error:', joinError)
      return
    }
    console.log('Resources with subjects:', resourcesWithSubjects)

    console.log('\nAll database tests passed successfully!')
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testDatabaseSchema() 