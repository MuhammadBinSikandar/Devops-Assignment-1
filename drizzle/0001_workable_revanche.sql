CREATE TABLE "parentChildConnections" (
	"id" serial PRIMARY KEY NOT NULL,
	"parentId" integer NOT NULL,
	"studentId" integer NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"requestedBy" varchar NOT NULL,
	"requested_at" timestamp DEFAULT now(),
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
