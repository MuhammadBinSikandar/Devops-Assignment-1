import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUserBySupabaseId, createUser } from '@/lib/database'

/**
 * Auth Callback Handler - The ONLY place where user profiles are created
 * 
 * Flow:
 * 1. User signs up with email/password/name/role in signup form
 * 2. Email verification link is sent
 * 3. User clicks email link -> this callback is triggered
 * 4. We create the user profile in our database with signup data
 * 5. User is redirected to profile-setup page for final loading/sync
 */

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      try {
        // Check if user profile exists in our database
        let existingProfile = await getUserBySupabaseId(data.user.id)

        // If no profile exists, create one with role from user metadata
        if (!existingProfile) {
          const userRole = data.user.user_metadata?.role || 'student'
          const userName = data.user.user_metadata?.full_name || data.user.email
          
          try {
            existingProfile = await createUser({
              supabaseId: data.user.id,
              email: data.user.email,
              name: userName,
              role: userRole.toLowerCase()
            });
          } catch (createError) {
            console.error('Error creating user profile:', createError)
            // If we can't create profile, redirect to signup to try again
            return NextResponse.redirect(`${origin}/auth/signup`)
          }
        }

        // If profile exists but no role (shouldn't happen with new flow), redirect to signup
        if (!existingProfile || !existingProfile.role) {
          return NextResponse.redirect(`${origin}/auth/signup`)
        }

        // Redirect based on user approval status and role
        let redirectPath = '/auth/waiting-approval'

        // Admins always go directly to admin panel
        if (existingProfile.role === 'admin') {
          redirectPath = '/admin'
        }
        // Suspended users go to waiting approval to see suspension message
        else if (existingProfile.isSuspended) {
          redirectPath = '/auth/waiting-approval'
        }
        // Regular approved (and not suspended) users go to profile setup for dashboard redirect
        else if (existingProfile.isApproved) {
          redirectPath = '/auth/profile-setup'
        }
        // Unapproved regular users go to waiting approval

        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${redirectPath}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
        } else {
          return NextResponse.redirect(`${origin}${redirectPath}`)
        }
      } catch (dbError) {
        console.error('Database error in auth callback:', dbError)
        // If database error, redirect to signup
        return NextResponse.redirect(`${origin}/auth/signup`)
      }
    }
  }
  
  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
