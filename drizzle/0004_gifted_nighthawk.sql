ALTER TABLE "users" ADD COLUMN "interests" json;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "favorite_subjects" json;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "study_time_preference" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "study_duration_preference" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "career_interests" json;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "english_proficiency" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "previous_online_learning" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "parent_support_available" boolean DEFAULT true;