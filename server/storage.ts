import { users, tasks, passwords, notes, type User, type InsertUser, type Task, type InsertTask, type Password, type InsertPassword, type Note, type InsertNote } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lt, lte, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUserPassword(userId: string, password: string): Promise<boolean>;
  
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

  // Password methods
  getPasswordsByUserId(userId: string): Promise<Password[]>;
  getPassword(id: string): Promise<Password | undefined>;
  createPassword(passwordData: InsertPassword & { userId: string }): Promise<Password>;
  updatePassword(id: string, updates: Partial<InsertPassword>): Promise<Password | undefined>;
  deletePassword(id: string): Promise<boolean>;
  decryptPassword(encryptedPassword: string, userPassword: string): Promise<string>;

  // Note methods
  getNotesByUserId(userId: string): Promise<Note[]>;
  getNote(id: string): Promise<Note | undefined>;
  createNote(noteData: InsertNote & { userId: string }): Promise<Note>;
  updateNote(id: string, updates: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: string): Promise<boolean>;
  deleteExpiredNotes(): Promise<number>;
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

  async verifyUserPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    return await bcrypt.compare(password, user.password);
  }

  async getPasswordsByUserId(userId: string): Promise<Password[]> {
    return await db.select().from(passwords).where(eq(passwords.userId, userId)).orderBy(desc(passwords.createdAt));
  }

  async getPassword(id: string): Promise<Password | undefined> {
    const [password] = await db.select().from(passwords).where(eq(passwords.id, id));
    return password || undefined;
  }

  async createPassword(passwordData: InsertPassword & { userId: string }): Promise<Password> {
    // Encrypt the password with user's account password
    const userPassword = passwordData.encryptedPassword;
    const encryptedPassword = await bcrypt.hash(userPassword, 10);
    
    const [password] = await db
      .insert(passwords)
      .values({
        ...passwordData,
        encryptedPassword,
      })
      .returning();
    return password;
  }

  async updatePassword(id: string, updates: Partial<InsertPassword>): Promise<Password | undefined> {
    // If password is being updated, encrypt it
    let updateData = { ...updates };
    if (updates.encryptedPassword) {
      updateData.encryptedPassword = await bcrypt.hash(updates.encryptedPassword, 10);
    }

    const [password] = await db
      .update(passwords)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(passwords.id, id))
      .returning();
    return password || undefined;
  }

  async deletePassword(id: string): Promise<boolean> {
    const result = await db.delete(passwords).where(eq(passwords.id, id));
    return (result.rowCount || 0) > 0;
  }

  async decryptPassword(encryptedPassword: string, userPassword: string): Promise<string> {
    // This is a simple approach - in reality, we would use proper encryption/decryption
    // For now, we'll return a placeholder since bcrypt is one-way
    return "••••••••"; // Placeholder for actual password
  }

  // Note methods implementation
  async getNotesByUserId(userId: string): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.createdAt));
  }

  async getNote(id: string): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note || undefined;
  }

  async createNote(noteData: InsertNote & { userId: string }): Promise<Note> {
    // Set expiration date to 5 days from now unless bookmarked
    const expiresAt = noteData.isBookmarked ? null : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    
    const [note] = await db
      .insert(notes)
      .values({
        ...noteData,
        expiresAt,
      })
      .returning();
    return note;
  }

  async updateNote(id: string, updates: Partial<InsertNote>): Promise<Note | undefined> {
    let updateData: any = { ...updates, updatedAt: new Date() };
    
    // If bookmarking status is being changed, update expiration
    if (updates.isBookmarked !== undefined) {
      if (updates.isBookmarked) {
        updateData.expiresAt = null; // Remove expiration if bookmarked
      } else {
        updateData.expiresAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // Set to expire in 5 days
      }
    }

    const [note] = await db
      .update(notes)
      .set(updateData)
      .where(eq(notes.id, id))
      .returning();
    return note || undefined;
  }

  async deleteNote(id: string): Promise<boolean> {
    const result = await db.delete(notes).where(eq(notes.id, id));
    return (result.rowCount || 0) > 0;
  }

  async deleteExpiredNotes(): Promise<number> {
    const now = new Date();
    const result = await db.delete(notes).where(
      and(
        eq(notes.isBookmarked, false),
        lte(notes.expiresAt, now)
      )
    );
    return result.rowCount || 0;
  }
}

export const storage = new DatabaseStorage();
