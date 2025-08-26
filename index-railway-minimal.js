import 'dotenv/config';
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || "development";
console.log('🚀 ULTRA MINIMAL SERVER - NO path-to-regexp issues');
console.log('🔍 DEBUG Railway - PORT:', PORT);

const app = express();

// ====== MINIMAL MIDDLEWARES ======
app.use(cors({
  origin: NODE_ENV === "production"
    ? ["https://alexiq.site", "https://www.alexiq.site"]
    : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  credentials: true
}));

app.use(express.json({ limit: "2mb" }));

// ====== HEALTH CHECK ======
app.get('/', (req, res) => {
  res.json({
    service: 'Alex IQ API',
    status: 'Railway Minimal Mode',
    timestamp: Date.now(),
    port: PORT,
    node_version: process.version
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: Date.now(),
    mode: "railway_minimal"
  });
});

// ====== ALEX STATUS ======
app.get("/api/alex/status", (req, res) => {
  res.json({
    ok: true,
    orchestrator: false,
    mode: "minimal_railway",
    providers: {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY
    },
    message: "APIs fonctionnelles en mode minimal"
  });
});

// ====== CHAT API ======
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    
    if (!message) {
      return res.status(400).json({
        error: "bad_request",
        message: "Message requis"
      });
    }

    console.log('💬 Chat message:', message.slice(0, 50));

    // Réponse simple fonctionnelle
    res.json({
      id: `msg_${Date.now()}`,
      output: `Alex (mode minimal): J'ai bien reçu votre message: "${message}". Le système fonctionne correctement. Interface ChatGPT active !`,
      provider: "alex_minimal",
      confidence: 0.9,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      error: "chat_error",
      message: "Erreur traitement chat"
    });
  }
});

// ====== IMAGE API ======  
app.post("/api/images", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    
    if (!prompt) {
      return res.status(400).json({
        error: "bad_request",
        message: "Prompt requis"
      });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: "api_key_missing",
        message: "Clé OpenAI requise"
      });
    }

    console.log('🎨 Image generation:', prompt);

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Erreur OpenAI");
    }

    res.json({
      id: `img_${Date.now()}`,
      image_url: data.data[0].url,
      prompt: prompt,
      provider: "OpenAI DALL-E",
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ Image error:', error);
    res.status(500).json({
      error: "generation_failed",
      message: `Erreur génération: ${error.message}`
    });
  }
});

// ====== FEEDBACK API ======
app.post("/api/alex/feedback", (req, res) => {
  console.log('📊 Feedback reçu:', req.body);
  res.json({
    success: true,
    message: "Feedback enregistré"
  });
});

// ====== FRONTEND STATIC FILES ======
if (NODE_ENV === "production") {
  const distDir = path.resolve(__dirname, "frontend", "dist");
  console.log("📁 Serving frontend from:", distDir);
  
  app.use(express.static(distDir));
  
  // SPA FALLBACK - SIMPLE (Express 5 compatible)
  app.get(/^\/(?!api\/).*/, (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API not found' });
    }
    
    res.sendFile(path.join(distDir, "index.html"), (err) => {
      if (err) {
        res.status(500).json({ error: 'Frontend not available' });
      }
    });
  });
}

// ====== ERROR HANDLER ======
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).json({
    error: "internal_server_error",
    message: "Something went wrong"
  });
});

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log(`✅ Alex Railway Minimal running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🤖 Interface ChatGPT ready !`);
  console.log(`⚡ Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
});