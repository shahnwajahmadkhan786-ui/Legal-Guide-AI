import { z } from "zod";
import { insertThreadSchema, insertMessageSchema, threads, messages } from "./schema";

export const api = {
  threads: {
    create: {
      method: "POST" as const,
      path: "/api/threads",
      input: z.object({}).optional(),
      responses: {
        201: z.custom<typeof threads.$inferSelect>(),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/threads/:id",
      responses: {
        200: z.custom<typeof threads.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    list: {
      method: "GET" as const,
      path: "/api/threads",
      responses: {
        200: z.array(z.custom<typeof threads.$inferSelect>()),
      },
    },
  },
  messages: {
    list: {
      method: "GET" as const,
      path: "/api/threads/:threadId/messages",
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/threads/:threadId/messages",
      input: z.object({
        content: z.string(),
      }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(), // Returns the assistant's response message (or user's if echoing, but usually assistant's)
        // Actually, for a chat app, often we return the assistant response.
        // Let's make it return the newly created assistant message.
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
