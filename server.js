/**
 * server.js — NyayaSahay Production Server
 *
 * Runs on Render.com free tier (and any Node.js host).
 * Responsibilities:
 *  1. Proxy /api/nvidia/* → NVIDIA NIM API (key injected server-side, never sent to browser)
 *  2. Serve the Vite-built React SPA from /dist
 *  3. Health check at /health
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "";

if (!NVIDIA_API_KEY) {
  console.warn("[server] ⚠️  NVIDIA_API_KEY is not set. AI responses will return 401.");
}

// ── Parse JSON bodies for any direct API use ─────────────────────────────────
app.use(express.json());

// ── Health check (Render uses this to verify the service is alive) ───────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "NyayaSahay", timestamp: new Date().toISOString() });
});

// ── NVIDIA NIM Proxy ─────────────────────────────────────────────────────────
// All requests to /api/nvidia/* are forwarded to NVIDIA with the server-side key.
// The browser never sees the key — it's only in Render's environment variables.
app.use("/api/nvidia", async (req, res) => {
  const targetPath = req.url.replace(/^\//, "");
  const url = `https://integrate.api.nvidia.com/${targetPath}`;

  // Collect request body
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks);

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
      },
      body: body.length > 0 ? body : undefined,
    });

    res.status(response.status);
    res.setHeader("Content-Type", "application/json");
    const text = await response.text();
    res.send(text);
  } catch (err) {
    console.error("[proxy] NVIDIA API error:", err.message);
    res.status(502).json({ error: "AI service temporarily unavailable. Please try again." });
  }
});

// ── Serve Vite build (React SPA) ─────────────────────────────────────────────
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// SPA fallback — all unknown routes return index.html (handles React Router)
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[server] ✅ NyayaSahay running → http://localhost:${PORT}`);
  console.log(`[server] 🔒 NVIDIA proxy active → /api/nvidia/*`);
  console.log(`[server] 📦 Serving SPA from → ${distPath}`);
});
