CREATE TABLE "courseProgress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" varchar(255) NOT NULL,
	"chapter_id" integer,
	"progress_percentage" integer DEFAULT 0,
	"last_accessed_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parentChildConnections" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"parent_email" varchar(255) NOT NULL,
	"student_email" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"requested_by" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quizResults" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" varchar(255) NOT NULL,
	"chapter_id" integer NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"time_spent" integer,
	"answers" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "studyMaterial" ALTER COLUMN "topic" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "studyMaterial" ALTER COLUMN "status" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "studyMaterial" ALTER COLUMN "status" SET DEFAULT 'Generating';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "supabase_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "avatar_url" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "phone" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "country" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "city" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "timezone" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "language" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "language" SET DEFAULT 'en';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "grade" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "school_name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "learning_style" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "difficulty_preference" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "difficulty_preference" SET DEFAULT 'intermediate';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "occupation" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "education_level" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "parenting_experience" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "children_age_range" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "website" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "linkedin_url" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "github_url" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "twitter_url" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "chapterNotes" ADD COLUMN "course_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "chapterNotes" ADD COLUMN "chapter_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "chapterNotes" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "chapterNotes" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "studyMaterial" ADD COLUMN "course_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "studyMaterial" ADD COLUMN "course_type" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "studyMaterial" ADD COLUMN "difficulty_level" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "studyMaterial" ADD COLUMN "course_layout" json;--> statement-breakpoint
ALTER TABLE "studyMaterial" ADD COLUMN "created_by" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "studyMaterial" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "studyMaterial" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_member" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "chapterNotes" DROP COLUMN "courseId";--> statement-breakpoint
ALTER TABLE "chapterNotes" DROP COLUMN "chapterId";--> statement-breakpoint
ALTER TABLE "studyMaterial" DROP COLUMN "courseId";--> statement-breakpoint
ALTER TABLE "studyMaterial" DROP COLUMN "courseType";--> statement-breakpoint
ALTER TABLE "studyMaterial" DROP COLUMN "difficultyLevel";--> statement-breakpoint
ALTER TABLE "studyMaterial" DROP COLUMN "courseLayout";--> statement-breakpoint
ALTER TABLE "studyMaterial" DROP COLUMN "createdBy";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "isMember";