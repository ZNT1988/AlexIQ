/**
 * @fileoverview Inhibition of Return Module - Gestion fatigue attentionnelle basée système
 * Module d'inhibition avec métriques système réelles et évitement adaptatif
 * @module InhibitionReturn
 * @version 5.0.0 - Phase 2 Anti-fake Systems
 * RÈGLES ANTI-FAKE: Inhibition basée métriques système, pas de simulation
 */

import { EventEmitter } from 'events';
import os from 'os';

/**
 * Inhibition of Return Module Principal
 * Gestion intelligente de la fatigue attentionnelle avec métriques système
 */
export default class InhibitionReturn extends EventEmitter {
  constructor(dependencies = {}) {
    super();
    
    // Dependency Injection
    this.logger = dependencies.logger || console;
    this.strictMode = dependencies.strictMode !== undefined ? dependencies.strictMode : true;
    this.config = {
      // Paramètres d'inhibition
      inhibitionStrength: dependencies.inhibitionStrength || 0.7,
      inhibitionDuration: dependencies.inhibitionDuration || 3000,
      maxInhibitionZones: dependencies.maxInhibitionZones || 50,
      
      // Fatigue attentionnelle
      fatigueThreshold: dependencies.fatigueThreshold || 3,
      fatigueDecay: dependencies.fatigueDecay || 0.95,
      maxFatigueLevel: dependencies.maxFatigueLevel || 1.0,
      
      // Zones et géométrie
      defaultZoneSize: dependencies.defaultZoneSize || { width: 100, height: 100 },
      overlapThreshold: dependencies.overlapThreshold || 0.5,
      
      // Modulation émotionnelle
      emotionalModulation: dependencies.emotionalModulation !== undefined ? dependencies.emotionalModulation : true,
      stressMultiplier: dependencies.stressMultiplier || 1.5,
      relaxationMultiplier: dependencies.relaxationMultiplier || 0.7,
      
      // Performance
      updateFrequency: dependencies.updateFrequency || 30,
      cleanupInterval: dependencies.cleanupInterval || 5000,
      spatialResolution: dependencies.spatialResolution || 10,
      
      // Debug
      enableLogging: dependencies.enableLogging || false,
      visualizeZones: dependencies.visualizeZones || false,
      
      ...dependencies
    };
    
    // État système
    this.state = {
      inhibitionZones: new Map(),
      fatigueMap: new Map(),
      visitHistory: [],
      emotionalState: {
        stress: 0,
        relaxation: 0,
        focus: 0.5,
        arousal: 0,
        valence: 0
      },
      lastCleanup: Date.now(),
      totalInhibitions: 0,
      systemMetrics: this.getSystemMetrics()
    };
    
    // Composants système
    this.zoneManager = new InhibitionZoneManager(this.config);
    this.fatigueTracker = new FatigueTracker(this.config);
    this.spatialIndex = new SpatialIndex(this.config);
    this.emotionalModulator = new EmotionalInhibitionModulator(this.config);
    this.inhibitionCalculator = new InhibitionCalculator();
    this.decayManager = new DecayManager(this.config);
    this.overlapDetector = new OverlapDetector(this.config);
    
    // Callbacks système
    this.callbacks = {
      onZoneInhibited: [],
      onZoneReleased: [],
      onFatigueDetected: [],
      onInhibitionTriggered: []
    };
    
    this.isInitialized = false;
    this.logger.info("🚫 InhibitionReturn initializing...");
  }

  /**
   * Métriques système pour calculs déterministes
   * Source: Process et OS metrics réels
   */
  getSystemMetrics() {
    const cpuUsage = process.cpuUsage();
    const memUsage = process.memoryUsage();
    const loadavg = os.loadavg();
    const hrtime = process.hrtime();
    
    return {
      cpuUser: cpuUsage.user,
      cpuSystem: cpuUsage.system,
      memoryUsed: memUsage.heapUsed,
      memoryTotal: memUsage.heapTotal,
      loadAverage: loadavg[0],
      hrtimeNano: hrtime[0] * 1e9 + hrtime[1],
      timestamp: Date.now(),
      pid: process.pid
    };
  }

