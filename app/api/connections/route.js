import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserBySupabaseId, getUserByEmail } from '@/lib/database';
import { db } from '@/configs/db';
import { PARENT_CHILD_CONNECTIONS_TABLE } from '@/configs/schema';
import { eq, and, or } from 'drizzle-orm';

// GET - Fetch connection requests for current user
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await getUserBySupabaseId(user.id);
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get all connections related to this user
    const connections = await db.select().from(PARENT_CHILD_CONNECTIONS_TABLE)
      .where(
        or(
          eq(PARENT_CHILD_CONNECTIONS_TABLE.parentId, userProfile.id),
          eq(PARENT_CHILD_CONNECTIONS_TABLE.studentId, userProfile.id)
        )
      );

    // Fetch user names for all connections
    const enrichedConnections = await Promise.all(
      connections.map(async (conn) => {
        // Get parent user details
        const parentUser = await getUserByEmail(conn.parentEmail);
        // Get student user details  
        const studentUser = await getUserByEmail(conn.studentEmail);

        return {
          ...conn,
          parentName: parentUser?.name || 'Unknown User',
          studentName: studentUser?.name || 'Unknown User'
        };
      })
    );

    // Separate pending requests from accepted connections
    const pendingRequests = enrichedConnections.filter(conn => conn.status === 'pending');
    const acceptedConnections = enrichedConnections.filter(conn => conn.status === 'accepted');

    return NextResponse.json({
      pendingRequests,
      acceptedConnections
    });

  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send connection request
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetEmail } = await request.json();

    if (!targetEmail) {
      return NextResponse.json({ error: 'Target email is required' }, { status: 400 });
    }

    const senderProfile = await getUserBySupabaseId(user.id);
    if (!senderProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Find target user by email
    const targetProfile = await getUserByEmail(targetEmail);
    if (!targetProfile) {
      return NextResponse.json({ error: 'User with this email not found' }, { status: 404 });
    }

    // Validate role compatibility
    const senderRole = senderProfile.role.toLowerCase();
    const targetRole = targetProfile.role.toLowerCase();

    if (!((senderRole === 'parent' && targetRole === 'student') ||
      (senderRole === 'student' && targetRole === 'parent'))) {
      return NextResponse.json({
        error: 'Connection can only be made between parent and student accounts'
      }, { status: 400 });
    }

    // Prevent self-connection
    if (senderProfile.id === targetProfile.id) {
      return NextResponse.json({ error: 'Cannot connect to yourself' }, { status: 400 });
    }

    // Check if connection already exists
    const existingConnection = await db.select().from(PARENT_CHILD_CONNECTIONS_TABLE)
      .where(
        or(
          and(
            eq(PARENT_CHILD_CONNECTIONS_TABLE.parentId, senderProfile.id),
            eq(PARENT_CHILD_CONNECTIONS_TABLE.studentId, targetProfile.id)
          ),
          and(
            eq(PARENT_CHILD_CONNECTIONS_TABLE.parentId, targetProfile.id),
            eq(PARENT_CHILD_CONNECTIONS_TABLE.studentId, senderProfile.id)
          )
        )
      );

    if (existingConnection.length > 0) {
      return NextResponse.json({
        error: 'Connection request already exists or connection is already established'
      }, { status: 400 });
    }

    // For students, check if they already have a connected parent
    if (senderRole === 'student') {
      const studentConnections = await db.select().from(PARENT_CHILD_CONNECTIONS_TABLE)
        .where(
          and(
            eq(PARENT_CHILD_CONNECTIONS_TABLE.studentId, senderProfile.id),
            eq(PARENT_CHILD_CONNECTIONS_TABLE.status, 'accepted')
          )
        );

      if (studentConnections.length > 0) {
        return NextResponse.json({
          error: 'Student can only connect to one parent account'
        }, { status: 400 });
      }
    }

    // Create connection request
    const connectionData = {
      parentId: senderRole === 'parent' ? senderProfile.id : targetProfile.id,
      studentId: senderRole === 'student' ? senderProfile.id : targetProfile.id,
      parentEmail: senderRole === 'parent' ? senderProfile.email : targetProfile.email,
      studentEmail: senderRole === 'student' ? senderProfile.email : targetProfile.email,
      status: 'pending',
      requestedBy: senderRole
    };

    const [newConnection] = await db.insert(PARENT_CHILD_CONNECTIONS_TABLE)
      .values(connectionData)
      .returning();

    return NextResponse.json({
      success: true,
      connection: newConnection,
      message: 'Connection request sent successfully'
    });

  } catch (error) {
    console.error('Error creating connection request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
