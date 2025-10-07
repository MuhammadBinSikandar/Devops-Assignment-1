import { generateCourseOutline } from "@/configs/AiModel";
import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { STUDY_MATERIAL_TABLE } from "@/configs/schema";
import { inngest } from "@/inngest/client";

export async function POST(req) {
    try {
        const { courseId, topic, studyType, difficultyLevel, createdBy, createdFor } = await req.json();
        const PROMPT = `Generate a comprehensive and detailed study material for ${topic} designed for ${studyType} at a ${difficultyLevel} difficulty level. The study material should be extensive, covering all essential aspects of the topic to ensure thorough learning.

IMPORTANT: Please respond with ONLY valid JSON, no additional text, markdown formatting, or code blocks. The JSON should be properly escaped and formatted.

Include the following in JSON format:
1. Course Title (as "course_title" - make sure to use a good name)
2. Difficulty Level (as "difficulty")
3. Course Summary: A detailed overview of the course (50-100 words with key as "CourseSummary"), including its objectives, target audience, and key learning outcomes.
4. List of Chapters: A minimum of 8 chapters, each with:
   - Chapter Title: A clear and descriptive title
   - Chapter Summary: A detailed summary of the chapter's content (at least 100 words per chapter)  
   - Topic List (as "topics"): A list of at least 5 specific topics (with each topic as "topic") covered in the chapter, each with a brief description (2-3 sentences per topic)
   - Emoji (as "emoji"): A relevant emoji for each chapter
5. Additional Resources: Suggest at least 3 resources (e.g., books, websites, or videos) relevant to the course, with a brief description of each.

Ensure all string values are properly escaped for JSON (escape quotes, newlines, etc.).`

        const responseText = await generateCourseOutline(PROMPT);
        // console.log("Raw AI Response:", responseText);

        // Clean the response text to extract JSON
        let cleanedResponse = responseText;

        // Remove markdown code blocks if present
        if (cleanedResponse.includes('```json')) {
            cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
        }

        // Remove any leading/trailing whitespace
        cleanedResponse = cleanedResponse.trim();

        // Try to find the JSON part if there are other characters
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanedResponse = jsonMatch[0];
        }

        // console.log("Cleaned Response:", cleanedResponse);

        let aiResult;
        try {
            aiResult = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError.message);
            console.error("Failed to parse response:", cleanedResponse.substring(0, 500) + "...");

            // Try to extract JSON from the response more aggressively
            const jsonStart = cleanedResponse.indexOf('{');
            const jsonEnd = cleanedResponse.lastIndexOf('}');

            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                const extractedJson = cleanedResponse.substring(jsonStart, jsonEnd + 1);
                console.log("Trying extracted JSON:", extractedJson.substring(0, 200) + "...");
                aiResult = JSON.parse(extractedJson);
            } else {
                throw new Error(`Unable to extract valid JSON from AI response. Parse error: ${parseError.message}`);
            }
        }

        // Insert into database
        const dbResult = await db
            .insert(STUDY_MATERIAL_TABLE)
            .values({
                courseId: courseId,
                courseType: studyType,
                topic: topic,
                difficultyLevel: difficultyLevel,
                courseLayout: aiResult,
                createdBy: createdBy,
                createdFor: createdFor || createdBy, // Use createdFor if provided, otherwise use createdBy
            })
            .returning({ resp: STUDY_MATERIAL_TABLE });

        console.log("DB Result:", dbResult);

        // Trigger Inngest function to generate course notes in background
        try {
            await inngest.send({
                name: 'notes.generate',
                data: {
                    course: dbResult[0].resp
                }
            });
            console.log('Course notes generation triggered via Inngest');
        } catch (inngestError) {
            console.error('Error triggering Inngest function:', inngestError);
            // Don't fail the main request if background job fails to trigger
        }

        return NextResponse.json({ 
            success: true,
            message: "Course outline generated successfully",
            result: dbResult[0] 
        }, { status: 201 });
    } catch (error) {
        console.error("Error in POST /api/generate-course-outline:", error);

        // Provide more specific error messages
        if (error instanceof SyntaxError) {
            console.error("JSON Parsing Error - Invalid JSON format from AI response");
            return NextResponse.json({
                success: false,
                error: "Failed to parse AI response. The generated content may not be in valid JSON format.",
                message: "AI response parsing failed",
                details: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: false,
            error: "An error occurred while generating the course outline",
            message: "Course generation failed",
            details: error.message
        }, { status: 500 });
    }
}