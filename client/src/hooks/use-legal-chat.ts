import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { sendGeminiMessage, generateThreadTitle, type ChatMessage } from "@/hooks/use-gemini";
import { trackEvent } from "@/lib/supabase-client";
import { incrementGuestQueries } from "@/lib/guest-limit";

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

// ============ Guest UID ============

const GUEST_UID_KEY = "nyayasahay_guest_uid";

function getEffectiveUid(userUid: string | undefined): string {
  if (userUid) return userUid;
  // Generate a persistent guest ID
  let guestUid = localStorage.getItem(GUEST_UID_KEY);
  if (!guestUid) {
    guestUid = `guest_${crypto.randomUUID()}`;
    localStorage.setItem(GUEST_UID_KEY, guestUid);
  }
  return guestUid;
}

// ============ Storage Helpers ============

const MAX_THREADS = 50;

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
  const sorted = [...threads].sort(
    (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
  );
  const pruned = sorted.slice(0, MAX_THREADS);
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
  const uid = getEffectiveUid(user?.uid);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      const loaded = loadThreads(uid);
      loaded.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      setThreads(loaded);
    };

    load();
    setIsLoading(false);

    window.addEventListener("legalai-storage-update", load);
    return () => window.removeEventListener("legalai-storage-update", load);
  }, [uid]);

  return { data: threads, isLoading };
}

export function useCreateThread() {
  const { user } = useAuth();
  const uid = getEffectiveUid(user?.uid);
  const [, setLocation] = useLocation();
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async () => {
    setIsPending(true);
    try {
      const threads = loadThreads(uid);
      const threadNumber = threads.length + 1;
      const newThread: Thread = {
        id: crypto.randomUUID(),
        title: `Consultation #${threadNumber}`,
        createdAt: new Date(),
      };
      threads.unshift(newThread);
      saveThreads(uid, threads);
      setLocation(`/thread/${newThread.id}`);
      window.dispatchEvent(new Event("legalai-storage-update"));
    } finally {
      setIsPending(false);
    }
  }, [uid, setLocation]);

  return { mutate, isPending };
}

export function useDeleteThread() {
  const { user } = useAuth();
  const uid = getEffectiveUid(user?.uid);

  return useCallback(
    async (threadId: string) => {
      const threads = loadThreads(uid);
      const filtered = threads.filter((t) => t.id !== threadId);
      saveThreads(uid, filtered);
      localStorage.removeItem(getMessagesKey(uid, threadId));
      window.dispatchEvent(new Event("legalai-storage-update"));
    },
    [uid]
  );
}

// ============ Messages ============

export function useMessages(threadId: string) {
  const { user } = useAuth();
  const uid = getEffectiveUid(user?.uid);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    const load = () => setMessages(loadMessages(uid, threadId));
    load();
    setIsLoading(false);

    window.addEventListener("legalai-storage-update", load);
    return () => window.removeEventListener("legalai-storage-update", load);
  }, [uid, threadId]);

  return { data: messages, isLoading };
}

export function useSendMessage(threadId: string) {
  const { user } = useAuth();
  const uid = getEffectiveUid(user?.uid);
  const isGuest = !user;
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(
    async (content: string) => {
      if (!threadId) return;
      setIsPending(true);

      try {
        const messages = loadMessages(uid, threadId);

        // 1. Save user message
        const userMsg: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content,
          createdAt: new Date(),
        };
        messages.push(userMsg);
        saveMessages(uid, threadId, messages);
        window.dispatchEvent(new Event("legalai-storage-update"));

        // Track analytics + guest query count
        if (isGuest) {
          incrementGuestQueries();
        }
        trackEvent("message_sent", { userId: uid, email: user?.email || "guest" });

        // 2. Build history for AI
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
        saveMessages(uid, threadId, messages);
        window.dispatchEvent(new Event("legalai-storage-update"));

        // 5. Auto-generate thread title on first message
        if (messages.length <= 2) {
          try {
            const title = await generateThreadTitle(content);
            const threads = loadThreads(uid);
            const idx = threads.findIndex((t) => t.id === threadId);
            if (idx >= 0) {
              threads[idx].title = title;
              saveThreads(uid, threads);
              window.dispatchEvent(new Event("legalai-storage-update"));
            }
          } catch {
            // Title generation is best-effort
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
        const messages = loadMessages(uid, threadId);
        messages.push({
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I encountered an error. Please try again.",
          createdAt: new Date(),
        });
        saveMessages(uid, threadId, messages);
        window.dispatchEvent(new Event("legalai-storage-update"));
      } finally {
        setIsPending(false);
      }
    },
    [uid, threadId, isGuest, user]
  );

  return { mutate, isPending };
}

export function useDeleteMessage(threadId: string) {
  const { user } = useAuth();
  const uid = getEffectiveUid(user?.uid);

  return useCallback(
    async (messageId: string) => {
      const messages = loadMessages(uid, threadId);
      const filtered = messages.filter((m) => m.id !== messageId);
      saveMessages(uid, threadId, filtered);
      window.dispatchEvent(new Event("legalai-storage-update"));
    },
    [uid, threadId]
  );
}
