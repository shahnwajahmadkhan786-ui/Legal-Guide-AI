/**
 * server.js — NyayaSahay Production Server v3
 *
 * 1. Proxy /api/nvidia/*   → NVIDIA NIM (key injected server-side)
 * 2. POST /api/track        → Save analytics events to Supabase
 * 3. GET  /api/admin/stats  → Return dashboard analytics
 * 4. Serve React SPA from /dist
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ""; // service_role key for server-side

if (!NVIDIA_API_KEY) {
  console.warn("[server] ⚠️  NVIDIA_API_KEY not set — AI responses will fail.");
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn("[server] ⚠️  Supabase env vars not set — analytics disabled.");
}

app.use(express.json());

// ── Helper: Supabase REST call ───────────────────────────────────────────────

async function supabaseQuery(endpoint, { method = "GET", body, query } = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;

  let url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  if (query) url += `?${query}`;

  const options = {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=minimal" : "return=representation",
    },
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(url, options);
    if (method === "POST" || method === "PATCH") return { ok: res.ok };
    return await res.json();
  } catch (err) {
    console.error("[supabase]", err.message);
    return null;
  }
}

// ── Health check ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "NyayaSahay", timestamp: new Date().toISOString() });
});

// ── NVIDIA NIM Proxy ─────────────────────────────────────────────────────────

app.use("/api/nvidia", async (req, res) => {
  const targetPath = req.url.replace(/^\//, "");
  const url = `https://integrate.api.nvidia.com/${targetPath}`;

  // req.body is already parsed by express.json() middleware
  const body = req.body && Object.keys(req.body).length > 0
    ? JSON.stringify(req.body)
    : undefined;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
      },
      body,
    });
    res.status(response.status);
    res.setHeader("Content-Type", "application/json");
    res.send(await response.text());
  } catch (err) {
    console.error("[proxy]", err.message);
    res.status(502).json({ error: "AI service temporarily unavailable." });
  }
});

// ── Analytics: Track Event ───────────────────────────────────────────────────

app.post("/api/track", async (req, res) => {
  const { eventType, metadata } = req.body || {};
  if (!eventType) return res.status(400).json({ error: "eventType required" });

  await supabaseQuery("events", {
    method: "POST",
    body: {
      event_type: eventType,
      user_id: metadata?.userId || null,
      user_email: metadata?.email || null,
      metadata: metadata || {},
    },
  });

  res.json({ ok: true });
});

// ── Analytics: Admin Stats ───────────────────────────────────────────────────

app.get("/api/admin/stats", async (_req, res) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.json({
      totalUsers: 0,
      activeToday: 0,
      totalQueries: 0,
      queriesLast24h: 0,
      signupsLast7Days: [],
      queriesLast7Days: [],
      recentEvents: [],
      authMethods: [],
    });
  }

  try {
    // Use Supabase RPC or direct queries
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Parallel queries
    const [allEvents, recentEvents] = await Promise.all([
      supabaseQuery("events", { query: "select=id,event_type,user_email,metadata,created_at" }),
      supabaseQuery("events", {
        query: `select=event_type,user_email,metadata,created_at&order=created_at.desc&limit=20`,
      }),
    ]);

    const events = Array.isArray(allEvents) ? allEvents : [];
    const recent = Array.isArray(recentEvents) ? recentEvents : [];

    // Compute stats in-memory (fine for free tier volume)
    const logins = events.filter(
      (e) => e.event_type === "login" || e.event_type === "signup"
    );
    const uniqueEmails = new Set(logins.map((e) => e.user_email).filter(Boolean));
    const totalUsers = uniqueEmails.size;

    const todayEvents = events.filter((e) => e.created_at >= today);
    const activeToday = new Set(
      todayEvents.map((e) => e.user_email).filter(Boolean)
    ).size;

    const queries = events.filter((e) => e.event_type === "message_sent");
    const totalQueries = queries.length;
    const queriesLast24h = queries.filter((e) => e.created_at >= last24h).length;

    // Signups last 7 days (daily breakdown)
    const signupsLast7Days = [];
    const queriesLast7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      const dayEnd = new Date(
        d.getFullYear(), d.getMonth(), d.getDate() + 1
      ).toISOString();
      const dayStr = dayStart.slice(0, 10);

      signupsLast7Days.push({
        date: dayStr,
        count: logins.filter((e) => e.created_at >= dayStart && e.created_at < dayEnd).length,
      });
      queriesLast7Days.push({
        date: dayStr,
        count: queries.filter((e) => e.created_at >= dayStart && e.created_at < dayEnd).length,
      });
    }

    // Auth methods breakdown
    const methodCounts = {};
    logins.forEach((e) => {
      const method = e.metadata?.auth_method || "email";
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });
    const authMethods = Object.entries(methodCounts).map(([method, count]) => ({
      method,
      count,
    }));

    res.json({
      totalUsers,
      activeToday,
      totalQueries,
      queriesLast24h,
      signupsLast7Days,
      queriesLast7Days,
      recentEvents: recent,
      authMethods,
    });
  } catch (err) {
    console.error("[admin/stats]", err.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ── Serve React SPA ──────────────────────────────────────────────────────────

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
// SPA fallback — all unknown routes return index.html (handles React Router)
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[server] ✅ NyayaSahay v3 → http://localhost:${PORT}`);
  console.log(`[server] 🔒 NVIDIA proxy → /api/nvidia/*`);
  console.log(`[server] 📊 Admin stats  → /api/admin/stats`);
  console.log(`[server] 📦 SPA          → ${distPath}`);
});
