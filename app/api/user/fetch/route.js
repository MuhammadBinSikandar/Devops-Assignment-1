import { NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const { supabaseId, email, fetchFromSupabase = true } = await request.json();
    
    if (!supabaseId && !email) {
      return NextResponse.json({ error: 'Either supabaseId or email is required' }, { status: 400 });
    }

    // Verify the requesting user is authenticated (optional security check)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Inngest disabled - fetching directly instead
    // Direct fetch from Supabase
    let userData = null;
    if (supabaseId) {
      const { data: supabaseUser, error } = await supabase.auth.admin.getUserById(supabaseId);
      if (!error) {
        userData = supabaseUser.user;
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: userData 
    });

  } catch (error) {
    console.error('Error in user fetch API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const supabaseId = searchParams.get('supabaseId');
    const email = searchParams.get('email');
    
    if (!supabaseId && !email) {
      return NextResponse.json({ error: 'Either supabaseId or email query parameter is required' }, { status: 400 });
    }

    // Verify the requesting user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user directly from Supabase
    let userData = null;
    if (supabaseId) {
      const { data: supabaseUser, error } = await supabase.auth.admin.getUserById(supabaseId);
      if (!error) {
        userData = supabaseUser.user;
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    } else if (email) {
      // For email lookup, we need to list users and find by email
      const { data: users, error } = await supabase.auth.admin.listUsers();
      if (!error) {
        userData = users.users.find(u => u.email === email);
        if (!userData) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
      } else {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: userData 
    });

  } catch (error) {
    console.error('Error in user fetch API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
