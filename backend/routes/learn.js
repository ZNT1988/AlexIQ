/**
 * @fileoverview Learning API Routes - Endpoint pour feedback et apprentissage Alex
 * @module routes/learn
 * @version 1.0.0 - Authentic Learning API
 * @author ZNT Team - HustleFinder IA Learning Routes
 * @since 2025-08-30
 * 
 * RÔLE: API publique (mais protégée) pour ingérer les événements d'apprentissage
 * du frontend vers AlexMasterSystem
 */

import express from 'express';
import logger from '../config/logger.js';
import { AlexMasterSystem } from '../alex-modules/core/AlexMasterSystem.js';

const router = express.Router();

// Instance AlexMasterSystem (sera injectée)
let masterSystem = null;

/**
 * Injecter l'instance AlexMasterSystem
 * @param {AlexMasterSystem} instance
 */
export function injectMasterSystem(instance) {
  masterSystem = instance;
  logger.info('🔌 MasterSystem injected into learning routes');
}

/**
 * Middleware pour vérifier que MasterSystem est disponible
 */
function requireMasterSystem(req, res, next) {
  if (!masterSystem) {
    return res.status(503).json({
      error: 'learning_system_unavailable',
      message: 'Alex learning system is not initialized'
    });
  }
  next();
}

/**
 * Extraire l'IP client (avec proxy support)
 * @param {Request} req
 * @returns {string}
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         'unknown';
}

/**
 * POST /api/learn - Endpoint principal pour ingérer événements d'apprentissage
 * 
 * Body attendu:
 * {
 *   type: 'message'|'feedback'|'rating'|'correction'|'click'|'goal_done',
 *   sessionId: string,
 *   userId?: string,
 *   text?: string,
 *   aiResponseId?: string,
 *   label?: 'helpful'|'not_helpful'|'hallucination'|'to_improve',
 *   rating?: 1|2|3|4|5,
 *   correction?: { before: string, after: string },
 *   meta?: Record<string, any>,
 *   ts: number // Date.now()
 * }
 */
router.post('/learn', requireMasterSystem, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const clientIP = getClientIP(req);
    const event = req.body;
    
    // Ajouter timestamp si manquant
    if (!event.ts) {
      event.ts = Date.now();
    }

    // Log de l'événement reçu
    logger.info('📚 Learning event received', {
      type: event.type,
      sessionId: event.sessionId?.slice(-8),
      clientIP: clientIP.slice(0, 10),
      hasText: !!event.text,
      hasRating: !!event.rating,
      hasCorrection: !!event.correction
    });

    // Ingérer via MasterSystem
    const result = await masterSystem.ingestFrontEvent(event, clientIP);
    
    const responseTime = Date.now() - startTime;
    
    if (result.accepted) {
      // Succès
      const stats = masterSystem.getStats();
      
      res.status(200).json({
        accepted: true,
        eventId: result.eventId,
        pendingJobs: stats.totalEvents,
        responseTime,
        message: 'Event ingested successfully - Alex is learning!'
      });
      
      logger.info('✅ Learning event processed', {
        eventId: result.eventId?.slice(0, 8),
        responseTime,
        totalEvents: stats.totalEvents
      });
      
    } else {
      // Rejeté
      res.status(400).json({
        accepted: false,
        reason: result.reason,
        responseTime,
        message: 'Event rejected - check format and rate limits'
      });
      
      logger.warn('❌ Learning event rejected', {
        reason: result.reason,
        type: event.type,
        sessionId: event.sessionId?.slice(-8),
        responseTime
      });
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    logger.error('💥 Learning endpoint error', error);
    
    res.status(500).json({
      accepted: false,
      reason: 'internal_error',
      responseTime,
      message: 'Internal error processing learning event'
    });
  }
});

/**
 * GET /api/learn/stats - Statistiques du système d'apprentissage
 */
router.get('/learn/stats', requireMasterSystem, (req, res) => {
  try {
    const stats = masterSystem.getStats();
    
    res.status(200).json({
      ok: true,
      learningStats: {
        totalEvents: stats.totalEvents,
        eventsRejected: stats.eventsRejected,
        eventsByType: stats.eventsByType,
        lastEvent: stats.lastEvent,
        uptime: stats.uptime,
        rateLimitEntries: stats.rateLimitEntries,
        processedEventsCount: stats.processedEventsCount
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('💥 Learning stats error', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to get learning stats'
    });
  }
});

/**
 * POST /api/learn/cleanup - Nettoyer les caches (admin seulement)
 */
router.post('/learn/cleanup', requireMasterSystem, (req, res) => {
  try {
    masterSystem.cleanup();
    
    res.status(200).json({
      ok: true,
      message: 'Learning system caches cleaned'
    });
    
    logger.info('🧹 Learning system cleanup performed');
    
  } catch (error) {
    logger.error('💥 Learning cleanup error', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to cleanup learning system'
    });
  }
});

/**
 * Middleware d'erreur pour les routes d'apprentissage
 */
router.use((error, req, res, next) => {
  logger.error('💥 Learning routes error', error);
  
  res.status(500).json({
    accepted: false,
    reason: 'internal_error',
    message: 'Learning system error',
    timestamp: new Date().toISOString()
  });
});

export default router;