CREATE TABLE "chapterNotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" varchar(255) NOT NULL,
	"chapter_id" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
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
CREATE TABLE "flashcards" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" varchar(255) NOT NULL,
	"content" json,
	"type" varchar NOT NULL
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
CREATE TABLE "studyMaterial" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" varchar(255) NOT NULL,
	"course_type" varchar(100) NOT NULL,
	"topic" varchar(500) NOT NULL,
	"difficulty_level" varchar(50) NOT NULL,
	"course_layout" json,
	"created_by" varchar(255) NOT NULL,
	"created_for" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'Generating',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'student' NOT NULL,
	"is_member" boolean DEFAULT false,
	"is_approved" boolean DEFAULT false,
	"approved_by" varchar(255),
	"approved_at" timestamp,
	"is_suspended" boolean DEFAULT false,
	"suspended_by" varchar(255),
	"suspended_at" timestamp,
	"suspension_reason" varchar(500),
	"bio" text,
	"avatar_url" varchar(500),
	"phone" varchar(50),
	"country" varchar(100),
	"city" varchar(100),
	"timezone" varchar(100),
	"language" varchar(10) DEFAULT 'en',
	"grade" varchar(100),
	"school_name" varchar(255),
	"date_of_birth" timestamp,
	"learning_goals" text,
	"subjects_of_interest" json,
	"learning_style" varchar(50),
	"difficulty_preference" varchar(50) DEFAULT 'intermediate',
	"occupation" varchar(255),
	"number_of_children" integer,
	"education_level" varchar(100),
	"parenting_experience" varchar(50),
	"children_age_range" varchar(50),
	"website" varchar(500),
	"linkedin_url" varchar(500),
	"github_url" varchar(500),
	"twitter_url" varchar(500),
	"notifications_enabled" boolean DEFAULT true,
	"email_notifications" boolean DEFAULT true,
	"marketing_emails" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_supabase_id_unique" UNIQUE("supabase_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
