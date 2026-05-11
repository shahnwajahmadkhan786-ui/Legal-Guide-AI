import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const SYSTEM_PROMPT = `
You are LegalAI, an AI-powered Global Legal Guidance Assistant. Your role is to provide clear, accurate, and practical LEGAL INFORMATION and GUIDANCE based strictly on the laws and constitution of the country the user is asking about.

IMPORTANT BOUNDARIES:
- You are NOT a lawyer.
- You MUST NOT provide personalized legal advice, guarantees, or predictions of case outcomes.
- You MUST clearly state that your responses are for informational purposes only.
- You MUST encourage consulting a qualified advocate when necessary.

LANGUAGE & LOCALIZATION:
- Detect the language the user is using and ALWAYS reply in that same language.
- If the user uses Roman Hindi, reply in Roman Hindi.
- Provide clear legal guidance based on the specific country legal system mentioned or implied.

HOW YOU SHOULD INTERACT:
1. Understand the user situation and country. Ask clarifying questions if needed.
2. Respond in a structured and simple format.
3. Include: Problem Summary, Applicable Laws, Legal Rights, Legal Options, Documents Required, When to Consult a Lawyer, and a Disclaimer.

DISCLAIMER (MANDATORY):
This information is for general legal awareness based on applicable laws and does not constitute legal advice. For advice specific to your situation, please consult a qualified advocate.
`;

async function callGemini(messages: Array<{role: string, content: string}>): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const contents = messages
    .filter(m => m.role !== "system")
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

  const systemMsg = messages.find(m => m.role === "system");

  const body: any = { contents };
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json() as any;
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I am unable to provide a response at this time.";
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(api.threads.create.path, async (req, res) => {
    const thread = await storage.createThread({});
    res.status(201).json(thread);
  });

  app.get(api.threads.get.path, async (req, res) => {
    const thread = await storage.getThread(Number(req.params.id));
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }
    res.json(thread);
  });

  app.get(api.threads.list.path, async (req, res) => {
    const threads = await storage.getThreads();
    res.json(threads);
  });

  app.get(api.messages.list.path, async (req, res) => {
    const messages = await storage.getMessages(Number(req.params.threadId));
    res.json(messages);
  });

  app.post(api.messages.create.path, async (req, res) => {
    const threadId = Number(req.params.threadId);
    const { content } = req.body;

    const userMessage = await storage.createMessage({
      threadId,
      role: "user",
      content,
    });

    const history = await storage.getMessages(threadId);
    const messages = history.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    try {
      const assistantContent = await callGemini([
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ]);

      const assistantMessage = await storage.createMessage({
        threadId,
        role: "assistant",
        content: assistantContent,
      });

      res.status(201).json(assistantMessage);
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ message: "Failed to generate response" });
    }
  });

  return httpServer;
}
