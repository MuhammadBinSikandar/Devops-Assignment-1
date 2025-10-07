import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUserBySupabaseId, getUserById, rejectUser } from '@/lib/database'

/**
 * Admin Reject User API
 * 
 * Security: Only admin users can reject other users
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

    if (!adminProfile.isApproved) {
      return NextResponse.json({ error: 'Admin account not approved' }, { status: 403 })
    }

    // Get the user to be rejected
    const targetUser = await getUserById(userId)

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Don't allow rejecting admin users (they should be managed differently)
    if (targetUser.role === 'admin') {
      return NextResponse.json({ error: 'Cannot reject admin users through this endpoint' }, { status: 400 })
    }

    // Reject the user
    const rejectedUser = await rejectUser(userId, adminProfile.email)

    return NextResponse.json({
      success: true,
      user: rejectedUser,
      message: 'User rejected successfully'
    })
  } catch (error) {
    console.error('Error in admin reject user API:', error)
    return NextResponse.json(
      { error: 'Failed to reject user' },
      { status: 500 }
    )
  }
}
