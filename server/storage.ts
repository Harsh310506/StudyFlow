import { users, tasks, type User, type InsertUser, type Task, type InsertTask } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lt, lte, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getTask(id: string): Promise<Task | undefined>;
  getTasksByUserId(userId: string): Promise<Task[]>;
  getTasksByUserIdAndDate(userId: string, date: string): Promise<Task[]>;
  getTodayTasksByUserId(userId: string): Promise<Task[]>;
  getUpcomingTasksByUserId(userId: string, days: number): Promise<Task[]>;
  createTask(task: InsertTask & { userId: string }): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  getTaskStats(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }

  async getTasksByUserIdAndDate(userId: string, date: string): Promise<Task[]> {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return await db.select().from(tasks).where(
      and(
        eq(tasks.userId, userId),
        gte(tasks.dueDate, startOfDay),
        lte(tasks.dueDate, endOfDay)
      )
    );
  }

  async getTodayTasksByUserId(userId: string): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all tasks for the user
    const allUserTasks = await db.select().from(tasks).where(eq(tasks.userId, userId));
    
    // Filter for today's tasks (overall tasks OR tasks due today)
    return allUserTasks.filter(task => 
      task.isOverallTask || 
      (task.dueDate && 
       new Date(task.dueDate) >= today && 
       new Date(task.dueDate) < tomorrow)
    );
  }

  async getUpcomingTasksByUserId(userId: string, days: number): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    const allTasks = await db.select().from(tasks).where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.isOverallTask, false),
        gte(tasks.dueDate, today),
        lte(tasks.dueDate, futureDate)
      )
    ).orderBy(tasks.dueDate);

    return allTasks;
  }

  async createTask(taskData: InsertTask & { userId: string }): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...taskData,
        priority: taskData.priority || "medium",
        category: taskData.category || "assignment",
        completionStatus: taskData.completionStatus || "pending",
        isOverallTask: taskData.isOverallTask || false,
        emailReminder: taskData.emailReminder || false,
        pushReminder: taskData.pushReminder || false,
      })
      .returning();
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getTaskStats(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  }> {
    const userTasks = await this.getTasksByUserId(userId);
    const total = userTasks.length;
    const completed = userTasks.filter(task => task.completionStatus === 'complete').length;
    const pending = userTasks.filter(task => task.completionStatus === 'pending').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, completionRate };
  }
}

export const storage = new DatabaseStorage();
