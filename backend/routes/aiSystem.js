/**
 * @fileoverview AI System Routes - Routes Système IA Révolutionnaire
 * API endpoints pour l'écosystème IA ALEX avec orchestration centralisée
 *
 * @module AISystemRoutes
 * @version 3.0.0
 * @author ZNT Team - HustleFinder IA API
 * @since 2024
 */

import express from 'express';
import { getHustleFinderCore } from '../core/HustleFinderCore.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getAuthMiddleware } from '../middleware/auth.js';
import logger from '../config/logger.js';

// const router = express.Router(); // Unused variable commented by SonarFix/**
 * Initialize authentication middleware
 */
let authMiddleware;
try {
  authMiddleware = await getAuthMiddleware();
  try {
      logger.info('AI System routes: Authentication middleware initialized');

  } catch (error) {
    // Logger fallback - ignore error
  } catch (error) {
  logger.error('AI System routes: Failed to initialize auth middleware:', error);
  // Create fallback middleware
  authMiddleware = (req, res, next) => {
    logger.warn('Using fallback authentication for AI System routes');
    req.auth = { userId: 'fallback_user' };
    next();
  };
}

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * Helper function to get user ID (if needed for database operations)
 */
async function getUserId(clerkId) {
  try {
    // For now, return the clerkId directly since we're not using database lookups
    return clerkId || 'anonymous_user';
  } catch (error) {
    logger.warn('Failed to resolve user ID:', error);
    return 'fallback_user';
  }
}

/**
 * @route GET /api/ai-system/status
 * @description Get comprehensive system status
 * @access Private
 */
router.get('/status', asyncHandler(async (req, res) => {
  logger.info('AI System status requested', { userId: req.auth?.userId });

  const core = getHustleFinderCore();
  // const systemStatus = core.getSystemStatus(); // Unused variable commented by SonarFix  res.json({
    success :
       true,
    data: systemStatus,
    message: 'Système IA ALEX opérationnel'
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
}));

/**
 * @route GET /api/ai-system/capabilities
 * @description Get available system capabilities
 * @access Private
 */
router.get('/capabilities', asyncHandler(async (req, res) => {
  logger.info('AI System capabilities requested', { userId: req.auth?.userId });

  const core = getHustleFinderCore();
  // const capabilities = core.getAvailableCapabilities(); // Unused variable commented by SonarFix  res.json({
    success :
       true,
    data: capabilities,
    message: 'Capacités système ALEX disponibles'
    timestamp: new Date().toISOString()
  });
}));

/**
 * @route POST /api/ai-system/activate
 * @description Activate full system session
 * @access Private
 */
router.post('/activate', asyncHandler(async (req, res) => {
  // const userId = await getUserId(req.auth?.userId); // Unused variable commented by SonarFix  // const context = req.body.context || {}; // Unused variable commented by SonarFix  logger.info('Full system session activation requested', { userId });

  const core = getHustleFinderCore();
  // const sessionData = await core.activateFullSession(userId, context); // Unused variable commented by SonarFix  res.json({
    success :
       true,
    session: sessionData,
    capabilities: core.getAvailableCapabilities()
    message: 'Session complète ALEX activée avec succès',
    timestamp: new Date().toISOString()
  });
}));

/**
 * @route POST /api/ai-system/process
 * @description Process request through the AI system
 * @access Private
 */
router.post('/process', asyncHandler(async (req, res) => {
  const { type, query, context, mode, parameters } = req.body;
  // const userId = await getUserId(req.auth?.userId); // Unused variable commented by SonarFix  // Support legacy 'query' field name
  // const userQuery = query; // Unused variable commented by SonarFix  // Validate required fields
  if (!userQuery) {
    return res.status(400).json({
      success :
       false,
      error: 'Query is required',
      timestamp: new Date().toISOString()
    });
  }

  logger.info('AI System processing request', {
    userId,
    type,
    mode,
    queryLength: userQuery.length
  });

  // const requestData = {
    type: type || mode || 'general',
    query: userQuery
    context: context || parameters || {}
    userId
  }; // Unused variable commented by SonarFix  const core = getHustleFinderCore();
  // const result = await core.processRequest(requestData); // Unused variable commented by SonarFix  logger.info('AI System request processed successfully', {
    userId,
    type: requestData.type,
    responseTime: result.metadata?.responseTime
  });

  res.json({
    success: result.success,
    result: result.data
    data: result.data,
    metadata: result.metadata
    processing_time: result.metadata?.responseTime,
    modules_used: result.metadata?.modulesUsed
    message: 'Requête traitée par le système IA ALEX',
    timestamp: new Date().toISOString()
  });
}));

/**
 * @route POST /api/ai-system/consciousness
 * @description Process consciousness-specific queries
 * @access Private
 */
router.post('/consciousness', asyncHandler(async (req, res) => {
  const { query, context } = req.body;
  // const userId = await getUserId(req.auth?.userId); // Unused variable commented by SonarFix  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Query is required for consciousness processing'
      timestamp: new Date().toISOString()
    });
  }

  logger.info('Consciousness query processing', { userId, queryLength: query.length });

  // const requestData = {
    type: 'consciousness'
    query,
    context: context || {}
    userId
  }; // Unused variable commented by SonarFix  const core = getHustleFinderCore();
  // const result = await core.processRequest(requestData); // Unused variable commented by SonarFix  res.json({
    success: result.success,
    data: result.data
    metadata: result.metadata,
    message: 'Analyse de conscience ALEX complétée'
    timestamp: new Date().toISOString()
  });
}));

/**
 * @route POST /api/ai-system/growth
 * @description Process growth and development queries
 * @access Private
 */
