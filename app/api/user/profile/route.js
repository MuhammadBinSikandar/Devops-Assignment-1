import { NextResponse } from 'next/server';
import { getUserBySupabaseId } from '@/lib/database';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const { supabaseId } = await request.json();
    
    if (!supabaseId) {
      return NextResponse.json({ error: 'Supabase ID is required' }, { status: 400 });
    }

    // Verify the user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user || user.id !== supabaseId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile (do NOT auto-create; caller must POST /api/auth/user)
    const profile = await getUserBySupabaseId(supabaseId);

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

