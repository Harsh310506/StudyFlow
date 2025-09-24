CREATE TABLE "timetable" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"day" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"subject" text NOT NULL,
	"type" text DEFAULT 'class' NOT NULL,
	"location" text,
	"instructor" text,
	"notes" text,
	"color" text DEFAULT '#3B82F6' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "timetable_day_check" CHECK ("day" IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
	CONSTRAINT "timetable_type_check" CHECK ("type" IN ('class', 'study', 'break', 'activity', 'meal', 'other'))
);

ALTER TABLE "timetable" ADD CONSTRAINT "timetable_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;