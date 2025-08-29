#!/usr/bin/env node

/**
 * 🏥 HEALTH CHECK ENDPOINT
 * Endpoint pour monitoring et vérification de l'état des modules
 */

import ownerIdentity from './alex-modules/core/OwnerIdentity.js';
import alexAuthenticCore from './alex-modules/core/AlexAuthenticCore.js';
import alexIntelligentCore from './alex-modules/core/AlexIntelligentCore.js';
import autonomyCore from './alex-modules/core/AutonomyCore.js';
import { getAIProvidersStatus } from './config/aiKeys.js';

const startTime = Date.now();

/**
 * Vérifie l'état de santé de tous les modules
 */
export async function getHealthStatus() {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  
  try {
    // Status des modules core
    const moduleStates = await Promise.allSettled([
      Promise.resolve(ownerIdentity.getStatus()),
      Promise.resolve(alexAuthenticCore.getStatus()), 
      Promise.resolve(alexIntelligentCore.getStatus()),
      Promise.resolve(autonomyCore.getStatus())
    ]);

    const modules = {
      ownerIdentity: moduleStates[0].status === 'fulfilled' ? moduleStates[0].value : { error: moduleStates[0].reason?.message },
      alexAuthenticCore: moduleStates[1].status === 'fulfilled' ? moduleStates[1].value : { error: moduleStates[1].reason?.message },
      alexIntelligentCore: moduleStates[2].status === 'fulfilled' ? moduleStates[2].value : { error: moduleStates[2].reason?.message },
      autonomyCore: moduleStates[3].status === 'fulfilled' ? moduleStates[3].value : { error: moduleStates[3].reason?.message }
    };

    // Calculer les métriques globales
    const initializedCount = Object.values(modules).filter(m => m.initialized === true).length;
    const totalModules = 4;
    const healthScore = (initializedCount / totalModules) * 100;

    // Status des providers IA
    const aiProviders = getAIProvidersStatus();

    // Métriques système
    const memUsage = process.memoryUsage();
    
    return {
      status: healthScore >= 75 ? 'healthy' : healthScore >= 50 ? 'degraded' : 'unhealthy',
      uptime,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      
      health: {
        score: healthScore,
        modulesInitialized: `${initializedCount}/${totalModules}`,
        aiConfigured: aiProviders.configured
      },

      modules,
      
      ai: aiProviders,
      
      system: {
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024),
          rss: Math.round(memUsage.rss / 1024 / 1024)
        },
        uptime: uptime,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
    
  } catch (error) {
    return {
      status: 'error',
      uptime,
      timestamp: new Date().toISOString(),
      error: error.message,
      health: { score: 0, modulesInitialized: '0/4', aiConfigured: false }
    };
  }
}

/**
 * Health check simple (pour load balancer)
 */
export async function getSimpleHealth() {
  try {
    const health = await getHealthStatus();
    return {
      ok: health.status === 'healthy',
      uptime: health.uptime,
      timestamp: health.timestamp
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Si exécuté directement, afficher le status
if (import.meta.url === `file://${process.argv[1]}`) {
  const health = await getHealthStatus();
  console.log(JSON.stringify(health, null, 2));
  process.exit(health.status === 'healthy' ? 0 : 1);
}