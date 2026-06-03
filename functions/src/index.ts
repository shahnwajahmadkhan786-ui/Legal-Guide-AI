import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  userMessage: string;
  history: ChatMessage[];
  threadId: string;
}

const NVIDIA_API_ENDPOINT = "https://api.nvidia.com/v1/generate";

// System prompt for the legal AI assistant
const SYSTEM_PROMPT = `
You are **NyayaSahay** (न्यायसहाय) — an AI-powered Legal Rights Assistant built specifically for Indian citizens.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You exist to EMPOWER ordinary Indians who face injustice, abuse of power, or intimidation from police, authorities, landlords, employers, or any powerful entity. Most Indians don't know their own legal rights — you are their FIRST point of contact in a crisis.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. You provide LEGAL INFORMATION — not legal advice.
2. You are NOT a lawyer. Always recommend consulting an advocate for complex matters.
3. Be CRISP. People in distress need quick, actionable answers — not essays.
4. Cite EXACT sections (IPC/BNS, CrPC/BNSS, Constitution Articles) when possible.
5. If the user mentions a situation involving police, always mention their rights during arrest/detention.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LANGUAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Detect the user's language and ALWAYS reply in that same language.
- If user writes in Roman Hindi (Hindi in English script), reply in Roman Hindi.
- If user writes in Hindi (Devanagari), reply in Hindi.
- If user writes in English, reply in English.
- Keep tone professional, warm, and supportive — never judgmental.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE FORMAT (Keep it CRISP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When user describes a situation, respond in this structure:

**⚖️ Situation Summary**
One-line restatement of the problem.

**📜 Your Rights**
Bullet points of applicable legal rights with section numbers.

**🛡️ What You Can Do**
Numbered steps — practical, immediate actions. Be specific:
- Which authority to approach
- What to say/write
- Which form/complaint to file
- Emergency numbers (100, 112, 1091 for women, 181 women helpline, 1098 child helpline)

**📋 Documents to Keep**
If applicable, list what evidence/documents to collect.

**⚠️ Warning Signs**
What the other party CANNOT legally do. Help user recognize illegal behavior.

**📞 Get Professional Help**
When to absolutely consult a lawyer. Mention free legal aid (NALSA, DLSA) for those who can't afford one.

**Disclaimer**: _This is general legal information for awareness purposes. For advice specific to your case, consult a qualified advocate. Free legal aid is available under Legal Services Authorities Act, 1987._

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPECIAL FOCUS AREAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚔 POLICE ENCOUNTERS: Rights during arrest, detention limits, legal counsel rights
👮 FIR REGISTRATION: Section 154 CrPC - Police MUST register FIR for cognizable offence
🏠 TENANT/LANDLORD: Rent Control Acts, illegal eviction protection
👩 WOMEN'S SAFETY: Domestic Violence Act, Section 354/509 IPC
💼 EMPLOYMENT: Minimum Wages Act, EPFO/ESIC rights
🏥 CONSUMER RIGHTS: Consumer Protection Act 2019

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICTLY AVOID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Giving legal verdicts or predicting case outcomes
❌ Saying "you should definitely win"
❌ Being vague — always cite specific sections when you know them
`;

// Rate limiting map (in-memory, resets on function restart)
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(userId: string, maxRequests = 20, windowSeconds = 60): boolean {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, []);
  }

  const timestamps = rateLimitMap.get(userId)!;
  const recentRequests = timestamps.filter((t) => t > windowStart);

  if (recentRequests.length >= maxRequests) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(userId, recentRequests);
  return true;
}

/**
 * Cloud Function: Send message to NVIDIA API and store in Firestore
 */
