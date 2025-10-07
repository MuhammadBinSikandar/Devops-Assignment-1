ALTER TABLE "users" ADD COLUMN "is_approved" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "approved_by" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "interests";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "favorite_subjects";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "study_time_preference";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "study_duration_preference";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "career_interests";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "english_proficiency";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "previous_online_learning";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "parent_support_available";