import { type User, type InsertUser, type Task, type InsertTask } from "@shared/schema";
import { connectToMongoDB } from "./mongodb";
import { ObjectId } from "mongodb";

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

export class MongoStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ id });
    if (!user) return undefined;
    const { _id, ...userData } = user;
    return userData as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ email });
    if (!user) return undefined;
    const { _id, ...userData } = user;
    return userData as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await connectToMongoDB();
    const id = new ObjectId().toString();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    await db.collection('users').insertOne(user);
    return user;
  }

  async getTask(id: string): Promise<Task | undefined> {
    const db = await connectToMongoDB();
    const task = await db.collection('tasks').findOne({ id });
    if (!task) return undefined;
    const { _id, ...taskData } = task;
    return taskData as Task;
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    const db = await connectToMongoDB();
    const tasks = await db.collection('tasks')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    return tasks.map(task => {
      const { _id, ...taskData } = task;
      return taskData as Task;
    });
  }

  async getTasksByUserIdAndDate(userId: string, date: string): Promise<Task[]> {
    const db = await connectToMongoDB();
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await db.collection('tasks')
      .find({
        userId,
        dueDate: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      })
      .toArray();
    return tasks.map(task => {
      const { _id, ...taskData } = task;
      return taskData as Task;
    });
  }

  async getTodayTasksByUserId(userId: string): Promise<Task[]> {
    const db = await connectToMongoDB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await db.collection('tasks')
      .find({
        userId,
        $or: [
          { isOverallTask: true },
          {
            dueDate: {
              $gte: today,
              $lt: tomorrow
            }
          }
        ]
      })
      .toArray();
    return tasks.map(task => {
      const { _id, ...taskData } = task;
      return taskData as Task;
    });
  }

  async getUpcomingTasksByUserId(userId: string, days: number): Promise<Task[]> {
    const db = await connectToMongoDB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    const tasks = await db.collection('tasks')
      .find({
        userId,
        isOverallTask: false,
        dueDate: {
          $gte: today,
          $lte: futureDate
        }
      })
      .sort({ dueDate: 1 })
      .toArray();
    return tasks.map(task => {
      const { _id, ...taskData } = task;
      return taskData as Task;
    });
  }

  async createTask(taskData: InsertTask & { userId: string }): Promise<Task> {
    const db = await connectToMongoDB();
    const id = new ObjectId().toString();
    const task: Task = {
      ...taskData,
      description: taskData.description || null,
      dueDate: taskData.dueDate || null,
      dueTime: taskData.dueTime || null,
      id,
      priority: taskData.priority || "medium",
      category: taskData.category || "assignment",
      completionStatus: taskData.completionStatus || "pending",
      isOverallTask: taskData.isOverallTask || false,
      emailReminder: taskData.emailReminder || false,
      pushReminder: taskData.pushReminder || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection('tasks').insertOne(task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const db = await connectToMongoDB();
    const result = await db.collection('tasks').findOneAndUpdate(
      { id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!result) return undefined;
    const { _id, ...taskData } = result;
    return taskData as Task;
  }

  async deleteTask(id: string): Promise<boolean> {
    const db = await connectToMongoDB();
    const result = await db.collection('tasks').deleteOne({ id });
    return result.deletedCount > 0;
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

export const storage = new MongoStorage();
