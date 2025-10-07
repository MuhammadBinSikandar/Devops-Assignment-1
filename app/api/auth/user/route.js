// app/api/auth/user/route.js
import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { getUserBySupabaseId, updateUser } from '@/lib/database';

// Simple in-memory request tracking for debouncing
const requestTracker = new Map();
const DEBOUNCE_TIME = 1000; // 1 second

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Simple debouncing for rapid requests from same user
    const now = Date.now();
    const lastRequest = requestTracker.get(user.id);
    if (lastRequest && now - lastRequest < DEBOUNCE_TIME) {
      // Return cached response or 429 for too many requests
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    requestTracker.set(user.id, now);

    // Clean up old entries periodically
    if (requestTracker.size > 1000) {
      const cutoff = now - DEBOUNCE_TIME * 60; // Keep last minute
      for (const [userId, timestamp] of requestTracker.entries()) {
        if (timestamp < cutoff) {
          requestTracker.delete(userId);
        }
      }
    }

    const userProfile = await getUserBySupabaseId(user.id);

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Compute ETag for conditional requests
    const body = { user: userProfile };
    const etag = 'W/"' + crypto.createHash('sha1').update(JSON.stringify(body)).digest('hex') + '"';
    const ifNoneMatch = request.headers.get('if-none-match');
    const headers = {
      'Cache-Control': 'private, max-age=600, stale-while-revalidate=300, must-revalidate',
      ETag: etag,
      'Vary': 'Authorization',
    };

    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304, headers });
    }

    return NextResponse.json(body, { headers });
  } catch (error) {
    console.error('Unexpected error in GET /api/auth/user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // Whitelist fields to prevent mass assignment
    const allowed = [
      'role', 'name', 'bio', 'location', 'website', 'linkedin_url', 'github_url',
      'phone', 'country', 'city', 'timezone', 'language', 'twitter_url',
      // Student fields
      'grade', 'school_name', 'date_of_birth', 'learning_goals', 'subjects_of_interest',
      'learning_style', 'difficulty_preference',
      // Parent fields
      'occupation', 'number_of_children', 'education_level', 'parenting_experience', 'children_age_range'
    ];
    Object.keys(body).forEach((k) => { if (!allowed.includes(k)) delete body[k]; });

    try {
      // Update user profile directly
      const updatedUser = await updateUser(user.id, {
        ...body,
        role: body.role ? body.role.toLowerCase() : undefined
      });

      return NextResponse.json({ user: updatedUser }, { status: 200 });
    } catch (updateError) {
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
