import { integer, json } from 'drizzle-orm/pg-core';
import { pgTable, serial, varchar, boolean, text, timestamp } from 'drizzle-orm/pg-core';
import { type } from 'os';

export const USER_TABLE = pgTable('users', {
    id: serial().primaryKey(),
    supabaseId: varchar('supabase_id', { length: 255 }).unique().notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    role: varchar('role', { length: 50 }).notNull().default('student'), // 'student', 'parent', or 'admin'
    isMember: boolean('is_member').default(false),

    // Admin approval fields
    isApproved: boolean('is_approved').default(false),
    approvedBy: varchar('approved_by', { length: 255 }),
    approvedAt: timestamp('approved_at'),

    // Admin suspension fields
    isSuspended: boolean('is_suspended').default(false),
    suspendedBy: varchar('suspended_by', { length: 255 }),
    suspendedAt: timestamp('suspended_at'),
    suspensionReason: varchar('suspension_reason', { length: 500 }),

    // Common profile fields
    bio: text('bio'),
    avatar_url: varchar('avatar_url', { length: 500 }),
    phone: varchar('phone', { length: 50 }),
    country: varchar('country', { length: 100 }),
    city: varchar('city', { length: 100 }),
    timezone: varchar('timezone', { length: 100 }),
    language: varchar('language', { length: 10 }).default('en'),

    // Student-specific fields
    grade: varchar('grade', { length: 100 }), // e.g., "9th", "10th", "College Freshman", etc.
    school_name: varchar('school_name', { length: 255 }),
    date_of_birth: timestamp('date_of_birth'),
    learning_goals: text('learning_goals'),
    subjects_of_interest: json('subjects_of_interest'), // Array of subjects
    learning_style: varchar('learning_style', { length: 50 }), // visual, auditory, kinesthetic, reading
    difficulty_preference: varchar('difficulty_preference', { length: 50 }).default('intermediate'), // beginner, intermediate, advanced

    // Parent-specific fields
    occupation: varchar('occupation', { length: 255 }),
    number_of_children: integer('number_of_children'),
    education_level: varchar('education_level', { length: 100 }),
    parenting_experience: varchar('parenting_experience', { length: 50 }), // "first-time", "experienced", "very-experienced"
    children_age_range: varchar('children_age_range', { length: 50 }), // "5-10", "11-15", "16-18", "mixed"

    // Social/Contact fields
    website: varchar('website', { length: 500 }),
    linkedin_url: varchar('linkedin_url', { length: 500 }),
    github_url: varchar('github_url', { length: 500 }),
    twitter_url: varchar('twitter_url', { length: 500 }),

    // Preferences
    notifications_enabled: boolean('notifications_enabled').default(true),
    email_notifications: boolean('email_notifications').default(true),
    marketing_emails: boolean('marketing_emails').default(false),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})

export const STUDY_MATERIAL_TABLE = pgTable('studyMaterial', {
    id: serial().primaryKey(),
    courseId: varchar('course_id', { length: 255 }).notNull(),
    courseType: varchar('course_type', { length: 100 }).notNull(),
    topic: varchar('topic', { length: 500 }).notNull(),
    difficultyLevel: varchar('difficulty_level', { length: 50 }).notNull(),
    courseLayout: json('course_layout'),
    createdBy: varchar('created_by', { length: 255 }).notNull(),
    createdFor: varchar('created_for', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).default('Generating'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})

export const CHAPTER_NOTES_TABLE = pgTable('chapterNotes', {
    id: serial().primaryKey(),
    courseId: varchar('course_id', { length: 255 }).notNull(),
    chapterId: integer('chapter_id').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})

export const PARENT_CHILD_CONNECTIONS_TABLE = pgTable('parentChildConnections', {
    id: serial().primaryKey(),
    parentId: integer('parent_id').notNull(),
    studentId: integer('student_id').notNull(),
    parentEmail: varchar('parent_email', { length: 255 }).notNull(),
    studentEmail: varchar('student_email', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'accepted', 'rejected'
    requestedBy: varchar('requested_by', { length: 50 }).notNull(), // 'parent' or 'student'
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})

export const COURSE_PROGRESS_TABLE = pgTable('courseProgress', {
    id: serial().primaryKey(),
    userId: integer('user_id').notNull(),
    courseId: varchar('course_id', { length: 255 }).notNull(),
    chapterId: integer('chapter_id'),
    progressPercentage: integer('progress_percentage').default(0),
    lastAccessedAt: timestamp('last_accessed_at').defaultNow(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})

export const QUIZ_RESULTS_TABLE = pgTable('quizResults', {
    id: serial().primaryKey(),
    userId: integer('user_id').notNull(),
    courseId: varchar('course_id', { length: 255 }).notNull(),
    chapterId: integer('chapter_id').notNull(),
    score: integer('score').notNull(),
    totalQuestions: integer('total_questions').notNull(),
    timeSpent: integer('time_spent'), // in seconds
    answers: json('answers'), // Store user answers
    createdAt: timestamp('created_at').defaultNow(),
})

export const STUDY_TYPE_CONTENT_TABLE = pgTable('studyTypeContent', {
    id: serial().primaryKey(),
    courseId: varchar('course_id', { length: 255 }).notNull(),
    content: json(),
    type: varchar().notNull(),
    status: varchar().default('Generating')
})

export const PRACTICE_TESTS_TABLE = pgTable('practiceTests', {
    id: serial().primaryKey(),
    userId: integer('user_id').notNull(),
    courseId: varchar('course_id', { length: 255 }).notNull(),
    chapterId: integer('chapter_id'), // null for full course tests
    testType: varchar('test_type', { length: 50 }).notNull(), // 'chapter' or 'full_course'
    questions: json('questions').notNull(), // Array of question objects with mixed types
    userAnswers: json('user_answers'), // User's answers (varies by question type)
    mcqScore: integer('mcq_score'), // Score for MCQ questions
    trueFalseScore: integer('true_false_score'), // Score for True/False questions
    descriptiveScore: integer('descriptive_score'), // Score for descriptive questions
    totalScore: integer('total_score'), // Overall percentage score
    totalQuestions: integer('total_questions').notNull(),
    mcqCount: integer('mcq_count').notNull(),
    trueFalseCount: integer('true_false_count').notNull(),
    descriptiveCount: integer('descriptive_count').notNull(),
    timeSpent: integer('time_spent'), // in seconds
    status: varchar('status', { length: 50 }).default('in_progress'), // 'in_progress', 'completed', 'grading', 'graded'
    startedAt: timestamp('started_at').defaultNow(),
    completedAt: timestamp('completed_at'),
    gradedAt: timestamp('graded_at'), // When descriptive answers were graded
    createdAt: timestamp('created_at').defaultNow(),
});