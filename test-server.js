// Serveur de test avec vraies API
import 'dotenv/config';
import { createServer } from 'http';
import { callOpenAI } from './services/openai.js';
import { callAnthropic } from './services/anthropic.js';
import { callGoogle } from './services/google.js';

const PORT = process.env.PORT || 3003;

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  if (url.pathname === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      apis: {
        openai: !!process.env.OPENAI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        google: !!process.env.GOOGLE_API_KEY
      }
    }));
    return;
  }

  if (url.pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body || '{}');
        
        if (!message) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Message requis' }));
          return;
        }

        console.log('📥 Message reçu:', message);

        // Test avec les 3 APIs en parallèle
        const responses = await Promise.allSettled([
          callOpenAI(message),
          callAnthropic(message),
          callGoogle(message)
        ]);

        const results = {
          openai: responses[0].status === 'fulfilled' ? responses[0].value : responses[0].reason,
          anthropic: responses[1].status === 'fulfilled' ? responses[1].value : responses[1].reason,
          google: responses[2].status === 'fulfilled' ? responses[2].value : responses[2].reason,
          timestamp: new Date().toISOString()
        };

        console.log('📤 Réponses:', {
          openai: results.openai.substring(0, 50) + '...',
          anthropic: results.anthropic.substring(0, 50) + '...',
          google: results.google.substring(0, 50) + '...'
        });

        res.writeHead(200);
        res.end(JSON.stringify({
          response: results.openai, // Réponse principale = OpenAI
          allResponses: results,
          confidence: 0.9,
          source: 'Multi-AI_Test'
        }));

      } catch (error) {
        console.error('❌ Erreur:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur de test API démarré sur le port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`💬 Chat: POST http://localhost:${PORT}/api/chat`);
  console.log(`📋 APIs configurées:`, {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    google: !!process.env.GOOGLE_API_KEY
  });
});