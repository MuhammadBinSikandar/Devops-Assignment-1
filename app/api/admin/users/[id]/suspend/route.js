import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUserBySupabaseId, getUserById, suspendUser } from '@/lib/database'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Admin Suspend User API
 * 
 * Security: Only admin users can suspend other users
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

    // Get the user to be suspended
    const targetUser = await getUserById(userId)

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Don't allow suspending admin users
    if (targetUser.role === 'admin') {
      return NextResponse.json({ error: 'Cannot suspend admin users' }, { status: 400 })
    }

    // Get suspension reason from request body
    const body = await request.json()
    const reason = body.reason || 'Account suspended by admin'

    // Suspend the user
    const suspendedUser = await suspendUser(userId, adminProfile.email, reason)

    // Immediately revoke all sessions for the suspended user
    try {
      const admin = createAdminClient()
      // We need target user's Supabase auth UID to revoke; we have users table row
      if (targetUser?.supabaseId) {
        await admin.auth.admin.signOut(targetUser.supabaseId)
      }
    } catch (revokeErr) {
      console.warn('Failed to revoke sessions for suspended user:', revokeErr)
    }

    return NextResponse.json({
      success: true,
      user: suspendedUser,
      message: 'User suspended successfully'
    })
  } catch (error) {
    console.error('Error in admin suspend user API:', error)
    return NextResponse.json(
      { error: 'Failed to suspend user' },
      { status: 500 }
    )
  }
}





