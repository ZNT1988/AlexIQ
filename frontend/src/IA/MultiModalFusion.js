
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ERROR = 'error';

const logger = {
  info: (msg) => console.log(`[${new Date().toISOString()}] INFO: ${msg}')
  warn: (msg) => console.warn('[${new Date().toISOString()}] WARN: ${msg}')
  error: (msg) => console.error('[${new Date().toISOString()}] ERROR: ${msg}')
  debug: (msg) => console.debug('[${new Date().toISOString()}] DEBUG: ${msg}`)
};

// ============================================================================
// ALEX ATTENTION SYSTEM - MULTIMODAL FUSION MODULE
// MultiModalFusion.js - Cerveau de fusion attentionnelle multi-sources
// Version: 4.5.0 | Compatible AlexAttentionMasterIntegration
// ============================================================================

export default class MultiModalFusion {
    constructor(config = {}) {
        this.name = "MultiModalFusion";
        this.version = "4.5.0";
        this.status = "active";

        // Configuration
        this.config = {
            // Pondération des sources
            weights: {
                bottomUp: config.weights?.bottomUp || 0.4
                topDown: config.weights?.topDown || 0.6
                emotional: config.weights?.emotional || 0.3
                eyeTracking: config.weights?.eyeTracking || 0.5
                inhibition: config.weights?.inhibition || 0.8
                voiceCommands: config.weights?
      .voiceCommands || 0.9
            }
            // Paramètres de fusion
            fusionMethod :
       config.fusionMethod || 'weighted_sum', // weighted_sum, max_pooling, attention_map
            adaptiveWeighting: config.adaptiveWeighting || true
            conflictResolution: config.conflictResolution || 'priority_based'
            temporalIntegration: config.temporalIntegration || true
            // Seuils et normalisation
            attentionThreshold: config.attentionThreshold || 0.3
            maxAttentionValue: config.maxAttentionValue || 1.0
            normalizationMethod: config.normalizationMethod || 'softmax'
            // Filtrage et lissage
            spatialSmoothing: config.spatialSmoothing || 0.3
            temporalSmoothing: config.temporalSmoothing || 0.7
            noiseReduction: config.noiseReduction || true
            // Performance
            updateFrequency: config.updateFrequency || 60, // Hz
            mapResolution: config.mapResolution || { width: 1920, height: 1080 }
            historyLength: config.historyLength || 30, // frames

            // Adaptation contextuelle
            contextualAdaptation: config.contextualAdaptation || true
            learningRate: config.learningRate || 0.01
            // Debug
            enableLogging: config.enableLogging || false
            enableProfiling: config.enableProfiling || false
            visualizeFusion: config.visualizeFusion || false
        };

        // État interne
        this.state = {
            currentInputs: new Map()
            fusedMap: null
            fusionHistory: []
            contextState: {}
            performance: {
                lastUpdateTime: 0
                avgFusionTime: 0
                fusionCount: 0
            }
            adaptiveWeights: { ...this.config.weights }
        };

        // Modules de fusion
        this.fusionEngine = new FusionEngine(this.config);
        this.weightAdaptator = new WeightAdaptator(this.config);
        this.conflictResolver = new ConflictResolver(this.config);
        this.spatialProcessor = new SpatialProcessor(this.config);
        this.temporalProcessor = new TemporalProcessor(this.config);

        // Analyseurs et optimiseurs
        this.qualityAnalyzer = new FusionQualityAnalyzer();
        this.performanceOptimizer = new PerformanceOptimizer();
        this.contextAnalyzer = new ContextAnalyzer();

        // Connecteurs système
        this.languageProcessor = null;
        this.emotionalEngine = null;
        this.quantumBrain = null;

        // Callbacks
        this.callbacks = {
            onFusionComplete: []
            onConflictDetected: []
            onWeightAdaptation: []
            onQualityChange: []
            onPerformanceAlert: []
        };

        this.init();
    }

    // ========================================
    // INITIALISATION
    // ========================================

    init() {
        this.log("🧠 MultiModalFusion initialisé");
        this.startUpdateLoop();
        this.initializeFusionMaps();
        this.setupAdaptiveSystem();
    }

