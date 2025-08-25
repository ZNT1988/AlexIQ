#!/usr/bin/env node
/**
 * Railway Production Startup Script
 * HustleFinder IA - Alex Backend
 * Zakaria Housni (ZNT)
 */

import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration Railway
const PORT = process.env.PORT || 3003;
const NODE_ENV = process.env.NODE_ENV || 'production';

console.log(`🚀 Starting HustleFinder IA on Railway`);
console.log(`📍 Port: ${PORT}`);
console.log(`🌍 Environment: ${NODE_ENV}`);
console.log(`👑 Owner: ${process.env.HF_OWNER_NAME || 'Zakaria Housni (ZNT)'}`);

// Vérifications pré-démarrage
function preflightChecks() {
  console.log('🔍 Running preflight checks...');
  
  // Vérifier que le fichier principal existe
  const mainFile = join(__dirname, 'index-ultra-minimal.js');
  if (!fs.existsSync(mainFile)) {
    console.error('❌ Main file not found:', mainFile);
    process.exit(1);
  }
  
  // Vérifier les répertoires critiques
  const criticalDirs = ['backend', 'backend/alex-modules', 'backend/core'];
  for (const dir of criticalDirs) {
    const dirPath = join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      console.error(`❌ Critical directory not found: ${dirPath}`);
      process.exit(1);
    }
  }
  
  console.log('✅ Preflight checks passed');
}

// Gestionnaire d'erreurs global
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Gestionnaire d'arrêt gracieux
function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  
  if (global.alexServer) {
    global.alexServer.close(() => {
      console.log('👋 Server closed');
      process.exit(0);
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.log('⏱️ Force shutdown');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Démarrage
async function start() {
  try {
    preflightChecks();
    
    console.log('🎯 Loading Alex Ultra Minimal...');
    
    // Charger dynamiquement le serveur principal
    const { default: startServer } = await import('./index-ultra-minimal.js');
    
    if (typeof startServer === 'function') {
      global.alexServer = await startServer();
    } else {
      console.log('🔄 Alex server already started via import');
    }
    
    console.log(`🌟 HustleFinder IA Alex is LIVE on Railway!`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/alex/status`);
    
  } catch (error) {
    console.error('💥 Startup failed:', error);
    process.exit(1);
  }
}

start();