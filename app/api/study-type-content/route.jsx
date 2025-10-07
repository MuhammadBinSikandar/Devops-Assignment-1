import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";
import { db } from '@/configs/db';
import { STUDY_TYPE_CONTENT_TABLE } from '@/configs/schema';

export async function POST(request) {
    const { chapters, courseId, type } = await request.json();

    const prompt = type === 'flashcard'
        ? `Create 20 high-quality flashcards covering the most essential concepts, definitions, practical applications, and common pitfalls from these chapters: ${chapters}.
Focus on ensuring that the flashcards build both recall and deep understanding of the material.
Questions should test comprehension, not rote memorization.
Keep answers clear, accurate, and enriched with examples where helpful.`

        : `Create exactly 20 multiple-choice quiz questions from the following chapters: ${chapters}.

Return only this JSON structure:
[
  {
    "question": "Clear, specific question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Correct option (must match one option exactly)"
  }
]

Requirements:
- Exactly 20 question objects
- Each object has "question", "options" (4 items), and "answer"
- Options must all be plausible (avoid obviously wrong answers)
- Answer must exactly match one of the options
- Cover key concepts, definitions, practical applications, and comparisons
- Mix difficulty: 30% basic, 50% intermediate, 20% advanced
- Test understanding, not rote memorization
`;

    const result = await db.insert(STUDY_TYPE_CONTENT_TABLE).values({
        courseId: courseId,
        type: type,
    }).returning({
        id: STUDY_TYPE_CONTENT_TABLE.id
    });

    inngest.send({
        name: "studytype.content",
        data: {
            studyType: type,
            prompt: prompt,
            courseId: courseId,
            recordId: result[0].id
        }
    });

    return NextResponse.json(result[0].id);
}
