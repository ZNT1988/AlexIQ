/**
 * @fileoverview AI Routes - Routes IA Harmonisées avec Nouvelle Architecture
 * API endpoints pour l'IA ALEX utilisant la nouvelle architecture centralisée
 *
 * @module AIRoutes
 * @version 3.0.0
 * @author ZNT Team - HustleFinder IA API
 * @since 2024
 */

import express from "express";
import { getHustleFinderCore } from "../core/HustleFinderCore.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { getOwnerIdentity } from "../alex-modules/core/OwnerIdentity.js";
import logger from "../config/logger.js";
import Joi from "joi";

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_CHAT = "chat";
const STR_ANALYSIS = "analysis";
const STR_GENERATION = "generation";
const STR_CONSCIOUSNESS = "consciousness";
const STR_ALEX = "alex";
const STR_GROWTH = "growth";
const STR_SOULPRINT = "soulprint";
const STR_HIGH = "high";

const router = express.Router();

// Validation schema
const aiRequestSchema = Joi.object({
  message: Joi.string().required().max(10000),
  type: Joi.string().valid(STR_CHAT, STR_ANALYSIS, STR_GENERATION, "trading", STR_CONSCIOUSNESS).default(STR_CHAT),
  context: Joi.object().optional(),
  model: Joi.string().valid(STR_ALEX, STR_CONSCIOUSNESS, STR_GROWTH, STR_SOULPRINT).default(STR_ALEX)
});

// Helper function to get user ID (simplified for new architecture)
async function getUserId(clerkId) {
  try {
    // Return the clerkId directly since we're not using complex database lookups in new architecture
    return clerkId || "anonymous_user";
  } catch (error) {
    logger.warn("Failed to resolve user ID:", error);
    return "fallback_user";
  }
}

// Inject owner context into requests
async function injectOwnerContext(req, context = {}) {
  try {
    const ownerIdentity = await getOwnerIdentity();
    const userId = await getUserId(req.auth?.userId);
    
    // Check if request comes from owner
    const isOwner = await ownerIdentity.verifyOwnership(req.body.message || "");
    
    if (isOwner) {
      const ownerRecognition = await ownerIdentity.recognizeOwner(context);
      return {
        ...context,
        isOwnerPresent: true,
        ownerRecognition,
        ownerContext: ownerIdentity.getOwnerContext(),
        userId
      };
    }
    
    return { ...context, isOwnerPresent: false, userId };
  } catch (error) {
    logger.warn("Failed to inject owner context:", error);
    return { ...context, isOwnerPresent: false, userId: await getUserId(req.auth?.userId) };
  }
}

// Log AI interaction (simplified for new architecture)
async function logInteraction(userId, interactionType, inputText, outputText, modelUsed, responseTime) {
  try {
    logger.info("AI Interaction logged", {
      userId,
      interactionType,
      modelUsed,
      responseTime,
      inputLength: inputText?.length || 0,
      outputLength: outputText?.length || 0
    });
  } catch (error) {
    // Logger fallback - ignore error
  }
}

/**
 * @route POST /api/ai/chat
 * @description Main AI chat endpoint using new HustleFinderCore with Owner Recognition
 * @access Private
 */
