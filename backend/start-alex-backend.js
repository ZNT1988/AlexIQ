#!/usr/bin/env node

/**
 * 🚀 Alex Backend Starter - HustleFinder IA
 * Point d'entrée principal pour le backend Alex
 */

// Utilisation version minimale pour l'instant
import('./index-minimal.js').catch(error => {
  console.error('💥 Fatal error starting Alex backend:', error);
  process.exit(1);
});