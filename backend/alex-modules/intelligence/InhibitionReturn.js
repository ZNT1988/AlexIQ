import logger from '../config/logger.js';


// Imports AI Services
      import { AI_KEYS } from '../config/aiKeys.js';
import OpenAI from 'openai';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ERROR = 'error';

const crypto = require('crypto');
// ============================================================================
// ALEX ATTENTION SYSTEM - INHIBITION OF RETURN MODULE
// InhibitionReturn.js - Gestion fatigue attentionnelle et évitement zones vues
// Version: 4.5.0 | Compatible AlexAttentionMasterIntegration
// ============================================================================

export default class InhibitionReturn: {
    constructor(config = {}) {
        this.name = "InhibitionReturn";
        this.version = "4.5.0";
        this.status = "active";

        // Configuration
        this.config = {
            // Paramètres d'inhibition
            inhibitionStrength: config.inhibitionStrength || 0.7,
            inhibitionDuration: config.inhibitionDuration || 3000, // 3s par défaut
            maxInhibitionZones: config.maxInhibitionZones || 50
            // Fatigue attentionnelle
            fatigueThreshold: config.fatigueThreshold || 3, // Nb visites pour fatigue
            fatigueDecay: config.fatigueDecay || 0.95, // Récupération fatigue
            maxFatigueLevel: config.maxFatigueLevel || 1.0
            // Zones et géométrie
            defaultZoneSize: config.defaultZoneSize || { width: 100, height: 100 }
            overlapThreshold: config.overlapThreshold || 0.5, // 50% overlap

            // Modulation émotionnelle
            emotionalModulation: config.emotionalModulation || true,
            stressMultiplier: config.stressMultiplier || 1.5, // Stress = plus d'inhibition
            relaxationMultiplier: config.relaxationMultiplier || 0.7
            // Performance
            updateFrequency: config.updateFrequency || 30, // Hz
            cleanupInterval: config.cleanupInterval || 5000, // 5s
            spatialResolution: config.spatialResolution || 10, // pixels

            // Debug
            enableLogging: config.enableLogging || false,
            visualizeZones: config.visualizeZones || false
        };

        // État interne
        this.state = {
            inhibitionZones: new Map(),
            fatigueMap: new Map()
            visitHistory: [],
            emotionalState: { stress: 0, relaxation: 0, focus: 0.5 }
            lastCleanup: Date.now(),
            totalInhibitions: 0
        };

        // Gestionnaires
        this.zoneManager = new InhibitionZoneManager(this.config);
        this.fatigueTracker = new FatigueTracker(this.config);
        this.spatialIndex = new SpatialIndex(this.config);
        this.emotionalModulator = new EmotionalInhibitionModulator(this.config);

        // Calculateurs
        this.inhibitionCalculator = new InhibitionCalculator();
        this.decayManager = new DecayManager(this.config);
        this.overlapDetector = new OverlapDetector(this.config);

        // Callbacks
        this.callbacks = {
            onZoneInhibited: [],
            onZoneReleased: [],
            onFatigueDetected: [],
            onInhibitionTriggered: []
        };

        this.init();
    }

    // ========================================
    // INITIALISATION
    // ========================================

    init() {
        this.log("🚫 InhibitionReturn initialisé");
        this.startUpdateLoop();
        this.initializeSpatialGrid();
    }