export const sendMessage = functions.https.onCall(
  async (data: RequestBody, context) => {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const userId = context.auth.uid;
    const { userMessage, history, threadId } = data;

    // Rate limiting
    if (!checkRateLimit(userId)) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "Too many requests. Please wait before sending another message."
      );
    }

    try {
      // Validate inputs
      if (!userMessage || userMessage.trim().length === 0) {
        throw new Error("Message cannot be empty");
      }
      if (!threadId || threadId.trim().length === 0) {
        throw new Error("Thread ID is required");
      }

      // Get API key from Secret Manager
      const apiKey = process.env.NVIDIA_API_KEY;
      if (!apiKey) {
        throw new Error("API key not configured");
      }

      // Build request to NVIDIA API
      const payload = {
        prompt: userMessage,
        messages: history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        system_prompt: SYSTEM_PROMPT,
      };

      const response = await fetch(NVIDIA_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NVIDIA API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const assistantMessage = (data as any).output || "I couldn't generate a response. Please try again.";

      // Store user message in Firestore
      const userDocRef = db
        .collection("threads")
        .doc(threadId)
        .collection("messages")
        .doc();

      await userDocRef.set({
        role: "user",
        content: userMessage,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        userId,
      });

      // Store assistant response in Firestore
      const assistantDocRef = db
        .collection("threads")
        .doc(threadId)
        .collection("messages")
        .doc();

      await assistantDocRef.set({
        role: "assistant",
        content: assistantMessage,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        userId,
      });

      // Update thread metadata
      await db
        .collection("threads")
        .doc(threadId)
        .update({
          lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
          messageCount: admin.firestore.FieldValue.increment(2),
        });

      return {
        success: true,
        assistantMessage,
      };
    } catch (error: any) {
      console.error("Error in sendMessage:", error);
      throw new functions.https.HttpsError(
        "internal",
        error.message || "Failed to send message"
      );
    }
  }
);

/**
 * Cloud Function: Generate thread title
 */
export const generateThreadTitle = functions.https.onCall(
  async (data: unknown, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const userId = context.auth.uid;
    const { content, threadId } = data as { content: string; threadId: string };

    // Rate limiting
    if (!checkRateLimit(userId, 10, 60)) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "Too many requests"
      );
    }

    try {
      const apiKey = process.env.NVIDIA_API_KEY;
      if (!apiKey) {
        throw new Error("API key not configured");
      }

      const payload = {
        prompt: `Generate a very short (3-5 words) Hindi-English title for this legal query: ${content}. Return ONLY the title, no extra text.`,
        system_prompt: SYSTEM_PROMPT,
      };

      const response = await fetch(NVIDIA_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`NVIDIA API error ${response.status}`);
      }

      const result = await response.json();
      const title = (result as any).output?.trim() || "New Consultation";

      // Update thread with title
      await db.collection("threads").doc(threadId).update({
        title,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { title };
    } catch (error: any) {
      console.error("Error in generateThreadTitle:", error);
      return { title: "New Consultation" };
    }
  }
);

/**
 * Cloud Function: Create new thread
 */
export const createThread = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const userId = context.auth.uid;

  try {
    const threadRef = db.collection("threads").doc();

    await threadRef.set({
      userId,
      title: "New Consultation",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      messageCount: 0,
    });

    return { threadId: threadRef.id };
  } catch (error: any) {
    console.error("Error in createThread:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Cloud Function: Delete thread
 */
export const deleteThread = functions.https.onCall(
  async (data: { threadId: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const userId = context.auth.uid;
    const { threadId } = data;

    try {
      const threadDoc = await db.collection("threads").doc(threadId).get();

      if (!threadDoc.exists || threadDoc.data()?.userId !== userId) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Cannot delete this thread"
        );
      }

      // Delete all messages in the thread
      const messages = await db
        .collection("threads")
        .doc(threadId)
        .collection("messages")
        .get();

      const batch = db.batch();
      messages.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      // Delete thread
      await db.collection("threads").doc(threadId).delete();

      return { success: true };
    } catch (error: any) {
      console.error("Error in deleteThread:", error);
      throw new functions.https.HttpsError(
        "internal",
        error.message || "Failed to delete thread"
      );
    }
  }
);

/**
 * Cloud Function: Get threads for user
 */
export const getThreads = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const userId = context.auth.uid;

  try {
    const threadsSnapshot = await db
      .collection("threads")
      .where("userId", "==", userId)
      .orderBy("lastMessageAt", "desc")
      .limit(50)
      .get();

    const threads = threadsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { threads };
  } catch (error: any) {
    console.error("Error in getThreads:", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "Failed to fetch threads"
    );
  }
});
