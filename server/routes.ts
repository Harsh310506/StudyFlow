import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTaskSchema, loginSchema, insertPasswordSchema, verifyPasswordSchema, insertNoteSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        }, 
        token 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(credentials.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(credentials.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        }, 
        token 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName 
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Task routes
  app.get("/api/tasks", authenticateToken, async (req: any, res) => {
    try {
      const tasks = await storage.getTasksByUserId(req.userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tasks/today", authenticateToken, async (req: any, res) => {
    try {
      const tasks = await storage.getTodayTasksByUserId(req.userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tasks/upcoming", authenticateToken, async (req: any, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const tasks = await storage.getUpcomingTasksByUserId(req.userId, days);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tasks/date/:date", authenticateToken, async (req: any, res) => {
    try {
      const tasks = await storage.getTasksByUserIdAndDate(req.userId, req.params.date);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tasks/stats", authenticateToken, async (req: any, res) => {
    try {
      const stats = await storage.getTaskStats(req.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/tasks", authenticateToken, async (req: any, res) => {
    try {
      // Transform the data to handle frontend-backend compatibility
      const transformedData = {
        ...req.body,
        // Convert empty strings to null for optional fields
        description: req.body.description || null,
        dueTime: req.body.dueTime || null,
        // Handle dueDate conversion - ensure consistent timezone handling
        dueDate: req.body.dueDate ? (() => {
          if (req.body.dueDate instanceof Date) {
            return req.body.dueDate;
          }
          // If it's a date string, parse it carefully to avoid timezone issues
          const dateValue = new Date(req.body.dueDate);
          // Ensure the date is interpreted in local timezone by setting time to noon
          const localDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), 12, 0, 0, 0);
          return localDate;
        })() : null,
        // Ensure boolean fields are properly converted
        isOverallTask: Boolean(req.body.isOverallTask),
        emailReminder: Boolean(req.body.emailReminder),
        pushReminder: Boolean(req.body.pushReminder),
      };

      const taskData = insertTaskSchema.parse(transformedData);
      const task = await storage.createTask({
        ...taskData,
        userId: req.userId,
      });
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Task creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/tasks/:id", authenticateToken, async (req: any, res) => {
    try {
      const taskId = req.params.id;
      const updates = req.body;
      
      // Verify task belongs to user
      const existingTask = await storage.getTask(taskId);
      if (!existingTask || existingTask.userId !== req.userId) {
        return res.status(404).json({ message: "Task not found" });
      }

      const updatedTask = await storage.updateTask(taskId, updates);
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/tasks/:id", authenticateToken, async (req: any, res) => {
    try {
      const taskId = req.params.id;
      
      // Verify task belongs to user
      const existingTask = await storage.getTask(taskId);
      if (!existingTask || existingTask.userId !== req.userId) {
        return res.status(404).json({ message: "Task not found" });
      }

      const deleted = await storage.deleteTask(taskId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Task not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Password management routes
  app.get("/api/passwords", authenticateToken, async (req: any, res) => {
    try {
      const passwords = await storage.getPasswordsByUserId(req.userId);
      // Return passwords with masked values for security
      const maskedPasswords = passwords.map(p => ({
        ...p,
        encryptedPassword: "••••••••"
      }));
      res.json(maskedPasswords);
    } catch (error) {
      console.error("Error fetching passwords:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/passwords", authenticateToken, async (req: any, res) => {
    try {
      const passwordData = insertPasswordSchema.parse(req.body);
      const password = await storage.createPassword({
        ...passwordData,
        userId: req.userId,
      });
      // Return masked password for security
      res.status(201).json({
        ...password,
        encryptedPassword: "••••••••"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Password creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/passwords/verify", authenticateToken, async (req: any, res) => {
    try {
      const { password } = verifyPasswordSchema.parse(req.body);
      const isValid = await storage.verifyUserPassword(req.userId, password);
      res.json({ valid: isValid });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/passwords/:id/reveal", authenticateToken, async (req: any, res) => {
    try {
      const passwordId = req.params.id;
      const { password: userPassword } = verifyPasswordSchema.parse(req.body);
      
      // Verify user password first
      const isValidPassword = await storage.verifyUserPassword(req.userId, userPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid account password" });
      }

      // Get the password entry
      const passwordEntry = await storage.getPassword(passwordId);
      if (!passwordEntry || passwordEntry.userId !== req.userId) {
        return res.status(404).json({ message: "Password not found" });
      }

      // For demonstration, return the original password (in real app, use proper decryption)
      const decryptedPassword = await storage.decryptPassword(passwordEntry.encryptedPassword, userPassword);
      res.json({ password: decryptedPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/passwords/:id", authenticateToken, async (req: any, res) => {
    try {
      const passwordId = req.params.id;
      
      // Verify password belongs to user
      const existingPassword = await storage.getPassword(passwordId);
      if (!existingPassword || existingPassword.userId !== req.userId) {
        return res.status(404).json({ message: "Password not found" });
      }

      const deleted = await storage.deletePassword(passwordId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Password not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Note management routes
  app.get("/api/notes", authenticateToken, async (req: any, res) => {
    try {
      // First delete expired notes
      await storage.deleteExpiredNotes();
      
      // Then get current notes
      const notes = await storage.getNotesByUserId(req.userId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/notes", authenticateToken, async (req: any, res) => {
    try {
      const noteData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote({
        ...noteData,
        userId: req.userId,
      });
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Note creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/notes/:id", authenticateToken, async (req: any, res) => {
    try {
      const noteId = req.params.id;
      const updates = req.body;
      
      // Verify note belongs to user
      const existingNote = await storage.getNote(noteId);
      if (!existingNote || existingNote.userId !== req.userId) {
        return res.status(404).json({ message: "Note not found" });
      }

      const updatedNote = await storage.updateNote(noteId, updates);
      if (updatedNote) {
        res.json(updatedNote);
      } else {
        res.status(404).json({ message: "Note not found" });
      }
    } catch (error) {
      console.error("Note update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/notes/:id", authenticateToken, async (req: any, res) => {
    try {
      const noteId = req.params.id;
      
      // Verify note belongs to user
      const existingNote = await storage.getNote(noteId);
      if (!existingNote || existingNote.userId !== req.userId) {
        return res.status(404).json({ message: "Note not found" });
      }

      const deleted = await storage.deleteNote(noteId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Note not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
