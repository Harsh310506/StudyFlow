import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  dueTime: text("due_time"),
  priority: text("priority", { enum: ["low", "medium", "high"] }).notNull().default("medium"),
  category: text("category", { enum: ["assignment", "exam", "project", "personal"] }).notNull().default("assignment"),
  completionStatus: text("completion_status", { enum: ["pending", "partial", "half", "complete"] }).notNull().default("pending"),
  isOverallTask: boolean("is_overall_task").notNull().default(false),
  emailReminder: boolean("email_reminder").notNull().default(false),
  pushReminder: boolean("push_reminder").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const passwords = pgTable("passwords", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  encryptedPassword: text("encrypted_password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isBookmarked: boolean("is_bookmarked").notNull().default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const timetable = pgTable("timetable", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  day: text("day", { enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "All Days"] }).notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  subject: text("subject").notNull(),
  type: text("type", { enum: ["class", "study", "break", "activity", "meal", "other"] }).notNull().default("class"),
  location: text("location"),
  instructor: text("instructor"),
  notes: text("notes"),
  color: text("color").notNull().default("#3B82F6"),
  isAllDay: boolean("is_all_day").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPasswordSchema = createInsertSchema(passwords).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  userId: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimetableSchema = createInsertSchema(timetable).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const verifyPasswordSchema = z.object({
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertPassword = z.infer<typeof insertPasswordSchema>;
export type Password = typeof passwords.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type TimetableEntry = typeof timetable.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type VerifyPassword = z.infer<typeof verifyPasswordSchema>;