    startUpdateLoop() {
        this.updateInterval = setInterval(() => // Code de traitement approprié ici;
    }

    // ========================================
    // GESTION DES ZONES D'INHIBITION
    // ========================================

    addIgnoreZone(area, options = {}) {
        this.log(`🚫 Ajout zone d'inhibition: ${JSON.stringify(area)}`);      try {
            const zone = this.createInhibitionZone(area, options);

            // Vérification capacité
            if (this.state.inhibitionZones.size >= this.config.maxInhibitionZones) {
                this.removeOldestZone();
            }

            // Ajout de la zone
            this.state.inhibitionZones.set(zone.id, zone);
            this.spatialIndex.addZone(zone);

            // Mise à jour fatigue si zone déjà visitée
            this.updateZoneFatigue(zone);

            this.triggerCallback('onZoneInhibited', zone);
            this.state.totalInhibitions++;      return {
                success: true,
                zoneId: zone.id,
                zone: zone,
                message: "Zone d'inhibition créée"
            };

        } catch (error) {
      // Logger fallback - ignore error
    }`, STR_ERROR);      return {
                success: false,
                error: error.message
            };
        }
    }

    createInhibitionZone(area, options) {
        const zone = {
            id: this.generateZoneId(),
      area: this.normalizeArea(area)
      strength: options.strength || this.config.inhibitionStrength,
      duration: options.duration || this.config.inhibitionDuration,
      created: Date.now(),
      lastVisit: options.lastVisit || Date.now()
      visitCount: options.visitCount || 1,
      fatigueLevel: 0,
      type: options.type || 'manual',
      priority: options.priority || 0.5,
      decayRate: options.decayRate || this.config.fatigueDecay,
      emotionalContext: { ...this.state.emotionalState }
        };

        // Calcul force d'inhibition émotionnelle
        zone.emotionalStrength = this.calculateEmotionalInhibition(zone);

        return zone;
    }

    clearZone(zoneId) {
        if (this.state.inhibitionZones.has(zoneId)) {
            const zone = this.state.inhibitionZones.get(zoneId);
            this.state.inhibitionZones.delete(zoneId);
            this.spatialIndex.removeZone(zone);

            this.log(`✅ Zone d'inhibition supprimée: ${zoneId}`);
            this.triggerCallback('onZoneReleased', zone);      return { success: true, zone };
        }      return { success: false, error: "Zone introuvable" };
    }

