import express from 'express';
import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import AI_KEYS from '../config/aiKeys.js';
import { computeConfidence } from '../utils/confidence.js';
import { memoryStore } from '../memory/fileStore.js';

let mounted = false;

export async function mountAlex(app, deps = {}) {
  if (mounted) return { status: 'already-mounted' };
  mounted = true;

  const router = express.Router();

  // Status minimal — toujours disponible
  router.get('/status', (_req, res) => {
    res.json({
      ok: true,
      orchestrator: true,
      providers: {
        openai: !!AI_KEYS.OPENAI,
        anthropic: !!AI_KEYS.ANTHROPIC,
        google: !!AI_KEYS.GOOGLE || !!AI_KEYS.GOOGLE_SA
      }
    });
  });

  // Scan modules/routes & ignorer les stubs
  async function scanModules() {
    const root = path.resolve("backend/alex-modules");
    const cats = ["specialized","consciousness","intelligence","core","config"];
    let total = 0, stubs = 0, filesByCat = {}, errors = [];
    
    for (const c of cats) {
      const dir = path.join(root, c);
      if (!fs.existsSync(dir)) { filesByCat[c] = 0; continue; }
      const js = (await fsp.readdir(dir)).filter(f => f.endsWith(".js"));
      filesByCat[c] = js.length; 
      total += js.length;
      
      for (const f of js) {
        try {
          const t = await fsp.readFile(path.join(dir, f), "utf8");
          if (/not_implemented/gi.test(t)) stubs++;
        } catch { errors.push(`${c}/${f}:readfail`); }
      }
    }
    
    // Services placeholders
    let placeholders = 0;
    const svc = path.resolve("backend/services");
    if (fs.existsSync(svc)) {
      for (const f of (await fsp.readdir(svc)).filter(x => x.endsWith(".js"))) {
        try {
          const t = await fsp.readFile(path.join(svc, f), "utf8");
          if (/API_URL_1/.test(t)) placeholders++;
        } catch { /* ignore */ }
      }
    }
    
    return { total, stubs, filesByCat, placeholders, errors, operational: total - stubs };
  }

  router.get('/capabilities', async (_req, res) => {
    try {
      const scan = await scanModules();
      res.json({ ok: true, orchestrator: true, ...scan });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  });

  // Exemple d'endpoint "pong" pour test rapide
  router.get('/ping', (_req, res) => {
    res.json({ pong: true, conf: computeConfidence(Date.now()) });
  });

  // Memory management routes
  router.get('/memory/:sessionId?', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        const sessions = await memoryStore.listSessions();
        return res.json({ ok: true, sessions });
      }
      
      const memory = await memoryStore.getSession(sessionId);
      res.json({ ok: true, sessionId, memory, count: Object.keys(memory).length });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  });

  router.post('/memory/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { key, value } = req.body;
      
      if (!key || value === undefined) {
        return res.status(400).json({ ok: false, error: 'key and value required' });
      }
      
      await memoryStore.store(sessionId, key, value);
      res.json({ ok: true, stored: { sessionId, key } });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  });

  router.delete('/memory/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const cleared = await memoryStore.clearSession(sessionId);
      res.json({ ok: true, cleared, sessionId });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  });

  // Enregistrer les vraies routes Alex authentiques
  let alexInstance = null;
  try {
    const { registerAlexAuthentic, alex } = await import('../routes/alex-authentic.js');
    const alexResult = registerAlexAuthentic(router, deps);
    alexInstance = alex;
    console.log('✅ Alex Authentic integrated:', alexResult.routes);
  } catch (error) {
    console.warn('⚠️ Alex Authentic routes not loaded:', error.message);
  }

  // Route principale pour chater directement avec Alex
  router.post('/chat', async (req, res) => {
    try {
      if (!alexInstance) {
        return res.status(503).json({
          error: 'alex_not_available',
          message: 'Alex modules not loaded',
          confidence: 0.1
        });
      }

      const { message, sessionId, context = {} } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          error: 'bad_request', 
          message: 'message:string required'
        });
      }

      const session = sessionId || 'default';
      const sessionMemory = await memoryStore.getSession(session);
      const enrichedContext = { ...context, memory: sessionMemory };

      const response = await alexInstance.processMessage(message, session, enrichedContext);
      
      // Store learning insights in persistent memory
      if (response.learningInsights && response.learningInsights.length > 0) {
        await memoryStore.store(session, `learning_${Date.now()}`, {
          insights: response.learningInsights,
          message: message.substring(0, 100),
          timestamp: Date.now()
        });
      }
      
      return res.json({
        provider: 'alex_orchestrator',
        output: response.response,
        authentic: true,
        confidence: response.confidence,
        learningInsights: response.learningInsights?.length || 0,
        processingTime: Date.now() - response.timestamp,
        metadata: {
          autonomyLevel: response.autonomyLevel || 0,
          moduleUsed: 'AlexAuthentic',
          orchestrated: true
        }
      });

    } catch (error) {
      console.error('Alex orchestrator chat error:', error);
      return res.status(500).json({
        error: 'alex_processing_failed',
        message: error.message,
        confidence: 0.1
      });
    }
  });

  app.use('/api/alex', router);
  return { status: 'mounted' };
}