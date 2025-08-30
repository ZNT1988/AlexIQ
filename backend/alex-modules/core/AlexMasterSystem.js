/**
 * @fileoverview AlexMasterSystem - L'Orchestrateur Principal Alex IQ
 * @module AlexMasterSystem  
 * @version 1.0.0 - Authentic Learning Architecture
 * @author ZNT Team - HustleFinder IA Master System
 * @since 2025-08-30
 * 
 * RÔLE: Capter tous les événements du front, les normaliser et les router
 * vers les bons sous-modules (IntelligentCore, AuthenticCore, SelfLearning, mémoire...)
 * 
 * IMPORTANT: Event Bus interne (in-proc, pas Kafka) pour apprentissage authentique
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import logger from '../../config/logger.js';

/**
 * @typedef {Object} FrontEvent
 * @property {'message'|'feedback'|'rating'|'correction'|'click'|'goal_done'} type
 * @property {string} sessionId
 * @property {string} [userId]
 * @property {string} [text]
 * @property {string} [aiResponseId]
 * @property {'helpful'|'not_helpful'|'hallucination'|'to_improve'} [label]
 * @property {1|2|3|4|5} [rating]
 * @property {Object} [correction]
 * @property {string} correction.before
 * @property {string} correction.after
 * @property {Record<string, any>} [meta]
 * @property {number} ts - Date.now()
 */

/**
 * AlexMasterSystem - L'Orchestrateur Principal
 * Event Bus interne pour apprentissage authentique Alex
 * @extends EventEmitter
 */
