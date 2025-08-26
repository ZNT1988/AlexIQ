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
    orchestrator: true,
    mode: "production_real_ai",
    providers: {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      google: !!process.env.GOOGLE_API_KEY,
      maps: !!process.env.GOOGLE_API_KEY
    },
    authentic: true,
    message: "Vraies APIs intégrées - Zero fake AI"
  });
});

// ====== CHAT API avec vraies APIs ======
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

    // 1) OpenAI GPT-4
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (OPENAI_API_KEY) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Tu es Alex, l'IA authentique de HustleFinder. Réponds de manière naturelle et intelligente." },
              { role: "user", content: message }
            ],
            max_tokens: 500
          })
        });

        if (response.ok) {
          const data = await response.json();
          const output = data.choices?.[0]?.message?.content;
          if (output) {
            return res.json({
              id: `msg_${Date.now()}`,
              output: output,
              provider: "alex_via_openai",
              authentic: true,
              timestamp: Date.now()
            });
          }
        }
      } catch (openaiError) {
        console.error('OpenAI error:', openaiError);
      }
    }

    // 2) Anthropic Claude fallback
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (ANTHROPIC_API_KEY) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "claude-3.5-sonnet-20240620",
            max_tokens: 500,
            system: "Tu es Alex, l'IA authentique de HustleFinder. Réponds de manière naturelle et intelligente.",
            messages: [{ role: "user", content: message }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const output = data.content?.[0]?.text;
          if (output) {
            return res.json({
              id: `msg_${Date.now()}`,
              output: output,
              provider: "alex_via_anthropic", 
              authentic: true,
              timestamp: Date.now()
            });
          }
        }
      } catch (anthropicError) {
        console.error('Anthropic error:', anthropicError);
      }
    }

    // 3) Google Gemini fallback
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    if (GOOGLE_API_KEY) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ 
              parts: [{ 
                text: `Tu es Alex, l'IA authentique de HustleFinder. Réponds de manière naturelle et intelligente.\n\nMessage: ${message}`
              }] 
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 1,
              topP: 1,
              maxOutputTokens: 500
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const output = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (output) {
            return res.json({
              id: `msg_${Date.now()}`,
              output: output,
              provider: "alex_via_gemini",
              authentic: true,
              timestamp: Date.now()
            });
          }
        }
      } catch (geminiError) {
        console.error('Gemini error:', geminiError);
      }
    }

    // 4) Si aucune API n'est disponible
    return res.status(503).json({
      error: "no_ai_provider",
      message: "Aucune clé API configurée (OpenAI, Anthropic ou Google requise)"
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
  const distDir = path.resolve(__dirname, "dist");
  console.log("📁 Serving frontend from:", distDir);
  
  app.use(express.static(distDir));
  
  // SPA FALLBACK - SIMPLE (Express 5 compatible)
  app.get(/^\/(?!api\/).*/, (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API not found' });
    }
    
    res.sendFile(path.join(distDir, "index.html"), (err) => {
      if (err) {
        console.error('Frontend serve error:', err);
        res.status(404).send('Page not found - Frontend not available');
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