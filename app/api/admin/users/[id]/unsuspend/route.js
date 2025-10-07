import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUserBySupabaseId, getUserById, unsuspendUser } from '@/lib/database'

/**
 * Admin Unsuspend User API
 * 
 * Security: Only admin users can unsuspend other users
 */

export async function POST(request, { params }) {
  try {
    const supabase = await createClient()

    // Await params as required by Next.js 15
    const resolvedParams = await params
    const userId = parseInt(resolvedParams.id)

    // Validate user ID
    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get admin profile to verify admin role
    const adminProfile = await getUserBySupabaseId(user.id)

    if (!adminProfile || adminProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get the user to be unsuspended
    const targetUser = await getUserById(userId)

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Don't allow unsuspending admin users (they shouldn't be suspended anyway)
    if (targetUser.role === 'admin') {
      return NextResponse.json({ error: 'Cannot unsuspend admin users' }, { status: 400 })
    }

    // Unsuspend the user
    const unsuspendedUser = await unsuspendUser(userId, adminProfile.email)

    return NextResponse.json({
      success: true,
      user: unsuspendedUser,
      message: 'User unsuspended successfully'
    })
  } catch (error) {
    console.error('Error in admin unsuspend user API:', error)
    return NextResponse.json(
      { error: 'Failed to unsuspend user' },
      { status: 500 }
    )
  }
}





