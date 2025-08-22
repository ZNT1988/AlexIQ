// ESM – Front (Vite en dev / build en prod) + API réelles sur UN SEUL PORT.
// Node >= 18
// npm i express vite

import express from "express";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3003);
const NODE_ENV = process.env.NODE_ENV || "development";
const app = express();

// ====== ENV HELPERS (ASCII + FR avec accents acceptés) ======
const env = (...names) => names.map(n => process.env[n]).find(Boolean);

const OPENAI_KEY      = env("CLE_API_OPENAI", "CLÉ_API_OPENAI", "OPENAI_API_KEY");
const ANTHROPIC_KEY   = env("CLE_API_ANTHROPIC", "CLÉ_API_ANTHROPIC", "ANTHROPIC_API_KEY");
const GOOGLE_API_KEY  = env("CLE_API_GOOGLE", "CLÉ_API_GOOGLE", "GOOGLE_API_KEY"); // Gemini API key (option)
const GCP_SA_JSON     = env("GOOGLE_APPLICATION_CREDENTIALS_JSON");               // Service Account JSON (string)
const GCP_PROJECT     = env("ID_PROJET_GOOGLE", "GOOGLE_PROJECT_ID");
const GCP_LOCATION    = env("GOOGLE_LOCATION");
const VERTEX_MODEL    = env("GOOGLE_VERTEX_MODEL"); // ex: gemini-1.5-pro-002

// ====== Helpers ======
async function googleAccessTokenFromServiceAccount(saJson) {
  let creds;
  try { creds = JSON.parse(saJson); } catch { throw new Error("Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON"); }
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: creds.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const toSign = `${b64(header)}.${b64(claims)}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(toSign);
  const signature = signer.sign(creds.private_key, "base64url");
  const assertion = `${toSign}.${signature}`;

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!resp.ok) throw new Error(`GCP token error: ${await resp.text()}`);
  const data = await resp.json();
  return data.access_token;
}

// ====== Middlewares ======
app.use(express.json({ strict: true, limit: "2mb", type: "application/json" }));
app.use((err, _req, res, next) => {
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ error: "invalid_json", message: "Malformed JSON body" });
  }
  next(err);
});

// ====== API ======
app.get("/api/health", (_req, res) => {
  res.json({ 
    ok: true, 
    service: "Chat IA Simple - Proxy vers APIs officielles",
    env: NODE_ENV, 
    port: PORT, 
    providers: {
      openai: !!OPENAI_KEY,
      anthropic: !!ANTHROPIC_KEY,
      vertex: !!(GCP_SA_JSON && GCP_PROJECT),
      gemini: !!GOOGLE_API_KEY
    },
    ts: Date.now() 
  });
});

// Chat direct vers APIs officielles - ZERO FAKE, ZERO SIMULATION
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "bad_request", message: "message:string requis" });
    }

    // 1) OpenAI
    if (OPENAI_KEY) {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: message }] })
      });
      if (!r.ok) return res.status(502).json({ error: "provider_error", provider: "openai", detail: await r.text() });
      const j = await r.json();
      const out = j?.choices?.[0]?.message?.content ?? null;
      const response = { provider: "openai", output: out };
      if (process.env.DEBUG === "1") response.raw = j;
      return res.json(response);
    }

    // 2) Anthropic
    if (ANTHROPIC_KEY) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-3.5-sonnet-20240620",
          max_tokens: 512,
          messages: [{ role: "user", content: message }]
        })
      });
      if (!r.ok) return res.status(502).json({ error: "provider_error", provider: "anthropic", detail: await r.text() });
      const j = await r.json();
      const out = j?.content?.[0]?.text ?? null;
      const response = { provider: "anthropic", output: out };
      if (process.env.DEBUG === "1") response.raw = j;
      return res.json(response);
    }

    // 3) Vertex AI (Service Account JSON)
    if (GCP_SA_JSON && GCP_PROJECT && GCP_LOCATION && VERTEX_MODEL) {
      const accessToken = await googleAccessTokenFromServiceAccount(GCP_SA_JSON);
      const url = `https://${GCP_LOCATION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT}/locations/${GCP_LOCATION}/publishers/google/models/${VERTEX_MODEL}:generateContent`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: message }] }] })
      });
      if (!r.ok) return res.status(502).json({ error: "provider_error", provider: "vertex", detail: await r.text() });
      const j = await r.json();
      const text = j?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") ?? null;
      const response = { provider: "vertex", output: text };
      if (process.env.DEBUG === "1") response.raw = j;
      return res.json(response);
    }

    // 4) Gemini API (clé simple)
    if (GOOGLE_API_KEY) {
      const model = VERTEX_MODEL || "gemini-1.5-pro";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: message }] }] })
      });
      if (!r.ok) return res.status(502).json({ error: "provider_error", provider: "gemini", detail: await r.text() });
      const j = await r.json();
      const text = j?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") ?? null;
      const response = { provider: "gemini", output: text };
      if (process.env.DEBUG === "1") response.raw = j;
      return res.json(response);
    }

    return res.status(503).json({ error: "not_configured", message: "Aucune clé configurée (OpenAI/Anthropic/Vertex/Gemini)." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal", message: "Erreur traitement /api/chat" });
  }
});

// ====== FRONT (même port) ======
if (NODE_ENV === "production") {
  const distDir = path.resolve(__dirname, "frontend", "dist");
  app.use(express.static(distDir));
  app.get("*", async (_req, res) => {
    const html = await fs.readFile(path.join(distDir, "index.html"), "utf-8");
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  });
} else {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    root: path.resolve(__dirname, "frontend"),
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
  app.get("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;
      let html = await fs.readFile(path.resolve(__dirname, "frontend", "index.html"), "utf-8");
      html = await vite.transformIndexHtml(url, html);
      res.status(200).setHeader("Content-Type", "text/html").end(html);
    } catch (e) { next(e); }
  });
}

app.listen(PORT, () => {
  console.log(`✅ Chat IA Simple - Proxy OpenAI/Anthropic/Google on http://localhost:${PORT} (env=${NODE_ENV})`);
});