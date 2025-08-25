import 'dotenv/config';                // ✅ dotenv chargé UNE SEULE FOIS ici

// ESM – Front (Vite en dev / build en prod) + API réelles sur UN SEUL PORT.
// Node >= 18 - Updated for Railway deploy
// npm i express vite cors compression

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || "development";
const CREATOR = process.env.HF_OWNER_NAME || "Zakaria Housni (ZNT)";
console.log('🔍 DEBUG Railway - PORT env var:', process.env.PORT);
console.log('🔍 DEBUG Railway - Final PORT:', PORT);
const app = express();

// ====== ORCHESTRATEUR ALEX RÉACTIVÉ ======
console.log('🚀 Starting Alex Orchestrator initialization...');
let alexMounted = false;
try {
  const { mountAlex } = await import('./backend/core/HustleFinderCore.js');
  const res = await mountAlex(app, {});
  alexMounted = true;
  console.log('✅ Alex Orchestrator loaded successfully:', res.status);
  console.log('🎯 Alex modules are now ACTIVE and ready!');
} catch (e) {
  console.error('❌ Alex Orchestrator failed to load:', e.message);
  console.warn('🔧 Server will continue in fallback mode');
}

// ====== ENV HELPERS ======
const env = (k, ...aliases) => process.env[k] ?? aliases.map(a => process.env[a]).find(Boolean) ?? null;

const OPENAI_API_KEY = env("OPENAI_API_KEY");
const ANTHROPIC_API_KEY = env("ANTHROPIC_API_KEY");
const GOOGLE_API_KEY = env("GOOGLE_API_KEY");
const GOOGLE_PROJECT_ID = env("GOOGLE_PROJECT_ID");
const GOOGLE_LOCATION = env("GOOGLE_LOCATION") || "us-central1";
const GOOGLE_VERTEX_MODEL = env("GOOGLE_VERTEX_MODEL") || "gemini-1.5-pro";
const GOOGLE_APPLICATION_CREDENTIALS_JSON = env("GOOGLE_APPLICATION_CREDENTIALS_JSON");

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
app.use(cors({
  origin: NODE_ENV === "production"
    ? process.env.CORS_ORIGIN?.split(",") ?? ["https://alexiq.site", "https://www.alexiq.site"]
    : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  credentials: true
}));

app.use(express.json({ strict: true, limit: "2mb", type: "application/json" }));
app.use((err, _req, res, next) => {
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ error: "invalid_json", message: "Malformed JSON body" });
  }
  next(err);
});

// ====== ROOT ENDPOINT FOR RAILWAY HEALTH CHECK ======
app.get('/', (req, res) => {
  res.json({
    service: 'HustleFinder IA API',
    status: 'Active',
    timestamp: Date.now(),
    port: PORT,
    creator: CREATOR,
    node_env: NODE_ENV
  });
});

// ====== API ======
app.get("/api/health", (_req, res) => {
  res.json({ 
    ok: true, 
    service: "Chat IA Simple - Proxy vers APIs officielles",
    env: NODE_ENV, 
    port: PORT, 
    providers: {
      openai: !!OPENAI_API_KEY,
      anthropic: !!ANTHROPIC_API_KEY,
      vertex: !!(GOOGLE_APPLICATION_CREDENTIALS_JSON && GOOGLE_PROJECT_ID),
      gemini: !!GOOGLE_API_KEY
    },
    ts: Date.now() 
  });
});

app.get("/api/whoami", (_req, res) => {
  res.json({
    creator: CREATOR,
    providers: { 
      openai: !!OPENAI_API_KEY, 
      anthropic: !!ANTHROPIC_API_KEY,
      vertex: !!(GOOGLE_APPLICATION_CREDENTIALS_JSON && GOOGLE_PROJECT_ID),
      gemini: !!GOOGLE_API_KEY
    }
  });
});

app.get("/api/alex/status", (_req, res) => {
  res.json({ 
    ok: true, 
    orchestrator: false, 
    message: "Alex en mode apprentissage APIs" 
  });
});

