import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserBySupabaseId } from '@/lib/database';
import { db } from '@/configs/db';
import { PARENT_CHILD_CONNECTIONS_TABLE } from '@/configs/schema';
import { eq, and } from 'drizzle-orm';

// PATCH - Accept or reject connection request
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { action } = await request.json(); // 'accept' or 'reject'
    
    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "accept" or "reject"' }, { status: 400 });
    }

    const userProfile = await getUserBySupabaseId(user.id);
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get the connection request
    const [connection] = await db.select().from(PARENT_CHILD_CONNECTIONS_TABLE)
      .where(eq(PARENT_CHILD_CONNECTIONS_TABLE.id, parseInt(id)));

    if (!connection) {
      return NextResponse.json({ error: 'Connection request not found' }, { status: 404 });
    }

    // Verify user is authorized to respond to this request
    const isParent = connection.parentId === userProfile.id;
    const isStudent = connection.studentId === userProfile.id;
    
    if (!isParent && !isStudent) {
      return NextResponse.json({ error: 'Not authorized to respond to this request' }, { status: 403 });
    }

    // Check if request is still pending
    if (connection.status !== 'pending') {
      return NextResponse.json({ error: 'This request has already been processed' }, { status: 400 });
    }

    // For students accepting: check if they already have a connected parent
    if (action === 'accept' && isStudent) {
      const existingConnections = await db.select().from(PARENT_CHILD_CONNECTIONS_TABLE)
        .where(
          and(
            eq(PARENT_CHILD_CONNECTIONS_TABLE.studentId, userProfile.id),
            eq(PARENT_CHILD_CONNECTIONS_TABLE.status, 'accepted')
          )
        );
      
      if (existingConnections.length > 0) {
        return NextResponse.json({ 
          error: 'Student can only connect to one parent account' 
        }, { status: 400 });
      }
    }

    // Update connection status
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const [updatedConnection] = await db.update(PARENT_CHILD_CONNECTIONS_TABLE)
      .set({ 
        status: newStatus,
        updatedAt: new Date()
      })
      .where(eq(PARENT_CHILD_CONNECTIONS_TABLE.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      success: true, 
      connection: updatedConnection,
      message: `Connection request ${action}ed successfully`
    });

  } catch (error) {
    console.error('Error updating connection request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove/disconnect connection
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const userProfile = await getUserBySupabaseId(user.id);
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get the connection
    const [connection] = await db.select().from(PARENT_CHILD_CONNECTIONS_TABLE)
      .where(eq(PARENT_CHILD_CONNECTIONS_TABLE.id, parseInt(id)));

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Verify user is authorized to delete this connection
    const isParent = connection.parentId === userProfile.id;
    const isStudent = connection.studentId === userProfile.id;
    
    if (!isParent && !isStudent) {
      return NextResponse.json({ error: 'Not authorized to delete this connection' }, { status: 403 });
    }

    // Delete the connection
    await db.delete(PARENT_CHILD_CONNECTIONS_TABLE)
      .where(eq(PARENT_CHILD_CONNECTIONS_TABLE.id, parseInt(id)));

    return NextResponse.json({ 
      success: true,
      message: 'Connection removed successfully'
    });

  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
