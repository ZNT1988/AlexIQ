// RAILWAY DEPLOYMENT - Palier 3 IA Augmentée
// Système Alex avec Vision, Émotions et Créativité
import { createServer } from 'http'
import url from 'url'
import crypto from 'crypto'
import AlexHyperIntelligence from './backend/alex-modules/consciousness/AlexHyperIntelligence.js'
import MemoryPalace from './backend/alex-modules/memory/MemoryPalace.js'
import DecisionEngine from './backend/alex-modules/decision/DecisionEngine.js'
import VisualCortex from './backend/alex-modules/vision/VisualCortex.js'
import EmotionalIntelligence from './backend/alex-modules/emotion/EmotionalIntelligence.js'
import AlexInfiniteCreator from './backend/alex-modules/creativity/AlexInfiniteCreator.js'

const PORT = process.env.PORT || 3003

console.log('🚂 Railway Palier 3 deployment starting...')
console.log(`📍 Node version: ${process.version}`)
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`)
console.log(`📡 Port: ${PORT}`)

// Initialisation des modules Palier 1, 2 & 3
let palier1Initialized = false
let palier2Initialized = false
let palier3Initialized = false

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

async function initializePalier3() {
  try {
    console.log('🚀 Initializing Palier 3 modules...')
    
    // Initialisation VisualCortex
    await VisualCortex.initialize()
    console.log('👁️ VisualCortex initialized')
    
    // Initialisation EmotionalIntelligence
    await EmotionalIntelligence.initialize()
    console.log('💝 EmotionalIntelligence initialized')
    
    // Initialisation AlexInfiniteCreator
    await AlexInfiniteCreator.initialize()
    console.log('🎨 AlexInfiniteCreator initialized')
    
    palier3Initialized = true
    console.log('✅ Palier 3 - IA Augmentée ready!')
  } catch (error) {
    console.error('❌ Failed to initialize Palier 3:', error)
    palier3Initialized = false
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
      system: 'Palier 3 - IA Augmentée (Railway)',
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
        visualCortex: {
          initialized: VisualCortex?.isInitialized || false,
          totalAnalyses: VisualCortex?.metrics?.totalAnalyses || 0
        },
        emotionalIntelligence: {
          initialized: EmotionalIntelligence?.isInitialized || false,
          totalAnalyses: EmotionalIntelligence?.metrics?.totalAnalyses || 0
        },
        infiniteCreator: {
          initialized: AlexInfiniteCreator?.isInitialized || false,
          totalCreations: AlexInfiniteCreator?.metrics?.totalCreations || 0
        },
        palier1Ready: palier1Initialized,
        palier2Ready: palier2Initialized,
        palier3Ready: palier3Initialized
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

        // Traitement avec Palier 3 - IA Augmentée
        try {
          const sessionId = crypto.randomUUID()
          let response

          if (palier3Initialized && palier2Initialized && palier1Initialized) {
            // 1. Récupération mémoires pertinentes
            const relevantMemories = await MemoryPalace.retrieveMemories(message, 3)
            
            // 2. Analyse émotionnelle du message
            const emotionalAnalysis = await EmotionalIntelligence.analyzeEmotions(message, {
              conversationStage: 'ongoing',
              timeOfDay: new Date().getHours() < 12 ? 'morning' : 'evening',
              userId: sessionId
            })
            
            // 3. Prise de décision enrichie avec émotions
            const decision = await DecisionEngine.makeDecision({
              query: message,
              relevantMemories,
              emotionalContext: emotionalAnalysis,
              intent: 'information_request',
              conversationHistory: []
            })

            // 4. Génération créative si besoin
            let creativeInsight = null
            if (message.toLowerCase().includes('idée') || message.toLowerCase().includes('créatif') || 
                message.toLowerCase().includes('innovation') || message.toLowerCase().includes('concept')) {
              creativeInsight = await AlexInfiniteCreator.generateIdeas(message, {
                domain: 'business',
                quantity: 3,
                creativity: 0.8
              })
            }

            // 5. Traitement avec AlexHyperIntelligence enrichi
            const context = {
              memories: relevantMemories,
              decision: decision,
              emotions: emotionalAnalysis,
              creativity: creativeInsight,
              sessionId
            }
            
            const result = await AlexHyperIntelligence.processQuery(message, context)
            
            // 6. Génération de réponse empathique
            const empathicResponse = await EmotionalIntelligence.generateEmpathicResponse(
              result.content, 
              emotionalAnalysis, 
              { sessionId }
            )
            
            // 7. Stockage en mémoire avec contexte émotionnel
            await MemoryPalace.storeMemory(
              `Q: ${message} | R: ${empathicResponse.response}`, 
              { 
                sessionId, 
                confidence: result.confidence,
                emotion: emotionalAnalysis.primaryEmotion?.name,
                empathy: empathicResponse.empathyScore
              }
            )

            response = {
              response: empathicResponse.response,
              confidence: result.confidence,
              domain: result.domain,
              source: 'Alex_Palier3_Railway',
              palier2: {
                memoriesUsed: relevantMemories.length,
                decisionConfidence: decision.confidence,
                decisionType: decision.type
              },
              palier3: {
                primaryEmotion: emotionalAnalysis.primaryEmotion?.name || 'neutral',
                emotionalValence: emotionalAnalysis.overallValence || 0,
                empathyScore: empathicResponse.empathyScore || 0.7,
                hasCreativeInsight: !!creativeInsight,
                responseStrategy: emotionalAnalysis.responseStrategy || 'neutral'
              },
              timestamp: new Date().toISOString()
            }
          } else if (palier2Initialized) {
            // Fallback Palier 2
            const relevantMemories = await MemoryPalace.retrieveMemories(message, 3)
            const decision = await DecisionEngine.makeDecision({
              query: message,
              relevantMemories,
              intent: 'information_request',
              conversationHistory: []
            })

            const context = {
              memories: relevantMemories,
              decision: decision,
              sessionId
            }
            
            const result = await AlexHyperIntelligence.processQuery(message, context)
            
            await MemoryPalace.storeMemory(
              `Q: ${message} | R: ${result.content}`, 
              { sessionId, confidence: result.confidence }
            )

            response = {
              response: result.content,
              confidence: result.confidence,
              domain: result.domain,
              source: 'Alex_Palier2_Railway',
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
              source: 'Alex_Palier1_Railway',
              timestamp: new Date().toISOString()
            }
          }

          res.writeHead(200)
          res.end(JSON.stringify(response))
        } catch (aiError) {
          // Fallback si erreur
          res.writeHead(200)
          res.end(JSON.stringify({ 
            response: `Bonjour ! Je suis Alex Palier 3 - IA Augmentée déployé sur Railway avec Vision, Émotions et Créativité. Vous avez dit: "${message}". Je traite votre demande avec mes capacités avancées.`,
            confidence: 0.6,
            source: 'Alex_Palier3_Railway_Fallback',
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

// Error handling
server.on('error', (err) => {
  console.error('💥 Server error:', err)
  process.exit(1)
})

// Graceful shutdown pour Railway
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`🔥 Alex Palier 3 server running on 0.0.0.0:${PORT}`)
  console.log(`🧠 AlexHyperIntelligence: ${AlexHyperIntelligence ? 'Loaded' : 'Error'}`)
  
  // Initialisation Palier 1 - AlexHyperIntelligence (Conscience)
  try {
    console.log('🧠 Initializing Palier 1 - AlexHyperIntelligence...')
    await AlexHyperIntelligence.initialize()
    palier1Initialized = true
    console.log('✅ AlexHyperIntelligence initialized')
  } catch (error) {
    console.error('❌ Failed to initialize Palier 1:', error)
    palier1Initialized = false
  }
  
  // Initialisation Palier 2 en arrière-plan
  await initializePalier2()
  
  // Initialisation Palier 3 en arrière-plan
  await initializePalier3()
})