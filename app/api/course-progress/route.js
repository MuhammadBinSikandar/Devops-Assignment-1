import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { and, eq } from 'drizzle-orm';
import { COURSE_PROGRESS_TABLE } from '@/configs/schema';

export async function POST(req) {
    try {
        const { userId, courseId, chapterId, progressPercentage } = await req.json();

        if (!userId || !courseId) {
            return NextResponse.json({ error: 'userId and courseId are required' }, { status: 400 });
        }

        const now = new Date();

        // Check if a progress record exists for this user and course
        const existing = await db
            .select()
            .from(COURSE_PROGRESS_TABLE)
            .where(and(
                eq(COURSE_PROGRESS_TABLE.userId, userId),
                eq(COURSE_PROGRESS_TABLE.courseId, courseId)
            ));

        if (existing && existing.length > 0) {
            const current = existing[0];
            const newProgress = Math.max(current.progressPercentage || 0, Math.min(100, Math.round(progressPercentage || 0)));

            const updated = await db
                .update(COURSE_PROGRESS_TABLE)
                .set({
                    chapterId: chapterId ?? current.chapterId,
                    progressPercentage: newProgress,
                    lastAccessedAt: now,
                    updatedAt: now,
                    completedAt: newProgress >= 100 ? now : current.completedAt,
                })
                .where(and(
                    eq(COURSE_PROGRESS_TABLE.userId, userId),
                    eq(COURSE_PROGRESS_TABLE.courseId, courseId)
                ))
                .returning();

            return NextResponse.json({ result: updated?.[0] || null });
        }

        const initialProgress = Math.min(100, Math.round(progressPercentage || 0));

        const inserted = await db
            .insert(COURSE_PROGRESS_TABLE)
            .values({
                userId,
                courseId,
                chapterId: chapterId ?? null,
                progressPercentage: initialProgress,
                lastAccessedAt: now,
                createdAt: now,
                updatedAt: now,
                completedAt: initialProgress >= 100 ? now : null,
            })
            .returning();

        return NextResponse.json({ result: inserted?.[0] || null });
    } catch (error) {
        console.error('Error updating course progress:', error);
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = Number(searchParams.get('userId'));
        const courseId = searchParams.get('courseId');

        if (!userId || !courseId) {
            return NextResponse.json({ error: 'userId and courseId are required' }, { status: 400 });
        }

        const existing = await db
            .select()
            .from(COURSE_PROGRESS_TABLE)
            .where(and(
                eq(COURSE_PROGRESS_TABLE.userId, userId),
                eq(COURSE_PROGRESS_TABLE.courseId, courseId)
            ));

        return NextResponse.json({ result: existing?.[0] || null });
    } catch (error) {
        console.error('Error fetching course progress:', error);
        return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }
}