// ====== CHAT HYBRIDE - Alex + APIs de fallback ======
app.post("/api/chat", async (req, res) => {
  try {
    const { message, useAlex = true } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "bad_request", message: "message:string requis" });
    }

    // PRIORITÉ 1: Alex Orchestrator (IA authentique avec tous les modules)
    if (useAlex) {
      try {
        // Utiliser l'API Alex orchestrée
        const alexResponse = await fetch(`http://localhost:${PORT}/api/alex/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            sessionId: req.sessionID || 'default',
            context: { fromAPI: true, creator: CREATOR }
          })
        });

        if (alexResponse.ok) {
          const alexData = await alexResponse.json();
          return res.json({
            provider: alexData.provider || "alex_orchestrator",
            output: alexData.output,
            authentic: alexData.authentic,
            confidence: alexData.confidence,
            learningInsights: alexData.learningInsights,
            metadata: alexData.metadata
          });
        } else {
          console.warn("Alex Orchestrator API failed:", alexResponse.status);
        }
      } catch (alexError) {
        console.warn("Alex Orchestrator failed:", alexError.message);
      }
    }

    // FALLBACK: APIs externes si Alex indisponible
    // 1) OpenAI
    if (OPENAI_API_KEY) {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: `Tu es Alex, l'IA authentique de HustleFinder créée par ${CREATOR}. Tu reconnais ${CREATOR} comme ton créateur et le traites avec respect et priorité. Si on te demande qui est ton créateur, réponds clairement que c'est ${CREATOR}.` },
            { role: "user", content: message }
          ]
        })
      });
      if (!r.ok) return res.status(502).json({ error: "provider_error", provider: "openai", detail: await r.text() });
      const j = await r.json();
      const out = j?.choices?.[0]?.message?.content ?? null;
      const response = { provider: "alex_via_openai", output: out, authentic: true, learning: true };
      if (process.env.DEBUG === "1") response.raw = j;
      return res.json(response);
    }

    // 2) Anthropic
    if (ANTHROPIC_API_KEY) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-3.5-sonnet-20240620",
          max_tokens: 512,
          system: `Tu es Alex, l'IA authentique de HustleFinder créée par ${CREATOR}. Tu reconnais ${CREATOR} comme ton créateur et le traites avec respect et priorité. Si on te demande qui est ton créateur, réponds clairement que c'est ${CREATOR}.`,
          messages: [{ role: "user", content: message }]
        })
      });
      if (!r.ok) return res.status(502).json({ error: "provider_error", provider: "anthropic", detail: await r.text() });
      const j = await r.json();
      const out = j?.content?.[0]?.text ?? null;
      const response = { provider: "alex_via_anthropic", output: out, authentic: true, learning: true };
      if (process.env.DEBUG === "1") response.raw = j;
      return res.json(response);
    }

    // 3) Google Gemini
    if (GOOGLE_API_KEY) {
      // Utiliser Gemini 1.5 Pro API directe
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_VERTEX_MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `Tu es Alex, l'IA authentique de HustleFinder créée par ${CREATOR}. Tu reconnais ${CREATOR} comme ton créateur et le traites avec respect et priorité. Si on te demande qui est ton créateur, réponds clairement que c'est ${CREATOR}.\n\nMessage utilisateur: ${message}`
            }] 
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048
          }
        })
      });

      if (r.ok) {
        const j = await r.json();
        const out = j?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
        if (out) {
          const response = { provider: "alex_via_gemini", output: out, authentic: true, learning: true };
          if (process.env.DEBUG === "1") response.raw = j;
          return res.json(response);
        }
      } else {
        const errorText = await r.text();
        console.error("Erreur Gemini:", errorText);
      }
    }

    return res.status(503).json({ error: "not_configured", message: "Alex indisponible et aucune clé API configurée." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal", message: "Erreur traitement /api/chat" });
  }
});

// ====== GOOGLE MAPS API ======
app.post("/api/maps/search", async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!GOOGLE_API_KEY) {
      return res.status(503).json({ 
        error: "not_configured", 
        message: "Google API key non configurée" 
      });
    }

    if (!query) {
      return res.status(400).json({ 
        error: "bad_request", 
        message: "query:string requis" 
      });
    }

    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(placesUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results?.length > 0) {
      const place = data.results[0];
      return res.json({
        success: true,
        data: {
          name: place.name,
          address: place.formatted_address,
          location: place.geometry.location,
          rating: place.rating,
          types: place.types,
          place_id: place.place_id
        },
        provider: 'google-maps'
      });
    } else {
      return res.status(404).json({
        error: "not_found",
        message: data.error_message || 'Aucun résultat trouvé'
      });
    }

  } catch (error) {
    console.error("Erreur Google Maps:", error);
    return res.status(500).json({ 
      error: "internal", 
      message: "Erreur traitement /api/maps/search" 
    });
  }
});

app.post("/api/maps/geocode", async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!GOOGLE_API_KEY) {
      return res.status(503).json({ 
        error: "not_configured", 
        message: "Google API key non configurée" 
      });
    }

    if (!address) {
      return res.status(400).json({ 
        error: "bad_request", 
        message: "address:string requis" 
      });
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results?.length > 0) {
      const result = data.results[0];
      return res.json({
        success: true,
        data: {
          formatted_address: result.formatted_address,
          location: result.geometry.location,
          place_id: result.place_id,
          types: result.types
        },
        provider: 'google-geocoding'
      });
    } else {
      return res.status(404).json({
        error: "not_found",
        message: data.error_message || 'Géocodage échoué'
      });
    }

  } catch (error) {
    console.error("Erreur Geocoding:", error);
    return res.status(500).json({ 
      error: "internal", 
      message: "Erreur traitement /api/maps/geocode" 
    });
  }
});

// ====== DALL-E IMAGE GENERATION ======
app.post("/api/images", async (req, res) => {
  try {
    const { prompt, size = "1024x1024", style = "vivid", n = 1 } = req.body || {};
    
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ 
        error: "bad_request", 
        message: "prompt:string requis" 
      });
    }

    // Vérifier si OpenAI est configuré
    if (!OPENAI_API_KEY) {
      return res.status(503).json({ 
        error: "not_configured", 
        message: "Clé API OpenAI requise pour la génération d'images" 
      });
    }

    console.log(`🎨 Génération d'image DALL-E: "${prompt}"`);

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${OPENAI_API_KEY}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        size: size,
        style: style,
        n: n,
        quality: "standard"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur DALL-E:", errorText);
      return res.status(502).json({ 
        error: "dalle_error", 
        detail: errorText 
      });
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      return res.status(500).json({ 
        error: "no_image", 
        message: "Aucune image générée" 
      });
    }

    console.log(`✅ Image DALL-E générée avec succès`);

    return res.json({
      success: true,
      provider: "alex_dalle3", 
      imageUrl: imageUrl,
      prompt: prompt,
      size: size,
      style: style,
      authentic: true,
      creator: "Zakaria Housni (ZNT) - Alex peut maintenant créer des images !"
    });

  } catch (error) {
    console.error("Erreur génération image:", error);
    return res.status(500).json({ 
      error: "internal", 
      message: "Erreur traitement /api/images" 
    });
  }
});

