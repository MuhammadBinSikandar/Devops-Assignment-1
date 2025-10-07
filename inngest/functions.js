// inngest/functions.js

import { inngest } from "./client";
import { db } from '@/configs/db';
import { eq } from 'drizzle-orm';
import { USER_TABLE } from '@/configs/schema';
import { generateNotes, generateStudyTypeContentAIModel, generateQuiz, generateMixedPracticeTestAIModel } from "@/configs/AiModel";
import { STUDY_MATERIAL_TABLE, CHAPTER_NOTES_TABLE, STUDY_TYPE_CONTENT_TABLE, PRACTICE_TESTS_TABLE } from '@/configs/schema';

export const GenerateNotes = inngest.createFunction(
    {
        id: "generate-course-notes",
        concurrency: {
            limit: 5 // Limit concurrent executions to avoid rate limits
        }
    },
    { event: 'notes.generate' },

    async ({ event, step }) => {
        const { course } = event.data;
        const chapters = course?.courseLayout?.chapters;

        if (!chapters || !Array.isArray(chapters)) {
            // Update course status to error
            await step.run("update-course-error", async () => {
                await db.update(STUDY_MATERIAL_TABLE)
                    .set({ status: 'Error' })
                    .where(eq(STUDY_MATERIAL_TABLE.courseId, course?.courseId));
            });
            throw new Error("Invalid course layout: chapters not found or not an array");
        }

        console.log(`Starting to generate notes for ${chapters.length} chapters for course: ${course?.courseId}`);

        // Update course status to generating
        await step.run("update-course-generating", async () => {
            await db.update(STUDY_MATERIAL_TABLE)
                .set({ status: 'Generating' })
                .where(eq(STUDY_MATERIAL_TABLE.courseId, course?.courseId));
        });

        // Process each chapter as a separate step for better reliability
        for (let index = 0; index < chapters.length; index++) {
            const chapter = chapters[index];
            const chapterTitle = chapter?.ChapterTitle || chapter?.chapter_title || `Chapter ${index + 1}`;

            await step.run(`generate-chapter-${index}`, async () => {
                console.log(`Processing chapter ${index + 1}/${chapters.length}: ${chapterTitle}`);

                const PROMPT = `
                You are an expert course author creating high-quality technical study material. 
                Expand the following chapter into **a full learning unit** with the following rules:

                1. **Content Structure**
                - <h3> for the chapter title
                - <h4> for each topic/subtopic
                - <p> with 300+ words of narrative explanation
                - <ul>/<li> for bullet-point breakdowns
                - <code> for algorithms, pseudocode, or syntax examples

                2. **Pedagogy**
                - Begin with a <p><strong>Learning Objectives</strong></p><ul><li>…</li></ul>
                - Provide analogies and real-world use cases
                - At the end of each topic, include <p><strong>Summary</strong></p>

                3. **Depth**
                - Explain WHY concepts matter, not just WHAT they are
                - Compare/contrast with related ideas
                - Include time complexity, trade-offs, and pitfalls for algorithms
                - Add at least 1 practical example per topic

                Chapter input (JSON):
                ${JSON.stringify(chapter, null, 2)}
                `;


                const aiResponse = await generateNotes(PROMPT);

                // Insert chapter notes with retry logic
                let retryCount = 0;
                const maxRetries = 3;

                while (retryCount < maxRetries) {
                    try {
                        await db.insert(CHAPTER_NOTES_TABLE).values({
                            courseId: course?.courseId,
                            chapterId: index + 1,
                            notes: aiResponse
                        });
                        console.log(`✅ Successfully saved notes for chapter ${index + 1}: ${chapterTitle}`);
                        break;
                    } catch (dbError) {
                        retryCount++;
                        console.error(`❌ Database error on attempt ${retryCount} for chapter ${index + 1}:`, dbError.message);

                        if (retryCount >= maxRetries) {
                            throw new Error(`Database insertion failed for chapter ${index + 1}: ${dbError.message}`);
                        }

                        // Exponential backoff
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                    }
                }

                // Generate practice test for this chapter after notes are saved
                console.log(`🧪 Generating practice test for chapter ${index + 1}: ${chapterTitle}`);

                // Calculate question distribution for chapter tests (10 questions)
                const totalQuestions = 10;
                const mcqCount = Math.round(totalQuestions * 0.4);
                const trueFalseCount = Math.round(totalQuestions * 0.3);
                const descriptiveCount = totalQuestions - mcqCount - trueFalseCount;

                const practiceTestPrompt = `Create a comprehensive practice test for Chapter ${index + 1}: ${chapterTitle}.
                
                Use the following chapter content as the basis for your questions:
                ${aiResponse}
                
                Generate exactly ${totalQuestions} questions with this distribution:
                - ${mcqCount} Multiple Choice Questions (4 options each)
                - ${trueFalseCount} True/False Questions 
                - ${descriptiveCount} Descriptive Questions (short answer/essay)
                
                Focus on key concepts, practical applications, and understanding from the provided chapter content.`;

                // Generate practice test content using AI
                const practiceTestContent = await generateMixedPracticeTestAIModel(practiceTestPrompt, mcqCount, trueFalseCount, descriptiveCount);

                // Get the actual user ID from the database using the email
                let actualUserId = null;
                try {
                    const userRecord = await db.select().from(USER_TABLE)
                        .where(eq(USER_TABLE.email, course?.createdFor))
                        .limit(1);

                    if (userRecord.length > 0) {
                        actualUserId = userRecord[0].id;
                    } else {
                        console.error(`User not found with email: ${course?.createdFor}`);
                        // Skip practice test generation for this chapter if user not found
                        return;
                    }
                } catch (userError) {
                    console.error(`Error fetching user: ${userError.message}`);
                    // Skip practice test generation for this chapter if user lookup fails
                    return;
                }

                // Insert practice test with retry logic
                let practiceTestRetryCount = 0;

                while (practiceTestRetryCount < maxRetries) {
                    try {
                        await db.insert(PRACTICE_TESTS_TABLE).values({
                            userId: actualUserId,
                            courseId: course?.courseId,
                            chapterId: index + 1,
                            testType: 'chapter',
                            questions: practiceTestContent.questions,
                            totalQuestions: totalQuestions,
                            mcqCount: mcqCount,
                            trueFalseCount: trueFalseCount,
                            descriptiveCount: descriptiveCount,
                            status: 'ready'
                        });
                        console.log(`✅ Successfully saved practice test for chapter ${index + 1}: ${chapterTitle}`);
                        break;
                    } catch (dbError) {
                        practiceTestRetryCount++;
                        console.error(`❌ Database error on attempt ${practiceTestRetryCount} for practice test ${index + 1}:`, dbError.message);

                        if (practiceTestRetryCount >= maxRetries) {
                            console.error(`Failed to save practice test for chapter ${index + 1}: ${dbError.message}`);
                            // Don't throw error here, just log it and continue with other chapters
                            break;
                        }

                        // Exponential backoff
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, practiceTestRetryCount) * 1000));
                    }
                }
            });
        }

        // Update course status to ready
        await step.run("update-course-ready", async () => {
            await db.update(STUDY_MATERIAL_TABLE)
                .set({ status: 'Ready' })
                .where(eq(STUDY_MATERIAL_TABLE.courseId, course?.courseId));
            console.log(`✅ Course ${course?.courseId} notes and practice tests generation completed successfully`);
        });

        return {
            success: true,
            courseId: course?.courseId,
            chaptersProcessed: chapters.length,
            message: 'All chapters and practice tests processed successfully'
        };
    });

