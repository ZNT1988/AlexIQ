import 'dotenv/config';
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
const PORT = 3000;
const NODE_ENV = "development";

// Middlewares
app.use(cors());
app.use(express.json());

// Routes API simples
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

console.log("✅ API routes OK");

// Test de la section frontend (la partie qui peut poser problème)
if (NODE_ENV === "production") {
  console.log("Mode production - static files");
  const distDir = path.resolve(__dirname, "frontend", "dist");
  app.use(express.static(distDir));
  app.get("/*", async (_req, res) => {
    try {
      const html = await fs.readFile(path.join(distDir, "index.html"), "utf-8");
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (e) {
      res.status(404).send("Frontend not built");
    }
  });
} else {
  console.log("Mode développement - testing Vite import...");
  
  // C'EST ICI QUE L'ERREUR PEUT SURVENIR
  try {
    const { createServer: createViteServer } = await import("vite");
    console.log("✅ Vite import OK");
    
    const vite = await createViteServer({
      root: path.resolve(__dirname, "frontend"),
      server: { middlewareMode: true },
      appType: "spa"
    });
    console.log("✅ Vite server creation OK");
    
    app.use(vite.middlewares);
    console.log("✅ Vite middlewares OK");
    
    app.get("/*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let html = await fs.readFile(path.resolve(__dirname, "frontend", "index.html"), "utf-8");
        html = await vite.transformIndexHtml(url, html);
        res.status(200).setHeader("Content-Type", "text/html").end(html);
      } catch (e) { 
        next(e); 
      }
    });
    console.log("✅ Vite catch-all route OK");
    
  } catch (viteError) {
    console.error("❌ Erreur Vite:", viteError.message);
  }
}

app.listen(PORT, () => {
  console.log(`✅ Frontend test server on http://localhost:${PORT}`);
});