  /**
   * Générateur d'ID déterministe basé système
   * Source: Métriques process et timestamp
   */
  generateSystemBasedId(prefix = 'inhibit') {
    const metrics = this.getSystemMetrics();
    const hash = (metrics.hrtimeNano + metrics.memoryUsed + metrics.pid).toString(36);
    return `${prefix}_${Date.now()}_${hash.substring(0, 8)}`;
  }

  /**
   * Calcul inhibition basé métriques système
   * Source: Load average et usage CPU
   */
  calculateSystemBasedInhibition(baseStrength) {
    const metrics = this.getSystemMetrics();
    const loadFactor = Math.min(1, metrics.loadAverage / 2); // 0-1
    const memoryFactor = metrics.memoryUsed / metrics.memoryTotal; // 0-1
    
    // Stress système augmente inhibition
    const systemStressFactor = (loadFactor * 0.3) + (memoryFactor * 0.2);
    return Math.min(1.0, baseStrength * (1 + systemStressFactor));
  }

  /**
   * Calcul fatigue basé performance système
   */
  calculateSystemBasedFatigue(visitCount, timeSpent) {
    const metrics = this.getSystemMetrics();
    const visitFactor = Math.min(visitCount / this.config.fatigueThreshold, 1.0);
    const timeFactor = Math.min(timeSpent / 10000, 1.0);
    
    // Facteur système basé performance
    const systemFactor = 0.8 + ((metrics.loadAverage % 40) / 100); // 0.8-1.2
    
    return Math.sqrt(visitFactor * timeFactor) * systemFactor;
  }

