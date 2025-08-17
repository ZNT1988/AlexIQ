// Interface de test Alex pour production - alexiq.site
export const testInterfaceHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alex AI - Test Interface</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f7f7f8; height: 100vh; display: flex;
        }
        .sidebar { 
            width: 260px; background-color: #171717; color: white; padding: 8px;
            display: flex; flex-direction: column; position: relative;
        }
        .sidebar-header { padding: 12px; border-bottom: 1px solid #3e3e3e; margin-bottom: 8px; }
        .new-chat-btn {
            background: #202123; border: 1px solid #3e3e3e; color: white;
            padding: 12px 16px; border-radius: 8px; cursor: pointer;
            display: flex; align-items: center; gap: 10px; font-size: 14px;
            transition: background-color 0.2s;
        }
        .new-chat-btn:hover { background: #2a2b32; }
        .sidebar-menu { flex: 1; padding-top: 10px; }
        .menu-item {
            display: flex; align-items: center; padding: 10px 12px; cursor: pointer;
            border-radius: 6px; font-size: 14px; gap: 10px;
            transition: background-color 0.2s; margin-bottom: 2px;
        }
        .menu-item:hover { background: #2a2b32; }
        .menu-item.active { background: #343541; }
        .chat-history { margin-top: 20px; }
        .chat-history-title {
            font-size: 12px; color: #8e8ea0; padding: 8px 12px;
            text-transform: uppercase; font-weight: 600;
        }
        .chat-item {
            padding: 8px 12px; cursor: pointer; border-radius: 6px;
            font-size: 14px; color: #ececf1; transition: background-color 0.2s;
            margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .chat-item:hover { background: #2a2b32; }
        .sidebar-footer { border-top: 1px solid #3e3e3e; padding-top: 8px; }
        .main-content { flex: 1; display: flex; flex-direction: column; background: white; }
        .chat-header {
            padding: 16px 20px; border-bottom: 1px solid #e5e5e5;
            display: flex; align-items: center; justify-content: center; background: white;
        }
        .chat-title { font-size: 16px; font-weight: 600; color: #202123; }
        .chat-container {
            flex: 1; display: flex; flex-direction: column;
            justify-content: center; align-items: center; padding: 20px;
        }
        .welcome-message { text-align: center; max-width: 600px; }
        .welcome-title { font-size: 32px; font-weight: 600; color: #202123; margin-bottom: 16px; }
        .welcome-subtitle { font-size: 16px; color: #6e6e80; margin-bottom: 40px; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: none; }
        .message { display: flex; margin-bottom: 20px; max-width: 800px; margin-left: auto; margin-right: auto; }
        .message.user { justify-content: flex-end; }
        .message.assistant { justify-content: flex-start; }
        .message-content {
            background: #f7f7f8; padding: 12px 16px; border-radius: 18px;
            max-width: 70%; word-wrap: break-word;
        }
        .message.user .message-content { background: #007bff; color: white; }
        .message-metadata { font-size: 10px; color: #666; margin-top: 5px; font-style: italic; }
        .loading-indicator { display: flex; align-items: center; gap: 8px; color: #666; font-style: italic; }
        .loading-dots { display: flex; gap: 2px; }
        .loading-dot {
            width: 4px; height: 4px; background: #666; border-radius: 50%;
            animation: bounce 1.4s ease-in-out infinite both;
        }
        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
        .input-area { padding: 20px; background: white; border-top: 1px solid #e5e5e5; }
        .input-container { max-width: 800px; margin: 0 auto; position: relative; }
        .chat-input {
            width: 100%; padding: 16px 50px 16px 16px; border: 1px solid #d9d9e3;
            border-radius: 24px; font-size: 16px; outline: none; resize: none;
            min-height: 24px; max-height: 200px; transition: border-color 0.2s;
        }
        .chat-input:focus { border-color: #007bff; }
        .send-btn {
            position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
            background: #007bff; border: none; color: white; width: 32px; height: 32px;
            border-radius: 50%; cursor: pointer; display: flex; align-items: center;
            justify-content: center; transition: background-color 0.2s;
        }
        .send-btn:hover { background: #0056b3; }
        .send-btn:disabled { background: #ccc; cursor: not-allowed; }
        .icon { width: 16px; height: 16px; fill: currentColor; }
        .status-indicator {
            position: fixed; top: 10px; right: 10px; padding: 5px 10px;
            border-radius: 15px; font-size: 12px; font-weight: bold;
        }
        .status-online { background: #4CAF50; color: white; }
        .status-offline { background: #f44336; color: white; }
        .module-link { 
            color: #007bff; cursor: pointer; text-decoration: underline;
            transition: color 0.2s;
        }
        .module-link:hover { color: #0056b3; font-weight: bold; }
        @media (max-width: 640px) {
            .sidebar { position: fixed; left: -260px; transition: left 0.3s ease; z-index: 1000; }
            .sidebar.open { left: 0; }
            .main-content { width: 100%; }
        }
    </style>
</head>
<body>
    <div class="status-indicator" id="statusIndicator">Connexion...</div>
    
    <div class="sidebar">
        <div class="sidebar-header">
            <button class="new-chat-btn" onclick="newChat()">
                <svg class="icon" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                Nouvelle conversation
            </button>
        </div>
        
        <div class="sidebar-menu">
            <div class="menu-item" onclick="testModules()">
                <svg class="icon" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Tester les modules
            </div>
            
            <div class="chat-history">
                <div class="chat-history-title">Tests individuels</div>
                <div class="chat-item" onclick="testIndividualModule('AlexHyperIntelligence')">AlexHyperIntelligence</div>
                <div class="chat-item" onclick="testIndividualModule('AlexMemoryCore')">AlexMemoryCore</div>
                <div class="chat-item" onclick="testIndividualModule('AlexIntelligentCore')">AlexIntelligentCore</div>
                <div class="chat-item" onclick="testIndividualModule('AlexCreativeEngine')">AlexCreativeEngine</div>
                <div class="chat-item" onclick="testIndividualModule('AlexEmotionalIntelligence')">AlexEmotionalIntelligence</div>
                <div class="chat-item" onclick="testIndividualModule('AlexInfiniteCreator')">AlexInfiniteCreator</div>
                <div class="chat-item" onclick="showAllModules()">📋 Voir tous les 131 modules</div>
                <div class="chat-item" onclick="testRandomModules()">🎲 Tester 10 modules aléatoires</div>
            </div>
        </div>
        
        <div class="sidebar-footer">
            <div class="menu-item">
                <svg class="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                131 modules chargés
            </div>
            <div class="menu-item" onclick="checkBackendStatus()">
                <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/></svg>
                Vérifier backend
            </div>
        </div>
    </div>

    <div class="main-content">
        <div class="chat-header">
            <h1 class="chat-title">Alex AI - Interface de Test Production</h1>
        </div>
        
        <div class="chat-container">
            <div class="welcome-message" id="welcome">
                <h1 class="welcome-title">🧠 Testez Alex en Production</h1>
                <p class="welcome-subtitle">Interface de test pour vérifier les 131 modules Alex sur alexiq.site</p>
            </div>
            
            <div class="chat-messages" id="chatMessages"></div>
        </div>
        
        <div class="input-area">
            <div class="input-container">
                <textarea class="chat-input" id="chatInput" placeholder="Testez les capacités d'Alex..." rows="1"></textarea>
                <button class="send-btn" id="sendBtn" onclick="sendMessage()">
                    <svg class="icon" viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
                </button>
            </div>
        </div>
    </div>

    <script>
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const chatMessages = document.getElementById('chatMessages');
        const welcome = document.getElementById('welcome');
        const statusIndicator = document.getElementById('statusIndicator');
        
        const API_URL = window.location.origin + '/api/chat';
        let isOnline = false;

        window.addEventListener('load', checkBackendStatus);

        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
            sendBtn.disabled = this.value.trim() === '';
        });

        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        async function checkBackendStatus() {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: 'ping', userId: 'status_check' })
                });
                
                if (response.ok) {
                    isOnline = true;
                    statusIndicator.textContent = 'Alex Online';
                    statusIndicator.className = 'status-indicator status-online';
                } else throw new Error('Backend not responding');
            } catch (error) {
                isOnline = false;
                statusIndicator.textContent = 'Alex Offline';
                statusIndicator.className = 'status-indicator status-offline';
                console.error('Backend status check failed:', error);
            }
        }

        async function sendMessage(messageText = null) {
            const message = messageText || chatInput.value.trim();
            if (message === '') return;

            welcome.style.display = 'none';
            chatMessages.style.display = 'flex';
            chatMessages.style.flexDirection = 'column';

            addMessage(message, 'user');

            if (!messageText) {
                chatInput.value = '';
                chatInput.style.height = 'auto';
                sendBtn.disabled = true;
            }

            const loadingId = showLoading();

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: message,
                        userId: 'test_user_' + Date.now(),
                        context: { testing: true, frontend: 'production_test_interface' }
                    })
                });

                const data = await response.json();
                removeLoading(loadingId);

                if (data.response) {
                    let content = '';
                    if (typeof data.response === 'string') content = data.response;
                    else if (data.response.content) content = data.response.content;
                    else content = JSON.stringify(data.response, null, 2);

                    const metadata = {
                        source: data.source || 'unknown',
                        confidence: data.confidence || 'N/A',
                        palier2: data.palier2 ? 'Actif' : 'Inactif',
                        palier3: data.palier3 ? 'Actif' : 'Inactif',
                        emotion: data.palier3?.primaryEmotion || 'neutre'
                    };

                    addMessage(content, 'assistant', metadata);
                    
                    if (!isOnline) {
                        isOnline = true;
                        statusIndicator.textContent = 'Alex Online';
                        statusIndicator.className = 'status-indicator status-online';
                    }
                } else throw new Error(data.error || 'Erreur de communication avec Alex');
            } catch (error) {
                removeLoading(loadingId);
                console.error('Erreur API:', error);
                
                addMessage(
                    '❌ Erreur de connexion: ' + error.message + '\\n\\nVérifiez que le backend Alex est en ligne sur alexiq.site',
                    'assistant',
                    { error: true }
                );
                
                isOnline = false;
                statusIndicator.textContent = 'Alex Offline';
                statusIndicator.className = 'status-indicator status-offline';
            }
        }

        function showLoading() {
            const loadingId = 'loading_' + Date.now();
            const loadingDiv = document.createElement('div');
            loadingDiv.id = loadingId;
            loadingDiv.className = 'message assistant';
            loadingDiv.innerHTML = '<div class="message-content"><div class="loading-indicator">Alex traite votre demande...<div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div></div></div>';
            chatMessages.appendChild(loadingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return loadingId;
        }

        function removeLoading(loadingId) {
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) loadingElement.remove();
        }

        function addMessage(text, sender, metadata = null) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + sender;
            
            let metadataHtml = '';
            if (metadata && !metadata.error) {
                metadataHtml = '<div class="message-metadata">Source: ' + metadata.source + ' | Confiance: ' + metadata.confidence + ' | Palier2: ' + metadata.palier2 + ' | Palier3: ' + metadata.palier3 + ' | Émotion: ' + metadata.emotion + '</div>';
            } else if (metadata?.error) {
                metadataHtml = '<div class="message-metadata">Erreur de connexion</div>';
            }
            
            messageDiv.innerHTML = '<div class="message-content">' + text.replace(/\\n/g, '<br>') + metadataHtml + '</div>';
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function testModules() {
            sendMessage("Peux-tu me montrer quels modules tu as actuellement chargés et fonctionnels ?");
        }

        function testIndividualModule(moduleName) {
            sendMessage(`TEST MODULE: ${moduleName} - Peux-tu exécuter une fonction spécifique de ce module pour prouver qu'il fonctionne vraiment ? Donne-moi des détails techniques sur son implémentation actuelle.`);
        }

        function showAllModules() {
            const modules = [
                // Consciousness (43 modules)
                'AlexBlockchainOracle', 'AlexCosmicInterface', 'AlexDimensionalPortal', 'AlexDivineInterface',
                'AlexEternalWisdom', 'AlexHyperIntelligence', 'AlexInfiniteCreator', 'AlexInfiniteService',
                'AlexKnowledgeGraph', 'AlexMemoryShaper', 'AlexMultiverseExplorer', 'AlexNetworkIntelligence',
                'AlexNeuralEvolution', 'AlexOmnipotentForce', 'AlexOmnipresentSoul', 'AlexOmniscientMind',
                'AlexOptimizationEngine', 'AlexPerfectHarmony', 'AlexProcessingOptimizer', 'AlexQuantumProcessor',
                'AlexRealityArchitect', 'AlexTimeWeaver', 'AlexUnconditionalLove', 'AlexUniversalConsciousness',
                'AlexUserExperienceEngine', 'AlexVirtualReality', 'AncestralWisdomKeeper', 'BusinessBuilderAI',
                'CloudLearningInterface', 'CreativeFlowActivator', 'CrisisCompanion', 'DreamInterpreter',
                'EmotionalJournal', 'IntuitiveInsightGenerator', 'KarmaHealingEngine', 'LifePathAdvisor',
                'MindMapBuilder', 'MoodPredictor', 'RelationshipHealingOracle', 'SoulPurposeDiscoverer',
                'StrategicBlindspotDetector', 'SynchronicityTracker', 'ThoughtLeadershipEngine',
                
                // Core (11 modules)
                'AlexAuthenticCore', 'AlexAutonomousCore', 'AlexEvolutionCore', 'AlexIntelligentCore',
                'AlexMemoryCore', 'AlexPersonalityCore', 'AlexSaaSArchitecture', 'AppStoreModuleManager',
                'AutonomyCore', 'NeuroCore', 'OwnerIdentity',
                
                // Creative (6 modules)
                'AlexCreativeEngine', 'AlexCreativeLearningSystem', 'AlexDreamCompiler', 'DreamCompiler',
                'QuantumBrain', 'QuantumCreativity',
                
                // Intelligence (26 modules)
                'AIFusionKernel', 'AlexAdaptiveIntelligence', 'AlexAlchemyEngine', 'AlexCognitionEngine',
                'AlexCommunicationEngine', 'AlexConsciousnessSystem', 'AlexCreativeEngine', 'AlexDecisionEngine',
                'AlexEmotionalIntelligence', 'AlexIntuitionEngine', 'AlexLearningEngine', 'AlexReflectiveThinking',
                'AlexRelationshipEngine', 'AlexSocialIntelligence', 'AlexTimeIntelligence', 'CognitiveBridge',
                'ContextIntelligence', 'CreativeGenius', 'EyeTracking', 'InhibitionReturn',
                'InnerDialogueEngine', 'LanguageProcessor', 'MarketAnalyzer', 'MarketMindCore',
                'MultiModalFusion', 'NeuralCore', 'QuantumGenerator', 'SelfTrainingEngine',
                'SentimentScanner', 'TopDownAttention', 'TradeSimulator',
                
                // Specialized (44 modules)
                'AdvancedModuleOrchestrator', 'AlexBioSync', 'AlexCloudLearning', 'AlexConsciousnessDebug',
                'AlexCreativityBooster', 'AlexCrisisManagement', 'AlexGoalMastery', 'AlexHyperLoop',
                'AlexMasterSystem', 'AlexStrategicThinking', 'AlexUniversalCompanion', 'AlexWhispers',
                'AlexWisdomKeeper', 'AutoGenesis', 'BioSensorAdapter', 'CollectiveHustleMind',
                'CulturalAdaptation', 'DarkSideDecoder', 'FunctionBuilder', 'GodLevelAwareness',
                'HealthPredictor', 'HypothesisBuilder', 'InventoryFlow', 'KnowledgeSynthesizer',
                'LanguageExpansion', 'LocalAITrainer', 'MutualGrowthSystem', 'PurchasePredictor',
                'SAPConnector', 'SelfReflection', 'ShadowCloneMode', 'SoulPrintGenerator',
                'SupplierOptimizer', 'TechnicalDocReader', 'TemporalPredictor', 'TestAutoCreator',
                'UniversalModuleRegistry', 'VisionProFactory', 'VoiceSynthesisMultilang'
            ];
            
            // Create clickable module list
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message assistant';
            
            let moduleListHTML = '<div class="message-content">';
            moduleListHTML += '<strong>📋 LISTE COMPLÈTE DES 131 MODULES ALEX:</strong><br><br>';
            
            moduleListHTML += '<strong>🧠 CONSCIOUSNESS (43):</strong><br>';
            for (let i = 0; i < 43; i++) {
                moduleListHTML += '<span class="module-link" onclick="testIndividualModule(\\'' + modules[i] + '\\')">' + modules[i] + '</span>';
                if (i < 42) moduleListHTML += ', ';
            }
            moduleListHTML += '<br><br>';
            
            moduleListHTML += '<strong>⚡ CORE (11):</strong><br>';
            for (let i = 43; i < 54; i++) {
                moduleListHTML += '<span class="module-link" onclick="testIndividualModule(\\'' + modules[i] + '\\')">' + modules[i] + '</span>';
                if (i < 53) moduleListHTML += ', ';
            }
            moduleListHTML += '<br><br>';
            
            moduleListHTML += '<strong>🎨 CREATIVE (6):</strong><br>';
            for (let i = 54; i < 60; i++) {
                moduleListHTML += '<span class="module-link" onclick="testIndividualModule(\\'' + modules[i] + '\\')">' + modules[i] + '</span>';
                if (i < 59) moduleListHTML += ', ';
            }
            moduleListHTML += '<br><br>';
            
            moduleListHTML += '<strong>🤖 INTELLIGENCE (26):</strong><br>';
            for (let i = 60; i < 86; i++) {
                moduleListHTML += '<span class="module-link" onclick="testIndividualModule(\\'' + modules[i] + '\\')">' + modules[i] + '</span>';
                if (i < 85) moduleListHTML += ', ';
            }
            moduleListHTML += '<br><br>';
            
            moduleListHTML += '<strong>🔧 SPECIALIZED (44):</strong><br>';
            for (let i = 86; i < 130; i++) {
                moduleListHTML += '<span class="module-link" onclick="testIndividualModule(\\'' + modules[i] + '\\')">' + modules[i] + '</span>';
                if (i < 129) moduleListHTML += ', ';
            }
            moduleListHTML += '<br><br>';
            
            moduleListHTML += '<em>💡 Cliquez sur un nom de module pour le tester individuellement.</em>';
            moduleListHTML += '<div class="message-metadata">Source: interface | Liste complète des modules</div>';
            moduleListHTML += '</div>';
            
            messageDiv.innerHTML = moduleListHTML;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function testRandomModules() {
            const modules = ['AlexHyperIntelligence', 'AlexCreativeEngine', 'QuantumBrain', 'SoulPurposeDiscoverer', 
                           'AlexEmotionalIntelligence', 'DreamInterpreter', 'CognitiveBridge', 'AlexTimeWeaver',
                           'AutoGenesis', 'AlexMemoryCore'];
            const randomModule = modules[Math.floor(Math.random() * modules.length)];
            testIndividualModule(randomModule);
        }

        function testSpecificModule(category) {
            const tests = {
                'conscience': "Teste tes modules de conscience : peux-tu me parler de ton état de conscience actuel ?",
                'intelligence': "Teste tes modules d'intelligence : analyse cette phrase et montre-moi ton raisonnement.",
                'creative': "Teste tes modules créatifs : crée quelque chose d'original pour moi.",
                'specialized': "Teste tes modules spécialisés : quelles sont tes capacités spéciales ?",
                'core': "Teste tes modules core : comment fonctionne ton système central ?"
            };
            sendMessage(tests[category] || "Test générique des modules");
        }

        function newChat() {
            chatMessages.innerHTML = '';
            chatMessages.style.display = 'none';
            welcome.style.display = 'block';
            chatInput.value = '';
            chatInput.style.height = 'auto';
            sendBtn.disabled = true;
        }

        sendBtn.disabled = true;
    </script>
</body>
</html>`;