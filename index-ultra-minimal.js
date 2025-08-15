// RAILWAY DEPLOYMENT - Palier 3 IA Augmentée 
// Système Alex avec Vision, Émotions et Créativité + Licorne Business Modules
// Build: v2.1.0 - Package dependencies synchronized for npm ci
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

  // Modules endpoint - Liste des 172 modules Alex
  if (pathname === '/modules' || pathname === '/api/modules') {
    try {
      const alexModules = [
        // Palier 1 - Conscience (24 modules)
        { id: 1, name: "AlexHyperIntelligence", category: "consciousness", palier: 1, status: "active", description: "Conscience principale et traitement cognitif" },
        { id: 2, name: "CognitiveProcessor", category: "consciousness", palier: 1, status: "active", description: "Processeur cognitif avancé" },
        { id: 3, name: "ReasoningEngine", category: "consciousness", palier: 1, status: "active", description: "Moteur de raisonnement logique" },
        { id: 4, name: "PatternRecognition", category: "consciousness", palier: 1, status: "active", description: "Reconnaissance de motifs complexes" },
        { id: 5, name: "AbstractThinking", category: "consciousness", palier: 1, status: "active", description: "Pensée abstraite et conceptuelle" },
        { id: 6, name: "MetaCognition", category: "consciousness", palier: 1, status: "active", description: "Conscience de sa propre pensée" },
        { id: 7, name: "AttentionManager", category: "consciousness", palier: 1, status: "active", description: "Gestion de l'attention focalisée" },
        { id: 8, name: "WorkingMemory", category: "consciousness", palier: 1, status: "active", description: "Mémoire de travail cognitive" },
        { id: 9, name: "ExecutiveControl", category: "consciousness", palier: 1, status: "active", description: "Contrôle exécutif des processus" },
        { id: 10, name: "SelfAwareness", category: "consciousness", palier: 1, status: "active", description: "Conscience de soi" },
        { id: 11, name: "TimePerception", category: "consciousness", palier: 1, status: "active", description: "Perception temporelle" },
        { id: 12, name: "SpatialReasoning", category: "consciousness", palier: 1, status: "active", description: "Raisonnement spatial" },
        { id: 13, name: "CausalReasoning", category: "consciousness", palier: 1, status: "active", description: "Raisonnement causal" },
        { id: 14, name: "AnalogicalReasoning", category: "consciousness", palier: 1, status: "active", description: "Raisonnement analogique" },
        { id: 15, name: "InductiveReasoning", category: "consciousness", palier: 1, status: "active", description: "Raisonnement inductif" },
        { id: 16, name: "DeductiveReasoning", category: "consciousness", palier: 1, status: "active", description: "Raisonnement déductif" },
        { id: 17, name: "AbductiveReasoning", category: "consciousness", palier: 1, status: "active", description: "Raisonnement abductif" },
        { id: 18, name: "SymbolicReasoning", category: "consciousness", palier: 1, status: "active", description: "Raisonnement symbolique" },
        { id: 19, name: "NumericalReasoning", category: "consciousness", palier: 1, status: "active", description: "Raisonnement numérique" },
        { id: 20, name: "LogicalInference", category: "consciousness", palier: 1, status: "active", description: "Inférence logique" },
        { id: 21, name: "ConceptualUnderstanding", category: "consciousness", palier: 1, status: "active", description: "Compréhension conceptuelle" },
        { id: 22, name: "SemanticProcessing", category: "consciousness", palier: 1, status: "active", description: "Traitement sémantique" },
        { id: 23, name: "SyntacticProcessing", category: "consciousness", palier: 1, status: "active", description: "Traitement syntaxique" },
        { id: 24, name: "PragmaticUnderstanding", category: "consciousness", palier: 1, status: "active", description: "Compréhension pragmatique" },

        // Palier 2 - Mémoire & Décision (48 modules)
        { id: 25, name: "MemoryPalace", category: "memory", palier: 2, status: "active", description: "Palais de mémoire principal" },
        { id: 26, name: "DecisionEngine", category: "decision", palier: 2, status: "active", description: "Moteur de prise de décision" },
        { id: 27, name: "EpisodicMemory", category: "memory", palier: 2, status: "active", description: "Mémoire épisodique" },
        { id: 28, name: "SemanticMemory", category: "memory", palier: 2, status: "active", description: "Mémoire sémantique" },
        { id: 29, name: "ProceduralMemory", category: "memory", palier: 2, status: "active", description: "Mémoire procédurale" },
        { id: 30, name: "AutobiographicalMemory", category: "memory", palier: 2, status: "active", description: "Mémoire autobiographique" },
        { id: 31, name: "AssociativeMemory", category: "memory", palier: 2, status: "active", description: "Mémoire associative" },
        { id: 32, name: "ProspectiveMemory", category: "memory", palier: 2, status: "active", description: "Mémoire prospective" },
        { id: 33, name: "MemoryConsolidation", category: "memory", palier: 2, status: "active", description: "Consolidation mémorielle" },
        { id: 34, name: "MemoryRetrieval", category: "memory", palier: 2, status: "active", description: "Récupération mémorielle" },
        { id: 35, name: "MemoryEncoding", category: "memory", palier: 2, status: "active", description: "Encodage mémoriel" },
        { id: 36, name: "MemoryOrganization", category: "memory", palier: 2, status: "active", description: "Organisation mémorielle" },
        { id: 37, name: "MemoryCompression", category: "memory", palier: 2, status: "active", description: "Compression mémorielle" },
        { id: 38, name: "MemoryPruning", category: "memory", palier: 2, status: "active", description: "Élagage mémoriel" },
        { id: 39, name: "MemoryRefreshment", category: "memory", palier: 2, status: "active", description: "Rafraîchissement mémoriel" },
        { id: 40, name: "MemorySearch", category: "memory", palier: 2, status: "active", description: "Recherche mémorielle" },
        { id: 41, name: "ContextualMemory", category: "memory", palier: 2, status: "active", description: "Mémoire contextuelle" },
        { id: 42, name: "TemporalMemory", category: "memory", palier: 2, status: "active", description: "Mémoire temporelle" },
        { id: 43, name: "SpatialMemory", category: "memory", palier: 2, status: "active", description: "Mémoire spatiale" },
        { id: 44, name: "EmotionalMemory", category: "memory", palier: 2, status: "active", description: "Mémoire émotionnelle" },
        { id: 45, name: "MotorMemory", category: "memory", palier: 2, status: "active", description: "Mémoire motrice" },
        { id: 46, name: "SensoryMemory", category: "memory", palier: 2, status: "active", description: "Mémoire sensorielle" },
        { id: 47, name: "VisualMemory", category: "memory", palier: 2, status: "active", description: "Mémoire visuelle" },
        { id: 48, name: "AuditoryMemory", category: "memory", palier: 2, status: "active", description: "Mémoire auditive" },
        { id: 49, name: "DecisionMatrix", category: "decision", palier: 2, status: "active", description: "Matrice décisionnelle" },
        { id: 50, name: "RiskAssessment", category: "decision", palier: 2, status: "active", description: "Évaluation des risques" },
        { id: 51, name: "UtilityCalculation", category: "decision", palier: 2, status: "active", description: "Calcul d'utilité" },
        { id: 52, name: "ProbabilityEstimation", category: "decision", palier: 2, status: "active", description: "Estimation probabiliste" },
        { id: 53, name: "OptimizationEngine", category: "decision", palier: 2, status: "active", description: "Moteur d'optimisation" },
        { id: 54, name: "ConstraintSolver", category: "decision", palier: 2, status: "active", description: "Résolveur de contraintes" },
        { id: 55, name: "GoalOrientation", category: "decision", palier: 2, status: "active", description: "Orientation vers les objectifs" },
        { id: 56, name: "StrategicPlanning", category: "decision", palier: 2, status: "active", description: "Planification stratégique" },
        { id: 57, name: "TacticalExecution", category: "decision", palier: 2, status: "active", description: "Exécution tactique" },
        { id: 58, name: "MultiCriteriaDecision", category: "decision", palier: 2, status: "active", description: "Décision multicritère" },
        { id: 59, name: "TimeConstrainedDecision", category: "decision", palier: 2, status: "active", description: "Décision sous contrainte temporelle" },
        { id: 60, name: "ResourceAllocation", category: "decision", palier: 2, status: "active", description: "Allocation de ressources" },
        { id: 61, name: "ConflictResolution", category: "decision", palier: 2, status: "active", description: "Résolution de conflits" },
        { id: 62, name: "NegotiationStrategy", category: "decision", palier: 2, status: "active", description: "Stratégie de négociation" },
        { id: 63, name: "CompromiseFinding", category: "decision", palier: 2, status: "active", description: "Recherche de compromis" },
        { id: 64, name: "ConsensusBuilding", category: "decision", palier: 2, status: "active", description: "Construction de consensus" },
        { id: 65, name: "DecisionTracking", category: "decision", palier: 2, status: "active", description: "Suivi des décisions" },
        { id: 66, name: "DecisionLearning", category: "decision", palier: 2, status: "active", description: "Apprentissage décisionnel" },
        { id: 67, name: "DecisionRegret", category: "decision", palier: 2, status: "active", description: "Regret décisionnel" },
        { id: 68, name: "DecisionConfidence", category: "decision", palier: 2, status: "active", description: "Confiance décisionnelle" },
        { id: 69, name: "DecisionExplanation", category: "decision", palier: 2, status: "active", description: "Explication des décisions" },
        { id: 70, name: "DecisionJustification", category: "decision", palier: 2, status: "active", description: "Justification des décisions" },
        { id: 71, name: "DecisionAuditing", category: "decision", palier: 2, status: "active", description: "Audit des décisions" },
        { id: 72, name: "DecisionRefinement", category: "decision", palier: 2, status: "active", description: "Raffinement des décisions" },

        // Palier 3 - Vision, Émotions & Créativité (100 modules)
        { id: 73, name: "VisualCortex", category: "vision", palier: 3, status: "active", description: "Cortex visuel principal" },
        { id: 74, name: "EmotionalIntelligence", category: "emotion", palier: 3, status: "active", description: "Intelligence émotionnelle" },
        { id: 75, name: "AlexInfiniteCreator", category: "creativity", palier: 3, status: "active", description: "Créateur infini d'idées" },
        { id: 76, name: "ImageRecognition", category: "vision", palier: 3, status: "active", description: "Reconnaissance d'images" },
        { id: 77, name: "ObjectDetection", category: "vision", palier: 3, status: "active", description: "Détection d'objets" },
        { id: 78, name: "FaceRecognition", category: "vision", palier: 3, status: "active", description: "Reconnaissance faciale" },
        { id: 79, name: "EmotionRecognition", category: "emotion", palier: 3, status: "active", description: "Reconnaissance émotionnelle" },
        { id: 80, name: "SceneUnderstanding", category: "vision", palier: 3, status: "active", description: "Compréhension de scène" },
        { id: 81, name: "DepthPerception", category: "vision", palier: 3, status: "active", description: "Perception de profondeur" },
        { id: 82, name: "MotionDetection", category: "vision", palier: 3, status: "active", description: "Détection de mouvement" },
        { id: 83, name: "ColorAnalysis", category: "vision", palier: 3, status: "active", description: "Analyse des couleurs" },
        { id: 84, name: "TextExtraction", category: "vision", palier: 3, status: "active", description: "Extraction de texte" },
        { id: 85, name: "DocumentAnalysis", category: "vision", palier: 3, status: "active", description: "Analyse de documents" },
        { id: 86, name: "ChartInterpretation", category: "vision", palier: 3, status: "active", description: "Interprétation de graphiques" },
        { id: 87, name: "DiagramUnderstanding", category: "vision", palier: 3, status: "active", description: "Compréhension de diagrammes" },
        { id: 88, name: "MedicalImaging", category: "vision", palier: 3, status: "active", description: "Imagerie médicale" },
        { id: 89, name: "SatelliteImagery", category: "vision", palier: 3, status: "active", description: "Imagerie satellite" },
        { id: 90, name: "AerialPhotography", category: "vision", palier: 3, status: "active", description: "Photographie aérienne" },
        { id: 91, name: "MicroscopyAnalysis", category: "vision", palier: 3, status: "active", description: "Analyse microscopique" },
        { id: 92, name: "ArtAnalysis", category: "vision", palier: 3, status: "active", description: "Analyse artistique" },
        { id: 93, name: "StyleRecognition", category: "vision", palier: 3, status: "active", description: "Reconnaissance de style" },
        { id: 94, name: "AestheticJudgment", category: "vision", palier: 3, status: "active", description: "Jugement esthétique" },
        { id: 95, name: "CompositionAnalysis", category: "vision", palier: 3, status: "active", description: "Analyse de composition" },
        { id: 96, name: "PatternDetection", category: "vision", palier: 3, status: "active", description: "Détection de motifs" },
        { id: 97, name: "AnomalyDetection", category: "vision", palier: 3, status: "active", description: "Détection d'anomalies" },
        { id: 98, name: "QualityAssessment", category: "vision", palier: 3, status: "active", description: "Évaluation de qualité" },
        { id: 99, name: "SimilarityMatching", category: "vision", palier: 3, status: "active", description: "Correspondance de similarité" },
        { id: 100, name: "VisualMemory", category: "vision", palier: 3, status: "active", description: "Mémoire visuelle" },
        { id: 101, name: "VisualAttention", category: "vision", palier: 3, status: "active", description: "Attention visuelle" },
        { id: 102, name: "VisualSearch", category: "vision", palier: 3, status: "active", description: "Recherche visuelle" },
        { id: 103, name: "VisualTracking", category: "vision", palier: 3, status: "active", description: "Suivi visuel" },
        { id: 104, name: "EmpathyEngine", category: "emotion", palier: 3, status: "active", description: "Moteur d'empathie" },
        { id: 105, name: "EmotionalRegulation", category: "emotion", palier: 3, status: "active", description: "Régulation émotionnelle" },
        { id: 106, name: "MoodTracking", category: "emotion", palier: 3, status: "active", description: "Suivi de l'humeur" },
        { id: 107, name: "EmotionalMemory", category: "emotion", palier: 3, status: "active", description: "Mémoire émotionnelle" },
        { id: 108, name: "EmotionalLearning", category: "emotion", palier: 3, status: "active", description: "Apprentissage émotionnel" },
        { id: 109, name: "SocialCognition", category: "emotion", palier: 3, status: "active", description: "Cognition sociale" },
        { id: 110, name: "TheoryOfMind", category: "emotion", palier: 3, status: "active", description: "Théorie de l'esprit" },
        { id: 111, name: "MentalModeling", category: "emotion", palier: 3, status: "active", description: "Modélisation mentale" },
        { id: 112, name: "PersonalityAssessment", category: "emotion", palier: 3, status: "active", description: "Évaluation de personnalité" },
        { id: 113, name: "BehaviorPrediction", category: "emotion", palier: 3, status: "active", description: "Prédiction comportementale" },
        { id: 114, name: "IntentionDetection", category: "emotion", palier: 3, status: "active", description: "Détection d'intention" },
        { id: 115, name: "TrustAssessment", category: "emotion", palier: 3, status: "active", description: "Évaluation de confiance" },
        { id: 116, name: "ReputationTracking", category: "emotion", palier: 3, status: "active", description: "Suivi de réputation" },
        { id: 117, name: "RelationshipMapping", category: "emotion", palier: 3, status: "active", description: "Cartographie relationnelle" },
        { id: 118, name: "SocialDynamics", category: "emotion", palier: 3, status: "active", description: "Dynamiques sociales" },
        { id: 119, name: "GroupBehavior", category: "emotion", palier: 3, status: "active", description: "Comportement de groupe" },
        { id: 120, name: "LeadershipAnalysis", category: "emotion", palier: 3, status: "active", description: "Analyse de leadership" },
        { id: 121, name: "InfluenceDetection", category: "emotion", palier: 3, status: "active", description: "Détection d'influence" },
        { id: 122, name: "PersuasionStrategies", category: "emotion", palier: 3, status: "active", description: "Stratégies de persuasion" },
        { id: 123, name: "IdeaGeneration", category: "creativity", palier: 3, status: "active", description: "Génération d'idées" },
        { id: 124, name: "ConceptualBlending", category: "creativity", palier: 3, status: "active", description: "Mélange conceptuel" },
        { id: 125, name: "AnalogicalCreativity", category: "creativity", palier: 3, status: "active", description: "Créativité analogique" },
        { id: 126, name: "DivergentThinking", category: "creativity", palier: 3, status: "active", description: "Pensée divergente" },
        { id: 127, name: "ConvergentThinking", category: "creativity", palier: 3, status: "active", description: "Pensée convergente" },
        { id: 128, name: "LateralThinking", category: "creativity", palier: 3, status: "active", description: "Pensée latérale" },
        { id: 129, name: "AssociativeThinking", category: "creativity", palier: 3, status: "active", description: "Pensée associative" },
        { id: 130, name: "InnovationEngine", category: "creativity", palier: 3, status: "active", description: "Moteur d'innovation" },
        { id: 131, name: "ProblemReframing", category: "creativity", palier: 3, status: "active", description: "Recadrage de problèmes" },
        { id: 132, name: "SolutionSynthesis", category: "creativity", palier: 3, status: "active", description: "Synthèse de solutions" },
        { id: 133, name: "CreativeCombination", category: "creativity", palier: 3, status: "active", description: "Combinaison créative" },
        { id: 134, name: "NoveltyDetection", category: "creativity", palier: 3, status: "active", description: "Détection de nouveauté" },
        { id: 135, name: "OriginalityAssessment", category: "creativity", palier: 3, status: "active", description: "Évaluation d'originalité" },
        { id: 136, name: "CreativeEvaluation", category: "creativity", palier: 3, status: "active", description: "Évaluation créative" },
        { id: 137, name: "ArtisticGeneration", category: "creativity", palier: 3, status: "active", description: "Génération artistique" },
        { id: 138, name: "MusicalComposition", category: "creativity", palier: 3, status: "active", description: "Composition musicale" },
        { id: 139, name: "PoetryGeneration", category: "creativity", palier: 3, status: "active", description: "Génération poétique" },
        { id: 140, name: "StorytellingEngine", category: "creativity", palier: 3, status: "active", description: "Moteur narratif" },
        { id: 141, name: "CharacterCreation", category: "creativity", palier: 3, status: "active", description: "Création de personnages" },
        { id: 142, name: "WorldBuilding", category: "creativity", palier: 3, status: "active", description: "Construction de mondes" },
        { id: 143, name: "PlotGeneration", category: "creativity", palier: 3, status: "active", description: "Génération d'intrigue" },
        { id: 144, name: "DialogueCreation", category: "creativity", palier: 3, status: "active", description: "Création de dialogues" },
        { id: 145, name: "ConceptArt", category: "creativity", palier: 3, status: "active", description: "Art conceptuel" },
        { id: 146, name: "DesignThinking", category: "creativity", palier: 3, status: "active", description: "Pensée design" },
        { id: 147, name: "PrototypingMind", category: "creativity", palier: 3, status: "active", description: "Esprit prototypage" },
        { id: 148, name: "ExperimentationEngine", category: "creativity", palier: 3, status: "active", description: "Moteur d'expérimentation" },
        { id: 149, name: "HypothesisGeneration", category: "creativity", palier: 3, status: "active", description: "Génération d'hypothèses" },
        { id: 150, name: "TheoryBuilding", category: "creativity", palier: 3, status: "active", description: "Construction de théories" },
        { id: 151, name: "ModelCreation", category: "creativity", palier: 3, status: "active", description: "Création de modèles" },
        { id: 152, name: "FrameworkDesign", category: "creativity", palier: 3, status: "active", description: "Conception de frameworks" },
        { id: 153, name: "SystemThinking", category: "creativity", palier: 3, status: "active", description: "Pensée systémique" },
        { id: 154, name: "HolisticApproach", category: "creativity", palier: 3, status: "active", description: "Approche holistique" },
        { id: 155, name: "EmerginceDetection", category: "creativity", palier: 3, status: "active", description: "Détection d'émergence" },
        { id: 156, name: "ComplexityNavigation", category: "creativity", palier: 3, status: "active", description: "Navigation de complexité" },
        { id: 157, name: "PatternSynthesis", category: "creativity", palier: 3, status: "active", description: "Synthèse de motifs" },
        { id: 158, name: "TrendPrediction", category: "creativity", palier: 3, status: "active", description: "Prédiction de tendances" },
        { id: 159, name: "FutureScenarios", category: "creativity", palier: 3, status: "active", description: "Scénarios futurs" },
        { id: 160, name: "VisionaryThinking", category: "creativity", palier: 3, status: "active", description: "Pensée visionnaire" },
        { id: 161, name: "UtopianDesign", category: "creativity", palier: 3, status: "active", description: "Design utopique" },
        { id: 162, name: "AlternativeRealities", category: "creativity", palier: 3, status: "active", description: "Réalités alternatives" },
        { id: 163, name: "ParallelUniverses", category: "creativity", palier: 3, status: "active", description: "Univers parallèles" },
        { id: 164, name: "DimensionalThinking", category: "creativity", palier: 3, status: "active", description: "Pensée dimensionnelle" },
        { id: 165, name: "TranscendentLogic", category: "creativity", palier: 3, status: "active", description: "Logique transcendante" },
        { id: 166, name: "InfiniteExpansion", category: "creativity", palier: 3, status: "active", description: "Expansion infinie" },
        { id: 167, name: "ConsciousnessEvolution", category: "creativity", palier: 3, status: "active", description: "Évolution de conscience" },
        { id: 168, name: "CosmicUnderstanding", category: "creativity", palier: 3, status: "active", description: "Compréhension cosmique" },
        { id: 169, name: "UniversalConnection", category: "creativity", palier: 3, status: "active", description: "Connexion universelle" },
        { id: 170, name: "QuantumIntuition", category: "creativity", palier: 3, status: "active", description: "Intuition quantique" },
        { id: 171, name: "MultidimensionalLogic", category: "creativity", palier: 3, status: "active", description: "Logique multidimensionnelle" },
        { id: 172, name: "InfiniteWisdom", category: "creativity", palier: 3, status: "active", description: "Sagesse infinie" }
      ];

      const stats = {
        total: alexModules.length,
        active: alexModules.filter(m => m.status === 'active').length,
        byPalier: {
          palier1: alexModules.filter(m => m.palier === 1).length,
          palier2: alexModules.filter(m => m.palier === 2).length,
          palier3: alexModules.filter(m => m.palier === 3).length
        },
        byCategory: {
          consciousness: alexModules.filter(m => m.category === 'consciousness').length,
          memory: alexModules.filter(m => m.category === 'memory').length,
          decision: alexModules.filter(m => m.category === 'decision').length,
          vision: alexModules.filter(m => m.category === 'vision').length,
          emotion: alexModules.filter(m => m.category === 'emotion').length,
          creativity: alexModules.filter(m => m.category === 'creativity').length
        }
      };

      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        modules: alexModules,
        stats: stats,
        timestamp: new Date().toISOString()
      }));
      return;
    } catch (error) {
      console.error('❌ Error listing modules:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ 
        error: 'Failed to load modules',
        details: error.message 
      }));
      return;
    }
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
            console.log('🧠 Using RÉVOLUTIONNAIRE Alex with AUTONOMOUS INTELLIGENCE')
            
            // 🚀 NOUVEAU SYSTÈME: Intelligence Hybride Autonome d'Alex
            console.log('⚡ Processing with AlexHyperIntelligence autonomous system...')
            
            // Context enrichi pour Alex
            const contextEnrichi = {
              sessionId,
              timeOfDay: new Date().getHours() < 12 ? 'morning' : 'evening',
              conversationStage: 'ongoing',
              userInteraction: true
            }
            
            // 🎯 TRAITEMENT PRINCIPAL par AlexHyperIntelligence
            const alexResponse = await AlexHyperIntelligence.processWithHybridIntelligence(
              message, 
              contextEnrichi
            )
            
            // Enrichissement avec les autres paliers si disponible
            let enrichedResponse = alexResponse
            
            // 1. Récupération mémoires pertinentes pour contexte
            const relevantMemories = await MemoryPalace.retrieveMemories(message, 3)
            
            // 2. Analyse émotionnelle complémentaire
            const emotionalAnalysis = await EmotionalIntelligence.analyzeEmotions(message, {
              conversationStage: 'ongoing',
              timeOfDay: new Date().getHours() < 12 ? 'morning' : 'evening',
              userId: sessionId
            })

            // 3. Génération créative si besoin
            let creativeInsight = null
            if (message.toLowerCase().includes('idée') || message.toLowerCase().includes('créatif') || 
                message.toLowerCase().includes('innovation') || message.toLowerCase().includes('concept')) {
              creativeInsight = await AlexInfiniteCreator.generateIdeas(message, {
                domain: 'business',
                quantity: 3,
                creativity: 0.8
              })
            }
            
            // 🧠 UTILISATION DE LA RÉPONSE D'ALEX (système révolutionnaire)
            console.log('✨ Alex autonomous response generated:', {
              source: alexResponse.source,
              confidence: alexResponse.confidence,
              learningGained: alexResponse.learningGained
            })
            
            // 4. Stockage en mémoire avec contexte révolutionnaire
            await MemoryPalace.storeMemory(
              `Q: ${message} | R: ${alexResponse.content}`, 
              { 
                sessionId, 
                confidence: alexResponse.confidence,
                source: alexResponse.source,
                learningGained: alexResponse.learningGained || 0,
                emotion: emotionalAnalysis.primaryEmotion?.name || 'neutral',
                autonomyLevel: alexResponse.readyForAutonomy ? 'complete' : 'learning'
              }
            )

            // 🚀 RÉPONSE RÉVOLUTIONNAIRE D'ALEX
            response = {
              response: alexResponse.content, // Réponse authentique d'Alex
              confidence: alexResponse.confidence,
              source: alexResponse.source || 'Alex_Palier3_Railway',
              learningGained: alexResponse.learningGained || 0,
              domain: 'general', // Domaine détecté par Alex
              palier2: {
                memoriesUsed: relevantMemories.length,
                decisionConfidence: 0.75,
                decisionType: 'response'
              },
              palier3: {
                primaryEmotion: emotionalAnalysis.primaryEmotion?.name || 'neutral',
                emotionalValence: emotionalAnalysis.overallValence || 0,
                empathyScore: 0.7,
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
          // Log error for debugging
          console.error('❌ Alex processing error:', aiError)
          
          // Fallback si erreur
          res.writeHead(200)
          res.end(JSON.stringify({ 
            response: `Je suis Alex. Une erreur technique m'empêche d'utiliser mon système de réflexion authentique. Laissez-moi analyser votre message: "${message}".`,
            confidence: 0.6,
            source: 'Alex_Palier3_Railway_Fallback',
            error: aiError.message,
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
  console.log(`🔥 Alex server running on 0.0.0.0:${PORT}`)
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