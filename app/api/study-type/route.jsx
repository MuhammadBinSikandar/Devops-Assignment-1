
import { db } from '@/configs/db'
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { CHAPTER_NOTES_TABLE, STUDY_TYPE_CONTENT_TABLE } from '@/configs/schema';

export async function POST(req) {
    try {
        const { courseId, studyType } = await req.json();

        if (studyType == "ALL") {
            // Fetch notes
            const notes = await db.select().from(CHAPTER_NOTES_TABLE)
                .where(eq(CHAPTER_NOTES_TABLE.courseId, courseId));

            // Fetch flashcards
            const contentList = await db.select().from(STUDY_TYPE_CONTENT_TABLE)
                .where(eq(STUDY_TYPE_CONTENT_TABLE?.courseId, courseId));

            const result = {
                notes: notes,
                flashcard: contentList?.filter(item => item.type === 'flashcard') || null,
                quiz: contentList?.filter(item => item.type === 'quiz') || null,
                qa: null
            }

            return NextResponse.json(result);

        } else if (studyType == 'notes') {
            const notes = await db.select().from(CHAPTER_NOTES_TABLE)
                .where(eq(CHAPTER_NOTES_TABLE.courseId, courseId));
            return NextResponse.json(notes);
        } else if (studyType == 'flashcard') {
            const flashcards = await db.select().from(STUDY_TYPE_CONTENT_TABLE)
                .where(and(eq(STUDY_TYPE_CONTENT_TABLE?.courseId, courseId), eq(STUDY_TYPE_CONTENT_TABLE?.type, studyType)));
            return NextResponse.json(flashcards);
        } else if (studyType == 'quiz') {
            const quizzes = await db.select().from(STUDY_TYPE_CONTENT_TABLE)
                .where(and(eq(STUDY_TYPE_CONTENT_TABLE?.courseId, courseId), eq(STUDY_TYPE_CONTENT_TABLE?.type, studyType)));
            return NextResponse.json(quizzes);
        }

        return NextResponse.json({ error: 'Invalid study type' }, { status: 400 });

    } catch (error) {
        console.error('Error fetching study materials:', error);
        return NextResponse.json({ error: 'Failed to fetch study materials' }, { status: 500 });
    }
}