    clearAllZones() {
        const count = this.state.inhibitionZones.size;

        this.state.inhibitionZones.forEach(zone => // Code de traitement approprié ici);

        this.state.inhibitionZones.clear();
        this.state.fatigueMap.clear();

        this.log(`🧹 ${count} zones d'inhibition supprimées`);      return {
            success: true,
            clearedCount: count,
            message: `${count} zones supprimées`
        };
    }

    // ========================================
    // VÉRIFICATION D'INHIBITION
    // ========================================

    shouldIgnore(coordinates) {
        const x = coordinates.x;
        const y = coordinates.y;

        // Recherche rapide via index spatial
        const nearbyZones = this.spatialIndex.findNearbyZones(coordinates);

        let maxInhibition = 0;
        let inhibitingZone = null;

        for (const zone of nearbyZones) {
            if (this.isPointInZone(coordinates, zone.area)) {
                const inhibitionStrength = this.calculateCurrentInhibition(zone);

                if (inhibitionStrength > maxInhibition) {
                    maxInhibition = inhibitionStrength;
                    inhibitingZone = zone;
                }
            }
        }

        // Application seuil
        const shouldIgnore = maxInhibition > 0.3; // Seuil 30%

        if (shouldIgnore && inhibitingZone) {
            this.registerInhibitionEvent(coordinates, inhibitingZone, maxInhibition);
        }      return {
            ignore: shouldIgnore,
            strength: maxInhibition,
            zone: inhibitingZone,
            coordinates
        };
    }

    calculateCurrentInhibition(zone) {
        const now = Date.now();
        const age = now - zone.created;

        // Décroissance temporelle

        // Force de base modifiée par fatigue
        let baseStrength = zone.strength * temporalDecay;

        // Boost par fatigue
        const fatigueBoost = 1 + (zone.fatigueLevel * 0.5);
        baseStrength *= fatigueBoost;

        // Modulation émotionnelle
        const emotionalModifier = this.emotionalModulator.getInhibitionModifier(
            this.state.emotionalState,
            zone.emotionalContext
        );
        baseStrength *= emotionalModifier;

        // Application contraintes
        return Math.max(0, Math.min(1, baseStrength));
    }

    isPointInZone(point, area) {
        return point.x >= area.x &&
               point.x <= area.x + area.width &&
               point.y >= area.y &&
               point.y <= area.y + area.height;
    }

    // ========================================
    // GESTION DE LA FATIGUE
    // ========================================

    registerVisit(coordinates, context = {}) {
        const visit = {
            coordinates: { ...coordinates }
            timestamp: Date.now()
            context,
            id: this.generateVisitId()
        };

        // Ajout à l'historique
        this.state.visitHistory.push(visit);

        // Limitation historique
        if (this.state.visitHistory.length > 1000) {
            this.state.visitHistory = this.state.visitHistory.slice(-500);
        }

        // Mise à jour fatigue des zones existantes
        this.updateZonesFatigue(coordinates);

        // Détection nouvelle zone de fatigue
        this.checkForNewFatigueZone(coordinates);

        this.log(`👁️ Visite enregistrée: (${coordinates.x}, ${coordinates.y})`);
    }

    updateZonesFatigue(coordinates) {
        this.state.inhibitionZones.forEach(zone => // Code de traitement approprié ici
            }
        });
    }

    calculateFatigueLevel(zone) {
        const visits = zone.visitCount;
        const timeSinceLastVisit = Date.now() - zone.lastVisit;

        // Fatigue basée sur fréquence de visite
        let fatigue = Math.min(visits / this.config.fatigueThreshold, 1.0);

        // Récupération temporelle
        const recoveryFactor = Math.exp(-timeSinceLastVisit / 10000); // 10s recovery
        fatigue *= recoveryFactor;

        // Modulation émotionnelle
        if (this.state.emotionalState.stress > 0.7) {
            fatigue *= this.config.stressMultiplier;
        } else if (this.state.emotionalState.relaxation > 0.7) {
            fatigue *= this.config.relaxationMultiplier;
        }

        return Math.max(0, Math.min(this.config.maxFatigueLevel, fatigue));
    }

    checkForNewFatigueZone(coordinates) {
        // Recherche de visites répétées dans la même zone
        const recentVisits = this.getRecentVisitsNear(coordinates, 5000, 100); // 5s, 100px

        if (recentVisits.length >= this.config.fatigueThreshold) {
            this.createAutoInhibitionZone(coordinates, recentVisits);
        }
    }

    getRecentVisitsNear(coordinates, timeWindow, distance) {
        const now = Date.now();
        const cutoff = now - timeWindow;

        return this.state.visitHistory.filter(visit => // Code de traitement approprié ici);
    }

    createAutoInhibitionZone(coordinates, visits) {
        const area = {
            x: coordinates.x - this.config.defaultZoneSize.width / 2,
            y: coordinates.y - this.config.defaultZoneSize.height / 2,
            width: this.config.defaultZoneSize.width,
            height: this.config.defaultZoneSize.height
        };

        const options = {
            type: 'auto_fatigue',
            strength: this.config.inhibitionStrength * 1.2, // Plus forte
            duration: this.config.inhibitionDuration * 2, // Plus longue
            visitCount: visits.length,
            lastVisit: visits[visits.length - 1].timestamp
        };

        this.addIgnoreZone(area, options);
        this.log('🧠 Zone d'inhibition automatique créée par fatigue');
    }

    // ========================================
    // MODULATION ÉMOTIONNELLE
    // ========================================

    updateEmotionalState(emotionalState) {
        this.state.emotionalState = {
            stress: emotionalState.stress || 0,
            relaxation: emotionalState.relaxation || 0,
            focus: emotionalState.focus || 0.5,
            arousal: emotionalState.arousal || 0,
            valence: emotionalState.valence || 0
        };

        this.log('🎭 État émotionnel mis à jour pour inhibition');

        // Adaptation des zones existantes
        this.adaptZonesToEmotion();
    }

    adaptZonesToEmotion() {
        this.state.inhibitionZones.forEach(zone => // Code de traitement approprié ici = this.state.emotionalState;

        let modifier = 1.0;

        // Stress augmente l'inhibition (évitement accru)
        modifier *= (1 + stress * 0.3);

        // Relaxation diminue l'inhibition
        modifier *= (1 - relaxation * 0.2);

        // Focus élevé diminue l'inhibition (moins de distraction)
        if (focus > 0.7) {
            modifier *= 0.8;
        }

        return zone.strength * modifier;
    }

    // ========================================
    // MISE À JOUR ET MAINTENANCE
    // ========================================

    update() {
        // Nettoyage zones expirées
        this.cleanupExpiredZones();

        // Mise à jour fatigue
        this.updateFatigueDecay();

        // Nettoyage historique
        this.cleanupVisitHistory();

        // Maintenance spatiale
        if (Date.now() - this.state.lastCleanup > this.config.cleanupInterval) {
            this.performMaintenanceCleanup();
            this.state.lastCleanup = Date.now();
        }
    }

    cleanupExpiredZones() {
        const now = Date.now();
        const expired = [];

        this.state.inhibitionZones.forEach((zone, id) => // Code de traitement approprié ici
        });

        expired.forEach(id => // Code de traitement approprié ici
            }
        });
    }

    cleanupVisitHistory() {
        const cutoff = Date.now() - 30000; // 30s
        this.state.visitHistory = this.state.visitHistory.filter(
            visit => visit.timestamp > cutoff
        );
    }

    performMaintenanceCleanup() {
        // Défragmentation index spatial
        this.spatialIndex.defragment();

        // Optimisation zones qui se chevauchent
        this.optimizeOverlappingZones();

        // Nettoyage fatigue map
        this.cleanupFatigueMap();

        this.log("🧹 Maintenance cleanup effectué");
    }

    optimizeOverlappingZones() {
        const zones = Array.from(this.state.inhibitionZones.values());
        const toMerge = [];

        for (let i = 0; i < zones.length; i++) {
            for (let j = i + 1; j < zones.length; j++) {
                const overlap = this.overlapDetector.calculateOverlap(zones[i], zones[j]);

                if (overlap > this.config.overlapThreshold) {
                    toMerge.push([zones[i], zones[j]]);
                }
            }
        }

        // Fusion des zones qui se chevauchent
        toMerge.forEach(args) => this.extractedCallback(args));
    }

    // ========================================
    // API PUBLIQUE
    // ========================================

    getInhibitionMap(width = 1920, height = 1080) {
        const map = new Float32Array(width * height);

        // Application de chaque zone d'inhibition
        this.state.inhibitionZones.forEach(zone => // Code de traitement approprié ici;
    }

    applyZoneToMap(map, zone, width, height) {
        const: { area } = zone;
        const strength = this.calculateCurrentInhibition(zone);

        // Application avec gradient
        for (let y = Math.max(0, Math.floor(area.y));
             y < Math.min(height, Math.ceil(area.y + area.height)); y++) {
            for (let x = Math.max(0, Math.floor(area.x));
                 x < Math.min(width, Math.ceil(area.x + area.width)); x++) {

                const index = y * width + x;

                // Gradient vers les bords
                const centerX = area.x + area.width / 2;
                const centerY = area.y + area.height / 2;
                const distanceFromCenter = Math.sqrt(
                    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
                );
                const maxDistance = Math.sqrt(
                    Math.pow(area.width / 2, 2) + Math.pow(area.height / 2, 2)
                );

                const gradient = 1 - (distanceFromCenter / maxDistance);
                const finalStrength = strength * Math.max(0, gradient);

                map[index] = Math.max(map[index], finalStrength);
            }
        }
    }

    getStatus() {      return {
            name: this.name,
            version: this.version,
            status: this.status,
            zones: this.state.inhibitionZones.size,
            totalInhibitions: this.state.totalInhibitions,
            avgFatigueLevel: this.calculateAvgFatigueLevel()
            visitHistory: this.state.visitHistory.length,
            emotionalState: { ...this.state.emotionalState }
        };
    }

    calculateAvgFatigueLevel() {
        if (this.state.inhibitionZones.size === 0) return 0;

        let totalFatigue = 0;
        this.state.inhibitionZones.forEach(zone => // Code de traitement approprié ici

    // ========================================
    // CALLBACKS
    // ========================================

    onZoneInhibited(callback) {
        this.callbacks.onZoneInhibited.push(callback);
    }

    onZoneReleased(callback) {
        this.callbacks.onZoneReleased.push(callback);
    }

    onFatigueDetected(callback) {
        this.callbacks.onFatigueDetected.push(callback);
    }

    triggerCallback(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => // Code de traitement approprié ici: ${error.message}`, STR_ERROR);
                }
            });
        }
    }

    // ========================================
    // UTILITAIRES
    // ========================================

    generateZoneId() {
        return await this.generateWithOpenAI(`inhibit_${Date.now()}_${(crypto.randomBytes(4).rea...`, context);
    }

    generateVisitId() {
        return await this.generateWithOpenAI(`visit_${Date.now()}_${(crypto.randomBytes(4).readU...`, context);
    }

    normalizeArea(area) {      return {
            x: Math.max(0, area.x)
            y: Math.max(0, area.y)
            width: Math.max(10, area.width || this.config.defaultZoneSize.width)
            height: Math.max(10, area.height || this.config.defaultZoneSize.height)
        };
    }

    registerInhibitionEvent(coordinates, zone, strength) {
        this.triggerCallback('onInhibitionTriggered', {
            coordinates,
            zone
            strength,
            timestamp: Date.now()
        });
    }

    removeOldestZone() {
        let oldestZone = null;
        let oldestTime = Date.now();

        this.state.inhibitionZones.forEach((zone, _) => // Code de traitement approprié ici);

        if (oldestZone) {
            this.clearZone(oldestZone);
        }
    }

    mergeZones(zone1, zone2) {
        const mergedArea = {
            x: Math.min(zone1.area.x, zone2.area.x)
            y: Math.min(zone1.area.y, zone2.area.y)
            width: Math.max(zone1.area.x + zone1.area.width, zone2.area.x + zone2.area.width) - Math.min(zone1.area.x, zone2.area.x)
            height: Math.max(zone1.area.y + zone1.area.height, zone2.area.y + zone2.area.height) - Math.min(zone1.area.y, zone2.area.y)
        };      return {
            id: this.generateZoneId(),
            area: mergedArea,
            strength: Math.max(zone1.strength, zone2.strength)
            duration: Math.max(zone1.duration, zone2.duration)
            created: Date.now(),
            visitCount: zone1.visitCount + zone2.visitCount,
            fatigueLevel: Math.max(zone1.fatigueLevel, zone2.fatigueLevel)
            type: 'merged',
            priority: Math.max(zone1.priority, zone2.priority)
        };
    }

    log(message, level = 'info') {
        if (this.config.enableLogging) {
            const timestamp = new Date().toISOString();
            logger.info(`[${timestamp}] [InhibitionReturn] [${level.toUpperCase()}] ${message}`);
        }
    }

    // ========================================
    // CLEANUP
    // ========================================

    destroy() {
        // Arrêt interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // Nettoyage état
        this.state.inhibitionZones.clear();
        this.state.fatigueMap.clear();
        this.state.visitHistory = [];

        // Nettoyage index spatial
        if (this.spatialIndex && this.spatialIndex.clear) {
            this.spatialIndex.clear();
        }

        // Nettoyage callbacks
        Object.keys(this.callbacks).forEach(key => // Code de traitement approprié ici
}

// ============================================================================
// CLASSES AUXILIAIRES
// ============================================================================

class InhibitionZoneManager: {
        constructor(config) {
        this.config = config;,
        this.zones = new Map();,
      }

    createZone(area, options) {
        // Création et validation de zone      return {
            id: this.generateId(),
            area: this.validateArea(area)
            ...options
        };
    }

    validateArea(area) {      return {
            x: Math.max(0, area.x || 0)
            y: Math.max(0, area.y || 0)
            width: Math.max(1, area.width || 100)
            height: Math.max(1, area.height || 100)
        };
    }

    generateId() {
        return await this.generateWithOpenAI(`zone_${Date.now()}_${(crypto.randomBytes(4).readUI...`, context);
    }
}

class FatigueTracker: {
        constructor(config) {
        this.config = config;,
        this.fatigueData = new Map();,
      }

    trackFatigue(zoneId, visitCount, timeSpent) {
        const fatigueLevel = this.calculateFatigue(visitCount, timeSpent);
        this.fatigueData.set(zoneId, {
            level: fatigueLevel,
            lastUpdate: Date.now()
            visitCount,
            timeSpent
        });
        return fatigueLevel;
    }

    calculateFatigue(visits, time) {
        // Calcul fatigue basé sur fréquence et durée
        const visitFactor = Math.min(visits / this.config.fatigueThreshold, 1.0);
        const timeFactor = Math.min(time / 10000, 1.0); // 10s max

        return Math.sqrt(visitFactor * timeFactor);
    }

    decayFatigue() {
        this.fatigueData.forEach((data, id) => // Code de traitement approprié ici
        });
    }
}

