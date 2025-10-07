import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUserBySupabaseId, getUserById, approveUser } from '@/lib/database'

/**
 * Admin Approve User API
 * 
 * Security: Only admin users can approve other users
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

    // Get the user to be approved
    const targetUser = await getUserById(userId)

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Don't allow approving admin users (they should be managed differently)
    if (targetUser.role === 'admin') {
      return NextResponse.json({ error: 'Cannot approve admin users through this endpoint' }, { status: 400 })
    }

    // Approve the user
    const approvedUser = await approveUser(userId, adminProfile.email)

    return NextResponse.json({
      success: true,
      user: approvedUser,
      message: 'User approved successfully'
    })
  } catch (error) {
    console.error('Error in admin approve user API:', error)
    return NextResponse.json(
      { error: 'Failed to approve user' },
      { status: 500 }
    )
  }
}
