#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CATEGORIES = {
    CONFORME: '🟢 CONFORME',
    MINEUR: '🟡 MINEUR', 
    MAJEUR: '🟠 MAJEUR',
    CRITIQUE: '🔴 CRITIQUE'
};

// Patterns de détection fake AI
const FAKE_PATTERNS = {
    CRITIQUE: [
        /Math\.random\(\)/,
        /simulate.*intelligence/i,
        /fake.*ai/i,
        /pretend.*smart/i,
        /mock.*consciousness/i,
        /artificial.*consciousness.*=.*true/i,
        /quantum.*consciousness/i,
        /neural.*network.*simulation/i,
        /advanced.*ai.*capabilities/i,
        /superhuman.*intelligence/i,
        /sentient.*behavior/i,
        /consciousness.*level/i,
        /artificial.*general.*intelligence/i,
        /superintelligence/i,
        /quantum.*ai/i,
        /predict.*future/i,
        /analyze.*universe/i,
        /infinite.*wisdom/i,
        /omniscient/i
    ],
    MAJEUR: [
        /predict\w*\s*\(/,
        /simulate\w*\s*\(/,
        /analyze\w*\s*\(/,
        /intelligence\s*=\s*Math\.random/i,
        /smart\w*\s*=\s*Math\.random/i,
        /ai\s*score/i,
        /cognitive\s*level/i,
        /learning\s*rate.*Math\.random/i,
        /accuracy.*Math\.random/i,
        /confidence.*Math\.random/i
    ],
    MINEUR: [
        /TODO/,
        /FIXME/,
        /PLACEHOLDER/,
        /Not implemented/i,
        /Coming soon/i,
        /Under construction/i,
        /return\s*null/,
        /return\s*undefined/,
        /return\s*\{\}/,
        /return\s*\[\]/,
        /console\.log.*mock/i,
        /console\.log.*placeholder/i
    ]
};

function analyzeFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        const analysis = {
            path: filePath,
            category: CATEGORIES.CONFORME,
            violations: [],
            lineCount: lines.length,
            isEmpty: content.trim().length === 0
        };

        // Si fichier vide
        if (analysis.isEmpty) {
            analysis.category = CATEGORIES.MINEUR;
            analysis.violations.push('Fichier vide');
            return analysis;
        }

        // Vérification des patterns critiques
        for (const pattern of FAKE_PATTERNS.CRITIQUE) {
            if (pattern.test(content)) {
                analysis.category = CATEGORIES.CRITIQUE;
                analysis.violations.push(`Pattern critique détecté: ${pattern}`);
            }
        }

        // Si pas critique, vérifier majeur
        if (analysis.category === CATEGORIES.CONFORME) {
            for (const pattern of FAKE_PATTERNS.MAJEUR) {
                if (pattern.test(content)) {
                    analysis.category = CATEGORIES.MAJEUR;
                    analysis.violations.push(`Pattern majeur détecté: ${pattern}`);
                }
            }
        }

        // Si pas majeur, vérifier mineur
        if (analysis.category === CATEGORIES.CONFORME) {
            for (const pattern of FAKE_PATTERNS.MINEUR) {
                if (pattern.test(content)) {
                    analysis.category = CATEGORIES.MINEUR;
                    analysis.violations.push(`Pattern mineur détecté: ${pattern}`);
                }
            }
        }

        // Détections spécifiques par nom de fichier
        const fileName = path.basename(filePath);
        if (fileName.includes('Quantum') || fileName.includes('Consciousness') || fileName.includes('Infinite')) {
            if (analysis.category === CATEGORIES.CONFORME) {
                analysis.category = CATEGORIES.MAJEUR;
                analysis.violations.push('Nom de fichier suggérant fake AI');
            }
        }

        return analysis;

    } catch (error) {
        return {
            path: filePath,
            category: CATEGORIES.CRITIQUE,
            violations: [`Erreur de lecture: ${error.message}`],
            lineCount: 0,
            isEmpty: true
        };
    }
}

function analyzeModules() {
    // Modules backend Intelligence
    const intelligenceModules = [
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\ContextIntelligenceEngine.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\DecisionMakingEngine.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\LearningMemorySystem.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\SelfOptimizationSystem.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\IntelligentResponseGenerator.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\AIFusionKernel.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\AlexReflectiveThinking.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\CreativeGenius.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\InhibitionReturn.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\MarketAnalyzer.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\MarketMindCore.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\MultiModalFusion.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\NeuralCore.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\QualityConfidenceScorer.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\SentimentScanner.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\TopDownAttention.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\EmotionalIntelligence.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\BusinessIdeaGenerator.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\CognitiveBridge.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\ContextIntelligence.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\EyeTracking.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\TradeSimulator.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\ConflictDetectionEngine.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\intelligence\\ExternalAPIManager.js'
    ];

    // Modules backend Specialized  
    const specializedModules = [
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\DreamCompiler.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\FunctionBuilder.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\InnerDialogueEngine.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\LanguageExpansion.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\QuantumSimulationEngine.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\SAPConnector.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\SelfReflection.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\SelfTrainingEngine.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\SupplierOptimizer.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\TestAutoCreator.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexCommunicationEngine.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexKernel.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexConsciousnessSystem.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\VoiceSynthesisMultilang.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\VisionProFactory.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\UserAutomationClone.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\TemporalPredictor.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\TechnicalDocReader.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AdvancedModuleOrchestrator.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexAdaptiveIntelligence.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexBioSync.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexCloudLearning.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexCognitionEngine.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexConsciousnessDebug.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexContextualAwareness.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexCreativeLearningSystem.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexCreativityBooster.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexCrisisManagement.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexDecisionEngine.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexEthicsCore.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexEvolutionCore.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexEmotionalIntelligence.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexDreamCompiler.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexGoalMastery.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexHyperLoop.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexIntuitionEngine.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexLearningEngine.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexMasterSystem.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexPersonalityCore.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexRelationshipEngine.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexSocialIntelligence.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexStrategicThinking.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexTimeIntelligence.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexWhispers.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexWisdomKeeper.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AutoGenesis.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AutonomyCore.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\BioSensorAdapter.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\BusinessFusionEngine.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\CollectiveHustleMind.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\CulturalAdaptation.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\DarkSideDecoder.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\HealthPredictor.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\HypothesisBuilder.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\InventoryFlow.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\KnowledgeSynthesizer.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\LanguageProcessor.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\UniversalModuleRegistry.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\LocalAITrainer.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\MutualGrowthSystem.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\PurchasePredictor.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\MemoryPalace.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\QuantumCreativeEngine.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexCreativeEngine.js',
        'C:\\dev\\HustleFinderIA\\backend\\alex-modules\\specialized\\AlexUniversalCompanion.js'
    ];

    // Modules backend Infrastructure
    const backendInfraModules = [
        'C:\\dev\\HustleFinderIA\\backend\\routes\\advanced-ai.js',
        'C:\\dev\\HustleFinderIA\\backend\\routes\\aiSystem.js',
        'C:\\dev\\HustleFinderIA\\backend\\routes\\aiSystemSpecialized.js',
        'C:\\dev\\HustleFinderIA\\backend\\routes\\assistant.js',
        'C:\\dev\\HustleFinderIA\\backend\\routes\\monitoring.js',
        'C:\\dev\\HustleFinderIA\\backend\\routes\\projects.js',
        'C:\\dev\\HustleFinderIA\\backend\\routes\\roi.js',
        'C:\\dev\\HustleFinderIA\\backend\\routes\\ai.js',
        'C:\\dev\\HustleFinderIA\\backend\\routes\\auth.js',
        'C:\\dev\\HustleFinderIA\\backend\\routes\\ideas.js',
        'C:\\dev\\HustleFinderIA\\backend\\routes\\real-alex.js',
        'C:\\dev\\HustleFinderIA\\backend\\services\\RateLimiter.js',
        'C:\\dev\\HustleFinderIA\\backend\\services\\ExternalDataSources.js',
        'C:\\dev\\HustleFinderIA\\backend\\services\\anthropic.js',
        'C:\\dev\\HustleFinderIA\\backend\\services\\google.js',
        'C:\\dev\\HustleFinderIA\\backend\\services\\openai.js',
        'C:\\dev\\HustleFinderIA\\backend\\security\\EnterpriseSecurityManager.js',
        'C:\\dev\\HustleFinderIA\\backend\\cache\\FallbackCache.js',
        'C:\\dev\\HustleFinderIA\\backend\\cluster\\ClusterManager.js',
        'C:\\dev\\HustleFinderIA\\backend\\diagnostics\\AlexCompleteSystemDiagnostics.js',
        'C:\\dev\\HustleFinderIA\\backend\\diagnostics\\AlexSystemDiagnostics.js',
        'C:\\dev\\HustleFinderIA\\backend\\monitoring\\AlexAutonomyMonitor.js',
        'C:\\dev\\HustleFinderIA\\backend\\monitoring\\PerformanceMonitor.js'
    ];

    // Modules frontend
    const frontendModules = [
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\VoiceEmotionProcessor.js',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\HFAlexRoot.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Demo\\DemoShowcase.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\FloatingToggleButton.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\HFOS.js',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\MainApp.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\ActionExecutor.js',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\AdvancedAI\\ConsciousnessInterface.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\AI\\AISystemInterface.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Alex\\AlexAutonomyDemo.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Alex\\AlexModernChat.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Alex\\AlexUltimateInterface.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Alex\\ChatGPTInterface.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Alex\\RealAlexInterface.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\AlexInputArea.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\AlexTradingDashboard.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\APIIntegrationHub.js',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\ArchitectBuilder.js',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Assistant\\AlexIQUltimateInterface.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Assistant\\AssistantDashboard.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Assistant\\ChatInterface.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Assistant\\ContextAwareSuggestions.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Assistant\\ConversationManager.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Assistant\\MessageRenderer.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Assistant\\ModernAssistantInterface.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Assistant\\VoiceCommandPanel.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Assistant\\SmartSuggestions.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Assistant\\EnhancedChatInterface.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Assistant\\SimpleChatInterface.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Assistant\\ModernChatInterface.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\BiometricTradingInterface.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\ConsciousnessPanel.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\MetaverseTradingInterface.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\BacktestInterface.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Modern\\OptimizedChatInterface.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\AISidePanel.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\Navigation.jsx',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\AutoDocumentation.js',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\InnerDialogue.js',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\HealthScanner.js',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\MultilingualProcessor.js',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\TestingSystem.js',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\SimulationEngine.js',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\components\\SharedDreamingEngine.js',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\services\\api.js',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\services\\alexApi.ts',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\hooks\\useDebounce.js',
        'C:\\dev\\HustleFinderIA\\frontend\\src\\hooks\\useOptimizedAPI.js'
    ];

    const results = {
        intelligence: { modules: [], stats: { conforme: 0, mineur: 0, majeur: 0, critique: 0, total: 0 } },
        specialized: { modules: [], stats: { conforme: 0, mineur: 0, majeur: 0, critique: 0, total: 0 } },
        backendInfra: { modules: [], stats: { conforme: 0, mineur: 0, majeur: 0, critique: 0, total: 0 } },
        frontend: { modules: [], stats: { conforme: 0, mineur: 0, majeur: 0, critique: 0, total: 0 } }
    };

    // Analyser chaque catégorie
    console.log('🔍 Analyse des modules Intelligence...');
    for (const modulePath of intelligenceModules) {
        const analysis = analyzeFile(modulePath);
        results.intelligence.modules.push(analysis);
        results.intelligence.stats.total++;
        
        switch (analysis.category) {
            case CATEGORIES.CONFORME: results.intelligence.stats.conforme++; break;
            case CATEGORIES.MINEUR: results.intelligence.stats.mineur++; break;
            case CATEGORIES.MAJEUR: results.intelligence.stats.majeur++; break;
            case CATEGORIES.CRITIQUE: results.intelligence.stats.critique++; break;
        }
    }

    console.log('🔍 Analyse des modules Specialized...');
    for (const modulePath of specializedModules) {
        const analysis = analyzeFile(modulePath);
        results.specialized.modules.push(analysis);
        results.specialized.stats.total++;
        
        switch (analysis.category) {
            case CATEGORIES.CONFORME: results.specialized.stats.conforme++; break;
            case CATEGORIES.MINEUR: results.specialized.stats.mineur++; break;
            case CATEGORIES.MAJEUR: results.specialized.stats.majeur++; break;
            case CATEGORIES.CRITIQUE: results.specialized.stats.critique++; break;
        }
    }

    console.log('🔍 Analyse des modules Backend Infrastructure...');
    for (const modulePath of backendInfraModules) {
        const analysis = analyzeFile(modulePath);
        results.backendInfra.modules.push(analysis);
        results.backendInfra.stats.total++;
        
        switch (analysis.category) {
            case CATEGORIES.CONFORME: results.backendInfra.stats.conforme++; break;
            case CATEGORIES.MINEUR: results.backendInfra.stats.mineur++; break;
            case CATEGORIES.MAJEUR: results.backendInfra.stats.majeur++; break;
            case CATEGORIES.CRITIQUE: results.backendInfra.stats.critique++; break;
        }
    }

    console.log('🔍 Analyse des modules Frontend...');
    for (const modulePath of frontendModules) {
        const analysis = analyzeFile(modulePath);
        results.frontend.modules.push(analysis);
        results.frontend.stats.total++;
        
        switch (analysis.category) {
            case CATEGORIES.CONFORME: results.frontend.stats.conforme++; break;
            case CATEGORIES.MINEUR: results.frontend.stats.mineur++; break;
            case CATEGORIES.MAJEUR: results.frontend.stats.majeur++; break;
            case CATEGORIES.CRITIQUE: results.frontend.stats.critique++; break;
        }
    }

    return results;
}

function generateFinalReport(results) {
    // Statistiques déjà analysées
    const existingStats = {
        core: { total: 11, conforme: 10, mineur: 1, majeur: 0, critique: 0 },
        consciousness: { total: 28, conforme: 4, mineur: 20, majeur: 1, critique: 3 }
    };

    // Calcul des totaux backend
    const backendTotal = existingStats.core.total + existingStats.consciousness.total + 
                        results.intelligence.stats.total + results.specialized.stats.total + 
                        results.backendInfra.stats.total;
    
    const backendConforme = existingStats.core.conforme + existingStats.consciousness.conforme +
                           results.intelligence.stats.conforme + results.specialized.stats.conforme +
                           results.backendInfra.stats.conforme;
                           
    const backendMineur = existingStats.core.mineur + existingStats.consciousness.mineur +
                         results.intelligence.stats.mineur + results.specialized.stats.mineur +
                         results.backendInfra.stats.mineur;
                         
    const backendMajeur = existingStats.core.majeur + existingStats.consciousness.majeur +
                         results.intelligence.stats.majeur + results.specialized.stats.majeur +
                         results.backendInfra.stats.majeur;
                         
    const backendCritique = existingStats.core.critique + existingStats.consciousness.critique +
                           results.intelligence.stats.critique + results.specialized.stats.critique +
                           results.backendInfra.stats.critique;

    // Frontend
    const frontendTotal = results.frontend.stats.total;
    const frontendConforme = results.frontend.stats.conforme;
    const frontendMineur = results.frontend.stats.mineur;
    const frontendMajeur = results.frontend.stats.majeur;  
    const frontendCritique = results.frontend.stats.critique;

    // Totaux projet
    const projetTotal = backendTotal + frontendTotal;
    const projetConforme = backendConforme + frontendConforme;
    const projetViolations = (backendMineur + backendMajeur + backendCritique) + 
                           (frontendMineur + frontendMajeur + frontendCritique);

    const pourcentageConformes = ((projetConforme / projetTotal) * 100).toFixed(1);
    const pourcentageFakeAI = ((projetViolations / projetTotal) * 100).toFixed(1);

    console.log('\n📊 STATISTIQUES FINALES FAKE AI - PROJET COMPLET\n');
    
    console.log('**BACKEND**:');
    console.log(`- Total modules: ${backendTotal}`);
    console.log(`- Conformes: ${backendConforme} (${((backendConforme/backendTotal)*100).toFixed(1)}%)`);
    console.log(`- Violations mineures: ${backendMineur} (${((backendMineur/backendTotal)*100).toFixed(1)}%)`);
    console.log(`- Violations majeures: ${backendMajeur} (${((backendMajeur/backendTotal)*100).toFixed(1)}%)`);
    console.log(`- Critiques: ${backendCritique} (${((backendCritique/backendTotal)*100).toFixed(1)}%)`);
    
    console.log('\n**FRONTEND**:');
    console.log(`- Total modules: ${frontendTotal}`);
    console.log(`- Conformes: ${frontendConforme} (${((frontendConforme/frontendTotal)*100).toFixed(1)}%)`);
    console.log(`- Violations mineures: ${frontendMineur} (${((frontendMineur/frontendTotal)*100).toFixed(1)}%)`);
    console.log(`- Violations majeures: ${frontendMajeur} (${((frontendMajeur/frontendTotal)*100).toFixed(1)}%)`);
    console.log(`- Critiques: ${frontendCritique} (${((frontendCritique/frontendTotal)*100).toFixed(1)}%)`);
    
    console.log('\n**PROJET COMPLET**:');
    console.log(`- Total modules: ${projetTotal}`);
    console.log(`- 🟢 Conformes anti-fake: ${projetConforme} (${pourcentageConformes}%)`);
    console.log(`- 🔴 Fake AI détecté: ${projetViolations} (${pourcentageFakeAI}%)`);
    
    console.log(`\n**POURCENTAGE FAKE AI GLOBAL**: ${pourcentageFakeAI}%`);

    // Détail par catégorie
    console.log('\n📋 DÉTAIL PAR CATÉGORIE:\n');
    
    console.log('🧠 **INTELLIGENCE MODULES**:');
    console.log(`- Total: ${results.intelligence.stats.total}`);
    console.log(`- 🟢 Conformes: ${results.intelligence.stats.conforme}`);
    console.log(`- 🟡 Mineurs: ${results.intelligence.stats.mineur}`);
    console.log(`- 🟠 Majeurs: ${results.intelligence.stats.majeur}`);
    console.log(`- 🔴 Critiques: ${results.intelligence.stats.critique}`);
    
    console.log('\n⚙️ **SPECIALIZED MODULES**:');
    console.log(`- Total: ${results.specialized.stats.total}`);
    console.log(`- 🟢 Conformes: ${results.specialized.stats.conforme}`);
    console.log(`- 🟡 Mineurs: ${results.specialized.stats.mineur}`);
    console.log(`- 🟠 Majeurs: ${results.specialized.stats.majeur}`);
    console.log(`- 🔴 Critiques: ${results.specialized.stats.critique}`);
    
    console.log('\n🔧 **BACKEND INFRASTRUCTURE**:');
    console.log(`- Total: ${results.backendInfra.stats.total}`);
    console.log(`- 🟢 Conformes: ${results.backendInfra.stats.conforme}`);
    console.log(`- 🟡 Mineurs: ${results.backendInfra.stats.mineur}`);
    console.log(`- 🟠 Majeurs: ${results.backendInfra.stats.majeur}`);
    console.log(`- 🔴 Critiques: ${results.backendInfra.stats.critique}`);
    
    console.log('\n💻 **FRONTEND MODULES**:');
    console.log(`- Total: ${results.frontend.stats.total}`);
    console.log(`- 🟢 Conformes: ${results.frontend.stats.conforme}`);
    console.log(`- 🟡 Mineurs: ${results.frontend.stats.mineur}`);
    console.log(`- 🟠 Majeurs: ${results.frontend.stats.majeur}`);
    console.log(`- 🔴 Critiques: ${results.frontend.stats.critique}`);

    return {
        backend: {
            total: backendTotal,
            conforme: backendConforme,
            mineur: backendMineur,
            majeur: backendMajeur,
            critique: backendCritique
        },
        frontend: {
            total: frontendTotal,
            conforme: frontendConforme,
            mineur: frontendMineur,
            majeur: frontendMajeur,
            critique: frontendCritique
        },
        projet: {
            total: projetTotal,
            conforme: projetConforme,
            violations: projetViolations,
            pourcentageConformes: parseFloat(pourcentageConformes),
            pourcentageFakeAI: parseFloat(pourcentageFakeAI)
        },
        details: results
    };
}

// Exécution
console.log('🚀 Démarrage de l\'analyse complète des modules restants...\n');
const results = analyzeModules();
const finalStats = generateFinalReport(results);

// Sauvegarde des résultats
fs.writeFileSync('final-fake-ai-stats.json', JSON.stringify(finalStats, null, 2));
console.log('\n✅ Analyse terminée! Résultats sauvegardés dans final-fake-ai-stats.json');