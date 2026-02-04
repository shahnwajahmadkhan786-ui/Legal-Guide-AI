import { type Thread, type InsertThread, type Message, type InsertMessage, type User, type InsertUser, threads, messages, users } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Threads
  createThread(thread: InsertThread): Promise<Thread>;
  getThread(id: number): Promise<Thread | undefined>;
  getThreads(userId?: number): Promise<Thread[]>;
  updateThread(id: number, data: Partial<Thread>): Promise<Thread>;
  deleteThread(id: number): Promise<void>;

  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(threadId: number): Promise<Message[]>;
  deleteMessage(id: number): Promise<void>;
  deleteAllMessages(threadId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async createThread(thread: InsertThread): Promise<Thread> {
    const [newThread] = await db.insert(threads).values(thread).returning();
    return newThread;
  }

  async getThread(id: number): Promise<Thread | undefined> {
    const [thread] = await db.select().from(threads).where(eq(threads.id, id));
    return thread;
  }

  async getThreads(userId?: number): Promise<Thread[]> {
    const query = db.select().from(threads);
    if (userId) {
      return await query.where(eq(threads.userId, userId)).orderBy(desc(threads.createdAt));
    }
    return await query.orderBy(desc(threads.createdAt));
  }

  async updateThread(id: number, data: Partial<Thread>): Promise<Thread> {
    const [updated] = await db.update(threads).set(data).where(eq(threads.id, id)).returning();
    return updated;
  }

  async deleteThread(id: number): Promise<void> {
    await db.delete(threads).where(eq(threads.id, id));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessages(threadId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.threadId, threadId)).orderBy(messages.createdAt);
  }

  async deleteMessage(id: number): Promise<void> {
    await db.delete(messages).where(eq(messages.id, id));
  }

  async deleteAllMessages(threadId: number): Promise<void> {
    await db.delete(messages).where(eq(messages.threadId, threadId));
  }
}

export const storage = new DatabaseStorage();