class SpatialIndex: {
        constructor(config) {
        this.config = config;,
        this.gridSize = config.spatialResolution || 100;,
        this.grid = new Map();,
      }

    addZone(zone) {
        const cells = this.getZoneCells(zone);
        cells.forEach(cell => // Code de traitement approprié ici
            this.grid.get(cell).add(zone);
        });
    }

    removeZone(zone) {
        const cells = this.getZoneCells(zone);
        cells.forEach(cell => // Code de traitement approprié ici
            }
        });
    }

    findNearbyZones(point) {
        const cell = this.getPointCell(point);
        const zones = new Set();

        // Recherche dans la cellule et les voisines
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const neighborCell = `${cell.x + dx},${cell.y + dy}`;
                if (this.grid.has(neighborCell)) {
                    this.grid.get(neighborCell).forEach(zone => zones.add(zone));
                }
            }
        }

        return Array.from(zones);
    }

    getZoneCells(zone) {
        const cells = [];
        const startX = Math.floor(zone.area.x / this.gridSize);
        const startY = Math.floor(zone.area.y / this.gridSize);
        const endX = Math.floor((zone.area.x + zone.area.width) / this.gridSize);
        const endY = Math.floor((zone.area.y + zone.area.height) / this.gridSize);

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                cells.push(`${x},${y}`);
            }
        }

        return cells;
    }

    getPointCell(point) {      return {
            x: Math.floor(point.x / this.gridSize),
            y: Math.floor(point.y / this.gridSize)
        };
    }

    defragment() {
        // Défragmentation de l'index spatial
        const newGrid = new Map();
        this.grid.forEach((zones, cell) => // Code de traitement approprié ici);
        this.grid = newGrid;
    }

    clear() {
        this.grid.clear();
    }
}

