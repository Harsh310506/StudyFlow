-- Add missing columns to timetable table
ALTER TABLE "timetable" ADD COLUMN "is_all_day" boolean DEFAULT false NOT NULL;
ALTER TABLE "timetable" ADD COLUMN "all_day_group_id" varchar;