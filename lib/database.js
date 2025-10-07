import { db } from '@/configs/db';
import { USER_TABLE, STUDY_MATERIAL_TABLE, CHAPTER_NOTES_TABLE } from '@/configs/schema';
import { eq } from 'drizzle-orm';

// User management functions
export async function createUser({ supabaseId, email, name, role = 'student' }) {
  try {
    const result = await db.insert(USER_TABLE)
      .values({
        supabaseId,
        email,
        name,
        role: role.toLowerCase(),
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUserBySupabaseId(supabaseId) {
  try {
    const result = await db.select()
      .from(USER_TABLE)
      .where(eq(USER_TABLE.supabaseId, supabaseId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error getting user by Supabase ID:', error);
    throw error;
  }
}

export async function getUserByEmail(email) {
  try {
    const result = await db.select()
      .from(USER_TABLE)
      .where(eq(USER_TABLE.email, email))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

export async function updateUser(supabaseId, updates) {
  try {
    const result = await db.update(USER_TABLE)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(USER_TABLE.supabaseId, supabaseId))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function updateUserByEmail(email, updates) {
  try {
    const result = await db.update(USER_TABLE)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(USER_TABLE.email, email))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error updating user by email:', error);
    throw error;
  }
}

// Admin functions
export async function getAllUsers() {
  try {
    const result = await db.select()
      .from(USER_TABLE)
      .orderBy(USER_TABLE.createdAt);

    return result;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

export async function getUserById(id) {
  try {
    const result = await db.select()
      .from(USER_TABLE)
      .where(eq(USER_TABLE.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

export async function approveUser(userId, approvedBy) {
  try {
    const result = await db.update(USER_TABLE)
      .set({
        isApproved: true,
        approvedBy: approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(USER_TABLE.id, userId))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error approving user:', error);
    throw error;
  }
}

export async function rejectUser(userId, rejectedBy) {
  try {
    const result = await db.update(USER_TABLE)
      .set({
        isApproved: false,
        approvedBy: rejectedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(USER_TABLE.id, userId))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error rejecting user:', error);
    throw error;
  }
}

export async function suspendUser(userId, suspendedBy, reason = '') {
  try {
    const result = await db.update(USER_TABLE)
      .set({
        isSuspended: true,
        suspendedBy: suspendedBy,
        suspendedAt: new Date(),
        suspensionReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(USER_TABLE.id, userId))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error suspending user:', error);
    throw error;
  }
}

export async function unsuspendUser(userId, unsuspendedBy) {
  try {
    const result = await db.update(USER_TABLE)
      .set({
        isSuspended: false,
        suspendedBy: unsuspendedBy,
        suspendedAt: new Date(),
        suspensionReason: 'Account reinstated',
        updatedAt: new Date(),
      })
      .where(eq(USER_TABLE.id, userId))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error unsuspending user:', error);
    throw error;
  }
}

// Study material functions
export async function createStudyMaterial(data) {
  try {
    const result = await db.insert(STUDY_MATERIAL_TABLE)
      .values(data)
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error creating study material:', error);
    throw error;
  }
}

export async function getStudyMaterialByUser(createdBy) {
  try {
    const result = await db.select()
      .from(STUDY_MATERIAL_TABLE)
      .where(eq(STUDY_MATERIAL_TABLE.createdBy, createdBy));

    return result;
  } catch (error) {
    console.error('Error getting study materials:', error);
    throw error;
  }
}

export async function getStudyMaterialById(id) {
  try {
    const result = await db.select()
      .from(STUDY_MATERIAL_TABLE)
      .where(eq(STUDY_MATERIAL_TABLE.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error getting study material by ID:', error);
    throw error;
  }
}

// Chapter notes functions
export async function createChapterNotes(data) {
  try {
    const result = await db.insert(CHAPTER_NOTES_TABLE)
      .values(data)
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error creating chapter notes:', error);
    throw error;
  }
}

export async function getChapterNotes(courseId, chapterId) {
  try {
    const { and } = await import('drizzle-orm');
    const result = await db.select()
      .from(CHAPTER_NOTES_TABLE)
      .where(and(
        eq(CHAPTER_NOTES_TABLE.courseId, courseId),
        eq(CHAPTER_NOTES_TABLE.chapterId, chapterId)
      ))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error getting chapter notes:', error);
    throw error;
  }
}