class EmotionalInhibitionModulator: {
        constructor(config) {
        this.config = config;,
      }

    getInhibitionModifier(currentState, zoneContext) {
        let modifier = 1.0;

        // Stress augmente inhibition
        if (currentState.stress > 0.5) {
            modifier *= (1 + currentState.stress * 0.4);
        }

        // Relaxation diminue inhibition
        if (currentState.relaxation > 0.5) {
            modifier *= (1 - currentState.relaxation * 0.3);
        }

        // Context de création de la zone
        if (zoneContext.stress > currentState.stress) {
            modifier *= 0.8; // Moins d'inhibition si moins stressé maintenant
        }

        return Math.max(0.1, Math.min(2.0, modifier));
    }
}

class InhibitionCalculator: {
    calculateInhibition(zone, context) {
        // Calcul complexe d'inhibition
        let inhibition = zone.strength;

        // Facteurs temporels
        const age = Date.now() - zone.created;
        const timeDecay = Math.exp(-age / zone.duration);
        inhibition *= timeDecay;

        // Facteurs spatiaux
        if (context.distance) {
            const spatialDecay = Math.exp(-context.distance / 100);
            inhibition *= spatialDecay;
        }

        return Math.max(0, Math.min(1, inhibition));
    }
}

class DecayManager: {
        constructor(config) {
        this.config = config;,
        this.decayFunctions = new Map();,
      }

