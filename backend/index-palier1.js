import { createServer } from 'http'
import url from 'url'
import AlexHyperIntelligence from './alex-modules/consciousness/AlexHyperIntelligence.js'

const PORT = Number(process.env.PORT) || 3004

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  const { pathname } = url.parse(req.url, true)

  // Health check
  if (req.method === 'GET' && pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }))
    return
  }

  // Chat minimal
  if (req.method === 'POST' && pathname === '/api/chat') {
    let body = ''
    req.on('data', chunk => (body += chunk))
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body || '{}')
        
        if (!message) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'message_required' }))
          return
        }

        // Appel AlexHyperIntelligence (fallback si erreur)
        try {
          const result = await AlexHyperIntelligence.processQuery(message, {})
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ 
            reply: result.content,
            confidence: result.confidence,
            source: 'AlexHyperIntelligence'
          }))
        } catch (aiError) {
          // Fallback simple
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ 
            reply: `Bonjour ! Je suis Alex. Vous avez dit: "${message}". Je suis en phase d'apprentissage.`,
            confidence: 0.6,
            source: 'Fallback'
          }))
        }
      } catch (parseError) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'invalid_json', details: parseError.message }))
      }
    })
    return
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'not_found' }))
})

server.listen(PORT, () => {
  console.log(`🔥 Palier 1 Backend running on port ${PORT}`)
  console.log(`📊 Available endpoints:`)
  console.log(`   GET  /health`)
  console.log(`   POST /api/chat`)
})