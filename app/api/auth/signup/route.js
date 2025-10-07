// app/api/auth/signup/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const { email, password, fullName, role } = await request.json();
    
    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Sign up the user with email verification required
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'http://localhost:3000'}/auth/callback`
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Check if email confirmation is required
    const emailConfirmationRequired = !data.session && data.user && !data.user.email_confirmed_at;

    // Profile will be created when user verifies email in the callback route
    return NextResponse.json({ 
      user: data.user, 
      session: data.session,
      emailConfirmationRequired
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