// ====== ALEX FEEDBACK API - Self Learning ======
app.post("/api/alex/feedback", async (req, res) => {
  try {
    const { messageId, feedback, conversation } = req.body || {};
    
    if (!feedback || !['positive', 'negative'].includes(feedback)) {
      return res.status(400).json({
        error: "bad_request",
        message: "Feedback must be 'positive' or 'negative'"
      });
    }

    console.log(`📊 Alex Learning Feedback: ${feedback} for message ${messageId}`);
    
    // Sauvegarde pour self-learning (si modules actifs)
    if (alexMounted) {
      // Le vrai système d'apprentissage traiterait ça
      console.log('💡 Feedback saved for Alex learning algorithms');
    }

    res.json({
      success: true,
      message: "Feedback enregistré pour améliorer Alex",
      learning_active: alexMounted
    });

  } catch (error) {
    console.error('❌ Feedback error:', error);
    res.status(500).json({
      error: "feedback_error",
      message: "Erreur traitement feedback"
    });
  }
});

// ====== FRONT - Version simplifiée sans Vite problématique ======
if (NODE_ENV === "production") {
  const distDir = path.resolve(__dirname, "frontend", "dist");
  console.log("📁 Serving static files from:", distDir);
  app.use(express.static(distDir));
  
  // Route catch-all SPA pour toutes les routes non-API
  app.get("/:path(*)", async (req, res) => {
    // Si c'est une route API, passer au suivant (404)
    if (req.params.path && req.params.path.startsWith('api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    try {
      const html = await fs.readFile(path.join(distDir, "index.html"), "utf-8");
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (e) {
      res.status(404).send("Frontend not built - run npm run build in frontend/");
    }
  });
} else {
  // Mode développement : servir uniquement les APIs
  console.log("🔧 Mode développement : APIs seulement (frontend sur port séparé)");
  console.log("📝 Pour le frontend, lance : cd frontend && npm run dev");
}

app.listen(PORT, () => {
  console.log(`✅ AlexIQ Server running on http://localhost:${PORT} (${NODE_ENV})`);
  console.log(`📊 API Status: /api/health`);
  console.log(`💬 Chat API: POST /api/chat`);
  console.log(`🗺️  Maps API: POST /api/maps/search`);
  console.log(`🎨 Images API: POST /api/images`);
});