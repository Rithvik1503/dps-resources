import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)

    // Get the user
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check if user exists in the profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select()
        .eq('id', user.id)
        .single()

      // If no profile exists, create one
      if (!profile) {
        await supabase.from('profiles').insert([
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata.full_name || '',
            avatar_url: user.user_metadata.avatar_url || '',
            updated_at: new Date().toISOString(),
          },
        ])
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
} 