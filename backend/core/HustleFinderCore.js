import express from 'express';
import AI_KEYS from '../config/aiKeys.js';
import { computeConfidence } from '../utils/confidence.js';

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

  // Exemple d'endpoint "pong" pour test rapide
  router.get('/ping', (_req, res) => {
    res.json({ pong: true, conf: computeConfidence(Date.now()) });
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

      const response = await alexInstance.processMessage(message, sessionId || 'default');
      
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