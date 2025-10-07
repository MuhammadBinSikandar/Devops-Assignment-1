DROP TABLE "parentChildConnections" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "city" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "timezone" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "language" varchar DEFAULT 'en';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "grade" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "school_name" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "date_of_birth" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "learning_goals" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subjects_of_interest" json;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "learning_style" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "difficulty_preference" varchar DEFAULT 'intermediate';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "occupation" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "number_of_children" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "education_level" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "parenting_experience" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "children_age_range" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "website" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "linkedin_url" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "github_url" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "twitter_url" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notifications_enabled" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_notifications" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "marketing_emails" boolean DEFAULT false;