export const GenerateStudyTypeContent = inngest.createFunction(
    { id: "generate-study-type-content" },
    { event: "studytype.content" },
    async ({ event, step }) => {
        const { studyType, prompt, courseId, recordId } = event.data;

        let AIResult;
        if (studyType == 'flashcard') {
            AIResult = await step.run("Generating Flashcards", async () => {
                return await generateStudyTypeContentAIModel(prompt);
            });
        } else if (studyType == 'quiz') {
            AIResult = await step.run("Generating Quiz", async () => {
                return await generateQuiz(prompt);
            });
        } else {
            throw new Error(`Unsupported study type: ${studyType}`);
        }


        await step.run("Saving to DB", async () => {
            try {
                await db.update(STUDY_TYPE_CONTENT_TABLE).set({
                    content: AIResult,
                    status: "Ready"
                }).where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));

                console.log(`✅ Successfully saved ${studyType} content for record ${recordId}`);
                return "Data Inserted";
            } catch (error) {
                console.error(`❌ Database update failed for ${studyType}:`, error);
                throw error;
            }
        });

    }
);

export const GeneratePracticeTest = inngest.createFunction(
    { id: "generate-practice-test" },
    { event: "practice.test.generate" },
    async ({ event, step }) => {
        const { testId, prompt, testType, mcqCount, trueFalseCount, descriptiveCount } = event.data;

        const testContent = await step.run("Generating Mixed Test Questions", async () => {
            return await generateMixedPracticeTestAIModel(prompt, mcqCount, trueFalseCount, descriptiveCount);
        });

        await step.run("Saving Test to DB", async () => {
            await db.update(PRACTICE_TESTS_TABLE).set({
                questions: testContent.questions,
                status: "ready"
            }).where(eq(PRACTICE_TESTS_TABLE.id, testId));

            return "Mixed Test Generated";
        });
    }
);