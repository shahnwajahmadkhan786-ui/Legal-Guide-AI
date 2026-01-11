import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useLocation } from "wouter";

// === Hook for Threads List ===
export function useThreads() {
  return useQuery({
    queryKey: [api.threads.list.path],
    queryFn: async () => {
      const res = await fetch(api.threads.list.path);
      if (!res.ok) throw new Error("Failed to fetch threads");
      return api.threads.list.responses[200].parse(await res.json());
    },
  });
}

// === Hook for Single Thread ===
export function useThread(id: number) {
  return useQuery({
    queryKey: [api.threads.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      const url = buildUrl(api.threads.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch thread");
      return api.threads.get.responses[200].parse(await res.json());
    },
  });
}

// === Hook to Create a New Thread ===
export function useCreateThread() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.threads.create.path, {
        method: api.threads.create.method,
      });
      if (!res.ok) throw new Error("Failed to create thread");
      return api.threads.create.responses[201].parse(await res.json());
    },
    onSuccess: (newThread) => {
      queryClient.invalidateQueries({ queryKey: [api.threads.list.path] });
      setLocation(`/thread/${newThread.id}`);
    },
  });
}

// === Hook for Messages in a Thread ===
export function useMessages(threadId: number) {
  return useQuery({
    queryKey: [api.messages.list.path, threadId],
    enabled: !!threadId,
    queryFn: async () => {
      const url = buildUrl(api.messages.list.path, { threadId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.messages.list.responses[200].parse(await res.json());
    },
  });
}

// === Hook to Send a Message ===
export function useSendMessage(threadId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const url = buildUrl(api.messages.create.path, { threadId });
      const res = await fetch(url, {
        method: api.messages.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.messages.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate messages to fetch the latest state (user msg + assistant response)
      queryClient.invalidateQueries({
        queryKey: [api.messages.list.path, threadId],
      });
      // Also invalidate threads list in case the thread title/timestamp was updated
      queryClient.invalidateQueries({ queryKey: [api.threads.list.path] });
    },
  });
}
