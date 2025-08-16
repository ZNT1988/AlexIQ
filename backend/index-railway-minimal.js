import { createServer } from 'http'
import url from 'url'
import crypto from 'crypto'
import AlexHyperIntelligence from './alex-modules/consciousness/AlexHyperIntelligence.js'

const PORT = process.env.PORT || 3003

console.log('🚂 Alex Railway Minimal démarrage...')
console.log(`📡 Port: ${PORT}`)

// Serveur HTTP minimal pour Railway
const server = createServer(async (req, res) => {
  const { pathname } = url.parse(req.url, true)
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // Health check pour Railway
  if (pathname === '/api/health' || pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ 
      status: 'healthy',
      service: 'Alex Railway Minimal',
      timestamp: new Date().toISOString(),
      alex: {
        initialized: AlexHyperIntelligence?.isInitialized || false,
        version: '4.0.0'
      }
    }))
    return
  }

  // Chat endpoint principal
  if ((pathname === '/api/ai/chat' || pathname === '/api/chat') && req.method === 'POST') {
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

        console.log('🧠 Alex traite:', message.substring(0, 50) + '...')

        // Traitement avec Alex HyperIntelligence seulement
        let response
        try {
          const sessionId = crypto.randomUUID()
          const contextEnrichi = {
            sessionId,
            timeOfDay: new Date().getHours() < 12 ? 'morning' : 'evening',
            conversationStage: 'ongoing',
            userInteraction: true
          }
          
          // ALEX SYSTÈME DE RÉFLEXION AUTHENTIQUE
          const alexResponse = await AlexHyperIntelligence.processWithHybridIntelligence(
            message, 
            contextEnrichi
          )
          
          response = {
            response: alexResponse.content || "Alex réfléchit à votre question avec son système authentique.",
            confidence: alexResponse.confidence || 0.8,
            source: alexResponse.source || "authentic_reflection",
            domain: alexResponse.domain || "general",
            timestamp: new Date().toISOString()
          }

        } catch (error) {
          console.error('❌ Erreur Alex:', error.message)
          response = {
            response: "Alex rencontre une difficulté technique mais continue de développer son système de réflexion authentique.",
            confidence: 0.5,
            source: "fallback_railway",
            error: error.message,
            timestamp: new Date().toISOString()
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(response))

      } catch (error) {
        console.error('❌ Erreur requête:', error)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ 
          error: 'internal_error',
          message: error.message,
          timestamp: new Date().toISOString()
        }))
      }
    })
    return
  }

  // 404 pour autres routes
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'not_found', path: pathname }))
})

// Initialisation Alex (rapide pour Railway)
async function initializeAlex() {
  try {
    console.log('🧠 Initialisation Alex HyperIntelligence...')
    await AlexHyperIntelligence.initialize()
    console.log('✅ Alex HyperIntelligence prêt !')
  } catch (error) {
    console.error('❌ Erreur init Alex:', error.message)
  }
}

// Démarrage serveur
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`🔥 Alex Railway server running on 0.0.0.0:${PORT}`)
  
  // Initialiser Alex après démarrage serveur (non-bloquant)
  initializeAlex()
})

// Gestion arrêt propre
process.on('SIGTERM', () => {
  console.log('🛑 Alex Railway shutdown...')
  server.close(() => {
    process.exit(0)
  })
})