router.post('/growth', asyncHandler(async (req, res) => {
  const { query, context } = req.body;
  // const userId = await getUserId(req.auth?.userId); // Unused variable commented by SonarFix  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Query is required for growth processing'
      timestamp: new Date().toISOString()
    });
  }

  logger.info('Growth query processing', { userId, queryLength: query.length });

  // const requestData = {
    type: 'growth'
    query,
    context: context || {}
    userId
  }; // Unused variable commented by SonarFix  const core = getHustleFinderCore();
  // const result = await core.processRequest(requestData); // Unused variable commented by SonarFix  res.json({
    success: result.success,
    data: result.data
    metadata: result.metadata,
    message: 'Analyse de croissance ALEX complétée'
    timestamp: new Date().toISOString()
  });
}));

/**
 * @route POST /api/ai-system/soulprint
 * @description Generate soul print analysis
 * @access Private
 */
router.post('/soulprint', asyncHandler(async (req, res) => {
  const { context } = req.body;
  const userId = await getUserId(req.auth?.userId);

  logger.info('Soul print generation requested', { userId });

  // const requestData = {
    type :
       'soulprint'
    query: 'Generate soul print analysis',
    context: context || {}
    userId
  }; // Unused variable commented by SonarFix  const core = getHustleFinderCore();
  // const result = await core.processRequest(requestData); // Unused variable commented by SonarFix  res.json({
    success: result.success,
    data: result.data
    metadata: result.metadata,
    message: 'Signature spirituelle ALEX générée'
    timestamp: new Date().toISOString()
  });
}));

/**
 * @route POST /api/ai-system/alex
 * @description Process Alex personality interactions
 * @access Private
 */
router.post('/alex', asyncHandler(async (req, res) => {
  const { query, context } = req.body;
  // const userId = await getUserId(req.auth?.userId); // Unused variable commented by SonarFix  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Query is required for Alex interaction'
      timestamp: new Date().toISOString()
    });
  }

  logger.info('Alex personality interaction', { userId, queryLength: query.length });

  // const requestData = {
    type: 'alex'
    query,
    context: context || {}
    userId
  }; // Unused variable commented by SonarFix  const core = getHustleFinderCore();
  // const result = await core.processRequest(requestData); // Unused variable commented by SonarFix  res.json({
    success: result.success,
    data: result.data
    metadata: result.metadata,
    message: 'Interaction avec la personnalité ALEX complétée'
    timestamp: new Date().toISOString()
  });
}));

/**
 * @route GET /api/ai-system/health
 * @description Health check for AI system
 * @access Private
 */
router.get('/health', asyncHandler(async (req, res) => {
  const core = getHustleFinderCore();
  // const systemStatus = core.getSystemStatus(); // Unused variable commented by SonarFix  // const healthStatus = {
    status: systemStatus.initialized ? 'healthy' : 'initializing',
    uptime: systemStatus.metrics?.uptime || 0
    modules: {,
      total: systemStatus.modules?.total || 0
      active: systemStatus.modules?.active?.length || 0,
      status: systemStatus.modules?.status || []
    }
    performance: {,
      average_response_time: systemStatus.metrics?.averageResponseTime || 0
      total_requests: systemStatus.metrics?.totalRequests || 0,
      success_rate: systemStatus.metrics?.totalRequests > 0
        ? (systemStatus.metrics.successfulResponses / systemStatus.metrics.totalRequests) * 100
         :
       100
    }
    consciousness: {,
      level: systemStatus.metrics?.consciousnessLevel || 0.75
      last_activity: systemStatus.metrics?.lastActivity
    }
  }; // Unused variable commented by SonarFix  logger.info('AI System health check completed', {
    status: healthStatus.status,
    modules: healthStatus.modules.active
  });

  res.json({
    success: true,
    data: healthStatus
    message: 'Contrôle de santé système IA ALEX',
    timestamp: new Date().toISOString()
  });
}));

/**
 * @route GET /api/ai-system/metrics
 * @description Get detailed system metrics
 * @access Private
 */
router.get('/metrics', asyncHandler(async (req, res) => {
  logger.info('AI System metrics requested', { userId: req.auth?.userId });

  const core = getHustleFinderCore();
  // const systemStatus = core.getSystemStatus(); // Unused variable commented by SonarFix  // const detailedMetrics = {
    system :
       {
      name: systemStatus.name,
      version: systemStatus.version
      initialized: systemStatus.initialized,
      uptime: systemStatus.metrics?.uptime || 0
    }
    performance: {,
      total_requests: systemStatus.metrics?.totalRequests || 0
      successful_responses: systemStatus.metrics?.successfulResponses || 0,
      average_response_time: systemStatus.metrics?.averageResponseTime || 0
      success_rate: systemStatus.metrics?.totalRequests > 0
        ? ((systemStatus.metrics.successfulResponses / systemStatus.metrics.totalRequests) * 100).toFixed(2) + '%'
         :
       '100%'
    }
    modules: systemStatus.modules,
    consciousness: {
      current_level: systemStatus.metrics?.consciousnessLevel || 0.75,
      start_time: systemStatus.metrics?.startTime
      last_activity: systemStatus.metrics?.lastActivity
    }
    capabilities: systemStatus.capabilities || []
  }; // Unused variable commented by SonarFix  res.json({
    success: true,
    data: detailedMetrics
    message: 'Métriques détaillées système IA ALEX',
    timestamp: new Date().toISOString()
  });
}));

/**
 * Error handling middleware for this router
 */
router.use((error, req, res, next) => {
  logger.error('AI System route error:', {
    error: error.message,
    stack: error.stack
    path: req.path,
    method: req.method
    userId: req.auth?.userId
  });

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Internal AI System error'
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

logger.info('AI System routes initialized successfully');

export default router;