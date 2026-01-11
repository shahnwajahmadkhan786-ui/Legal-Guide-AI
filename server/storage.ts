import { type Thread, type InsertThread, type Message, type InsertMessage, threads, messages } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createThread(thread: InsertThread): Promise<Thread>;
  getThread(id: number): Promise<Thread | undefined>;
  getThreads(): Promise<Thread[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(threadId: number): Promise<Message[]>;
}

export class DatabaseStorage implements IStorage {
  async createThread(thread: InsertThread): Promise<Thread> {
    const [newThread] = await db.insert(threads).values(thread).returning();
    return newThread;
  }

  async getThread(id: number): Promise<Thread | undefined> {
    const [thread] = await db.select().from(threads).where(eq(threads.id, id));
    return thread;
  }

  async getThreads(): Promise<Thread[]> {
    return await db.select().from(threads).orderBy(desc(threads.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessages(threadId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.threadId, threadId)).orderBy(messages.createdAt);
  }
}

export const storage = new DatabaseStorage();
