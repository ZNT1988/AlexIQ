
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ERROR = 'error';

const logger = {
  info: (msg, ...args) => console.log(`[${new Date().toISOString()}] INFO:', msg, ...args)
  warn: (msg, ...args) => console.warn('[${new Date().toISOString()}] WARN:', msg, ...args)
  error: (msg, ...args) => console.error('[${new Date().toISOString()}] ERROR:', msg, ...args)
  debug: (msg, ...args) => console.debug('[${new Date().toISOString()}] DEBUG:`, msg, ...args)
};

const crypto = require('crypto');
// ============================================================================
// ALEX ATTENTION SYSTEM - TOP-DOWN ATTENTION MODULE
// TopDownAttention.js - Attention dirigée par objectifs
// Version: 4.5.0 | Compatible AlexAttentionMasterIntegration
// ============================================================================

    constructor(config = {}) {
        this.name = "TopDownAttention";
        this.version = "4.5.0";
        this.status = STR_ACTIVE;

        // Configuration
        this.config = {
            // Paramètres d'attention dirigée
            focusStrength: config.focusStrength || 0.8
      goalDecay: config.goalDecay || 0.95
      // Dégradation objectif dans le temps
            emotionalModulation: config.emotionalModulation || 0.3
      voiceCommandPriority: config.voiceCommandPriority || 0.9
      // Limites et seuils
            maxConcurrentTargets: config.maxConcurrentTargets || 3
      minConfidence: config.minConfidence || 0.6
      maxDistance: config.maxDistance || 500
      // pixels

            // Timing
            updateFrequency: config.updateFrequency || 60
      // Hz
            goalTimeout: config.goalTimeout || 30000
      // 30s
            transitionTime: config.transitionTime || 200
      // ms

            // Debug
            enableLogging: config.enableLogging || false
      visualizeTargets: config.visualizeTargets || false
        };

        // État interne
        this.state = {
            currentTargets: new Map()
            activeGoals: new Map()
            emotionalBias: { arousal: 0, valence: 0, dominance: 0 }
            lastUpdate: Date.now()
            focusHistory: []
            currentMode: STR_BROAD
            ignoreZones: new Map()
        };

        // Gestionnaires
        this.targetManager = new TargetManager(this.config);
        this.goalProcessor = new GoalProcessor(this.config);
        this.emotionalModulator = new EmotionalModulator(this.config);
        this.voiceCommandHandler = new VoiceCommandHandler(this.config);

        // Calculateurs d'attention
        this.attentionCalculator = new AttentionCalculator();
        this.saliencyModifier = new SaliencyModifier();
        this.biasGenerator = new BiasGenerator();

        // Callbacks
        this.callbacks = {
            onTargetAcquired: []
            onTargetLost: []
            onFocusChange: []
            onGoalCompleted: []
            onGoalAdded: []
        };

        // Intervalles
        this.updateInterval = null;
        this.scanningInterval = null;

        this.init();
    }

    // ========================================
    // INITIALISATION
    // ========================================

    init() {
        this.log("🎯 TopDownAttention initialisé");
        this.startUpdateLoop();
    }

    startUpdateLoop() {
        this.updateInterval = setInterval(() => {
            this.update();
        }, 1000 / this.config.updateFrequency);
    }

    // ========================================
    // TRAITEMENT PRINCIPAL
    // ========================================

    async process(goals = []) {
        const startTime = performance.now();

        try {
            // 1. Mise à jour des objectifs
            await this.updateGoals(goals);

            // 2. Traitement des cibles actives
            await this.processActiveTargets();

            // 3. Application des biais émotionnels
            const emotionalBias = this.applyEmotionalBias();

            // 4. Génération de la carte d'attention dirigée
            const attentionMap = await this.generateAttentionMap();

            // 5. Calcul des scores finaux
            const finalScores = this.calculateFinalScores(attentionMap, emotionalBias);

            const processingTime = performance.now() - startTime;

            return {
                attentionMap: finalScores
                targets: Array.from(this.state.currentTargets.values())
                goals: Array.from(this.state.activeGoals.values())
                emotionalBias
                performance: {
                    processingTime
                    targetCount: this.state.currentTargets.size
                    goalCount: this.state.activeGoals.size
                }
                timestamp: Date.now()
            };

        } catch (error) {
      // Logger fallback - ignore error
    }`, STR_ERROR);
            return this.getEmptyResult();
        }
    }

    async processActiveTargets() {
        // Traitement des cibles actives
        this.state.currentTargets.forEach((target, _) => {
            // Mise à jour de la priorité émotionnelle
            target.emotionalPriority = this.calculateEmotionalPriority(target);

            // Mise à jour du timestamp
            target.lastSeen = Date.now();
        });

        // Nettoyage des cibles expirées
        this.cleanupExpiredTargets();
    }

    // ========================================
    // GESTION DES OBJECTIFS
    // ========================================

    async updateGoals(newGoals) {
        // Nettoyage des objectifs expirés
        this.cleanupExpiredGoals();

        // Traitement des nouveaux objectifs
        for (const goal of newGoals) {
            await this.addGoal(goal);
        }

        // Mise à jour des priorités
        this.updateGoalPriorities();

        // Mise à jour du decay
        this.updateGoalDecay();
    }

    updateGoalPriorities() {
        const goals = Array.from(this.state.activeGoals.values());

        // Tri par priorité et âge
        goals.sort((a, b) => {
            const priorityDiff = b.priority - a.priority;
            if (Math.abs(priorityDiff) > 0.1) return priorityDiff;

            // Si priorités similaires, plus récent = plus important
            return b.created - a.created;
        });

        // Mise à jour des priorités normalisées
        goals.forEach((goal, index) => {
            goal.normalizedPriority = 1.0 - (index / goals.length);
        });
    }

    calculateEmotionalPriority(target) {
        const { arousal, valence, dominance } = this.state.emotionalBias;

        let emotionalPriority = target.priority;

        // Modification selon type de target et émotion
        switch (target.type) {
            case STR_FACE:
                // Visages plus importants si stress (arousal élevé)
                emotionalPriority *= (1 + arousal * 0.3);
                // Moins importants si émotion négative extrême
                if (valence < -0.7) emotionalPriority *= 0.8;
                break;

            case STR_MOTION:
                // Mouvement plus important si stress
                emotionalPriority *= (1 + arousal * 0.4);
                break;

            case STR_TEXT:
                // Texte moins prioritaire si stress élevé
                if (arousal > 0.7) emotionalPriority *= 0.7;
                break;
        }

        // Application dominance (confiance)
        emotionalPriority *= (0.8 + dominance * 0.4);

        return Math.max(0.1, Math.min(1.0, emotionalPriority));
    }

    removeOldestTarget() {
        let oldestTarget = null;
        let oldestTime = Date.now();

        this.state.currentTargets.forEach((target, _) => {
            if (target.created < oldestTime) {                oldestTarget = id;
            }
        });

        if (oldestTarget) {
            const target = this.state.currentTargets.get(oldestTarget);
            this.state.currentTargets.delete(oldestTarget);
            this.log(`🗑️ Cible la plus ancienne supprimée: ${target.type} (${oldestTarget})`);
            this.triggerCallback(STR_ONTARGETLOST, target);
        }
    }

    cleanupExpiredTargets() {
        const now = Date.now();
        const expired = [];

        this.state.currentTargets.forEach((target, id) => {
            if (now - target.created > target.lifetime) { expired.push(id);
            ; return; }
        });

        expired.forEach(id => {
            const target = this.state.currentTargets.get(id);
            this.state.currentTargets.delete(id);
            this.log(`⏰ Cible expirée: ${target.type} (${id})`);
            this.triggerCallback(STR_ONTARGETLOST, target);
        });
    }

    updateGoalDecay() {
        const now = Date.now();

        this.state.activeGoals.forEach(goal => {
            const age = (now - goal.created) / 1000; // secondes
            const decayFactor = Math.pow(this.config.goalDecay, age);

            goal.currentPriority = goal.priority * decayFactor;

            // Marquage pour suppression si trop faible
            if (goal.currentPriority < 0.1) {
                goal.status = 'decayed';
            }
        });

        // Suppression des objectifs dégradés
        const decayed = Array.from(this.state.activeGoals.entries())
            .filter(([id, goal]) => goal.status === 'decayed')
            .map(([id, goal]) => id);

        decayed.forEach(id => {
            this.state.activeGoals.delete(id);
            this.log(`📉 Objectif dégradé supprimé: ${id}`);
        });
    }

    async addGoal(goal) {
        const goalId = goal.id || this.generateGoalId();

        const processedGoal = {
            id: goalId
            type: goal.type || 'generic'
            target: goal.target
            priority: goal.priority || 0.5
            currentPriority: goal.priority || 0.5
            confidence: goal.confidence || 1.0
            emotionalWeight: goal.emotionalWeight || 0.5
            timeout: Date.now() + (goal.duration || this.config.goalTimeout)
            created: Date.now()
            status: STR_ACTIVE
        };

        this.state.activeGoals.set(goalId, processedGoal);
        this.log(`🎯 Objectif ajouté: ${goal.type} (${goalId})`);

        // Conversion en cible si nécessaire
        if (goal.target && goal.target.coordinates) {
            await this.setTarget(goal.target);
        }

        this.triggerCallback('onGoalAdded', processedGoal);
    }

    cleanupExpiredGoals() {
        const now = Date.now();
        const expired = [];

        this.state.activeGoals.forEach((goal, id) => {
            if (goal.timeout < now) { expired.push(id);
            ; return; }
        });

        expired.forEach(id => {
            const goal = this.state.activeGoals.get(id);
            this.state.activeGoals.delete(id);
            this.log(`⏰ Objectif expiré: ${goal.type} (${id})`);
            this.triggerCallback('onGoalCompleted', goal);
        });
    }

    // ========================================
    // GESTION DES CIBLES
    // ========================================

    async focusOn(target) {
        this.log(`🎯 Alex focus sur: ${JSON.stringify(target)}`);

        try {
            const processedTarget = await this.processTarget(target);
            await this.setTarget(processedTarget);

            return {
                success: true
                target: processedTarget
                message: "Focus établi avec succès"
            };

        } catch (error) {
      // Logger fallback - ignore error
    }`, STR_ERROR);
            return {
                success: false
                error: error.message
            };
        }
    }

    async setTarget(target) {
        const targetId = target.id || this.generateTargetId();

        const processedTarget = {
            id: targetId
      type: target.type || 'point'
      coordinates: target.coordinates
      size: target.size || { width: 50
      height: 50 }
      confidence: target.confidence || 1.0
      priority: target.priority || 0.7
      lifetime: target.lifetime || 10000
      // 10s par défaut
            created: Date.now()
      lastSeen: Date.now()
      trackingData: target.trackingData || {}
        };

        // Limitation du nombre de cibles
        if (this.state.currentTargets.size >= this.config.maxConcurrentTargets) {
            this.removeOldestTarget();
        }

        this.state.currentTargets.set(targetId, processedTarget);
        this.log(`🎯 Cible définie: ${target.type} à (${target.coordinates.x}, ${target.coordinates.y})`);

        this.triggerCallback('onTargetAcquired', processedTarget);

        return processedTarget;
    }

    async processTarget(target) {
        // Validation des coordonnées
        if (!target.coordinates || typeof target.coordinates.x !== 'number' || typeof target.coordinates.y !== 'number') {
            throw new Error("Coordonnées cible invalides");
        }

        // Traitement selon le type
        switch (target.type) {
            case STR_FACE:
                return this.processFaceTarget(target);
            case 'object':
                return this.processObjectTarget(target);
            case STR_TEXT:
                return this.processTextTarget(target);
            case STR_MOTION:
                return this.processMotionTarget(target);
            default:
                return this.processGenericTarget(target);
        }
    }

    processFaceTarget(target) {
        return {
            ...target
            priority: target.priority || 0.9, // Visages = haute priorité
            emotionalWeight: 0.8
            trackingMode: 'continuous'
        };
    }

    processObjectTarget(target) {
        return {
            ...target
            priority: target.priority || 0.6
            emotionalWeight: 0.4
            trackingMode: 'adaptive'
        };
    }

    processTextTarget(target) {
        return {
            ...target
            priority: target.priority || 0.7, // Texte = importante pour lecture
            emotionalWeight: 0.3
            trackingMode: 'linear'
            scanPattern: 'left-to-right'
        };
    }

    processMotionTarget(target) {
        return {
            ...target
            priority: target.priority || 0.8, // Mouvement = attention automatique
            emotionalWeight: 0.6
            trackingMode: 'predictive'
            velocity: target.velocity || { x: 0, y: 0 }
        };
    }

    processGenericTarget(target) {
        return {
            ...target
            priority: target.priority || 0.5
            emotionalWeight: 0.4
            trackingMode: 'static'
        };
    }

    // ========================================
    // MODULATION ÉMOTIONNELLE
    // ========================================

    updateEmotionalFocus(emotionalState) {
        this.state.emotionalBias = {
            arousal: emotionalState.arousal || 0
            valence: emotionalState.valence || 0
            dominance: emotionalState.dominance || 0
        };

        this.log(`🎭 Biais émotionnel mis à jour: A:${emotionalState.arousal?.toFixed(2)}, V:${emotionalState.valence?.toFixed(2)}, D:${emotionalState.dominance?
      .toFixed(2)}`);

        // Adaptation des cibles selon l'émotion
        this.adaptTargetsToEmotion();
    }

    applyEmotionalBias() {
        const { arousal, valence, dominance } = this.state.emotionalBias;

        // Calcul des modificateurs émotionnels
        const focusModifier = this.calculateFocusModifier(arousal, valence);
        const scopeModifier = this.calculateScopeModifier(arousal);
        const priorityModifier = this.calculatePriorityModifier(valence, dominance);

        return {
            focus :
       focusModifier
            scope: scopeModifier
            priority: priorityModifier
            emotional: { arousal, valence, dominance }
        };
    }

    calculateFocusModifier(arousal, valence) {
        // Arousal élevé = focus plus étroit et intense
        // Valence positive = focus plus stable
        const intensity = 0.5 + (arousal * 0.4);
        const stability = 0.5 + (valence * 0.3);

        return {
            intensity: Math.max(0.1, Math.min(1.0, intensity))
            stability: Math.max(0.1, Math.min(1.0, stability))
        };
    }

    calculateScopeModifier(arousal) {
        // Arousal élevé = scope plus étroit (tunnel vision)
        // Arousal faible = scope plus large
        return {
            width: Math.max(0.3, 1.0 - arousal * 0.4)
            sensitivity: Math.max(0.5, arousal * 0.8)
        };
    }

    calculatePriorityModifier(valence, dominance) {
        // Valence positive + dominance élevée = boost priorités positives
        // Valence négative = boost priorités sécurité/survie
        return {
            positive: Math.max(0.5, 0.7 + valence * 0.6)
            negative: Math.max(0.5, 0.7 - valence * 0.4)
            confidence: Math.max(0.3, 0.5 + dominance * 0.7)
        };
    }

    adaptTargetsToEmotion() {
        this.state.currentTargets.forEach((target, _) => {
            // Adaptation de la priorité selon l'émotion
            const emotionalPriority = this.calculateEmotionalPriority(target);
            target.emotionalPriority = emotionalPriority;

            // Adaptation de la durée de vie
            if (this.state.emotionalBias.arousal > 0.7) {
                target.lifetime *= 0.8; // Réduction si stress élevé
            }
        });
    }

    // ========================================
    // GÉNÉRATION CARTE D'ATTENTION
    // ========================================

    async generateAttentionMap() {
        const mapWidth = 1920; // Par défaut, ajustable
        const mapHeight = 1080;

        // Initialisation de la carte
        const attentionMap = new Float32Array(mapWidth * mapHeight);

        // Application de chaque cible
        this.state.currentTargets.forEach(target => {
            this.applyTargetToMap(attentionMap, target, mapWidth, mapHeight);
        });

        // Application des objectifs globaux
        this.state.activeGoals.forEach(goal => {
            this.applyGoalToMap(attentionMap, goal, mapWidth, mapHeight);
        });

        // Normalisation
        this.normalizeAttentionMap(attentionMap);

        return {
            data: attentionMap
            width: mapWidth
            height: mapHeight
            targets: Array.from(this.state.currentTargets.values())
            timestamp: Date.now()
        };
    }

    applyTargetToMap(map, target, width, height) {
        const { x, y } = target.coordinates;
        const radius = Math.max(target.size.width, target.size.height) / 2;
        const strength = target.priority * target.confidence;

        // Application d'un gradient gaussien autour de la cible
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const pixelX = Math.round(x + dx);
                const pixelY = Math.round(y + dy);

                if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const influence = strength * Math.exp(-(distance * distance) / (2 * radius * radius));

                    const index = pixelY * width + pixelX;
                    map[index] = Math.max(map[index], influence);
                }
            }
        }
    }

    applyGoalToMap(map, goal, width, height) {
        if (!goal.target || !goal.target.coordinates) return;

        const { x, y } = goal.target.coordinates;
        const radius = goal.target.size ? Math.max(goal.target.size.width, goal.target.size.height) / 2 : 75;
        const strength = (goal.currentPriority || goal.priority) * 0.8; // Goals moins intenses que targets directs

        // Application d'influence graduelle
        for (let dy = -radius * 1.5; dy <= radius * 1.5; dy++) {
            for (let dx = -radius * 1.5; dx <= radius * 1.5; dx++) {
                const pixelX = Math.round(x + dx);
                const pixelY = Math.round(y + dy);

                if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const influence = strength * Math.exp(-(distance * distance) / (2 * radius * radius));

                    const index = pixelY * width + pixelX;
                    map[index] = Math.max(map[index], influence * 0.7); // Goals = 70% de l'influence des targets
                }
            }
        }
    }

    normalizeAttentionMap(map) {
        // Trouve la valeur max
        let maxValue = 0;
        for (let i = 0; i < map.length; i++) {
            if (map[i] > maxValue) maxValue = map[i];
        }

        // Normalisation si nécessaire
        if (maxValue > 1.0) {
            for (let i = 0; i < map.length; i++) {
                map[i] /= maxValue;
            }
        }

        // Application d'un seuil minimum
        const threshold = 0.05;
        for (let i = 0; i < map.length; i++) {
            if (map[i] < threshold) map[i] = 0;
        }
    }

    calculateFinalScores(attentionMap, emotionalBias) {
        // Application des modificateurs émotionnels
        const modifiedMap = new Float32Array(attentionMap.data.length);

        for (let i = 0; i < attentionMap.data.length; i++) {
            let score = attentionMap.data[i];

            // Application biais émotionnel
            score *= emotionalBias.focus.intensity;

            // Application stabilité
            if (this.hasRecentFocus(i)) {
                score *= emotionalBias.focus.stability;
            }

            modifiedMap[i] = Math.max(0, Math.min(1, score));
        }

        return {
            ...attentionMap
            data: modifiedMap
            emotionalBias
        };
    }

    hasRecentFocus(pixelIndex) {
        const now = Date.now();
        const recentThreshold = 2000; // 2 secondes

        return this.state.focusHistory.some(focus => {
            if (now - focus.timestamp > recentThreshold) return false;

            // Vérification proximité spatiale
            const distance = Math.abs(focus.pixelIndex - pixelIndex);
            return distance < 100; // pixels proches
        });
    }

    updateFocusHistory() {
        const now = Date.now();
        const maxHistoryAge = 10000; // 10 secondes

        // Nettoyage historique ancien
        this.state.focusHistory = this.state.focusHistory.filter(
            focus => now - focus.timestamp < maxHistoryAge
        );

        // Ajout focus actuels
        this.state.currentTargets.forEach(target => {
            const x = Math.round(target.coordinates.x);
            const y = Math.round(target.coordinates.y);
            const pixelIndex = y * 1920 + x; // Assuming 1920 width

            this.state.focusHistory.push({
                pixelIndex
                targetId: target.id
                timestamp: now
                intensity: target.priority * target.confidence
            });
        });

        // Limitation taille historique
        if (this.state.focusHistory.length > 1000) {
            this.state.focusHistory = this.state.focusHistory.slice(-500);
        }
    }

    // ========================================
    // COMMANDES VOCALES
    // ========================================

    async handleVoiceCommand(command) {
        this.log(`🗣️ Commande vocale: ${command.type}`);

        try {
            switch (command.type) {
                case 'FOCUS_ON':
                    return await this.focusOn(command.target);

                case 'LOOK_AT':
                    return await this.lookAt(command.coordinates);

                case 'IGNORE':
                    return await this.addIgnoreZone(command.area);

                case 'CLEAR_FOCUS':
                    return this.clearAllTargets();

                case 'SET_MODE':
                    return this.setAttentionMode(command.mode);

                default:
                    throw new Error(`Commande inconnue: ${command.type}`);
            }

        } catch (error) {
      // Logger fallback - ignore error
    }`, STR_ERROR);
            return { success: false, error: error.message };
        }
    }

    async lookAt(coordinates) {
        const target = {
            type: 'voice_target'
            coordinates
            priority: this.config.voiceCommandPriority
            confidence: 1.0
            lifetime: 5000 // 5 secondes
        };

        return await this.setTarget(target);
    }

    setAttentionMode(mode) {
        const validModes = ['focused', STR_BROAD, STR_SCANNING, 'tracking', 'relaxed'];

        if (!validModes.includes(mode)) {
            throw new Error(`Mode d'attention invalide: ${mode}`);
        }

        this.state.currentMode = mode;

        // Adaptation de la configuration selon le mode
        switch (mode) {
            case 'focused':
                this.config.focusStrength = 0.9;
                this.config.maxConcurrentTargets = 1;
                this.log("🎯 Mode FOCUSED activé - Attention laser");
                break;

            case STR_BROAD:
                this.config.focusStrength = 0.5;
                this.config.maxConcurrentTargets = 5;
                this.log("👁️ Mode BROAD activé - Vision périphérique");
                break;

            case STR_SCANNING:
                this.config.focusStrength = 0.7;
                this.config.maxConcurrentTargets = 3;
                this.startScanningPattern();
                this.log("🔍 Mode SCANNING activé - Balayage systématique");
                break;

            case 'tracking':
                this.config.focusStrength = 0.8;
                this.config.maxConcurrentTargets = 2;
                this.log("📍 Mode TRACKING activé - Suivi continu");
                break;

            case 'relaxed':
                this.config.focusStrength = 0.3;
                this.config.maxConcurrentTargets = 4;
                this.log("😌 Mode RELAXED activé - Attention détendue");
                break;
        }

        return {
            success: true
            mode: mode
            message: `Mode d'attention changé vers ${mode}`
        };
    }

    async addIgnoreZone(area) {
        const ignoreZone = {
            id: this.generateZoneId()
            area: area
            created: Date.now()
            lifetime: area.duration || 5000, // 5s par défaut
            strength: area.strength || 1.0
        };

        this.state.ignoreZones.set(ignoreZone.id, ignoreZone);
        this.log(`🚫 Zone d'ignore ajoutée: ${ignoreZone.id}`);

        return {
            success: true
            zoneId: ignoreZone.id
            message: "Zone d'ignore créée"
        };
    }

    startScanningPattern() {
        if (this.scanningInterval) {
            clearInterval(this.scanningInterval);
        }

        let scanX = 0;
        let scanY = 0;
        const stepSize = 200;

        this.scanningInterval = setInterval(() => {
            // Pattern de balayage en zigzag
            const target = {
                type: 'scan_point'
                coordinates: { x: scanX, y: scanY }
                priority: 0.4
                lifetime: 1000
            };

            this.setTarget(target);

            // Mise à jour position scan
            scanX += stepSize;
            if (scanX > 1920) {                scanY += stepSize;
                if (scanY > 1080) {                }
            }
        }, 500); // Nouveau point toutes les 500ms
    }

    // ========================================
    // GESTION ÉTAT
    // ========================================

    update() {
        // Mise à jour périodique
        this.updateTargetLifetimes();
        this.updateGoalDecay();
        this.updateFocusHistory();
        this.cleanupExpiredTargets();

        this.state.lastUpdate = Date.now();
    }

    updateTargetLifetimes() {
        const now = Date.now();
        const toRemove = [];

        this.state.currentTargets.forEach((target, id) => {
            if (now - target.created > target.lifetime) { toRemove.push(id);
            ; return; }
        });

        toRemove.forEach(id => {
            const target = this.state.currentTargets.get(id);
            this.state.currentTargets.delete(id);
            this.log(`⏰ Cible expirée: ${target.type} (${id})`);
            this.triggerCallback(STR_ONTARGETLOST, target);
        });
    }

    clearAllTargets() {
        const count = this.state.currentTargets.size;
        this.state.currentTargets.clear();
        this.log(`🧹 ${count} cibles supprimées`);

        return {
            success: true
            message: `${count} cibles supprimées`
        };
    }

    // ========================================
    // API PUBLIQUE
    // ========================================

    getCurrentTargets() {
        return Array.from(this.state.currentTargets.values());
    }

    getActiveGoals() {
        return Array.from(this.state.activeGoals.values());
    }

    getStatus() {
        return {
            name: this.name
            version: this.version
            status: this.status
            targets: this.state.currentTargets.size
            goals: this.state.activeGoals.size
            emotionalBias: this.state.emotionalBias
            lastUpdate: this.state.lastUpdate
            mode: this.state.currentMode
        };
    }

    // ========================================
    // CALLBACKS
    // ========================================

    onTargetAcquired(callback) {
        this.callbacks.onTargetAcquired.push(callback);
    }

    onTargetLost(callback) {
        this.callbacks.onTargetLost.push(callback);
    }

    onFocusChange(callback) {
        this.callbacks.onFocusChange.push(callback);
    }

    onGoalCompleted(callback) {
        this.callbacks.onGoalCompleted.push(callback);
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

    // ========================================
    // MÉTRIQUES ET STATISTIQUES
    // ========================================

    countCompletedGoals() {
        // Cette méthode nécessiterait un historique des goals complétés
        // Pour l'instant, on compte ceux qui ont été supprimés par decay
        return 0; // Placeholder
    }

    calculateAvgGoalDuration() {
        if (this.state.activeGoals.size === 0) return 0;

        const now = Date.now();
        let totalDuration = 0;

        this.state.activeGoals.forEach(goal => {
            totalDuration += (now - goal.created);
        });

        return totalDuration / this.state.activeGoals.size;
    }

    getAvgProcessingTime() {
        // Cette méthode nécessiterait un tracking des temps de traitement
        // Pour l'instant, estimation basée sur la complexité
        const complexity = this.state.currentTargets.size + this.state.activeGoals.size;
        return Math.min(complexity * 0.5, 16.67); // Max 16.67ms pour 60fps
    }

    countEmotionalAdaptations() {
        // Count des adaptations émotionnelles récentes
        return this.emotionalModulator.modulationHistory.length;
    }

    getDetailedStats() {
        return {
            basic: this.getStatus()
            targets: {
                count: this.state.currentTargets.size
                types: this.getTargetTypeDistribution()
                avgLifetime: this.calculateAvgTargetLifetime()
                avgPriority: this.calculateAvgPriority()
            }
            goals: {
                count: this.state.activeGoals.size
                completed: this.countCompletedGoals()
                avgDuration: this.calculateAvgGoalDuration()
            }
            performance: {
                focusHistory: this.state.focusHistory.length
                memoryUsage: this.estimateMemoryUsage()
                processingTime: this.getAvgProcessingTime()
            }
            emotional: {
                currentBias: this.state.emotionalBias
                trend: this.emotionalModulator.getEmotionalTrend()
                adaptations: this.countEmotionalAdaptations()
            }
        };
    }

    getTargetTypeDistribution() {
        const distribution = {};
        this.state.currentTargets.forEach(target => {
            distribution[target.type] = (distribution[target.type] || 0) + 1;
        });
        return distribution;
    }

    calculateAvgTargetLifetime() {
        if (this.state.currentTargets.size === 0) return 0;

        const now = Date.now();
        let totalLifetime = 0;

        this.state.currentTargets.forEach(target => {
            totalLifetime += (now - target.created);
        });

        return totalLifetime / this.state.currentTargets.size;
    }

    calculateAvgPriority() {
        if (this.state.currentTargets.size === 0) return 0;

        let totalPriority = 0;
        this.state.currentTargets.forEach(target => {
            totalPriority += target.priority;
        });

        return totalPriority / this.state.currentTargets.size;
    }

    estimateMemoryUsage() {
        // Estimation approximative de l'usage mémoire
        const targetSize = 200; // bytes par target approximatif
        const goalSize = 150; // bytes par goal approximatif
        const historySize = 50; // bytes par entrée d'historique

        return (this.state.currentTargets.size * targetSize)
            (this.state.activeGoals.size * goalSize)
            (this.state.focusHistory.length * historySize);
    }

    // ========================================
    // SAUVEGARDE ET RESTAURATION
    // ========================================

    saveState() {
        return {
            version: this.version
            timestamp: Date.now()
            config: { ...this.config }
            targets: Array.from(this.state.currentTargets.entries())
            goals: Array.from(this.state.activeGoals.entries())
            emotionalBias: { ...this.state.emotionalBias }
            focusHistory: [...this.state.focusHistory]
            mode: this.state.currentMode
        };
    }

    restoreState(savedState) {
        if (savedState.version !== this.version) {
            this.log(`⚠️ Version différente: ${savedState.version} vs ${this.version}`, 'warn');
        }

        try {
            // Restauration de la config
            this.config = { ...this.config, ...savedState.config };

            // Restauration des targets
            this.state.currentTargets.clear();
            savedState.targets.forEach((_, _) => {
                this.state.currentTargets.set(id, target);
            });

            // Restauration des goals
            this.state.activeGoals.clear();
            savedState.goals.forEach((_, _) => {
                this.state.activeGoals.set(id, goal);
            });

            // Restauration autres états
            this.state.emotionalBias = savedState.emotionalBias || { arousal: 0, valence: 0, dominance: 0 };
            this.state.focusHistory = savedState.focusHistory || [];
            this.state.currentMode = savedState.mode || STR_BROAD;

            this.log("✅ État restauré avec succès");
            return { success: true };

        } catch (error) {
      // Logger fallback - ignore error
    }`, STR_ERROR);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // UTILITAIRES
    // ========================================

    generateTargetId() {
        return `target_${Date.now()}_${(crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF).toString(36).substr(2, 9)}`;
    }

    generateGoalId() {
        return `goal_${Date.now()}_${(crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF).toString(36).substr(2, 9)}`;
    }

    generateZoneId() {
        return `zone_${Date.now()}_${(crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF).toString(36).substr(2, 9)}`;
    }

    getEmptyResult() {
        return {
            attentionMap: null
            targets: []
            goals: []
            emotionalBias: this.state.emotionalBias
            performance: { error: true }
            timestamp: Date.now()
        };
    }

    log(message, level = 'info') {
        if (this.config.enableLogging) {
            const timestamp = new Date().toISOString();
            logger.info(`[${timestamp}] [TopDownAttention] [${level.toUpperCase()}] ${message}`);
        }
    }

    // ========================================
    // CLEANUP
    // ========================================

    destroy() {
        // Arrêt des intervalles
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        if (this.scanningInterval) {
            clearInterval(this.scanningInterval);
        }

        // Nettoyage des états
        this.state.currentTargets.clear();
        this.state.activeGoals.clear();
        this.state.focusHistory = [];

        if (this.state.ignoreZones) {
            this.state.ignoreZones.clear();
        }

        // Nettoyage des callbacks
        Object.keys(this.callbacks).forEach(key => {
            this.callbacks[key] = [];
        });

        // Nettoyage des gestionnaires
        if (this.targetManager && this.targetManager.destroy) {
            this.targetManager.destroy();
        }

        if (this.attentionCalculator && this.attentionCalculator.cleanupCache) {
            this.attentionCalculator.cleanupCache();
        }

        this.status = "destroyed";
        this.log("🗑️ TopDownAttention détruit");
    }
}

// ============================================================================
// CLASSES AUXILIAIRES
// ============================================================================

class TargetManager {
    constructor(config) {
        this.config = config;
        this.targetPool = new Map();
        this.activeTargets = new Set();
    }

    createTarget(data) {
        const target = {
            id: this.generateId()
            ...data
            created: Date.now()
            lastUpdate: Date.now()
            status: STR_ACTIVE
        };

        this.targetPool.set(target.id, target);
        this.activeTargets.add(target.id);

        return target;
    }

    updateTarget(id, updates) {
        const target = this.targetPool.get(id);
        if (target) {
            Object.assign(target, updates);
            target.lastUpdate = Date.now();
        }
        return target;
    }

    removeTarget(id) {
        const target = this.targetPool.get(id);
        this.targetPool.delete(id);
        this.activeTargets.delete(id);
        return target;
    }

    destroy() {
        this.targetPool.clear();
        this.activeTargets.clear();
    }

    generateId() {
        return `tm_${Date.now()}_${(crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF).toString(36).substr(2, 6)}`;
    }
}

class GoalProcessor {
    constructor(config) {
        this.config = config;
        this.goalQueue = [];
        this.processingGoals = new Map();
    }

    addGoal(goal) {
        const processedGoal = {
            id: this.generateId()
            ...goal
            priority: this.calculatePriority(goal)
            status: 'queued'
            created: Date.now()
        };

        this.goalQueue.push(processedGoal);
        this.goalQueue.sort((a, b) => b.priority - a.priority);

        return processedGoal;
    }

    processNextGoal() {
        if (this.goalQueue.length === 0) return null;

        const goal = this.goalQueue.shift();
        goal.status = 'processing';
        goal.startTime = Date.now();

        this.processingGoals.set(goal.id, goal);
        return goal;
    }

    completeGoal(id, result) {
        const goal = this.processingGoals.get(id);
        if (goal) {
            goal.status = 'completed';
            goal.result = result;
            goal.completedAt = Date.now();
            this.processingGoals.delete(id);
        }
        return goal;
    }

    calculatePriority(goal) {
        let priority = goal.priority || 0.5;

        // Boost pour certains types
        if (goal.type === 'safety') priority += 0.3;
        if (goal.type === 'user_command') priority += 0.2;
        if (goal.type === 'emotional') priority += goal.emotionalIntensity * 0.2;

        return Math.max(0, Math.min(1, priority));
    }

    generateId() {
        return `gp_${Date.now()}_${(crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF).toString(36).substr(2, 6)}`;
    }
}

class EmotionalModulator {
    constructor(config) {
        this.config = config;
        this.emotionalState = { arousal: 0, valence: 0, dominance: 0 };
        this.modulationHistory = [];
    }

    updateEmotionalState(newState) {
        this.emotionalState = { ...newState };
        this.modulationHistory.push({
            state: { ...newState }
            timestamp: Date.now()
        });

        // Limitation historique
        if (this.modulationHistory.length > 100) {
            this.modulationHistory = this.modulationHistory.slice(-50);
        }
    }

    modulateAttention(baseAttention) {
        const { arousal, valence, dominance } = this.emotionalState;

        const modulated = { ...baseAttention };

        // Modulation intensité selon arousal
        modulated.intensity *= (0.7 + arousal * 0.6);

        // Modulation stabilité selon valence
        modulated.stability *= (0.8 + Math.abs(valence) * 0.4);

        // Modulation confiance selon dominance
        modulated.confidence *= (0.6 + dominance * 0.8);

        return modulated;
    }

    getEmotionalTrend() {
        if (this.modulationHistory.length < 3) return 'stable';

        const recent = this.modulationHistory.slice(-3);
        const arousalTrend = recent[2].state.arousal - recent[0].state.arousal;

        if (arousalTrend > 0.2) return 'increasing';
        if (arousalTrend < -0.2) return 'decreasing';
        return 'stable';
    }
}

class VoiceCommandHandler {
    constructor(config) {
        this.config = config;
        this.commandHistory = [];
        this.activeCommands = new Map();
    }

    parseCommand(rawCommand) {
        const command = {
            id: this.generateId()
            raw: rawCommand
            timestamp: Date.now()
            confidence: 0.8
        };

        // Parsing simple des commandes
        const text = rawCommand.toLowerCase();

        if (text.includes('regarde') || text.includes('focus')) {
            command.type = 'FOCUS_ON';
            command.target = this.extractTarget(text);
        } else if (text.includes('ignore') || text.includes('évite')) {
            command.type = 'IGNORE';
            command.area = this.extractArea(text);
        } else if (text.includes('cherche') || text.includes('scan')) {
            command.type = 'SET_MODE';
            command.mode = STR_SCANNING;
        } else if (text.includes('arrête') || text.includes('stop')) {
            command.type = 'CLEAR_FOCUS';
        } else {
            command.type = 'UNKNOWN';
            command.confidence = 0.3;
        }

        this.commandHistory.push(command);
        return command;
    }

    extractTarget(text) {
        // Extraction simple de cible
        if (text.includes('visage') || text.includes(STR_FACE)) {
            return { type: STR_FACE, priority: 0.9 };
        }
        if (text.includes('mouvement') || text.includes('bouge')) {
            return { type: STR_MOTION, priority: 0.8 };
        }
        if (text.includes('texte') || text.includes('écrit')) {
            return { type: STR_TEXT, priority: 0.7 };
        }

        return { type: 'generic', priority: 0.5 };
    }

    extractArea(text) {
        // Extraction simple de zone
        const area = { x: 0, y: 0, width: 100, height: 100 };

        if (text.includes('gauche')) area.x = 0;
        if (text.includes('droite')) area.x = 1920 - 100;
        if (text.includes('haut')) area.y = 0;
        if (text.includes('bas')) area.y = 1080 - 100;
        if (text.includes('centre')) {
            area.x = 960 - 50;
            area.y = 540 - 50;
        }

        return area;
    }

    generateId() {
        return `vc_${Date.now()}_${(crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF).toString(36).substr(2, 6)}`;
    }
}

class AttentionCalculator {
    constructor() {
        this.calculationCache = new Map();
        this.lastCacheCleanup = Date.now();
    }

    calculateAttentionScore(target, context) {
        const cacheKey = this.generateCacheKey(target, context);

        // Vérification cache
        if (this.calculationCache.has(cacheKey)) {
            const cached = this.calculationCache.get(cacheKey);
            if (Date.now() - cached.timestamp < 1000) { // Cache 1s
                return cached.score;
            }
        }

        // Calcul du score
        let score = target.priority || 0.5;

        // Facteurs contextuels
        score *= (context.visibility || 1.0);
        score *= (context.relevance || 1.0);
        score *= (target.confidence || 1.0);

        // Application decay temporel
        const age = (Date.now() - target.created) / 1000;
        const decayFactor = Math.exp(-age / 30); // Decay sur 30s
        score *= decayFactor;

        // Cache du résultat
        this.calculationCache.set(cacheKey, {
            score: Math.max(0, Math.min(1, score))
            timestamp: Date.now()
        });

        // Nettoyage cache périodique
        if (Date.now() - this.lastCacheCleanup > 5000) {
            this.cleanupCache();
        }

        return score;
    }

    generateCacheKey(target, context) {
        return `${target.id}_${target.lastUpdate}_${context.timestamp || Date.now()}`;
    }

    cleanupCache() {
        const now = Date.now();
        const expiredKeys = [];

        this.calculationCache.forEach((value, key) => {
            if (now - value.timestamp > 5000) { expiredKeys.push(key);
            ; return; }
        });

        expiredKeys.forEach(key => this.calculationCache.delete(key));
        this.lastCacheCleanup = now;
    }
}

class SaliencyModifier {
    constructor() {
        this.modifiers = new Map();
        this.globalModifier = 1.0;
    }

    addModifier(id, modifier) {
        this.modifiers.set(id, {
            ...modifier
            created: Date.now()
            id
        });
    }

    removeModifier(id) {
        return this.modifiers.delete(id);
    }

    applySaliencyModification(saliencyMap, context) {
        const modifiedMap = new Float32Array(saliencyMap.length);

        // Copie de base
        for (let i = 0; i < saliencyMap.length; i++) {
            modifiedMap[i] = saliencyMap[i];
        }

        // Application des modificateurs
        this.modifiers.forEach(modifier => {
            if (this.isModifierActive(modifier, context)) {
                this.applyModifier(modifiedMap, modifier, context);
            }
        });

        // Application modificateur global
        for (let i = 0; i < modifiedMap.length; i++) {
            modifiedMap[i] *= this.globalModifier;
            modifiedMap[i] = Math.max(0, Math.min(1, modifiedMap[i]));
        }

        return modifiedMap;
    }

    isModifierActive(modifier, context) {
        if (modifier.conditions) {
            return modifier.conditions.every(condition =>
                this.evaluateCondition(condition, context)
            );
        }
        return true;
    }

    applyModifier(map, modifier, context) {
        const { type, strength, area } = modifier;

        switch (type) {
            case 'boost':
                this.applyBoost(map, area, strength);
                break;
            case 'suppress':
                this.applySuppress(map, area, strength);
                break;
            case 'blur':
                this.applyBlur(map, area, strength);
                break;
            case 'sharpen':
                this.applySharpen(map, area, strength);
                break;
        }
    }

    applyBoost(map, area, strength) {
        if (!area) return;

        for (let y = area.y; y < area.y + area.height && y < 1080; y++) {
            for (let x = area.x; x < area.x + area.width && x < 1920; x++) {
                const index = y * 1920 + x;
                if (index >= 0 && index < map.length) {
                    map[index] *= (1 + strength);
                }
            }
        }
    }

    applySuppress(map, area, strength) {
        if (!area) return;

        for (let y = area.y; y < area.y + area.height && y < 1080; y++) {
            for (let x = area.x; x < area.x + area.width && x < 1920; x++) {
                const index = y * 1920 + x;
                if (index >= 0 && index < map.length) {
                    map[index] *= (1 - strength);
                }
            }
        }
    }

    applyBlur(map, area, strength) {
        // Implémentation simplifiée du flou
        if (!area) return;
        // Placeholder pour effet de flou
    }

    applySharpen(map, area, strength) {
        // Implémentation simplifiée de l'accentuation
        if (!area) return;
        // Placeholder pour effet d'accentuation
    }

    evaluateCondition(condition, context) {
        // Évaluation simple des conditions
        return true; // Placeholder
    }
}

class BiasGenerator {
    constructor() {
        this.biases = new Map();
        this.activeBiases = new Set();
    }

    generateBias(type, parameters) {
        const bias = {
            id: this.generateId()
            type
            parameters
            created: Date.now()
            strength: parameters.strength || 1.0
            duration: parameters.duration || 5000
        };

        this.biases.set(bias.id, bias);
        this.activeBiases.add(bias.id);

        return bias;
    }

    updateBiases(context) {
        const now = Date.now();
        const expired = [];

        this.activeBiases.forEach(id => {
            const bias = this.biases.get(id);
            if (bias && now - bias.created > bias.duration) {
                expired.push(id);
            }
        });

        expired.forEach(id => {
            this.activeBiases.delete(id);
            this.biases.delete(id);
        });
    }

    applyBiases(attentionMap, context) {
        const biasedMap = new Float32Array(attentionMap.length);

        // Copie de base
        for (let i = 0; i < attentionMap.length; i++) {
            biasedMap[i] = attentionMap[i];
        }

        // Application des biais actifs
        this.activeBiases.forEach(id => {
            const bias = this.biases.get(id);
            if (bias) {
                this.applyBias(biasedMap, bias, context);
            }
        });

        return biasedMap;
    }

    applyBias(map, bias, context) {
        switch (bias.type) {
            case 'center':
                this.applyCenterBias(map, bias.strength);
                break;
            case 'edge':
                this.applyEdgeBias(map, bias.strength);
                break;
            case 'emotional':
                this.applyEmotionalBias(map, bias, context);
                break;
            case 'contextual':
                this.applyContextualBias(map, bias, context);
                break;
        }
    }

    applyCenterBias(map, strength) {
        const centerX = 1920 / 2;
        const centerY = 1080 / 2;
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

        for (let y = 0; y < 1080; y++) {
            for (let x = 0; x < 1920; x++) {
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const bias = (1 - distance / maxDistance) * strength;

                const index = y * 1920 + x;
                map[index] *= (1 + bias);
            }
        }
    }

    applyEdgeBias(map, strength) {
        const edgeThreshold = 100; // pixels du bord

        for (let y = 0; y < 1080; y++) {
            for (let x = 0; x < 1920; x++) {
                const distanceToEdge = Math.min(x, y, 1920 - x, 1080 - y);

                if (distanceToEdge < edgeThreshold) {
                    const bias = (1 - distanceToEdge / edgeThreshold) * strength;
                    const index = y * 1920 + x;
                    map[index] *= (1 + bias);
                }
            }
        }
    }

    applyEmotionalBias(map, bias, context) {
        // Placeholder pour biais émotionnel
        const emotional = context.emotional || { arousal: 0, valence: 0, dominance: 0 };
        // Application du biais basé sur l'état émotionnel
    }

    applyContextualBias(map, bias, context) {
        // Placeholder pour biais contextuel
        // Application du biais basé sur le contexte
    }

    generateId() {
        return `bias_${Date.now()}_${(crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF).toString(36).substr(2, 6)}`;
    }
}

// Export par défaut