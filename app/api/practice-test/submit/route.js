import { db } from '@/configs/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { PRACTICE_TESTS_TABLE } from '@/configs/schema';

export async function POST(req) {
    try {
        const { testId, userAnswers, timeSpent } = await req.json();

        if (!testId || !userAnswers) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Update the practice test with user answers and completion status
        const result = await db.update(PRACTICE_TESTS_TABLE)
            .set({
                userAnswers: userAnswers,
                timeSpent: timeSpent || null,
                status: 'completed',
                completedAt: new Date()
            })
            .where(eq(PRACTICE_TESTS_TABLE.id, testId))
            .returning({
                id: PRACTICE_TESTS_TABLE.id,
                status: PRACTICE_TESTS_TABLE.status
            });

        if (!result || result.length === 0) {
            return NextResponse.json({ error: 'Practice test not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Test submitted successfully',
            testId: result[0].id
        });

    } catch (error) {
        console.error('Error submitting practice test:', error);
        return NextResponse.json({ error: 'Failed to submit practice test' }, { status: 500 });
    }
}
