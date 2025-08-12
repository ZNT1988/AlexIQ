
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ERROR = 'error';

const logger = {
  info: (msg) => console.log(`[${new Date().toISOString()}] INFO: ${msg}')
  warn: (msg) => console.warn('[${new Date().toISOString()}] WARN: ${msg}')
  error: (msg) => console.error('[${new Date().toISOString()}] ERROR: ${msg}')
  debug: (msg) => console.debug('[${new Date().toISOString()}] DEBUG: ${msg}`)
};

const crypto = require('crypto');
// ============================================================================
// ALEX ATTENTION SYSTEM - EYE TRACKING MODULE
// EyeTracking.js - Suivi visuel des objets et simulation saccades
// Version: 4.5.0 | Compatible AlexAttentionMasterIntegration
// ============================================================================

    constructor(config = {}) {
        this.name = "EyeTracking";
        this.version = "4.5.0";
        this.status = "active";

        // Configuration
        this.config = {
            // Paramètres de tracking
            trackingAccuracy: config.trackingAccuracy || 0.95
      predictionHorizon: config.predictionHorizon || 1000
      // 1s
            maxTrackingTargets: config.maxTrackingTargets || 5
      trackingTimeout: config.trackingTimeout || 5000
      // 5s

            // Saccades oculaires
            saccadeVelocity: config.saccadeVelocity || 500
      // deg/s
            saccadeDuration: config.saccadeDuration || 50
      // ms
            intersaccadeInterval: config.intersaccadeInterval || 200
      // ms
            smoothPursuitGain: config.smoothPursuitGain || 0.9
      // Prédiction de mouvement
            predictionAlgorithm: config.predictionAlgorithm || STR_KALMAN
      // kalman
      linear
      polynomial
            velocitySmoothing: config.velocitySmoothing || 0.8
      accelerationWeight: config.accelerationWeight || 0.3
      // Filtres et correction
            positionSmoothing: config.positionSmoothing || 0.7
      noiseThreshold: config.noiseThreshold || 2.0
      // pixels
            outlierDetection: config.outlierDetection || true
      // Performance
            updateFrequency: config.updateFrequency || 120
      // Hz
            historyLength: config.historyLength || 100
      // Simulation vs Réel
            simulationMode: config.simulationMode || true
      hardwareInterface: config.hardwareInterface || null
      // Debug
            enableLogging: config.enableLogging || false
      visualizeTracking: config.visualizeTracking || false
        };

        // État du système
        this.state = {
            currentGaze: { x: 960, y: 540 }, // Centre écran par défaut
            gazeHistory: []
            trackedObjects: new Map()
            activeTargets: new Set()
            saccadeState: STR_FIXATION, // fixation, saccade, pursuit
            lastSaccade: Date.now()
            totalSaccades: 0
        };

        // Gestionnaires
        this.objectTracker = new ObjectTracker(this.config);
        this.saccadeController = new SaccadeController(this.config);
        this.motionPredictor = new MotionPredictor(this.config);
        this.gazeEstimator = new GazeEstimator(this.config);

        // Calculateurs spécialisés
        this.kalmanFilter = new KalmanFilter();
        this.velocityCalculator = new VelocityCalculator();
        this.trajectoryAnalyzer = new TrajectoryAnalyzer();
        this.smoothingFilter = new SmoothingFilter(this.config);

        // Callbacks
        this.callbacks = {
            onGazeMove: []
            onSaccadeStart: []
            onSaccadeEnd: []
            onTargetAcquired: []
            onTargetLost: []
            onPredictionUpdate: []
        };

        this.init();
    }

    // ========================================
    // INITIALISATION
    // ========================================

    init() {
        this.log("👁️ EyeTracking initialisé");
        this.startUpdateLoop();
        this.initializeFilters();

        if (!this.config.simulationMode && this.config.hardwareInterface) {
            this.initializeHardware();
        }
    }

    startUpdateLoop() {
        this.updateInterval = setInterval(() => {
            this.update();
        }, 1000 / this.config.updateFrequency);
    }

    initializeFilters() {
        // Configuration des filtres de Kalman pour chaque objet
        this.kalmanFilter.configure({
            processNoise: 0.1
            measurementNoise: 1.0
            initialErrorCovariance: 100
        });

        // Configuration du lissage
        this.smoothingFilter.configure({
            alpha: this.config.positionSmoothing
            velocityAlpha: this.config.velocitySmoothing
        });
    }

    // ========================================
    // TRACKING D'OBJETS
    // ========================================

    trackObject(object) {
        this.log(`🎯 Début tracking objet: ${object.id || 'anonymous'}`);

        try {
            const trackingTarget = this.createTrackingTarget(object);

            // Vérification capacité
            if (this.state.trackedObjects.size >= this.config.maxTrackingTargets) {
                this.removeOldestTarget();
            }

            // Ajout du target
            this.state.trackedObjects.set(trackingTarget.id, trackingTarget);
            this.state.activeTargets.add(trackingTarget.id);

            // Initialisation des filtres spécifiques
            this.initializeTargetFilters(trackingTarget);

            // Démarrage tracking immédiat si premier target
            if (this.state.activeTargets.size === 1) {
                this.startTrackingTarget(trackingTarget.id);
            }

            this.triggerCallback('onTargetAcquired', trackingTarget);

            return {
                success: true
                targetId: trackingTarget.id
                target: trackingTarget
                message: "Tracking démarré"
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

    createTrackingTarget(object) {
        const target = {
            id: object.id || this.generateTargetId()
            type: object.type || 'generic'
            position: { ...object.position }
            lastPosition: { ...object.position }
            velocity: { x: 0, y: 0 }
            acceleration: { x: 0, y: 0 }
            confidence: object.confidence || 1.0
            priority: object.priority || 0.5
            size: object.size || { width: 50, height: 50 }
            created: Date.now()
            lastUpdate: Date.now()
            positionHistory: []
            predictions: []
            trackingQuality: 1.0
            isVisible: true
            lostFrames: 0
            maxLostFrames: 30 // ~250ms à 120Hz
        };

        // Ajout position initiale à l'historique
        target.positionHistory.push({
            position: { ...target.position }
            timestamp: Date.now()
            confidence: target.confidence
        });

        return target;
    }

    updateObjectPosition(targetId, newPosition, confidence = 1.0) {
        const target = this.state.trackedObjects.get(targetId);
        if (!target) {
            this.log(`⚠️ Target ${targetId} introuvable pour update`, STR_WARN);
            return { success: false, error: STR_TARGET_NOT_FOUND };
        }

        // Sauvegarde ancienne position
        target.lastPosition = { ...target.position };

        // Détection outliers
        if (this.config.outlierDetection && this.isOutlier(target, newPosition)) {
            this.log(`🚨 Outlier détecté pour ${targetId}`, STR_WARN);
            return { success: false, error: "Outlier detected" };
        }

        // Application du filtre de Kalman
        const filteredPosition = this.kalmanFilter.update(targetId, newPosition);

        // Lissage additionnel
        target.position = this.smoothingFilter.smooth(target.position, filteredPosition);

        // Calcul vitesse et accélération
        this.updateTargetKinematics(target);

        // Mise à jour historique
        this.updateTargetHistory(target, confidence);

        // Qualité de tracking
        this.updateTrackingQuality(target, confidence);

        // Prédiction future
        this.updateTargetPredictions(target);

        target.lastUpdate = Date.now();
        target.lostFrames = 0;
        target.isVisible = true;

        return {
            success: true
            position: target.position
            velocity: target.velocity
            predictions: target.predictions
        };
    }

    // ========================================
    // CONTRÔLE DU REGARD
    // ========================================

    getCurrentGaze() {
        return {
            position: { ...this.state.currentGaze }
            state: this.state.saccadeState
            timestamp: Date.now()
            confidence: this.calculateGazeConfidence()
            target: this.getCurrentTarget()
            history: this.getRecentGazeHistory(1000) // 1s
        };
    }

    moveGazeTo(targetPosition, options = {}) {
        const currentGaze = this.state.currentGaze;
        const distance = this.calculateDistance(currentGaze, targetPosition);

        // Choix du type de mouvement
        const movementType = this.determineMovementType(distance, options);

        switch (movementType) {
            case STR_SACCADE:
                return this.performSaccade(targetPosition, options);
            case 'smooth_pursuit':
                return this.performSmoothPursuit(targetPosition, options);
            case STR_FIXATION:
                return this.maintainFixation(targetPosition, options);
            default:
                return this.performSaccade(targetPosition, options);
        }
    }

    performSaccade(targetPosition, options = {}) {
        if (this.state.saccadeState === STR_SACCADE) {
            this.log("⚠️ Saccade déjà en cours", STR_WARN);
            return { success: false, reason: "Saccade in progress" };
        }

        const saccadeData = this.saccadeController.planSaccade(
            this.state.currentGaze
            targetPosition
            options
        );

        this.state.saccadeState = STR_SACCADE;
        this.state.lastSaccade = Date.now();
        this.state.totalSaccades++;

        this.triggerCallback('onSaccadeStart', saccadeData);

        // Exécution saccade
        this.executeSaccade(saccadeData);

        return {
            success: true
            saccadeData
            duration: saccadeData.duration
            amplitude: saccadeData.amplitude
        };
    }

    executeSaccade(saccadeData) {
        const startTime = Date.now();
        const startPosition = { ...this.state.currentGaze };
        const targetPosition = saccadeData.target;
        const duration = saccadeData.duration;

        const saccadeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1.0);

            // Profil de vitesse sigmoïde pour saccade réaliste
            const sigmoidProgress = this.applySaccadeProfile(progress);

            // Interpolation position
            this.state.currentGaze = {
                x: startPosition.x + (targetPosition.x - startPosition.x) * sigmoidProgress
                y: startPosition.y + (targetPosition.y - startPosition.y) * sigmoidProgress
            };

            // Enregistrement dans l'historique
            this.recordGazePosition();
            this.triggerCallback('onGazeMove', this.state.currentGaze);

            // Fin de saccade
            if (progress >= 1.0) {
                clearInterval(saccadeInterval);
                this.completeSaccade(saccadeData);
            }
        }, 1000 / this.config.updateFrequency);
    }

    applySaccadeProfile(t) {
        // Profil de vitesse sigmoïde pour mouvement oculaire réaliste
        return 1 / (1 + Math.exp(-12 * (t - 0.5)));
    }

    completeSaccade(saccadeData) {
        this.state.saccadeState = STR_FIXATION;
        this.triggerCallback('onSaccadeEnd', {
            ...saccadeData
            actualDuration: Date.now() - this.state.lastSaccade
            finalPosition: { ...this.state.currentGaze }
        });

        this.log(`✅ Saccade terminée vers (${this.state.currentGaze.x.toFixed(1)}, ${this.state.currentGaze.y.toFixed(1)})`);
    }

    // ========================================
    // PRÉDICTION DE TRAJECTOIRE
    // ========================================

    predictGazePath(targetId, horizon = null) {
        horizon = horizon || this.config.predictionHorizon;

        const target = this.state.trackedObjects.get(targetId);
        if (!target) {
            return { success: false, error: STR_TARGET_NOT_FOUND };
        }

        try {
            const predictions = this.motionPredictor.predict(target, horizon);

            // Mise à jour des prédictions du target
            target.predictions = predictions;

            // Calcul chemin de regard optimal
            const gazePath = this.calculateOptimalGazePath(predictions);

            this.triggerCallback('onPredictionUpdate', {
                targetId
                predictions
                gazePath
                horizon
            });

            return {
                success: true
                targetId
                predictions
                gazePath
                confidence: this.calculatePredictionConfidence(predictions)
                horizon
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

    calculateOptimalGazePath(predictions) {
        const gazePath = [];
        const currentGaze = this.state.currentGaze;

        let lastGazePosition = { ...currentGaze };

        predictions.forEach((prediction, _) => {
            // Calcul position optimale du regard en anticipation
            const leadTime = this.calculateLeadTime(prediction.velocity);
            const anticipatedPosition = this.anticipatePosition(prediction, leadTime);

            // Planification saccade si nécessaire
            const distance = this.calculateDistance(lastGazePosition, anticipatedPosition);

            if (distance > 50) { // Seuil pour déclencher saccade
                const saccadePlan = this.saccadeController.planSaccade(
                    lastGazePosition
                    anticipatedPosition
                );

                gazePath.push({
                    type: STR_SACCADE
                    start: { ...lastGazePosition }
                    end: { ...anticipatedPosition }
                    timestamp: prediction.timestamp
                    duration: saccadePlan.duration
                    confidence: prediction.confidence
                });            } else {
                // Poursuite lisse
                gazePath.push({
                    type: 'pursuit'
                    position: { ...anticipatedPosition }
                    timestamp: prediction.timestamp
                    velocity: prediction.velocity
                    confidence: prediction.confidence
                });
            }
        });

        return gazePath;
    }

    calculateLeadTime(velocity) {
        // Temps d'anticipation basé sur la vitesse
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

        if (speed < 50) return 0; // Objet lent, pas d'anticipation
        if (speed < 200) return 50; // Anticipation courte
        if (speed < 500) return 100; // Anticipation moyenne
        return 200; // Anticipation longue pour objets rapides
    }

    anticipatePosition(prediction, leadTime) {
        return {
            x: prediction.position.x + (prediction.velocity.x * leadTime / 1000)
            y: prediction.position.y + (prediction.velocity.y * leadTime / 1000)
        };
    }

    // ========================================
    // MISE À JOUR ET MAINTENANCE
    // ========================================

    update() {
        // Mise à jour des targets trackés
        this.updateTrackedTargets();

        // Mise à jour du regard
        this.updateGazeState();

        // Nettoyage historique
        this.cleanupHistory();

        // Vérification targets perdus
        this.checkLostTargets();

        // Maintenance des filtres
        this.maintainFilters();
    }

    updateTrackedTargets() {
        this.state.trackedObjects.forEach((target, _) => {
            // Simulation de bruit pour mode simulation
            if (this.config.simulationMode) {
                this.simulateObjectMovement(target);
            }

            // Mise à jour prédictions
            this.updateTargetPredictions(target);

            // Vérification visibilité
            this.checkTargetVisibility(target);
        });
    }

    simulateObjectMovement(target) {
        // Simulation mouvement pour test
        const deltaTime = (Date.now() - target.lastUpdate) / 1000;

        // Application bruit réaliste
        const noise = {
            x: ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * this.config.noiseThreshold
            y: ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * this.config.noiseThreshold
        };

        // Mouvement basé sur vitesse + bruit
        const newPosition = {
            x: target.position.x + target.velocity.x * deltaTime + noise.x
            y: target.position.y + target.velocity.y * deltaTime + noise.y
        };

        // Contraintes écran
        newPosition.x = Math.max(0, Math.min(1920, newPosition.x));
        newPosition.y = Math.max(0, Math.min(1080, newPosition.y));

        this.updateObjectPosition(target.id, newPosition, 0.9);
    }

    updateTargetKinematics(target) {
        const deltaTime = (Date.now() - target.lastUpdate) / 1000;
        if (deltaTime <= 0) return;

        // Calcul vitesse
        const newVelocity = {
            x: (target.position.x - target.lastPosition.x) / deltaTime
            y: (target.position.y - target.lastPosition.y) / deltaTime
        };

        // Calcul accélération
        const newAcceleration = {
            x: (newVelocity.x - target.velocity.x) / deltaTime
            y: (newVelocity.y - target.velocity.y) / deltaTime
        };

        // Lissage vitesse
        target.velocity = this.velocityCalculator.smooth(target.velocity, newVelocity);
        target.acceleration = newAcceleration;
    }

    updateTargetHistory(target, confidence) {
        const historyEntry = {
            position: { ...target.position }
            velocity: { ...target.velocity }
            timestamp: Date.now()
            confidence
        };

        target.positionHistory.push(historyEntry);

        // Limitation historique
        if (target.positionHistory.length > this.config.historyLength) {
            target.positionHistory = target.positionHistory.slice(-this.config.historyLength);
        }
    }

    checkLostTargets() {
        const now = Date.now();
        const lostTargets = [];

        this.state.trackedObjects.forEach((target, id) => {
            const timeSinceUpdate = now - target.lastUpdate;

            if (timeSinceUpdate > this.config.trackingTimeout) {
                target.lostFrames++;

                if (target.lostFrames > target.maxLostFrames) {
                    lostTargets.push(id);
                }
            }
        });

        // Suppression targets perdus
        lostTargets.forEach(id => {
            this.stopTrackingTarget(id);
        });
    }

    stopTrackingTarget(targetId) {
        const target = this.state.trackedObjects.get(targetId);
        if (target) {
            this.state.trackedObjects.delete(targetId);
            this.state.activeTargets.delete(targetId);

            this.log(`📍 Arrêt tracking: ${targetId}`);
            this.triggerCallback('onTargetLost', target);

            return { success: true, target };
        }

        return { success: false, error: STR_TARGET_NOT_FOUND };
    }

    // ========================================
    // API PUBLIQUE
    // ========================================

    getTrackedObjects() {
        return Array.from(this.state.trackedObjects.values());
    }

    getTrackingStatus() {
        return {
            name: this.name
            version: this.version
            status: this.status
            currentGaze: { ...this.state.currentGaze }
            saccadeState: this.state.saccadeState
            trackedTargets: this.state.trackedObjects.size
            totalSaccades: this.state.totalSaccades
            averageTrackingQuality: this.calculateAverageTrackingQuality()
            gazeHistoryLength: this.state.gazeHistory.length
        };
    }

    startTrackingTarget(targetId) {
        const target = this.state.trackedObjects.get(targetId);
        if (!target) {
            return { success: false, error: STR_TARGET_NOT_FOUND };
        }

        // Saccade vers le target
        this.moveGazeTo(target.position, {
            priority: target.priority
            type: 'acquisition'
        });

        return { success: true, target };
    }

    // ========================================
    // UTILITAIRES
    // ========================================

    calculateDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    determineMovementType(distance, options) {
        if (distance < 10) return STR_FIXATION;
        if (distance > 100 || options.force === STR_SACCADE) return STR_SACCADE;
        if (options.target && options.target.velocity) {
            const speed = Math.sqrt(
                options.target.velocity.x ** 2 + options.target.velocity.y ** 2
            );
            if (speed > 50) return 'smooth_pursuit';
        }
        return STR_SACCADE;
    }

    isOutlier(target, newPosition) {
        if (target.positionHistory.length < 3) return false;

        const recent = target.positionHistory.slice(-3);
        const avgX = recent.reduce((sum, h) => sum + h.position.x, 0) / recent.length;
        const avgY = recent.reduce((sum, h) => sum + h.position.y, 0) / recent.length;

        const distance = this.calculateDistance({ x: avgX, y: avgY }, newPosition);
        const expectedMaxDistance = target.velocity ?
            Math.sqrt(target.velocity.x ** 2 + target.velocity.y ** 2) * 0.1 + 20 : 50;

        return distance > expectedMaxDistance;
    }

    calculateGazeConfidence() {
        // Confiance basée sur l'état et l'historique récent
        let confidence = 1.0;

        if (this.state.saccadeState === STR_SACCADE) {
            confidence *= 0.7; // Moins de confiance pendant saccade
        }

        const recentHistory = this.getRecentGazeHistory(500);
        if (recentHistory.length > 2) {
            // Stabilité du regard
            const variance = this.calculatePositionVariance(recentHistory);
            confidence *= Math.max(0.5, 1.0 - variance / 100);
        }

        return Math.max(0.1, Math.min(1.0, confidence));
    }

    recordGazePosition() {
        this.state.gazeHistory.push({
            position: { ...this.state.currentGaze }
            timestamp: Date.now()
            state: this.state.saccadeState
        });

        // Limitation historique
        if (this.state.gazeHistory.length > 1000) {
            this.state.gazeHistory = this.state.gazeHistory.slice(-500);
        }
    }

    getRecentGazeHistory(timeWindow) {
        const cutoff = Date.now() - timeWindow;
        return this.state.gazeHistory.filter(entry => entry.timestamp > cutoff);
    }

    getCurrentTarget() {
        // Retourne le target actuellement suivi (plus proche du regard)
        let minDistance = Infinity;

        this.state.trackedObjects.forEach(target => {
            const distance = this.calculateDistance(this.state.currentGaze, target.position);
            if (distance < minDistance) {
                minDistance = distance;
            }
        });

        return minDistance < 100 ? closestTarget : null; // Seuil 100px
    }

    generateTargetId() {
        return `track_${Date.now()}_${(crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF).toString(36).substr(2, 9)}`;
    }

    removeOldestTarget() {
        let oldestTarget = null;
        let oldestTime = Date.now();

        this.state.trackedObjects.forEach((target, _) => {
            if (target.created < oldestTime) {                oldestTarget = id;
            }
        });

        if (oldestTarget) {
            this.stopTrackingTarget(oldestTarget);
        }
    }

    // ========================================
    // CALLBACKS
    // ========================================

    onGazeMove(callback) {
        this.callbacks.onGazeMove.push(callback);
    }

    onSaccadeStart(callback) {
        this.callbacks.onSaccadeStart.push(callback);
    }

    onSaccadeEnd(callback) {
        this.callbacks.onSaccadeEnd.push(callback);
    }

    onTargetAcquired(callback) {
        this.callbacks.onTargetAcquired.push(callback);
    }

    onTargetLost(callback) {
        this.callbacks.onTargetLost.push(callback);
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
            logger.info(`[${timestamp}] [EyeTracking] [${level.toUpperCase()}] ${message}`);
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

        // Nettoyage état
        this.state.trackedObjects.clear();
        this.state.activeTargets.clear();
        this.state.gazeHistory = [];

        // Nettoyage callbacks
        Object.keys(this.callbacks).forEach(key => {
            this.callbacks[key] = [];
        });

        // Nettoyage filtres
        if (this.kalmanFilter && this.kalmanFilter.clear) {
            this.kalmanFilter.clear();
        }

        this.status = "destroyed";
        this.log("🗑️ EyeTracking détruit");
    }
}

// ============================================================================
// CLASSES AUXILIAIRES
// ============================================================================

class ObjectTracker {
    constructor(config) {
        this.config = config;
        this.trackers = new Map();
    }

    track(object) {
        // Algorithme de tracking spécialisé
        const tracker = {
            id: object.id
            lastPosition: object.position
            confidence: object.confidence || 1.0
            template: this.extractTemplate(object)
        };

        this.trackers.set(object.id, tracker);
        return tracker;
    }

    extractTemplate(object) {
        // Extraction template pour tracking visuel
        return {
            features: this.extractFeatures(object)
            size: object.size
            appearance: object.appearance || 'generic'
        };
    }

    extractFeatures(object) {
        // Simulation extraction features
        return {
            color: object.color || 'unknown'
            shape: object.shape || 'rectangular'
            texture: object.texture || 'smooth'
        };
    }
}

class SaccadeController {
    constructor(config) {
        this.config = config;
    }

    planSaccade(start, target, options = {}) {
        const distance = this.calculateDistance(start, target);
        const amplitude = this.calculateAmplitude(distance);
        const duration = this.calculateDuration(amplitude);
        const velocity = this.calculatePeakVelocity(amplitude);

        return {
            start: { ...start }
            target: { ...target }
            distance
            amplitude
            duration
            velocity
            type: options.type || 'voluntary'
            priority: options.priority || 0.5
            planned: Date.now()
        };
    }

    calculateDistance(start, target) {
        const dx = target.x - start.x;
        const dy = target.y - start.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    calculateAmplitude(distance) {
        // Conversion pixels vers degrés visuels (approximation)
        const pixelsPerDegree = 35; // Approximation écran standard
        return distance / pixelsPerDegree;
    }

    calculateDuration(amplitude) {
        // Relation amplitude-durée pour saccades humaines
        // Durée = 2.2 * amplitude + 21 (ms) pour amplitudes en degrés
        const baseDuration = 2.2 * amplitude + 21;
        return Math.max(20, Math.min(100, baseDuration));
    }

    calculatePeakVelocity(amplitude) {
        // Relation principale: vitesse_pic = 500 * amplitude (deg/s)
        return Math.min(this.config.saccadeVelocity, 500 * amplitude);
    }
}

class MotionPredictor {
    constructor(config) {
        this.config = config;
        this.predictors = new Map();
    }

    predict(target, horizon) {
        const predictor = this.getOrCreatePredictor(target.id);

        switch (this.config.predictionAlgorithm) {
            case STR_KALMAN:
                return this.kalmanPredict(target, horizon, predictor);
            case STR_LINEAR:
                return this.linearPredict(target, horizon);
            case 'polynomial':
                return this.polynomialPredict(target, horizon);
            default:
                return this.linearPredict(target, horizon);
        }
    }

    linearPredict(target, horizon) {
        const predictions = [];
        const timeSteps = Math.floor(horizon / 50); // Prédictions toutes les 50ms

        for (let i = 1; i <= timeSteps; i++) {
            const deltaTime = (i * 50) / 1000; // en secondes

            const predictedPosition = {
                x: target.position.x + target.velocity.x * deltaTime
                y: target.position.y + target.velocity.y * deltaTime
            };

            predictions.push({
                position: predictedPosition
                velocity: { ...target.velocity }
                timestamp: Date.now() + i * 50
                confidence: Math.max(0.1, 1.0 - (deltaTime / (horizon / 1000)) * 0.5)
                method: STR_LINEAR
            });
        }

        return predictions;
    }

    kalmanPredict(target, horizon, predictor) {
        // Prédiction avec filtre de Kalman
        const predictions = [];
        const timeSteps = Math.floor(horizon / 50);

        let currentState = predictor.getState();

        for (let i = 1; i <= timeSteps; i++) {
            currentState = predictor.predictNext(currentState, 50); // 50ms step

            predictions.push({
                position: { x: currentState.x, y: currentState.y }
                velocity: { x: currentState.vx, y: currentState.vy }
                timestamp: Date.now() + i * 50
                confidence: currentState.confidence
                method: STR_KALMAN
                uncertainty: currentState.uncertainty
            });
        }

        return predictions;
    }

    getOrCreatePredictor(targetId) {
        if (!this.predictors.has(targetId)) {
            this.predictors.set(targetId, new KalmanPredictor());
        }
        return this.predictors.get(targetId);
    }
}

class GazeEstimator {
    constructor(config) {
        this.config = config;
    }

    estimateGaze(eyeData) {
        // Estimation position regard à partir données oculaires
        if (this.config.simulationMode) {
            return this.simulateGaze();
        }

        return this.processRealGaze(eyeData);
    }

    simulateGaze() {
        // Simulation regard pour tests
        return {
            x: 960 + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 100
            y: 540 + ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) - 0.5) * 100
            confidence: 0.9
        };
    }

    processRealGaze(eyeData) {
        // Traitement données réelles eye tracker
        return {
            x: eyeData.x
            y: eyeData.y
            confidence: eyeData.confidence || 0.8
        };
    }
}

class KalmanFilter {
    constructor() {
        this.filters = new Map();
    }

    configure(config) {
        this.config = config;
    }

    update(targetId, measurement) {
        if (!this.filters.has(targetId)) {
            this.initializeFilter(targetId, measurement);
        }

        const filter = this.filters.get(targetId);
        return this.kalmanUpdate(filter, measurement);
    }

    initializeFilter(targetId, initialPosition) {
        const filter = {
            x: initialPosition.x
      y: initialPosition.y
      vx: 0
      vy: 0
      P: [[100
      0
      0
      0]
      [0
      100
      0
      0]
      [0
      0
      100
      0]
      [0
      0
      0
      100]]
      // Covariance
            Q: 0.1
      // Process noise
            R: 1.0  // Measurement noise
        };

        this.filters.set(targetId, filter);
    }

    kalmanUpdate(filter, measurement) {
        // Prédiction
        filter.x += filter.vx * 0.016; // Assume 60fps
        filter.y += filter.vy * 0.016;

        // Mise à jour avec mesure
        const innovation = {
            x: measurement.x - filter.x
            y: measurement.y - filter.y
        };

        // Gain de Kalman simplifié
        const gain = 0.5;

        filter.x += gain * innovation.x;
        filter.y += gain * innovation.y;
        filter.vx += gain * innovation.x / 0.016;
        filter.vy += gain * innovation.y / 0.016;

        return { x: filter.x, y: filter.y };
    }

    clear() {
        this.filters.clear();
    }
}

class VelocityCalculator {
    smooth(oldVelocity, newVelocity) {
        const alpha = 0.8; // Facteur de lissage

        return {
            x: oldVelocity.x * alpha + newVelocity.x * (1 - alpha)
            y: oldVelocity.y * alpha + newVelocity.y * (1 - alpha)
        };
    }
}

class TrajectoryAnalyzer {
    analyzeTrajectory(positionHistory) {
        if (positionHistory.length < 3) {
            return { type: 'insufficient_data' };
        }

        // Analyse du pattern de mouvement
        const velocities = this.calculateVelocities(positionHistory);
        const accelerations = this.calculateAccelerations(velocities);

        return {
            type: this.classifyMovement(velocities, accelerations)
            smoothness: this.calculateSmoothness(accelerations)
            predictability: this.calculatePredictability(velocities)
            avgSpeed: this.calculateAverageSpeed(velocities)
        };
    }

    calculateVelocities(history) {
        const velocities = [];

        for (let i = 1; i < history.length; i++) {
            const dt = (history[i].timestamp - history[i-1].timestamp) / 1000;
            const dx = history[i].position.x - history[i-1].position.x;
            const dy = history[i].position.y - history[i-1].position.y;

            velocities.push({
                x: dx / dt
                y: dy / dt
                magnitude: Math.sqrt(dx*dx + dy*dy) / dt
                timestamp: history[i].timestamp
            });
        }

        return velocities;
    }

    classifyMovement(velocities, accelerations) {
        const avgSpeed = velocities.reduce((sum, v) => sum + v.magnitude, 0) / velocities.length;
        const speedVariance = this.calculateVariance(velocities.map(v => v.magnitude));

        if (avgSpeed < 10) return 'stationary';
        if (speedVariance < 50) return STR_LINEAR;
        if (this.detectCircular(velocities)) return 'circular';
        if (speedVariance > 200) return 'erratic';
        return 'curved';
    }

    detectCircular(velocities) {
        // Détection mouvement circulaire basique
        if (velocities.length < 10) return false;

        const angles = velocities.map(v => Math.atan2(v.y, v.x));
        let totalAngleChange = 0;

        for (let i = 1; i < angles.length; i++) {
            let angleDiff = angles[i] - angles[i-1];
            if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            totalAngleChange += Math.abs(angleDiff);
        }

        return totalAngleChange > Math.PI; // Plus d'un demi-tour
    }

    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }
}

class SmoothingFilter {
    constructor(config) {
        this.config = config;
    }

    configure(config) {
        this.config = { ...this.config, ...config };
    }

    smooth(oldPosition, newPosition) {
        const alpha = this.config.alpha || 0.7;

        return {
            x: oldPosition.x * alpha + newPosition.x * (1 - alpha)
            y: oldPosition.y * alpha + newPosition.y * (1 - alpha)
        };
    }
}

class KalmanPredictor {
    constructor() {
        this.state = {
            x: 0
      y: 0
      vx: 0
      vy: 0
      confidence: 1.0
      uncertainty: 0.1
        };
    }

    getState() {
        return { ...this.state };
    }

    predictNext(currentState
      deltaTime) {
        const dt = deltaTime / 1000; // Convert to seconds

        // Simple prediction: position += velocity * time
        return {
            x: currentState.x + currentState.vx * dt
      y: currentState.y + currentState.vy * dt
      vx: currentState.vx
      // Assume constant velocity
            vy: currentState.vy
      confidence: currentState.confidence * 0.95
      // Decay confidence
            uncertainty: currentState.uncertainty * 1.1 // Increase uncertainty
        };
    }
}