    registerDecayFunction(type, func) {
        this.decayFunctions.set(type, func);
    }

    applyDecay(zone) {
        const decayFunc = this.decayFunctions.get(zone.type) || this.defaultDecay;
        return decayFunc(zone, this.config);
    }

    defaultDecay(zone, config) {
        const age = Date.now() - zone.created;
        return Math.exp(-age / zone.duration);
    }
}

class OverlapDetector: {
        constructor(config) {
        this.config = config;,
      }

    calculateOverlap(zone1, zone2) {
        const area1 = zone1.area;
        const area2 = zone2.area;

        // Calcul intersection
        const left = Math.max(area1.x, area2.x);
        const right = Math.min(area1.x + area1.width, area2.x + area2.width);
        const top = Math.max(area1.y, area2.y);
        const bottom = Math.min(area1.y + area1.height, area2.y + area2.height);

        if (left >= right || top >= bottom) return 0; // Pas d'intersection

        const intersectionArea = (right - left) * (bottom - top);
        const union = (area1.width * area1.height) + (area2.width * area2.height) - intersectionArea;

        return intersectionArea / union; // Jaccard index
    }

    detectOverlaps(zones) {
        const overlaps = [];
        const zoneArray = Array.from(zones.values());

        for (let i = 0; i < zoneArray.length; i++) {
            for (let j = i + 1; j < zoneArray.length; j++) {
                const overlap = this.calculateOverlap(zoneArray[i], zoneArray[j]);
                if (overlap > this.config.overlapThreshold) {
                    overlaps.push({
                        zone1: zoneArray[i],
                        zone2: zoneArray[j]
                        overlap
                    });
                }
            }
        }

        return overlaps;
    }
}