    startUpdateLoop() {
        this.updateInterval = setInterval(() => {
            this.update();
        }, 1000 / this.config.updateFrequency);
    }

    initializeFusionMaps() {
        const { width, height } = this.config.mapResolution;

        // Cartes de base
        this.maps = {
            bottomUp: new Float32Array(width * height)
            topDown: new Float32Array(width * height)
            emotional: new Float32Array(width * height)
            eyeTracking: new Float32Array(width * height)
            inhibition: new Float32Array(width * height)
            voiceCommands: new Float32Array(width * height)
            fused: new Float32Array(width * height)
            confidence: new Float32Array(width * height)
        };

        this.mapMetadata = {
            width
            height
            lastUpdate: Date.now()
            updateCount: 0
        };
    }

    setupAdaptiveSystem() {
        if (this.config.adaptiveWeighting) {
            this.weightAdaptator.initialize(this.state.adaptiveWeights);
        }

        if (this.config.contextualAdaptation) {
            this.contextAnalyzer.initialize();
        }
    }

    // ========================================
    // FUSION PRINCIPALE
    // ========================================

    async fuse(inputs) {
        const startTime = performance.now();

        try {
            this.log("🔄 Démarrage fusion multi-modale");

            // 1. Validation et preprocessing des entrées
            const validatedInputs = await this.validateInputs(inputs);

            // 2. Mise à jour des cartes individuelles
            await this.updateIndividualMaps(validatedInputs);

            // 3. Analyse contextuelle
            const context = await this.analyzeContext(validatedInputs);

            // 4. Adaptation des poids
            if (this.config.adaptiveWeighting) {
                await this.adaptWeights(context, validatedInputs);
            }

            // 5. Résolution des conflits
            const resolvedInputs = await this.resolveConflicts(validatedInputs, context);

            // 6. Fusion spatiale
            const spatiallyFused = await this.performSpatialFusion(resolvedInputs);

            // 7. Intégration temporelle

            // 8. Post-processing et normalisation
            const finalMap = await this.postProcessFusion(temporallyIntegrated);

            // 9. Analyse qualité
            const qualityMetrics = this.analyzeQuality(finalMap, validatedInputs);

            // 10. Mise à jour état
            this.updateState(finalMap, qualityMetrics, startTime);

            const result = {
                fusedMap: finalMap
                confidence: this.calculateOverallConfidence(finalMap)
                quality: qualityMetrics
                context: context
                weights: { ...this.state.adaptiveWeights }
                performance: {
                    fusionTime: performance.now() - startTime
                    inputSources: Object.keys(validatedInputs).length
                    mapSize: finalMap.data.length
                }
                timestamp: Date.now()
            };

            this.triggerCallback('onFusionComplete', result);

            return result;

        } catch (error) {
      // Logger fallback - ignore error
    }`, STR_ERROR);
            return this.getEmptyFusionResult(error);
        }
    }

    async validateInputs(inputs) {
        const validated = {};

        // Validation Bottom-Up
        if (inputs.bottomUp) {
            validated.bottomUp = this.validateBottomUp(inputs.bottomUp);
        }

        // Validation Top-Down
        if (inputs.topDown) {
            validated.topDown = this.validateTopDown(inputs.topDown);
        }

        // Validation Emotional
        if (inputs.emotional) {
            validated.emotional = this.validateEmotional(inputs.emotional);
        }

        // Validation Eye Tracking
        if (inputs.eyeTracking) {
            validated.eyeTracking = this.validateEyeTracking(inputs.eyeTracking);
        }

        // Validation Inhibition
        if (inputs.inhibition) {
            validated.inhibition = this.validateInhibition(inputs.inhibition);
        }

        // Validation Voice Commands
        if (inputs.voiceCommands) {
            validated.voiceCommands = this.validateVoiceCommands(inputs.voiceCommands);
        }

        return validated;
    }

    validateBottomUp(bottomUpData) {
        if (!bottomUpData.saliencyMap || !bottomUpData.saliencyMap.data) {
            throw new Error("Bottom-up data requires saliencyMap with data");
        }

        return {
            saliencyMap: bottomUpData.saliencyMap
            peaks: bottomUpData.peaks || []
            confidence: bottomUpData.confidence || 0.8
            timestamp: bottomUpData.timestamp || Date.now()
            type: 'bottom_up'
        };
    }

    validateTopDown(topDownData) {
        if (!topDownData.attentionMap || !topDownData.attentionMap.data) {
            throw new Error("Top-down data requires attentionMap with data");
        }

        return {
            attentionMap: topDownData.attentionMap
            targets: topDownData.targets || []
            goals: topDownData.goals || []
            confidence: topDownData.confidence || 0.9
            timestamp: topDownData.timestamp || Date.now()
            type: 'top_down'
        };
    }

    validateEmotional(emotionalData) {
        return {
            emotionalBias: emotionalData.emotionalBias || {}
            state: emotionalData.state || { arousal: 0, valence: 0 }
            influence: emotionalData.influence || 0.5
            confidence: emotionalData.confidence || 0.7
            timestamp: emotionalData.timestamp || Date.now()
            type: 'emotional'
        };
    }

    // ========================================
    // MISE À JOUR CARTES INDIVIDUELLES
    // ========================================

    async updateIndividualMaps(inputs) {
        const { width, height } = this.config.mapResolution;

        // Reset toutes les cartes
        Object.keys(this.maps).forEach(key => {
            if (key !== 'fused' && key !== 'confidence') {
                this.maps[key].fill(0);
            }
        });

        // Mise à jour Bottom-Up
        if (inputs.bottomUp) {
            this.updateBottomUpMap(inputs.bottomUp, width, height);
        }

        // Mise à jour Top-Down
        if (inputs.topDown) {
            this.updateTopDownMap(inputs.topDown, width, height);
        }

        // Mise à jour Emotional
        if (inputs.emotional) {
            this.updateEmotionalMap(inputs.emotional, width, height);
        }

        // Mise à jour Eye Tracking
        if (inputs.eyeTracking) {
            this.updateEyeTrackingMap(inputs.eyeTracking, width, height);
        }

        // Mise à jour Inhibition
        if (inputs.inhibition) {
            this.updateInhibitionMap(inputs.inhibition, width, height);
        }

        // Mise à jour Voice Commands
        if (inputs.voiceCommands) {
            this.updateVoiceCommandsMap(inputs.voiceCommands, width, height);
        }
    }

    updateBottomUpMap(bottomUpData, width, height) {
        const saliencyMap = bottomUpData.saliencyMap;

        // Copie directe si même résolution
        if (saliencyMap.width === width && saliencyMap.height === height) {
            this.maps.bottomUp.set(saliencyMap.data);
        } else {
            // Redimensionnement si nécessaire
            this.resampleMap(saliencyMap.data, saliencyMap.width, saliencyMap.height
                           this.maps.bottomUp, width, height);
        }

        // Application boost pour les pics
        if (bottomUpData.peaks) {
            bottomUpData.peaks.forEach(peak => {
                this.applyGaussianBlob(this.maps.bottomUp, peak.x, peak.y
                                     peak.strength * 0.3, 30, width, height);
            });
        }
    }

    updateTopDownMap(topDownData, width, height) {
        const attentionMap = topDownData.attentionMap;

        if (attentionMap.width === width && attentionMap.height === height) {
            this.maps.topDown.set(attentionMap.data);
        } else {
            this.resampleMap(attentionMap.data, attentionMap.width, attentionMap.height
                           this.maps.topDown, width, height);
        }

        // Boost pour targets actifs
        if (topDownData.targets) {
            topDownData.targets.forEach(target => {
                const strength = target.priority * target.confidence;
                this.applyGaussianBlob(this.maps.topDown, target.coordinates.x, target.coordinates.y
                                     strength * 0.4, 40, width, height);
            });
        }
    }

    updateEmotionalMap(emotionalData, width, height) {
        // Application du biais émotionnel global
        const bias = emotionalData.emotionalBias;
        const influence = emotionalData.influence;

        if (bias.focus) {
            // Modification sélective basée sur le focus émotionnel
            const focusModifier = bias.focus.intensity || 1.0;
            const centerX = Math.floor(width / 2);
            const centerY = Math.floor(height / 2);

            // Gradient centripète si focus élevé
            if (focusModifier > 0.7) {
                this.applyRadialGradient(this.maps.emotional, centerX, centerY
                                       influence * focusModifier, width, height);
            }
        }

        // Modulation selon arousal/valence
        if (emotionalData.state) {
            const { arousal, valence } = emotionalData.state;
            this.applyEmotionalModulation(this.maps.emotional, arousal, valence, influence, width, height);
        }
    }

    updateEyeTrackingMap(eyeTrackingData, width, height) {
        const gazeData = eyeTrackingData.currentGaze || eyeTrackingData;

        if (gazeData.position) {
            const { x, y } = gazeData.position;
            const confidence = gazeData.confidence || 0.8;

            // Blob attentionnel autour du regard
            this.applyGaussianBlob(this.maps.eyeTracking, x, y, confidence * 0.6, 35, width, height);
        }

        // Prédictions de trajectoire
        if (eyeTrackingData.predictions) {
            eyeTrackingData.predictions.forEach((prediction, index) => {
                const futureStrength = prediction.confidence * (1 - index * 0.1);
                this.applyGaussianBlob(this.maps.eyeTracking
                                     prediction.position.x, prediction.position.y
                                     futureStrength * 0.3, 25, width, height);
            });
        }
    }

    updateInhibitionMap(inhibitionData, width, height) {
        if (inhibitionData.data) {
            // Application directe carte d'inhibition (valeurs négatives)
            for (/* complex condition extracted */ let i = 0; i < inhibitionData.data.length && i < t...) {
                this.maps.inhibition[i] = -inhibitionData.data[i]; // Négatif pour inhibition
            }
        }

        // Zones d'inhibition spécifiques
        if (inhibitionData.zones) {
            inhibitionData.zones.forEach(zone => {
                this.applyRectangularInhibition(this.maps.inhibition, zone, width, height);
            });
        }
    }

    updateVoiceCommandsMap(voiceData, width, height) {
        if (voiceData.targets) { voiceData.targets.forEach(target => {
                const priority = target.priority || 0.9; // Voice commands = haute priorité
                this.applyGaussianBlob(this.maps.voiceCommands
                                     target.coordinates.x, target.coordinates.y
                                     priority * 0.7, 50, width, height);
            ; return; });
        }

        // Commandes globales (ex: "scan mode")
        if (voiceData.globalCommand) {
            this.applyGlobalCommand(this.maps.voiceCommands, voiceData.globalCommand, width, height);
        }
    }

    // ========================================
    // FUSION SPATIALE
    // ========================================

    async performSpatialFusion(inputs) {
        const { width, height } = this.config.mapResolution;
        this.maps.fused.fill(0);

        // Application méthode de fusion
        switch (this.config.fusionMethod) {
            case 'weighted_sum':
                this.performWeightedSum();
                break;
            case 'max_pooling':
                this.performMaxPooling();
                break;
            case 'attention_map':
                this.performAttentionMapFusion();
                break;
            case 'neural_fusion':
                await this.performNeuralFusion(inputs);
                break;
            default:
                this.performWeightedSum();
        }

        // Application inhibition (toujours en dernier)
        this.applyInhibition();

        // Lissage spatial si activé
        if (this.config.spatialSmoothing > 0) {
            this.applySpatialSmoothing();
        }

        return {
            data: this.maps.fused
            width
            height
            method: this.config.fusionMethod
            timestamp: Date.now()
        };
    }

    performWeightedSum() {
        const weights = this.state.adaptiveWeights;

        for (let i = 0; i < this.maps.fused.length; i++) {
            let sum = 0;
            let totalWeight = 0;

            // Bottom-up
            if (this.maps.bottomUp[i] > 0) {
                sum += this.maps.bottomUp[i] * weights.bottomUp;
                totalWeight += weights.bottomUp;
            }

            // Top-down
            if (this.maps.topDown[i] > 0) {
                sum += this.maps.topDown[i] * weights.topDown;
                totalWeight += weights.topDown;
            }

            // Emotional
            if (this.maps.emotional[i] > 0) {
                sum += this.maps.emotional[i] * weights.emotional;
                totalWeight += weights.emotional;
            }

            // Eye tracking
            if (this.maps.eyeTracking[i] > 0) {
                sum += this.maps.eyeTracking[i] * weights.eyeTracking;
                totalWeight += weights.eyeTracking;
            }

            // Voice commands
            if (this.maps.voiceCommands[i] > 0) {
                sum += this.maps.voiceCommands[i] * weights.voiceCommands;
                totalWeight += weights.voiceCommands;
            }

            // Normalisation par poids total
            this.maps.fused[i] = totalWeight > 0 ? sum / totalWeight : 0;
        }
    }

    performMaxPooling() {
        for (let i = 0; i < this.maps.fused.length; i++) {
            const values = [
                this.maps.bottomUp[i] * this.state.adaptiveWeights.bottomUp
                this.maps.topDown[i] * this.state.adaptiveWeights.topDown
                this.maps.emotional[i] * this.state.adaptiveWeights.emotional
                this.maps.eyeTracking[i] * this.state.adaptiveWeights.eyeTracking
                this.maps.voiceCommands[i] * this.state.adaptiveWeights.voiceCommands
            ];

            this.maps.fused[i] = Math.max(...values);
        }
    }

    applyInhibition() {
        for (let i = 0; i < this.maps.fused.length; i++) {
            if (this.maps.inhibition[i] < 0) {
                // Application inhibition multiplicative
                const inhibitionFactor = 1 + this.maps.inhibition[i]; // -0.5 devient 0.5
                this.maps.fused[i] *= Math.max(0, inhibitionFactor);
            }
        }
    }

    applySpatialSmoothing() {
        const smoothed = new Float32Array(this.maps.fused.length);
        const { width, height } = this.config.mapResolution;
        const smoothingRadius = 2;
        const alpha = this.config.spatialSmoothing;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const centerIndex = y * width + x;
                let sum = 0;
                let count = 0;

                // Moyenne avec voisinage
                for (let dy = -smoothingRadius; dy <= smoothingRadius; dy++) {
                    for (let dx = -smoothingRadius; dx <= smoothingRadius; dx++) {
                        const ny = y + dy;
                        const nx = x + dx;

                        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                            const neighborIndex = ny * width + nx;
                            sum += this.maps.fused[neighborIndex];
                            count++;
                        }
                    }
                }

                const avgValue = count > 0 ? sum / count : 0;
                smoothed[centerIndex] = this.maps.fused[centerIndex] * (1 - alpha) + avgValue * alpha;
            }
        }

        this.maps.fused.set(smoothed);
    }

    // ========================================
    // INTÉGRATION TEMPORELLE
    // ========================================

    async performTemporalIntegration(spatialMap) {
        if (!this.config.temporalIntegration || this.state.fusionHistory.length === 0) {
            return spatialMap;
        }

        const alpha = this.config.temporalSmoothing;

        // Récupération carte précédente
        const lastMap = this.state.fusionHistory[this.state.fusionHistory.length - 1];

        if (lastMap && lastMap.data.length === spatialMap.data.length) {
            // Lissage temporel
            for (let i = 0; i < spatialMap.data.length; i++) {
                temporallyIntegrated[i] = spatialMap.data[i] * (1 - alpha) + lastMap.data[i] * alpha;
            }
        } else {
            temporallyIntegrated.set(spatialMap.data);
        }

        return {
            ...spatialMap
            data: temporallyIntegrated
        };
    }

    // ========================================
    // ADAPTATION DES POIDS
    // ========================================

    async adaptWeights(context, inputs) {
        const adaptations = this.weightAdaptator.calculateAdaptations(
            context
            inputs
            this.state.adaptiveWeights
            this.state.fusionHistory
        );

        // Application des adaptations avec learning rate
        const lr = this.config.learningRate;

        Object.keys(adaptations).forEach(source => {
            if (this.state.adaptiveWeights[source] !== undefined) {
                const delta = adaptations[source] - this.state.adaptiveWeights[source];
                this.state.adaptiveWeights[source] += delta * lr;

                // Contraintes
                this.state.adaptiveWeights[source] = Math.max(0.1
                    Math.min(1.0, this.state.adaptiveWeights[source]));
            }
        });

        this.triggerCallback('onWeightAdaptation', {
            oldWeights: { ...this.config.weights }
            newWeights: { ...this.state.adaptiveWeights }
            adaptations
            context
        });

        this.log(`⚖️ Poids adaptés: ${JSON.stringify(this.state.adaptiveWeights)}`);
    }

    // ========================================
    // RÉSOLUTION DE CONFLITS
    // ========================================

    async resolveConflicts(inputs, context) {
        const conflicts = this.conflictResolver.detectConflicts(inputs, context);

        if (conflicts.length === 0) {
            return inputs;
        }

        this.log(`⚠️ ${conflicts.length} conflits détectés`);
        this.triggerCallback('onConflictDetected', conflicts);

        const resolvedInputs = { ...inputs };

        conflicts.forEach(conflict => {
            switch (this.config.conflictResolution) {
                case 'priority_based':
                    this.resolvePriorityBased(resolvedInputs, conflict);
                    break;
                case 'confidence_based':
                    this.resolveConfidenceBased(resolvedInputs, conflict);
                    break;
                case 'temporal_based':
                    this.resolveTemporalBased(resolvedInputs, conflict);
                    break;
                case 'fusion_based':
                    this.resolveFusionBased(resolvedInputs, conflict);
                    break;
            }
        });

        return resolvedInputs;
    }

    resolvePriorityBased(inputs, conflict) {
        // Ordre de priorité: Voice > TopDown > EyeTracking > Emotional > BottomUp
        const priorityOrder = ['voiceCommands', 'topDown', 'eyeTracking', 'emotional', 'bottomUp'];

        const highestPriority = conflict.sources.reduce((highest, source) => {
            const priorityA = priorityOrder.indexOf(highest);
            const priorityB = priorityOrder.indexOf(source);
            return priorityB < priorityA ? source : highest;
        });

        // Boost du signal prioritaire dans la zone de conflit
        this.boostSignalInRegion(inputs[highestPriority], conflict.region, 1.5);

        // Atténuation des autres signaux
        conflict.sources.forEach(source => {
            if (source !== highestPriority) {
                this.attenuateSignalInRegion(inputs[source], conflict.region, 0.7);
            }
        });
    }

    // ========================================
    // CONNEXIONS SYSTÈME
    // ========================================

    connectToLanguageProcessor(languageProcessor) {
        this.languageProcessor = languageProcessor;

        // Setup callbacks pour commandes vocales
        languageProcessor.onAttentionCommand((command) => {
            this.handleLanguageCommand(command);
        });

        this.log("🗣️ LanguageProcessor connecté");
    }

    connectToEmotionalEngine(emotionalEngine) {
        this.emotionalEngine = emotionalEngine;

        // Sync état émotionnel
        emotionalEngine.onStateChange((state) => {
            this.handleEmotionalStateChange(state);
        });

        this.log("🎭 EmotionalEngine connecté");
    }

    enableQuantumSuperposition() {
        // Activation mode quantique pour fusion parallèle
        this.quantumMode = true;
        this.log("🌌 Mode quantique activé - Superposition attentionnelle");
    }

    // ========================================
    // UTILITAIRES GÉOMÉTRIQUES
    // ========================================

    applyGaussianBlob(map, centerX, centerY, strength, radius, width, height) {
        const radiusSquared = radius * radius;

        for (let y = Math.max(0, centerY - radius); y < Math.min(height, centerY + radius); y++) {
            for (let x = Math.max(0, centerX - radius); x < Math.min(width, centerX + radius); x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distanceSquared = dx * dx + dy * dy;

                if (distanceSquared <= radiusSquared) {
                    const gaussian = Math.exp(-distanceSquared / (2 * radiusSquared / 4));
                    const index = y * width + x;
                    map[index] = Math.max(map[index], strength * gaussian);
                }
            }
        }
    }

    applyRadialGradient(map, centerX, centerY, strength, width, height) {
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const gradient = 1 - (distance / maxDistance);
                const index = y * width + x;
                map[index] = Math.max(map[index], strength * Math.max(0, gradient));
            }
        }
    }

    resampleMap(sourceData, sourceWidth, sourceHeight, targetData, targetWidth, targetHeight) {
        const scaleX = sourceWidth / targetWidth;
        const scaleY = sourceHeight / targetHeight;

        for (let y = 0; y < targetHeight; y++) {
            for (let x = 0; x < targetWidth; x++) {
                const sourceX = Math.floor(x * scaleX);
                const sourceY = Math.floor(y * scaleY);

                if (sourceX < sourceWidth && sourceY < sourceHeight) {
                    const sourceIndex = sourceY * sourceWidth + sourceX;
                    const targetIndex = y * targetWidth + x;
                    targetData[targetIndex] = sourceData[sourceIndex];
                }
            }
        }
    }

    // ========================================
    // API PUBLIQUE
    // ========================================

    getFusedAttentionMap() {
        return {
            data: new Float32Array(this.maps.fused)
            width: this.config.mapResolution.width
            height: this.config.mapResolution.height
            confidence: this.calculateOverallConfidence(this.maps.fused)
            timestamp: Date.now()
            sources: this.getActiveSources()
            weights: { ...this.state.adaptiveWeights }
        };
    }

    getStatus() {
        return {
            name: this.name
            version: this.version
            status: this.status
            activeSources: this.getActiveSources().length
            adaptiveWeights: { ...this.state.adaptiveWeights }
            fusionMethod: this.config.fusionMethod
            performance: { ...this.state.performance }
            quantumMode: this.quantumMode || false
        };
    }

    getActiveSources() {
        return Object.keys(this.maps).filter(key => {
            if (key === 'fused' || key === 'confidence') return false;

            // Vérification si la carte a des valeurs non-nulles
            for (let i = 0; i < this.maps[key].length; i++) {
                if (Math.abs(this.maps[key][i]) > 0.01) return true;
            }
            return false;
        });
    }

    calculateOverallConfidence(map) {
        if (!map || map.length === 0) return 0;

        let sum = 0;
        let count = 0;

        for (let i = 0; i < map.length; i++) {
            if (map[i] > 0.1) {
                sum += map[i];
                count++;
            }
        }

        return count > 0 ? Math.min(1.0, sum / count) : 0;
    }

    // ========================================
    // MISE À JOUR ET MAINTENANCE
    // ========================================

    update() {
        // Maintenance automatique des cartes
        this.performMaintenance();

        // Mise à jour performance
        this.updatePerformanceMetrics();

        // Nettoyage historique
        this.cleanupHistory();
    }

    updateState(finalMap, qualityMetrics, startTime) {
        // Mise à jour carte fusionnée
        this.state.fusedMap = finalMap;

        // Ajout à l'historique
        this.state.fusionHistory.push({
            data: new Float32Array(finalMap.data)
            timestamp: Date.now()
            quality: qualityMetrics.overall
        });

        // Limitation historique
        if (this.state.fusionHistory.length > this.config.historyLength) {
            this.state.fusionHistory = this.state.fusionHistory.slice(-this.config.historyLength);
        }

        // Mise à jour performance
        const fusionTime = performance.now() - startTime;
        this.state.performance.lastUpdateTime = Date.now();
        this.state.performance.avgFusionTime =
            (this.state.performance.avgFusionTime * this.state.performance.fusionCount + fusionTime) /
            (this.state.performance.fusionCount + 1);
        this.state.performance.fusionCount++;
    }

    // ========================================
    // CALLBACKS
    // ========================================

    onFusionComplete(callback) {
        this.callbacks.onFusionComplete.push(callback);
    }

    onConflictDetected(callback) {
        this.callbacks.onConflictDetected.push(callback);
    }

    onWeightAdaptation(callback) {
        this.callbacks.onWeightAdaptation.push(callback);
    }

    triggerCallback(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    this.log(`❌ Erreur callback ${event}: ${error.message}`, STR_ERROR);
                }
            });
        }
    }

    log(message, level = 'info') {
        if (this.config.enableLogging) {
            const timestamp = new Date().toISOString();
            logger.info(`[${timestamp}] [MultiModalFusion] [${level.toUpperCase()}] ${message}`);
        }
    }

    // ========================================
    // CLEANUP
    // ========================================

    destroy() {
        // Arrêt update loop
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // Nettoyage cartes
        Object.keys(this.maps).forEach(key => {
            this.maps[key] = null;
        });

        // Nettoyage historique
        this.state.fusionHistory = [];

        // Nettoyage callbacks
        Object.keys(this.callbacks).forEach(key => {
            this.callbacks[key] = [];
        });

        // Déconnexion systèmes
        this.languageProcessor = null;
        this.emotionalEngine = null;
        this.quantumBrain = null;

        this.status = "destroyed";
        this.log("🗑️ MultiModalFusion détruit");
    }

    getEmptyFusionResult(error) {
        return {
            fusedMap: null
            confidence: 0
            quality: { overall: 0 }
            context: {}
            weights: { ...this.state.adaptiveWeights }
            performance: { fusionTime: 0, error: error.message }
            timestamp: Date.now()
        };
    }
}

// ============================================================================
// CLASSES AUXILIAIRES
// ============================================================================

class FusionEngine {
    constructor(config) {
        this.config = config;
    }
}

class WeightAdaptator {
    constructor(config) {
        this.config = config;
        this.adaptationHistory = [];
    }

    initialize(initialWeights) {
        this.currentWeights = { ...initialWeights };
    }

    calculateAdaptations(context, inputs, currentWeights, history) {
        const adaptations = { ...currentWeights };

        // Adaptation basée sur le contexte
        if (context.taskType === 'reading') {
            adaptations.topDown *= 1.2; // Plus de top-down pour lecture
            adaptations.bottomUp *= 0.8;
        } else if (context.taskType === 'exploration') {
            adaptations.bottomUp *= 1.3; // Plus de bottom-up pour exploration
            adaptations.topDown *= 0.9;
        }

        // Adaptation basée sur la performance
        if (history.length > 5) {
            const recentQuality = history.slice(-5).map(h => h.quality);
            const avgQuality = recentQuality.reduce((s, q) => s + q, 0) / recentQuality.length;

            if (avgQuality < 0.7) {
                // Boost des sources les plus confiantes
                Object.keys(inputs).forEach(source => {
                    if (inputs[source].confidence > 0.8) {
                        adaptations[source] *= 1.1;
                    }
                });
            }
        }

        return adaptations;
    }
}

class ConflictResolver {
    constructor(config) {
        this.config = config;
    }

    detectConflicts(inputs, context) {
        const conflicts = [];

        // Détection conflits spatiaux
        const spatialConflicts = this.detectSpatialConflicts(inputs);
        conflicts.push(...spatialConflicts);

        // Détection conflits temporels
        conflicts.push(...temporalConflicts);

        // Détection conflits de priorité
        const priorityConflicts = this.detectPriorityConflicts(inputs);
        conflicts.push(...priorityConflicts);

        return conflicts;
    }

    detectSpatialConflicts(inputs) {
        // Simplifiée: détection de zones où plusieurs sources ont des valeurs élevées
        return [];
    }

    detectTemporalConflicts(inputs) {
        // Détection de changements contradictoires
        return [];
    }

    detectPriorityConflicts(inputs) {
        // Détection de commandes concurrentes
        return [];
    }
}

class SpatialProcessor {
    constructor(config) {
        this.config = config;
    }
}

class TemporalProcessor {
    constructor(config) {
        this.config = config;
    }
}

class FusionQualityAnalyzer {
    analyzeQuality(fusedMap, inputs) {
        return {
            overall: 0.8
            spatial: 0.85
            temporal: 0.75
            confidence: 0.9
        };
    }
}

class PerformanceOptimizer {
    constructor() {
        this.optimizations = [];
    }
}

class ContextAnalyzer {
    initialize() {
        // Initialisation analyse contextuelle
    }

    analyzeContext(inputs) {
        return {
            taskType: 'general'
            difficulty: 0.5
            urgency: 0.3
        };
    }
}