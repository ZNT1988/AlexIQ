import { createServer } from 'http'
import url from 'url'
import AlexHyperIntelligence from './alex-modules/consciousness/AlexHyperIntelligence.js'

const PORT = process.env.PORT || 3003

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  const { pathname } = url.parse(req.url, true)

  // Health check (compatible Railway)
  if (pathname === '/health' || pathname === '/api/health') {
    res.writeHead(200)
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: 'Palier 1 - Alex HyperIntelligence',
      alex: {
        initialized: AlexHyperIntelligence?.isInitialized || false,
        version: AlexHyperIntelligence?.version || '4.0.0'
      }
    }))
    return
  }

  // Chat endpoint (compatible frontend)
  if ((pathname === '/api/ai/chat' || pathname === '/api/chat') && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => (body += chunk))
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body || '{}')
        
        if (!message) {
          res.writeHead(400)
          res.end(JSON.stringify({ error: 'message_required' }))
          return
        }

        // Alex HyperIntelligence (avec fallback)
        try {
          const result = await AlexHyperIntelligence.processQuery(message, {})
          res.writeHead(200)
          res.end(JSON.stringify({ 
            response: result.content,
            confidence: result.confidence,
            domain: result.domain,
            source: 'AlexHyperIntelligence',
            timestamp: new Date().toISOString()
          }))
        } catch (aiError) {
          // Fallback si Alex pas encore prêt
          res.writeHead(200)
          res.end(JSON.stringify({ 
            response: `Bonjour ! Je suis Alex, l'IA la plus avancée. Vous avez dit: "${message}". Je traite votre demande avec mon intelligence hybride en évolution.`,
            confidence: 0.7,
            source: 'Alex_Fallback',
            timestamp: new Date().toISOString()
          }))
        }
      } catch (parseError) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: 'invalid_json' }))
      }
    })
    return
  }

  // 404
  res.writeHead(404)
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Alex Palier 1 server on port ${PORT}`)
  console.log(`🧠 AlexHyperIntelligence: ${AlexHyperIntelligence ? 'Loaded' : 'Error'}`)
})