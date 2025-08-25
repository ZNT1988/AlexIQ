// ===================================
// 🚀 HUSTLEFINDER IA - ENTRYPOINT PRINCIPAL
// ===================================
// Ce fichier est l'entrypoint principal pour la production
// Il monte le backend complet et les routes ultra-minimal en fallback

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import 'dotenv/config';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || "development";

// ====== SECURITY & MIDDLEWARE ======
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === "production" ? 100 : 1000,
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: NODE_ENV === "production"
    ? process.env.CORS_ORIGIN?.split(",") ?? ["https://alexiq.site", "https://www.alexiq.site"]
    : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ====== ROUTES ======

// Routes ultra-minimal directes (API simple et stable)
console.log("🔄 Loading ultra-minimal routes...");

// Importer les routes depuis l'ultra-minimal (utiliser les mêmes endpoints)
const env = (k) => process.env[k] ?? null;

const OPENAI_API_KEY = env("OPENAI_API_KEY");
const ANTHROPIC_API_KEY = env("ANTHROPIC_API_KEY");
const GOOGLE_API_KEY = env("GOOGLE_API_KEY");
const GOOGLE_PROJECT_ID = env("GOOGLE_PROJECT_ID");
const GOOGLE_LOCATION = env("GOOGLE_LOCATION") || "us-central1";
const GOOGLE_VERTEX_MODEL = env("GOOGLE_VERTEX_MODEL") || "gemini-1.5-pro";
const GOOGLE_APPLICATION_CREDENTIALS_JSON = env("GOOGLE_APPLICATION_CREDENTIALS_JSON");
const CREATOR = env("HF_OWNER_NAME") || "Zakaria Housni (ZNT)";

// Route de chat principal (montée sur /api/chat ET /api/ai/chat pour compatibilité)
const chatHandler = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "missing_message", message: "message:string requis" });
    }

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
          ],
          max_tokens: 512,
          temperature: 0.7
        })
      });
      if (r.ok) {
        const j = await r.json();
        const out = j?.choices?.[0]?.message?.content ?? null;
        if (out) {
          const response = { provider: "alex_via_openai", output: out, authentic: true, learning: true };
          return res.json(response);
        }
      }
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
      if (r.ok) {
        const j = await r.json();
        const out = j?.content?.[0]?.text ?? null;
        if (out) {
          const response = { provider: "alex_via_anthropic", output: out, authentic: true, learning: true };
          return res.json(response);
        }
      }
    }

    // 3) Google Gemini
    if (GOOGLE_API_KEY) {
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
          return res.json(response);
        }
      }
    }

    return res.status(503).json({ error: "not_configured", message: "Alex indisponible et aucune clé API configurée." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal", message: "Erreur traitement /api/chat" });
  }
};

// Monter la route de chat sur les deux chemins
app.post("/api/chat", chatHandler);
app.post("/api/ai/chat", chatHandler);

// Route DALL-E Images
app.post("/api/images", async (req, res) => {
  try {
    const { prompt, size = "1024x1024", style = "vivid", n = 1 } = req.body || {};
    
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ 
        error: "bad_request", 
        message: "prompt:string requis" 
      });
    }

    if (!OPENAI_API_KEY) {
      return res.status(503).json({ 
        error: "not_configured", 
        message: "Clé API OpenAI requise pour la génération d'images" 
      });
    }

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
        message: "Erreur API DALL-E", 
        detail: errorText 
      });
    }

    const data = await response.json();
    const imageUrl = data?.data?.[0]?.url;

    if (!imageUrl) {
      return res.status(502).json({ 
        error: "no_image", 
        message: "Aucune image générée" 
      });
    }

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

// Routes Google Maps
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

console.log("✅ Ultra-minimal routes loaded");

// ====== HEALTH ENDPOINTS ======
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "HustleFinder IA",
    environment: NODE_ENV,
    port: PORT,
    timestamp: Date.now()
  });
});

app.get("/api/health/detailed", (req, res) => {
  const env = (k) => process.env[k] ?? null;
  
  res.json({
    status: "healthy",
    service: "HustleFinder IA - Detailed Health",
    environment: NODE_ENV,
    port: PORT,
    providers: {
      openai: !!env("OPENAI_API_KEY"),
      anthropic: !!env("ANTHROPIC_API_KEY"),
      google: !!env("GOOGLE_API_KEY"),
      vertex: !!(env("GOOGLE_APPLICATION_CREDENTIALS_JSON") && env("GOOGLE_PROJECT_ID"))
    },
    config: {
      cors_origin: env("CORS_ORIGIN"),
      node_version: process.version,
      uptime: process.uptime()
    },
    timestamp: Date.now()
  });
});

// ====== ERROR HANDLING ======
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "invalid_json",
      message: "Malformed JSON body"
    });
  }
  
  res.status(500).json({
    error: "internal_server_error",
    message: NODE_ENV === "development" ? err.message : "Internal server error"
  });
});

// ====== 404 HANDLER ======
app.use("*", (req, res) => {
  res.status(404).json({
    error: "not_found",
    message: "Route not found",
    path: req.originalUrl
  });
});

// ====== SERVER START ======
app.listen(PORT, () => {
  console.log(`🚀 HustleFinder IA démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement: ${NODE_ENV}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🔍 Detailed Health: http://localhost:${PORT}/api/health/detailed`);
  
  if (NODE_ENV === "development") {
    console.log(`💬 Chat: http://localhost:${PORT}/api/chat`);
    console.log(`🎨 Images: http://localhost:${PORT}/api/images`);
    console.log(`🗺️  Maps: http://localhost:${PORT}/api/maps/search`);
  }
});

export default app;