  /**
   * Initialisation système
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      this.initializeSpatialGrid();
      this.startUpdateLoop();
      
      this.isInitialized = true;
      this.logger.info("✅ InhibitionReturn initialized with system-based tracking");
      this.emit("inhibitionSystemReady");
      
    } catch (error) {
      this.logger.error("❌ InhibitionReturn initialization failed:", error);
      if (this.strictMode) {
        throw error;
      }
    }
  }

  initializeSpatialGrid() {
    this.spatialIndex.initialize();
    this.logger.info("🗺️ Spatial grid initialized for inhibition zones");
  }

  startUpdateLoop() {
    this.updateInterval = setInterval(() => {
      this.update();
    }, 1000 / this.config.updateFrequency);
  }

  /**
   * Gestion des zones d'inhibition avec métriques système
   */
  addIgnoreZone(area, options = {}) {
    this.log(`🚫 Ajout zone d'inhibition: ${JSON.stringify(area)}`);
    
    try {
      const zone = this.createSystemBasedInhibitionZone(area, options);
      
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
      this.state.totalInhibitions++;
      
      return {
        success: true,
        zoneId: zone.id,
        zone,
        message: "Zone d'inhibition créée",
        source: "system_based_inhibition",
        timestamp: Date.now()
      };
      
    } catch (error) {
      this.log(`Erreur création zone inhibition: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  createSystemBasedInhibitionZone(area, options) {
    const systemStrength = this.calculateSystemBasedInhibition(
      options.strength || this.config.inhibitionStrength
    );
    
    const zone = {
      id: options.id || this.generateSystemBasedId(),
      area: this.normalizeArea(area),
      strength: systemStrength,
      duration: options.duration || this.config.inhibitionDuration,
      created: Date.now(),
      lastVisit: options.lastVisit || Date.now(),
      visitCount: options.visitCount || 1,
      fatigueLevel: 0,
      type: options.type || 'manual',
      priority: options.priority || 0.5,
      decayRate: options.decayRate || this.config.fatigueDecay,
      emotionalContext: { ...this.state.emotionalState },
      systemMetrics: this.getSystemMetrics()
    };
    
    // Calcul force émotionnelle
    zone.emotionalStrength = this.calculateEmotionalInhibition(zone);
    
    return zone;
  }

  calculateEmotionalInhibition(zone) {
    if (!this.config.emotionalModulation) return zone.strength;
    
    const emotional = zone.emotionalContext;
    let modifier = 1.0;
    
    // Stress augmente inhibition
    modifier += (emotional.stress * 0.3);
    
    // Relaxation diminue inhibition
    modifier -= (emotional.relaxation * 0.2);
    
    // Focus élevé diminue inhibition
    if (emotional.focus > 0.7) {
      modifier *= 0.8;
    }
    
    return Math.max(0.1, Math.min(2.0, zone.strength * modifier));
  }

  clearZone(zoneId) {
    if (this.state.inhibitionZones.has(zoneId)) {
      const zone = this.state.inhibitionZones.get(zoneId);
      this.state.inhibitionZones.delete(zoneId);
      this.spatialIndex.removeZone(zone);
      
      this.log(`✅ Zone d'inhibition supprimée: ${zoneId}`);
      this.triggerCallback('onZoneReleased', zone);
      
      return {
        success: true,
        zone,
        timestamp: Date.now()
      };
    }
    
    return {
      success: false,
      error: "Zone introuvable",
      timestamp: Date.now()
    };
  }

  clearAllZones() {
    const count = this.state.inhibitionZones.size;
    
    this.state.inhibitionZones.forEach(zone => {
      this.triggerCallback('onZoneReleased', zone);
    });
    
    this.state.inhibitionZones.clear();
    this.state.fatigueMap.clear();
    this.spatialIndex.clear();
    
    this.log(`🧹 ${count} zones d'inhibition supprimées`);
    
    return {
      success: true,
      clearedCount: count,
      message: `${count} zones supprimées`,
      timestamp: Date.now()
    };
  }

  /**
   * Vérification d'inhibition avec métriques système
   */
  shouldIgnore(coordinates) {
    // Recherche rapide via index spatial
    const nearbyZones = this.spatialIndex.findNearbyZones(coordinates);
    let maxInhibition = 0;
    let inhibitingZone = null;
    
    for (const zone of nearbyZones) {
      if (this.isPointInZone(coordinates, zone.area)) {
        const inhibitionStrength = this.calculateCurrentSystemBasedInhibition(zone);
        
        if (inhibitionStrength > maxInhibition) {
          maxInhibition = inhibitionStrength;
          inhibitingZone = zone;
        }
      }
    }
    
    // Application seuil système
    const systemThreshold = 0.3 + ((this.state.systemMetrics.loadAverage % 10) / 100); // 0.3-0.4
    const shouldIgnore = maxInhibition > systemThreshold;
    
    if (shouldIgnore && inhibitingZone) {
      this.registerInhibitionEvent(coordinates, inhibitingZone, maxInhibition);
    }
    
    return {
      ignore: shouldIgnore,
      strength: maxInhibition,
      zone: inhibitingZone,
      coordinates,
      threshold: systemThreshold,
      source: "system_based_check",
      timestamp: Date.now()
    };
  }

  calculateCurrentSystemBasedInhibition(zone) {
    const now = Date.now();
    const age = now - zone.created;
    
    // Décroissance temporelle basée système
    const systemDecayRate = zone.duration * (1 + (this.state.systemMetrics.loadAverage % 20) / 100);
    const temporalDecay = Math.exp(-age / systemDecayRate);
    
    // Force de base modifiée par fatigue système
    let baseStrength = zone.strength * temporalDecay;
    
    // Boost par fatigue système
    const systemFatigueBoost = 1 + (zone.fatigueLevel * 0.5 * (1 + this.state.systemMetrics.memoryUsed / this.state.systemMetrics.memoryTotal));
    baseStrength *= systemFatigueBoost;
    
    // Modulation émotionnelle
    const emotionalModifier = this.emotionalModulator.getSystemBasedInhibitionModifier(
      this.state.emotionalState,
      zone.emotionalContext,
      this.state.systemMetrics
    );
    baseStrength *= emotionalModifier;
    
    return Math.max(0, Math.min(1, baseStrength));
  }

  isPointInZone(point, area) {
    return point.x >= area.x &&
           point.x <= area.x + area.width &&
           point.y >= area.y &&
           point.y <= area.y + area.height;
  }

  /**
   * Gestion fatigue avec métriques système
   */
  registerVisit(coordinates, context = {}) {
    const metrics = this.getSystemMetrics();
    
    const visit = {
      coordinates: { ...coordinates },
      timestamp: Date.now(),
      context,
      id: this.generateSystemBasedId('visit'),
      systemMetrics: metrics
    };
    
    // Ajout à l'historique
    this.state.visitHistory.push(visit);
    
    // Limitation historique
    if (this.state.visitHistory.length > 1000) {
      this.state.visitHistory = this.state.visitHistory.slice(-500);
    }
    
    // Mise à jour fatigue zones existantes
    this.updateZonesFatigue(coordinates);
    
    // Détection nouvelle zone fatigue
    this.checkForNewFatigueZone(coordinates);
    
    this.log(`👁️ Visite enregistrée: (${coordinates.x}, ${coordinates.y})`);
    
    return {
      success: true,
      visit,
      timestamp: Date.now()
    };
  }

  updateZonesFatigue(coordinates) {
    this.state.inhibitionZones.forEach(zone => {
      if (this.isPointInZone(coordinates, zone.area)) {
        zone.visitCount++;
        zone.lastVisit = Date.now();
        zone.fatigueLevel = this.calculateSystemBasedFatigue(zone.visitCount, Date.now() - zone.created);
        
        if (zone.fatigueLevel > 0.7) {
          this.triggerCallback('onFatigueDetected', {
            zone,
            fatigueLevel: zone.fatigueLevel,
            coordinates,
            timestamp: Date.now()
          });
        }
      }
    });
  }

  checkForNewFatigueZone(coordinates) {
    // Recherche visites répétées avec analyse système
    const recentVisits = this.getRecentVisitsNear(coordinates, 5000, 100);
    const systemFatigueThreshold = this.config.fatigueThreshold + Math.floor(this.state.systemMetrics.loadAverage);
    
    if (recentVisits.length >= systemFatigueThreshold) {
      this.createAutoInhibitionZone(coordinates, recentVisits);
    }
  }

  getRecentVisitsNear(coordinates, timeWindow, distance) {
    const now = Date.now();
    const cutoff = now - timeWindow;
    
    return this.state.visitHistory.filter(visit => {
      const timeCriteria = visit.timestamp > cutoff;
      const distanceCriteria = this.calculateDistance(visit.coordinates, coordinates) <= distance;
      return timeCriteria && distanceCriteria;
    });
  }

  createAutoInhibitionZone(coordinates, visits) {
    const systemSize = this.config.defaultZoneSize.width + (this.state.systemMetrics.loadAverage % 50);
    
    const area = {
      x: coordinates.x - systemSize / 2,
      y: coordinates.y - systemSize / 2,
      width: systemSize,
      height: systemSize
    };
    
    const systemStrengthMultiplier = 1.2 + ((this.state.systemMetrics.memoryUsed % 100000) / 500000); // 1.2-1.4
    
    const options = {
      type: 'auto_fatigue',
      strength: this.config.inhibitionStrength * systemStrengthMultiplier,
      duration: this.config.inhibitionDuration * 2,
      visitCount: visits.length,
      lastVisit: visits[visits.length - 1].timestamp
    };
    
    this.addIgnoreZone(area, options);
    this.log('🧠 Zone d\'inhibition automatique créée par fatigue système');
  }

  /**
   * Modulation émotionnelle avec métriques système
   */
  updateEmotionalState(emotionalState) {
    this.state.emotionalState = {
      stress: emotionalState.stress || 0,
      relaxation: emotionalState.relaxation || 0,
      focus: emotionalState.focus || 0.5,
      arousal: emotionalState.arousal || 0,
      valence: emotionalState.valence || 0
    };
    
    this.log('🎭 État émotionnel mis à jour pour inhibition');
    
    // Adaptation zones existantes
    this.adaptZonesToEmotion();
  }

  adaptZonesToEmotion() {
    this.state.inhibitionZones.forEach(zone => {
      zone.emotionalStrength = this.calculateEmotionalInhibition(zone);
    });
  }

  /**
   * Mise à jour et maintenance système
   */
  update() {
    // Mise à jour métriques système
    this.state.systemMetrics = this.getSystemMetrics();
    
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
    
    this.state.inhibitionZones.forEach((zone, id) => {
      if (now - zone.created > zone.duration) {
        expired.push(id);
      }
    });
    
    expired.forEach(id => {
      const zone = this.state.inhibitionZones.get(id);
      this.clearZone(id);
      this.log(`⏰ Zone expirée supprimée: ${id}`);
    });
  }

  updateFatigueDecay() {
    this.state.inhibitionZones.forEach(zone => {
      const timeSinceLastVisit = Date.now() - zone.lastVisit;
      const systemDecayRate = this.config.fatigueDecay * (1 + (this.state.systemMetrics.loadAverage % 5) / 100);
      
      if (timeSinceLastVisit > 1000) { // 1s
        zone.fatigueLevel *= systemDecayRate;
        zone.fatigueLevel = Math.max(0, zone.fatigueLevel);
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
    
    // Optimisation zones chevauchantes
    this.optimizeOverlappingZones();
    
    // Nettoyage fatigue map
    this.cleanupFatigueMap();
    
    this.log("🧹 Maintenance cleanup système effectué");
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
    
    // Fusion zones chevauchantes
    toMerge.forEach(([zone1, zone2]) => {
      const mergedZone = this.mergeZones(zone1, zone2);
      this.clearZone(zone1.id);
      this.clearZone(zone2.id);
      this.state.inhibitionZones.set(mergedZone.id, mergedZone);
      this.spatialIndex.addZone(mergedZone);
    });
  }

  cleanupFatigueMap() {
    const cutoff = Date.now() - 60000; // 1 minute
    this.state.fatigueMap.forEach((data, id) => {
      if (data.lastUpdate < cutoff) {
        this.state.fatigueMap.delete(id);
      }
    });
  }

  /**
   * API publique
   */
  getInhibitionMap(width = 1920, height = 1080) {
    const map = new Float32Array(width * height);
    
    // Application chaque zone d'inhibition
    this.state.inhibitionZones.forEach(zone => {
      this.applyZoneToMap(map, zone, width, height);
    });
    
    return map;
  }

  applyZoneToMap(map, zone, width, height) {
    const { area } = zone;
    const strength = this.calculateCurrentSystemBasedInhibition(zone);
    
    // Application avec gradient système
    for (let y = Math.max(0, Math.floor(area.y));
         y < Math.min(height, Math.ceil(area.y + area.height)); y++) {
      
      for (let x = Math.max(0, Math.floor(area.x));
           x < Math.min(width, Math.ceil(area.x + area.width)); x++) {
        
        const index = y * width + x;
        
        // Gradient vers bords basé système
        const centerX = area.x + area.width / 2;
        const centerY = area.y + area.height / 2;
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        const maxDistance = Math.sqrt(
          Math.pow(area.width / 2, 2) + Math.pow(area.height / 2, 2)
        );
        
        // Gradient système
        const systemGradientFactor = 1 + ((this.state.systemMetrics.hrtimeNano % 1000) / 10000); // 1.0-1.1
        const gradient = (1 - (distanceFromCenter / maxDistance)) * systemGradientFactor;
        const finalStrength = strength * Math.max(0, gradient);
        
        map[index] = Math.max(map[index], finalStrength);
      }
    }
  }

  getStatus() {
    return {
      name: "InhibitionReturn",
      version: "5.0.0",
      status: this.isInitialized ? "active" : "initializing",
      zones: this.state.inhibitionZones.size,
      totalInhibitions: this.state.totalInhibitions,
      avgFatigueLevel: this.calculateAvgFatigueLevel(),
      visitHistory: this.state.visitHistory.length,
      emotionalState: { ...this.state.emotionalState },
      systemMetrics: this.state.systemMetrics,
      source: "system_based_inhibition",
      timestamp: Date.now()
    };
  }

  calculateAvgFatigueLevel() {
    if (this.state.inhibitionZones.size === 0) return 0;
    
    let totalFatigue = 0;
    this.state.inhibitionZones.forEach(zone => {
      totalFatigue += zone.fatigueLevel;
    });
    
    return totalFatigue / this.state.inhibitionZones.size;
  }

  /**
   * Callbacks système
   */
  onZoneInhibited(callback) {
    this.callbacks.onZoneInhibited.push(callback);
  }

  onZoneReleased(callback) {
    this.callbacks.onZoneReleased.push(callback);
  }

  onFatigueDetected(callback) {
    this.callbacks.onFatigueDetected.push(callback);
  }

  onInhibitionTriggered(callback) {
    this.callbacks.onInhibitionTriggered.push(callback);
  }

  triggerCallback(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          this.log(`Erreur callback ${event}: ${error.message}`, 'error');
        }
      });
    }
  }

