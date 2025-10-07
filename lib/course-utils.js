import { db } from '@/configs/db';
import { eq } from 'drizzle-orm';
import { generateNotes } from "@/configs/AiModel";
import { STUDY_MATERIAL_TABLE, CHAPTER_NOTES_TABLE } from "@/configs/schema";

/**
 * Generate course notes for all chapters
 * Replaces the Inngest GenerateNotes function
 */
export async function generateCourseNotes(course) {
    try {
        console.log('Starting course notes generation for course:', course?.courseId);

        const chapters = course?.courseLayout?.chapters;
        if (!chapters || !Array.isArray(chapters)) {
            throw new Error('Course chapters not found or invalid format');
        }

        // Generate notes for each chapter
        for (let index = 0; index < chapters.length; index++) {
            const chapter = chapters[index];
            console.log(`Generating notes for chapter ${index + 1}: ${chapter.name || 'Unnamed Chapter'}`);

            const prompt = `Generate exam material detail content for each chapter. Make sure to cover all the topic points in the content. Make sure to give content in HTML (Do not add HTML, Head, Body, Title tag), The chapters. Provide detailed content for all the topics of the chapter ${JSON.stringify(chapter)}`;

            const aiResponse = await generateNotes(prompt);

            // Insert chapter notes into database
            await db.insert(CHAPTER_NOTES_TABLE).values({
                courseId: course?.courseId,
                chapterId: index,
                notes: aiResponse
            });

            console.log(`Generated notes for chapter ${index + 1}`);
        }

        // Update course status to ready
        await db.update(STUDY_MATERIAL_TABLE)
            .set({ status: 'Ready' })
            .where(eq(STUDY_MATERIAL_TABLE.courseId, course?.courseId));

        console.log('Course notes generation completed successfully');
        return { success: true, message: 'Course notes generated successfully' };

    } catch (error) {
        console.error('Error generating course notes:', error);

        // Update course status to error
        try {
            await db.update(STUDY_MATERIAL_TABLE)
                .set({ status: 'Error' })
                .where(eq(STUDY_MATERIAL_TABLE.courseId, course?.courseId));
        } catch (updateError) {
            console.error('Error updating course status to error:', updateError);
        }

        throw error;
    }
}

/**
 * Generate course notes asynchronously (fire and forget)
 * For cases where we don't want to wait for completion
 */
export async function generateCourseNotesAsync(course) {
    // Start the generation process without waiting for it
    generateCourseNotes(course).catch(error => {
        console.error('Async course notes generation failed:', error);
    });

    return { success: true, message: 'Course notes generation started' };
}

/**
 * Get course notes by course ID
 */
export async function getCourseNotes(courseId) {
    try {
        const notes = await db.select()
            .from(CHAPTER_NOTES_TABLE)
            .where(eq(CHAPTER_NOTES_TABLE.courseId, courseId))
            .orderBy(CHAPTER_NOTES_TABLE.chapterId);

        return { success: true, notes };
    } catch (error) {
        console.error('Error fetching course notes:', error);
        throw error;
    }
}

/**
 * Check if course notes are ready
 */
export async function checkCourseStatus(courseId) {
    try {
        const course = await db.select()
            .from(STUDY_MATERIAL_TABLE)
            .where(eq(STUDY_MATERIAL_TABLE.courseId, courseId))
            .limit(1);

        if (course.length === 0) {
            return { success: false, message: 'Course not found' };
        }

        return {
            success: true,
            status: course[0].status,
            course: course[0]
        };
    } catch (error) {
        console.error('Error checking course status:', error);
        throw error;
    }
}