router.post("/chat", asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  // Validate input
  const { error, value } = aiRequestSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { message, type, context, model } = value;
  
  // 👑 INJECT OWNER CONTEXT
  const enrichedContext = await injectOwnerContext(req, context);
  const { userId, isOwnerPresent, ownerRecognition } = enrichedContext;

  logger.info("AI chat request", { userId, type, model, messageLength: message.length, isOwnerPresent });

  // Map model to request type for new architecture
  let requestType;
  switch (model) {
  case STR_CONSCIOUSNESS:
    requestType = STR_CONSCIOUSNESS;
    break;
  case STR_GROWTH:
    requestType = STR_GROWTH;
    break;
  case STR_SOULPRINT:
    requestType = STR_SOULPRINT;
    break;
  case STR_ALEX:
  default:
    requestType = STR_ALEX;
    break;
  }

  // 🌟 COMPAGNON UNIVERSEL: Process through Alex Universal Life Companion
  const alexUniversalCompanion = (await import("../systems/AlexUniversalCompanion.js")).default;

  const result = await alexUniversalCompanion.processUniversalMessage(
    message,
    userId,
    {
      type: requestType,
      originalContext: enrichedContext,
      requestType: type,
      model: model,
      timestamp: new Date().toISOString(),
      ownerPresent: isOwnerPresent,
      ownerRecognition
    }
  );

  const responseTime = Date.now() - startTime;

  // Log the interaction
  await logInteraction(
    userId,
    type,
    message,
    result.content,
    model,
    responseTime
  );

  res.json({
    response: JSON.stringify(result),
    type,
    model,
    response_time_ms: result.metrics?.responseTime || responseTime,
    context: result.userAnalysis || null,
    suggestions: result.contextual_suggestions || [],
    confidence: result.confidence || null,
    ownerRecognized: isOwnerPresent,
    personalizedGreeting: ownerRecognition?.greeting || null,
    metadata: {
      responseTime: result.metrics?.responseTime || responseTime,
      timestamp: result.timestamp,
      version: "6.0.0-Universal-Companion-Owner-Aware",
      contextAnalysis: {
        overall: result.contextRelevance || 0.8,
        intent: result.cognitiveInsights?.[0]?.type || "autonomous_thinking",
        continuity: result.memoryIntegration || 0.8,
        entities: 0.7,
        autonomyLevel: result.autonomyLevel || 0.8,
        cognitionDepth: result.metrics?.cognitionDepth || 0.7
      },
      userProfile: {
        interests: [],
        communicationStyle: { formalLevel: "informal" },
        lastUpdate: Date.now(),
        isOwner: isOwnerPresent
      },
      cached: false,
      ultraFast: result.metrics?.isUltraFast || false
    },
    success: !result.error
  });
}));

/**
 * @route POST /api/ai/analyze-idea
 * @description Analyze business idea using new architecture with Owner Context
 * @access Private
 */
router.post("/analyze-idea", asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { idea_text, focus_areas } = req.body;

  if (!idea_text) {
    return res.status(400).json({ error: "idea_text is required" });
  }

  // 👑 INJECT OWNER CONTEXT
  const enrichedContext = await injectOwnerContext(req, { analysis_type: "business_idea" });
  const { userId, isOwnerPresent } = enrichedContext;

  logger.info("AI idea analysis request", { userId, ideaLength: idea_text.length, isOwnerPresent });

  // Process through new HustleFinderCore with analysis context
  const core = getHustleFinderCore();
  const result = await core.processRequest({
    type: STR_ALEX,
    query: `Analyse cette idée business en détail: ${idea_text}`,
    context: {
      ...enrichedContext,
      focus_areas: focus_areas || [],
      detailed_analysis: true
    },
    userId
  });

  const responseTime = Date.now() - startTime;
  await logInteraction(userId, STR_ANALYSIS, idea_text, JSON.stringify(result.data), STR_ALEX, responseTime);

  res.json({
    analysis: result.data,
    response_time_ms: responseTime,
    metadata: result.metadata,
    success: result.success,
    ownerRecognized: isOwnerPresent
  });
}));

/**
 * @route GET /api/ai/health
 * @description Health check for AI systems using new architecture
 * @access Private
 */
router.get("/health", asyncHandler(async (req, res) => {
  logger.info("AI systems health check");

  try {
    const core = getHustleFinderCore();
    const systemStatus = core.getSystemStatus();
    
    // Test owner identity system
    const ownerIdentity = await getOwnerIdentity();
    const ownerStats = await ownerIdentity.getRecognitionStats();

    // Test each system component
    const systems = {
      core: systemStatus.initialized,
      alex: systemStatus.modules?.active?.includes("alexCore") || false,
      consciousness: systemStatus.modules?.active?.includes("neuroCore") || false,
      growth: systemStatus.modules?.active?.includes("growthSystem") || false,
      soulprint: systemStatus.modules?.active?.includes("soulPrint") || false,
      ownerIdentity: ownerIdentity.isVerified
    };

    const allHealthy = Object.values(systems).every(status => status);

    res.json({
      status: allHealthy ? "healthy" : "partial",
      systems,
      ownerIdentity: {
        verified: ownerIdentity.isVerified,
        recognitions: ownerStats.total_recognitions || 0,
        lastRecognition: ownerStats.last_recognition
      },
      system_info: {
        version: systemStatus.version,
        uptime: systemStatus.metrics?.uptime || 0,
        total_modules: systemStatus.modules?.total || 0,
        active_modules: systemStatus.modules?.active?.length || 0,
        consciousness_level: systemStatus.metrics?.consciousnessLevel || 0.75
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * Error handling middleware for AI routes
 */
router.use((error, req, res, next) => {
  logger.error("AI route error:", {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    userId: req.auth?.userId
  });

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Internal AI system error",
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

logger.info("🤖 AI routes initialized with Owner Identity integration");

export default router;