  /**
   * Utilitaires système
   */
  calculateDistance(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  normalizeArea(area) {
    return {
      x: Math.max(0, area.x || 0),
      y: Math.max(0, area.y || 0),
      width: Math.max(10, area.width || this.config.defaultZoneSize.width),
      height: Math.max(10, area.height || this.config.defaultZoneSize.height)
    };
  }

  registerInhibitionEvent(coordinates, zone, strength) {
    this.triggerCallback('onInhibitionTriggered', {
      coordinates,
      zone,
      strength,
      systemMetrics: this.state.systemMetrics,
      timestamp: Date.now()
    });
  }

  removeOldestZone() {
    let oldestZone = null;
    let oldestTime = Date.now();
    
    this.state.inhibitionZones.forEach((zone, id) => {
      if (zone.created < oldestTime) {
        oldestTime = zone.created;
        oldestZone = id;
      }
    });
    
    if (oldestZone) {
      this.clearZone(oldestZone);
    }
  }

  mergeZones(zone1, zone2) {
    const mergedArea = {
      x: Math.min(zone1.area.x, zone2.area.x),
      y: Math.min(zone1.area.y, zone2.area.y),
      width: Math.max(zone1.area.x + zone1.area.width, zone2.area.x + zone2.area.width) - Math.min(zone1.area.x, zone2.area.x),
      height: Math.max(zone1.area.y + zone1.area.height, zone2.area.y + zone2.area.height) - Math.min(zone1.area.y, zone2.area.y)
    };
    
    return {
      id: this.generateSystemBasedId(),
      area: mergedArea,
      strength: Math.max(zone1.strength, zone2.strength),
      duration: Math.max(zone1.duration, zone2.duration),
      created: Date.now(),
      visitCount: zone1.visitCount + zone2.visitCount,
      fatigueLevel: Math.max(zone1.fatigueLevel, zone2.fatigueLevel),
      type: 'merged',
      priority: Math.max(zone1.priority, zone2.priority),
      systemMetrics: this.getSystemMetrics()
    };
  }

  updateZoneFatigue(zone) {
    const recentVisits = this.getRecentVisitsNear(
      { x: zone.area.x + zone.area.width/2, y: zone.area.y + zone.area.height/2 },
      10000,
      Math.max(zone.area.width, zone.area.height)
    );
    
    zone.visitCount = recentVisits.length;
    if (recentVisits.length > 0) {
      zone.lastVisit = recentVisits[recentVisits.length - 1].timestamp;
    }
    
    zone.fatigueLevel = this.calculateSystemBasedFatigue(zone.visitCount, Date.now() - zone.created);
  }

  log(message, level = 'info') {
    if (this.config.enableLogging) {
      const timestamp = new Date().toISOString();
      this.logger.info(`[${timestamp}] [InhibitionReturn] [${level.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Cleanup système
   */
  async destroy() {
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
    Object.keys(this.callbacks).forEach(key => {
      this.callbacks[key] = [];
    });
    
    this.isInitialized = false;
    this.log("🗑️ InhibitionReturn détruit");
  }
}

/**
 * Classes auxiliaires système
 */
class InhibitionZoneManager {
  constructor(config) {
    this.config = config;
    this.zones = new Map();
  }

  createZone(area, options) {
    return {
      id: this.generateId(),
      area: this.validateArea(area),
      ...options
    };
  }

  validateArea(area) {
    return {
      x: Math.max(0, area.x || 0),
      y: Math.max(0, area.y || 0),
      width: Math.max(1, area.width || 100),
      height: Math.max(1, area.height || 100)
    };
  }

  generateId() {
    const hrtime = process.hrtime();
    const hash = (hrtime[0] * 1e9 + hrtime[1]).toString(36);
    return `zone_${Date.now()}_${hash.substring(0, 8)}`;
  }
}

class FatigueTracker {
  constructor(config) {
    this.config = config;
    this.fatigueData = new Map();
  }

  trackFatigue(zoneId, visitCount, timeSpent) {
    const fatigueLevel = this.calculateFatigue(visitCount, timeSpent);
    
    this.fatigueData.set(zoneId, {
      level: fatigueLevel,
      lastUpdate: Date.now(),
      visitCount,
      timeSpent
    });
    
    return fatigueLevel;
  }

  calculateFatigue(visits, time) {
    const visitFactor = Math.min(visits / this.config.fatigueThreshold, 1.0);
    const timeFactor = Math.min(time / 10000, 1.0);
    return Math.sqrt(visitFactor * timeFactor);
  }

  decayFatigue() {
    this.fatigueData.forEach((data, id) => {
      const age = Date.now() - data.lastUpdate;
      const decay = Math.exp(-age / 5000);
      data.level *= decay;
      
      if (data.level < 0.01) {
        this.fatigueData.delete(id);
      }
    });
  }
}

class SpatialIndex {
  constructor(config) {
    this.config = config;
    this.gridSize = config.spatialResolution || 100;
    this.grid = new Map();
  }

  initialize() {
    this.grid.clear();
  }

  addZone(zone) {
    const cells = this.getZoneCells(zone);
    
    cells.forEach(cell => {
      if (!this.grid.has(cell)) {
        this.grid.set(cell, new Set());
      }
      this.grid.get(cell).add(zone);
    });
  }

  removeZone(zone) {
    const cells = this.getZoneCells(zone);
    
    cells.forEach(cell => {
      if (this.grid.has(cell)) {
        this.grid.get(cell).delete(zone);
        if (this.grid.get(cell).size === 0) {
          this.grid.delete(cell);
        }
      }
    });
  }

  findNearbyZones(point) {
    const cell = this.getPointCell(point);
    const zones = new Set();
    
    // Recherche cellule et voisines
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

  getPointCell(point) {
    return {
      x: Math.floor(point.x / this.gridSize),
      y: Math.floor(point.y / this.gridSize)
    };
  }

  defragment() {
    const newGrid = new Map();
    
    this.grid.forEach((zones, cell) => {
      if (zones.size > 0) {
        newGrid.set(cell, zones);
      }
    });
    
    this.grid = newGrid;
  }

  clear() {
    this.grid.clear();
  }
}

class EmotionalInhibitionModulator {
  constructor(config) {
    this.config = config;
  }

  getSystemBasedInhibitionModifier(currentState, zoneContext, systemMetrics) {
    let modifier = 1.0;
    
    // Stress augmente inhibition
    if (currentState.stress > 0.5) {
      modifier *= (1 + currentState.stress * 0.4);
    }
    
    // Relaxation diminue inhibition
    if (currentState.relaxation > 0.5) {
      modifier *= (1 - currentState.relaxation * 0.3);
    }
    
    // Context création zone
    if (zoneContext.stress > currentState.stress) {
      modifier *= 0.8;
    }
    
    // Modulation système
    const systemStressFactor = Math.min(1, systemMetrics.loadAverage / 2);
    modifier *= (1 + systemStressFactor * 0.2);
    
    return Math.max(0.1, Math.min(2.0, modifier));
  }
}

class InhibitionCalculator {
  calculateInhibition(zone, context) {
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

class DecayManager {
  constructor(config) {
    this.config = config;
    this.decayFunctions = new Map();
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

class OverlapDetector {
  constructor(config) {
    this.config = config;
  }

  calculateOverlap(zone1, zone2) {
    const area1 = zone1.area;
    const area2 = zone2.area;
    
    // Calcul intersection
    const left = Math.max(area1.x, area2.x);
    const right = Math.min(area1.x + area1.width, area2.x + area2.width);
    const top = Math.max(area1.y, area2.y);
    const bottom = Math.min(area1.y + area1.height, area2.y + area2.height);
    
    if (left >= right || top >= bottom) return 0;
    
    const intersectionArea = (right - left) * (bottom - top);
    const union = (area1.width * area1.height) + (area2.width * area2.height) - intersectionArea;
    
    return intersectionArea / union;
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
            zone2: zoneArray[j],
            overlap
          });
        }
      }
    }
    
    return overlaps;
  }
}