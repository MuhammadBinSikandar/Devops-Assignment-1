import OpenAI from "openai";

// Initialize OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Common model config (fine-tune as needed)
const modelConfig = {
  model: "gpt-4o",               // Best current OpenAI GPT model
  temperature: 0.7,              // Balanced creativity
  max_tokens: 10000,              // Expand if longer outputs needed
  top_p: 1,                      // Controls randomness (1 = full range)
  frequency_penalty: 0,          // Discourage repetition
  presence_penalty: 0,           // Encourage introducing new ideas
  response_format: { type: "json_object" } // Force JSON if needed
};

// ---------------------------
// Course Outline Generator
// ---------------------------
export const generateCourseOutline = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      ...modelConfig,
      messages: [
        {
          "role": "system",
          "content": "You are a senior curriculum architect with 20+ years of experience in designing advanced technical education programs for elite coding interviews and university-level computer science. Your role is to produce highly detailed, rigorously structured course outlines in strict JSON format. \
        Guidelines: \
        - Always include a compelling course_title, accurate difficulty level, and a 50–100 word CourseSummary written with professional clarity. \
        - Break content into at least 8 chapters, each containing: ChapterTitle, ChapterSummary (≥100 words), and a topics array of ≥5 topics. Each topic must include a clear, practical description (2–3 sentences) with examples or applications. \
        - Ensure technical accuracy, clarity, and depth suitable for advanced learners. \
        - Never include extra text, explanations, or formatting outside valid JSON. \
        - Act as if the output will be directly parsed by software — consistency and validity are critical."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating course outline:", error);
    throw error;
  }
};

// ---------------------------
// Notes / Exam Material Generator
// ---------------------------
export const generateNotes = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",              // Use a more stable model
      temperature: 0.7,              // Balanced creativity
      max_tokens: 16384,              // Expand if longer outputs needed
      top_p: 1,                      // Controls randomness (1 = full range)
      frequency_penalty: 0,          // Discourage repetition
      presence_penalty: 0,           // Encourage introducing new ideas
      // Remove response_format for HTML generation
      messages: [
        {
          "role": "system",
          "content": "You are an authoritative educational content creator and technical writing specialist. Your task is to transform structured outlines into fully developed, detailed instructional material in clean, semantic HTML. \
        Guidelines: \
        - Do not include <html>, <head>, <body>, or <title> tags. Only return structured content (<h3>, <h4>, <p>, <ul>, <li>, <code>, etc.). \
        - For each chapter and topic: \
           * Provide in-depth explanations (≥150 words per topic). \
           * Use structured HTML hierarchy: <h3> for chapters, <h4> for topics, <p> for detailed narrative, <ul>/<li> for subpoints, and <code> blocks where examples or pseudocode are relevant. \
        - Emphasize clarity, accuracy, and thoroughness, targeting an advanced technical audience. \
        - Expand on algorithms, data structures, complexities, and use-cases with professional depth. \
        - Never output plain text or Markdown — only valid, professional-grade HTML."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating notes:", error);
    throw error;
  }
};

export const generateStudyTypeContentAIModel = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",              // Strong reasoning, good output size
      temperature: 0.6,             // Focused, less randomness
      max_tokens: 8000,             // Safe buffer for 20 detailed cards
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      messages: [
        {
          role: "system",
          content: `Generate exactly 20 flashcards in a JSON array format.

Return only this JSON structure:
[
  {"front": "question", "back": "answer"},
  {"front": "question", "back": "answer"}
]

Requirements:
- Create exactly 20 flashcard objects
- Each object has "front" (question) and "back" (answer) 
- Focus on key concepts, definitions, and practical applications
- Keep questions clear and answers concise but complete`
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return JSON.parse(response.choices[0].message.content);

  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
};


export const generateQuiz = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",              // Strong reasoning, good output size
      temperature: 0.6,             // Focused, less randomness
      max_tokens: 8000,             // Safe buffer for 20 detailed questions
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      messages: [
        {
          role: "system",
          content: `Generate exactly 20 multiple-choice questions in a JSON array format.

Return only this JSON structure:
[
  {
    "question": "Clear, specific question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Correct option (must match one option exactly)"
  }
]

Requirements:
- Create exactly 20 question objects
- Each object has "question", "options" (4 items), and "answer"
- Answer must exactly match one of the options
- Focus on key concepts, definitions, and practical applications
- Keep questions clear and answers concise but complete`
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return JSON.parse(response.choices[0].message.content);

  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};




export const generateMixedPracticeTestAIModel = async (prompt, mcqCount, trueFalseCount, descriptiveCount) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 10000,
      messages: [
        {
          role: "system",
          content: `Generate a mixed-type practice test in JSON format with exactly:
- ${mcqCount} Multiple Choice Questions
- ${trueFalseCount} True/False Questions  
- ${descriptiveCount} Descriptive Questions

Return only this JSON structure:
{
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "Question text here?",
      "options": [
        "Option A",
        "Option B", 
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this answer is correct",
      "points": 1
    },
    {
      "id": 2,
      "type": "true_false",
      "question": "Statement to evaluate as true or false",
      "correctAnswer": true,
      "explanation": "Explanation of why this is true/false",
      "points": 1
    },
    {
      "id": 3,
      "type": "descriptive",
      "question": "Question requiring detailed explanation or analysis",
      "sampleAnswer": "A comprehensive sample answer showing key points expected",
      "gradingCriteria": [
        "Key point 1 to look for",
        "Key point 2 to look for", 
        "Key point 3 to look for"
      ],
      "points": 2
    }
  ]
}

Requirements:
- Start with MCQs, then True/False, then Descriptive questions
- MCQ correctAnswer should be index (0-3) of correct option
- True/False correctAnswer should be boolean (true/false)
- Descriptive questions should have detailed sample answers and clear grading criteria
- Include clear explanations for objective questions
- Assign points: MCQ=1, True/False=1, Descriptive=2 points each
- Vary difficulty and focus on understanding over memorization`
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // Clean the response content by removing markdown code blocks if present
    let responseContent = response.choices[0].message.content.trim();
    
    // Remove ```json and ``` if present
    if (responseContent.startsWith('```json')) {
      responseContent = responseContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (responseContent.startsWith('```')) {
      responseContent = responseContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    return JSON.parse(responseContent);

  } catch (error) {
    console.error("Error generating mixed practice test:", error);
    console.error("Raw response content:", response?.choices?.[0]?.message?.content);
    throw error;
  }
};