import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { sendGeminiMessage, generateThreadTitle, type ChatMessage } from "@/hooks/use-gemini";
import { trackEvent } from "@/lib/supabase-client";

// ============ Types ============

export interface Thread {
  id: string;
  title: string | null;
  createdAt: Date | null;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date | null;
}

// ============ Storage Helpers ============

const MAX_THREADS = 50; // H6 — cap at 50 threads per user

function getThreadsKey(uid: string) {
  return `legalai_threads_${uid}`;
}

function getMessagesKey(uid: string, threadId: string) {
  return `legalai_messages_${uid}_${threadId}`;
}

function loadThreads(uid: string): Thread[] {
  try {
    const data = localStorage.getItem(getThreadsKey(uid));
    if (!data) return [];
    return JSON.parse(data).map((t: any) => ({
      ...t,
      createdAt: t.createdAt ? new Date(t.createdAt) : null,
    }));
  } catch {
    return [];
  }
}

function saveThreads(uid: string, threads: Thread[]) {
  // H6: sort by most recent first, then prune to cap
  const sorted = [...threads].sort(
    (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
  );
  const pruned = sorted.slice(0, MAX_THREADS);
  // Also clean up localStorage for pruned threads
  const prunedIds = sorted.slice(MAX_THREADS).map((t) => t.id);
  prunedIds.forEach((id) => localStorage.removeItem(getMessagesKey(uid, id)));
  localStorage.setItem(getThreadsKey(uid), JSON.stringify(pruned));
}

function loadMessages(uid: string, threadId: string): Message[] {
  try {
    const data = localStorage.getItem(getMessagesKey(uid, threadId));
    if (!data) return [];
    return JSON.parse(data).map((m: any) => ({
      ...m,
      createdAt: m.createdAt ? new Date(m.createdAt) : null,
    }));
  } catch {
    return [];
  }
}

function saveMessages(uid: string, threadId: string, messages: Message[]) {
  localStorage.setItem(getMessagesKey(uid, threadId), JSON.stringify(messages));
}

// ============ Threads ============

export function useThreads() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setThreads([]);
      setIsLoading(false);
      return;
    }

    // H4: call inline — do NOT include a refresh callback in deps to avoid loops
    const load = () => {
      const loaded = loadThreads(user.uid);
      loaded.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      setThreads(loaded);
    };

    load();
    setIsLoading(false);

    // Listen for updates from other hooks (create, delete, title changes)
    window.addEventListener("legalai-storage-update", load);
    return () => window.removeEventListener("legalai-storage-update", load);
  }, [user]); // H4: only user in deps — no refresh function reference

  return { data: threads, isLoading };
}

export function useCreateThread() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async () => {
    if (!user) return;
    setIsPending(true);
    try {
      const threads = loadThreads(user.uid);
      // L3: number the thread until AI title generates
      const threadNumber = threads.length + 1;
      const newThread: Thread = {
        id: crypto.randomUUID(),
        title: `Consultation #${threadNumber}`,
        createdAt: new Date(),
      };
      threads.unshift(newThread);
      saveThreads(user.uid, threads);
      setLocation(`/thread/${newThread.id}`);
      window.dispatchEvent(new Event("legalai-storage-update"));
    } finally {
      setIsPending(false);
    }
  }, [user, setLocation]);

  return { mutate, isPending };
}

export function useDeleteThread() {
  const { user } = useAuth();

  return useCallback(
    async (threadId: string) => {
      if (!user) return;
      const threads = loadThreads(user.uid);
      const filtered = threads.filter((t) => t.id !== threadId);
      saveThreads(user.uid, filtered);
      localStorage.removeItem(getMessagesKey(user.uid, threadId));
      window.dispatchEvent(new Event("legalai-storage-update"));
    },
    [user]
  );
}

// ============ Messages ============

export function useMessages(threadId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !threadId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    const load = () => setMessages(loadMessages(user.uid, threadId));
    load();
    setIsLoading(false);

    window.addEventListener("legalai-storage-update", load);
    return () => window.removeEventListener("legalai-storage-update", load);
  }, [user, threadId]);

  return { data: messages, isLoading };
}

export function useSendMessage(threadId: string) {
  const { user } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(
    async (content: string) => {
      if (!user || !threadId) return;
      setIsPending(true);

      try {
        const messages = loadMessages(user.uid, threadId);

        // 1. Save user message
        const userMsg: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content,
          createdAt: new Date(),
        };
        messages.push(userMsg);
        saveMessages(user.uid, threadId, messages);
        window.dispatchEvent(new Event("legalai-storage-update"));

        // Track analytics
        trackEvent("message_sent", { userId: user.uid, email: user.email });

        // 2. Build history for AI (C3: rate limiting and validation already in sendGeminiMessage)
        const history: ChatMessage[] = messages.slice(0, -1).map((m) => ({
          role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
          parts: [{ text: m.content }],
        }));

        // 3. Call AI
        const aiResponse = await sendGeminiMessage(content, history);

        // 4. Save assistant response
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: aiResponse,
          createdAt: new Date(),
        };
        messages.push(assistantMsg);
        saveMessages(user.uid, threadId, messages);
        window.dispatchEvent(new Event("legalai-storage-update"));

        // 5. Auto-generate a real thread title on first message (replace #N placeholder)
        if (messages.length <= 2) {
          try {
            const title = await generateThreadTitle(content);
            const threads = loadThreads(user.uid);
            const idx = threads.findIndex((t) => t.id === threadId);
            if (idx >= 0) {
              threads[idx].title = title;
              saveThreads(user.uid, threads);
              window.dispatchEvent(new Event("legalai-storage-update"));
            }
          } catch {
            // Title generation is best-effort — leave the #N title
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
        const messages = loadMessages(user.uid, threadId);
        messages.push({
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I encountered an error. Please try again.",
          createdAt: new Date(),
        });
        saveMessages(user.uid, threadId, messages);
        window.dispatchEvent(new Event("legalai-storage-update"));
      } finally {
        setIsPending(false);
      }
    },
    [user, threadId]
  );

  return { mutate, isPending };
}

export function useDeleteMessage(threadId: string) {
  const { user } = useAuth();

  return useCallback(
    async (messageId: string) => {
      if (!user) return;
      const messages = loadMessages(user.uid, threadId);
      const filtered = messages.filter((m) => m.id !== messageId);
      saveMessages(user.uid, threadId, filtered);
      window.dispatchEvent(new Event("legalai-storage-update"));
    },
    [user, threadId]
  );
}
