import { db } from '@/configs/db';
import { QUIZ_RESULTS_TABLE } from '@/configs/schema';
import { NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';

export async function POST(request) {
    try {
        const { courseId, chapterId, score, totalQuestions, timeSpent, answers, userId } = await request.json();

        if (!courseId || score === undefined || !totalQuestions || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields: courseId, score, totalQuestions, userId' },
                { status: 400 }
            );
        }

        // Insert quiz result
        const result = await db.insert(QUIZ_RESULTS_TABLE).values({
            userId: userId,
            courseId: courseId,
            chapterId: chapterId || 1, // Default to chapter 1 if not provided
            score: score,
            totalQuestions: totalQuestions,
            timeSpent: timeSpent,
            answers: answers
        }).returning({
            id: QUIZ_RESULTS_TABLE.id
        });

        return NextResponse.json({
            success: true,
            resultId: result[0].id,
            message: 'Quiz result saved successfully'
        });

    } catch (error) {
        console.error('Error saving quiz result:', error);
        return NextResponse.json(
            { error: 'Failed to save quiz result' },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');
        const userId = searchParams.get('userId');

        if (!courseId || !userId) {
            return NextResponse.json(
                { error: 'Missing courseId or userId parameter' },
                { status: 400 }
            );
        }

        // Get quiz results for the user and course
        const results = await db.select().from(QUIZ_RESULTS_TABLE)
            .where(
                and(
                    eq(QUIZ_RESULTS_TABLE.userId, userId),
                    eq(QUIZ_RESULTS_TABLE.courseId, courseId)
                )
            )
            .orderBy(desc(QUIZ_RESULTS_TABLE.createdAt));

        return NextResponse.json(results);

    } catch (error) {
        console.error('Error fetching quiz results:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quiz results' },
            { status: 500 }
        );
    }
}