export class AlexMasterSystem extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      // Rate limiting
      maxEventsPerSecond: config.maxEventsPerSecond || 10,
      rateLimitWindow: config.rateLimitWindow || 1000, // 1 second
      
      // Event processing
      enableIdempotency: config.enableIdempotency !== false,
      maxEventAge: config.maxEventAge || 24 * 60 * 60 * 1000, // 24h
      
      // Routing configuration
      enableIntelligentCore: config.enableIntelligentCore !== false,
      enableAuthenticCore: config.enableAuthenticCore !== false,
      enableSelfLearning: config.enableSelfLearning !== false,
      
      // Debug mode
      debugMode: config.debugMode || false
    };

    // Rate limiting state
    this.rateLimitMap = new Map(); // IP+sessionId -> {count, windowStart}
    this.processedEvents = new Set(); // Pour idempotency
    
    // Module references (seront injectées)
    this.intelligentCore = null;
    this.authenticCore = null;
    this.selfLearning = null;
    
    // Statistics
    this.stats = {
      totalEvents: 0,
      eventsRejected: 0,
      eventsByType: {},
      lastEvent: null,
      startTime: Date.now()
    };

    logger.info('🎛️ AlexMasterSystem initialized - Event orchestrator ready');
  }

  /**
   * Injecter les modules pour le routing
   * @param {Object} modules
   * @param {Object} modules.intelligentCore
   * @param {Object} modules.authenticCore 
   * @param {Object} modules.selfLearning
   */
  injectModules(modules) {
    this.intelligentCore = modules.intelligentCore;
    this.authenticCore = modules.authenticCore;
    this.selfLearning = modules.selfLearning;
    
    logger.info('🔌 AlexMasterSystem modules injected', {
      intelligentCore: !!this.intelligentCore,
      authenticCore: !!this.authenticCore,
      selfLearning: !!this.selfLearning
    });
  }

  /**
   * Point d'entrée principal - Ingérer un événement du frontend
   * @param {FrontEvent} event - Événement normalisé du frontend
   * @param {string} [clientIP] - IP du client pour rate limiting
   * @returns {Promise<{accepted: boolean, reason?: string, eventId?: string}>}
   */
  async ingestFrontEvent(event, clientIP = 'unknown') {
    try {
      // 1. Validation et normalisation
      const validationResult = this.validateEvent(event);
      if (!validationResult.valid) {
        this.stats.eventsRejected++;
        return { accepted: false, reason: validationResult.reason };
      }

      // 2. Rate limiting
      const rateLimitResult = this.checkRateLimit(clientIP, event.sessionId);
      if (!rateLimitResult.allowed) {
        this.stats.eventsRejected++;
        logger.warn('🚨 Rate limit exceeded', { clientIP, sessionId: event.sessionId });
        return { accepted: false, reason: 'rate_limit_exceeded' };
      }

      // 3. Idempotency check
      const eventId = this.generateEventId(event);
      if (this.config.enableIdempotency && this.processedEvents.has(eventId)) {
        return { accepted: true, reason: 'duplicate_event', eventId };
      }

      // 4. Enrichir l'événement
      const enrichedEvent = {
        ...event,
        eventId,
        clientIP,
        ingestedAt: Date.now(),
        source: 'frontend'
      };

      // 5. Router vers les modules appropriés
      await this.routeEvent(enrichedEvent);

      // 6. Marquer comme traité
      if (this.config.enableIdempotency) {
        this.processedEvents.add(eventId);
        // Nettoyer les anciens eventIds (éviter fuite mémoire)
        if (this.processedEvents.size > 10000) {
          const oldEntries = Array.from(this.processedEvents).slice(0, 5000);
          oldEntries.forEach(id => this.processedEvents.delete(id));
        }
      }

      // 7. Mettre à jour les stats
      this.updateStats(enrichedEvent);

      logger.info('✅ Event ingested and routed', { 
        type: event.type, 
        sessionId: event.sessionId.slice(-8),
        eventId: eventId.slice(0, 8) 
      });

      return { accepted: true, eventId };

    } catch (error) {
      logger.error('❌ Error ingesting front event', error);
      this.stats.eventsRejected++;
      return { accepted: false, reason: 'internal_error' };
    }
  }

  /**
   * Valider la structure d'un événement
   * @param {FrontEvent} event
   * @returns {{valid: boolean, reason?: string}}
   */
  validateEvent(event) {
    // Vérifications de base
    if (!event || typeof event !== 'object') {
      return { valid: false, reason: 'invalid_event_structure' };
    }

    // Type requis
    const validTypes = ['message', 'feedback', 'rating', 'correction', 'click', 'goal_done'];
    if (!validTypes.includes(event.type)) {
      return { valid: false, reason: 'invalid_event_type' };
    }

    // SessionId requis
    if (!event.sessionId || typeof event.sessionId !== 'string') {
      return { valid: false, reason: 'missing_session_id' };
    }

    // Timestamp requis et récent
    if (!event.ts || typeof event.ts !== 'number') {
      return { valid: false, reason: 'missing_timestamp' };
    }

    const eventAge = Date.now() - event.ts;
    if (eventAge > this.config.maxEventAge) {
      return { valid: false, reason: 'event_too_old' };
    }

    // Validations spécifiques par type
    switch (event.type) {
      case 'rating':
        if (!event.rating || ![1,2,3,4,5].includes(event.rating)) {
          return { valid: false, reason: 'invalid_rating_value' };
        }
        break;
      
      case 'feedback':
        const validLabels = ['helpful', 'not_helpful', 'hallucination', 'to_improve'];
        if (!event.label || !validLabels.includes(event.label)) {
          return { valid: false, reason: 'invalid_feedback_label' };
        }
        break;
      
      case 'correction':
        if (!event.correction || !event.correction.before || !event.correction.after) {
          return { valid: false, reason: 'invalid_correction_structure' };
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Vérifier le rate limiting
   * @param {string} clientIP
   * @param {string} sessionId
   * @returns {{allowed: boolean, remaining: number}}
   */
  checkRateLimit(clientIP, sessionId) {
    const key = `${clientIP}:${sessionId}`;
    const now = Date.now();
    
    const entry = this.rateLimitMap.get(key);
    
    if (!entry) {
      // Première requête pour cette clé
      this.rateLimitMap.set(key, { count: 1, windowStart: now });
      return { allowed: true, remaining: this.config.maxEventsPerSecond - 1 };
    }

    // Reset window si nécessaire
    if (now - entry.windowStart >= this.config.rateLimitWindow) {
      entry.count = 1;
      entry.windowStart = now;
      return { allowed: true, remaining: this.config.maxEventsPerSecond - 1 };
    }

    // Vérifier si limite atteinte
    if (entry.count >= this.config.maxEventsPerSecond) {
      return { allowed: false, remaining: 0 };
    }

    // Incrémenter compteur
    entry.count++;
    return { allowed: true, remaining: this.config.maxEventsPerSecond - entry.count };
  }

  /**
   * Générer un ID unique pour l'événement (idempotency)
   * @param {FrontEvent} event
   * @returns {string}
   */
  generateEventId(event) {
    const content = JSON.stringify({
      type: event.type,
      sessionId: event.sessionId,
      text: event.text,
      rating: event.rating,
      label: event.label,
      correction: event.correction,
      ts: event.ts
    });
    
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Router l'événement vers les modules appropriés
   * @param {Object} enrichedEvent - Événement enrichi avec métadonnées
   */
  async routeEvent(enrichedEvent) {
    const routingPromises = [];

    // Émettre l'événement sur le bus interne
    this.emit('front_event', enrichedEvent);

    // Router vers IntelligentCore pour apprentissage
    if (this.config.enableIntelligentCore && this.intelligentCore?.learnFromInteraction) {
      routingPromises.push(
        this.intelligentCore.learnFromInteraction(enrichedEvent)
          .catch(error => logger.error('❌ IntelligentCore routing error', error))
      );
    }

    // Router vers AuthenticCore pour expérience
    if (this.config.enableAuthenticCore && this.authenticCore) {
      // Increment experience on feedback/rating/correction
      if (['feedback', 'rating', 'correction'].includes(enrichedEvent.type)) {
        routingPromises.push(
          Promise.resolve(this.authenticCore.incrementExperience?.(1))
            .catch(error => logger.error('❌ AuthenticCore routing error', error))
        );
      }
    }

    // Router vers SelfLearning queue
    if (this.config.enableSelfLearning && this.selfLearning?.enqueue) {
      routingPromises.push(
        this.selfLearning.enqueue(enrichedEvent)
          .catch(error => logger.error('❌ SelfLearning routing error', error))
      );
    }

    // Attendre tous les routings (non-bloquant)
    await Promise.allSettled(routingPromises);
  }

  /**
   * Mettre à jour les statistiques
   * @param {Object} event
   */
  updateStats(event) {
    this.stats.totalEvents++;
    this.stats.eventsByType[event.type] = (this.stats.eventsByType[event.type] || 0) + 1;
    this.stats.lastEvent = {
      type: event.type,
      sessionId: event.sessionId.slice(-8),
      timestamp: event.ingestedAt
    };
  }

  /**
   * Obtenir les statistiques du système
   * @returns {Object}
   */
  getStats() {
    return {
      ...this.stats,
      uptime: Date.now() - this.stats.startTime,
      rateLimitEntries: this.rateLimitMap.size,
      processedEventsCount: this.processedEvents.size
    };
  }

  /**
   * Nettoyer les ressources (rate limit cache, etc.)
   */
  cleanup() {
    // Nettoyer rate limit map (entrées anciennes)
    const now = Date.now();
    for (const [key, entry] of this.rateLimitMap.entries()) {
      if (now - entry.windowStart > this.config.rateLimitWindow * 2) {
        this.rateLimitMap.delete(key);
      }
    }
  }
}

export default AlexMasterSystem;