import { db } from '@/configs/db';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { PRACTICE_TESTS_TABLE } from '@/configs/schema';

export async function POST(req) {
    try {
        const { courseId, chapterId, userId } = await req.json();

        console.log('Practice test API request:', { courseId, chapterId, userId });

        if (!courseId || !chapterId || !userId) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Fetch practice test for the specific chapter
        const practiceTest = await db.select().from(PRACTICE_TESTS_TABLE)
            .where(and(
                eq(PRACTICE_TESTS_TABLE.courseId, courseId),
                eq(PRACTICE_TESTS_TABLE.chapterId, chapterId),
                eq(PRACTICE_TESTS_TABLE.userId, userId),
                eq(PRACTICE_TESTS_TABLE.testType, 'chapter')
            ))
            .limit(1);

        if (!practiceTest || practiceTest.length === 0) {
            return NextResponse.json({ error: 'Practice test not found' }, { status: 404 });
        }

        return NextResponse.json(practiceTest[0]);

    } catch (error) {
        console.error('Error fetching practice test:', error);
        return NextResponse.json({ error: 'Failed to fetch practice test' }, { status: 500 });
    }
}
