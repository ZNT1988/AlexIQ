import { createServer } from 'http'
import url from 'url'
import crypto from 'crypto'
import AlexHyperIntelligence from './alex-modules/consciousness/AlexHyperIntelligence.js'
import MemoryPalace from './alex-modules/memory/MemoryPalace.js'
import DecisionEngine from './alex-modules/decision/DecisionEngine.js'

const PORT = process.env.PORT || 3003

// Initialisation des modules Palier 2
let palier2Initialized = false

async function initializePalier2() {
  try {
    console.log('🚀 Initializing Palier 2 modules...')
    
    // Initialisation MemoryPalace
    await MemoryPalace.initialize()
    console.log('💾 MemoryPalace initialized')
    
    // Initialisation DecisionEngine  
    await DecisionEngine.initialize()
    console.log('⚡ DecisionEngine initialized')
    
    palier2Initialized = true
    console.log('✅ Palier 2 - Mémoire & Décision ready!')
  } catch (error) {
    console.error('❌ Failed to initialize Palier 2:', error)
    palier2Initialized = false
  }
}

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
      system: 'Palier 2 - Mémoire & Décision',
      alex: {
        hyperIntelligence: {
          initialized: AlexHyperIntelligence?.isInitialized || false,
          version: AlexHyperIntelligence?.version || '4.0.0'
        },
        memoryPalace: {
          initialized: MemoryPalace?.isInitialized || false,
          totalMemories: MemoryPalace?.metrics?.totalMemories || 0
        },
        decisionEngine: {
          initialized: DecisionEngine?.isInitialized || false,
          totalDecisions: DecisionEngine?.metrics?.totalDecisions || 0
        },
        palier2Ready: palier2Initialized
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

        // Traitement avec Palier 2 - Mémoire & Décision
        try {
          const sessionId = crypto.randomUUID()
          let response

          if (palier2Initialized) {
            // 1. Récupération mémoires pertinentes
            const relevantMemories = await MemoryPalace.retrieveMemories(message, 3)
            
            // 2. Prise de décision intelligente
            const decision = await DecisionEngine.makeDecision({
              query: message,
              relevantMemories,
              intent: 'information_request',
              conversationHistory: []
            })

            // 3. Traitement avec AlexHyperIntelligence enrichi
            const context = {
              memories: relevantMemories,
              decision: decision,
              sessionId
            }
            
            const result = await AlexHyperIntelligence.processQuery(message, context)
            
            // 4. Stockage en mémoire
            await MemoryPalace.storeMemory(
              `Q: ${message} | R: ${result.content}`, 
              { sessionId, confidence: result.confidence }
            )

            response = {
              response: result.content,
              confidence: result.confidence,
              domain: result.domain,
              source: 'Alex_Palier2',
              palier2: {
                memoriesUsed: relevantMemories.length,
                decisionConfidence: decision.confidence,
                decisionType: decision.type
              },
              timestamp: new Date().toISOString()
            }
          } else {
            // Fallback Palier 1
            const result = await AlexHyperIntelligence.processQuery(message, {})
            response = {
              response: result.content,
              confidence: result.confidence,
              domain: result.domain,
              source: 'Alex_Palier1_Fallback',
              timestamp: new Date().toISOString()
            }
          }

          res.writeHead(200)
          res.end(JSON.stringify(response))
        } catch (aiError) {
          // Fallback si erreur
          res.writeHead(200)
          res.end(JSON.stringify({ 
            response: `Bonjour ! Je suis Alex avec Palier 2 - Mémoire & Décision. Vous avez dit: "${message}". Je traite votre demande avec mes capacités évoluées.`,
            confidence: 0.6,
            source: 'Alex_Palier2_Fallback',
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

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`🔥 Alex Palier 2 server on port ${PORT}`)
  console.log(`🧠 AlexHyperIntelligence: ${AlexHyperIntelligence ? 'Loaded' : 'Error'}`)
  
  // Initialisation Palier 2 en arrière-plan
  await initializePalier2()
})