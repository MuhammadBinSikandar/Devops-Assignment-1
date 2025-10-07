import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAllUsers, getUserBySupabaseId } from '@/lib/database'

/**
 * Admin Users API - Get all users for admin panel
 * 
 * Security: Only admin users can access this endpoint
 */

export async function GET(request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check admin role
    const userProfile = await getUserBySupabaseId(user.id)
    
    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    if (!userProfile.isApproved) {
      return NextResponse.json({ error: 'Admin account not approved' }, { status: 403 })
    }

    // Get all users
    const users = await getAllUsers()
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error in admin users API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}




