import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import type { Plugin } from "vite";

// Node 20 compatible __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The API key lives here in the Vite/Node config — never compiled into the browser bundle.
const NVIDIA_API_KEY =
  process.env.NVIDIA_API_KEY ||
  "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";

/**
 * Vite plugin that intercepts /api/nvidia/* requests in dev mode,
 * injects the Authorization header server-side, then forwards to NVIDIA NIM.
 */
function nvidiaProxyPlugin(): Plugin {
  return {
    name: "nvidia-proxy",
    configureServer(server) {
      server.middlewares.use("/api/nvidia", async (req, res) => {
        const targetPath = (req.url || "/").replace(/^\//, "");
        const url = `https://integrate.api.nvidia.com/${targetPath}`;

        const chunks: Buffer[] = [];
        await new Promise<void>((resolve) => {
          req.on("data", (chunk: Buffer) => chunks.push(chunk));
          req.on("end", resolve);
        });
        const body = Buffer.concat(chunks);

        try {
          const response = await fetch(url, {
            method: req.method || "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${NVIDIA_API_KEY}`,
            },
            body: body.length > 0 ? body : undefined,
          });

          res.statusCode = response.status;
          res.setHeader("Content-Type", "application/json");
          const text = await response.text();
          res.end(text);
        } catch (err: any) {
          console.error("[nvidia-proxy] Error:", err.message);
          res.statusCode = 502;
          res.end(JSON.stringify({ error: "AI service unreachable" }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), nvidiaProxyPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
});
