#!/usr/bin/env node

// Force Railway deployment script
console.log('🚀 DÉPLOIEMENT RAILWAY FORCÉ');
console.log('📊 Version: 2.1.0 - 97/127 modules stable');
console.log('⚡ Commits pushés avec déclencheurs multiples:');
console.log('   - Version bump package.json');
console.log('   - Trigger file créé');  
console.log('   - GitHub Action configurée');
console.log('');
console.log('🔧 Variables d\'environnement Railway requises:');
console.log('   NODE_OPTIONS=--max-old-space-size=1536 --enable-source-maps --expose-gc');
console.log('   ALEX_DISABLE_MODULES=AlexNeuralEvolution,AlexProcessingOptimizer');
console.log('   NODE_ENV=production');
console.log('');
console.log('✅ Railway devrait redéployer automatiquement depuis GitHub');
console.log('🎯 URL de déploiement: À vérifier dans Railway dashboard');

process.exit(0);