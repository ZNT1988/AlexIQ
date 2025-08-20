#!/usr/bin/env node

/**
 * QUICK SYNTAX SCAN - Compte rapide des erreurs syntaxiques
 * Scan uniquement les fichiers du projet (pas node_modules)
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 QUICK SYNTAX SCAN - Comptage Erreurs');
console.log('=======================================\n');

let totalFiles = 0;
let totalErrors = 0;
let errorFiles = 0;

/**
 * Test de syntaxe basique sur un fichier JS
 */
function hasJsSyntaxError(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    
    // Tests rapides de syntaxes malformées communes
    const errorPatterns = [
      /Unexpected token/i,
      /Unterminated string/i,
      /Invalid character/i,
      /Parsing error/i,
      /SyntaxError/i,
      /['"][^'"]*$/m,  // Chaînes non terminées
      /\{\s*,/,        // Objets malformés
      /,\s*\}/,        // Virgules en trop
      /}\)\s*;\s*[a-zA-Z]/,  // Code après })
      /^\s*\w+\s*:/m,   // Propriétés orphelines
    ];
    
    let errorCount = 0;
    for (const pattern of errorPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        errorCount += matches.length || 1;
      }
    }
    
    // Test spécial pour les modules ES6
    if (content.includes('import') || content.includes('export')) {
      // Vérifier cohérence ES6
      if (content.includes('module.exports') || content.includes('require(')) {
        errorCount++; // Mix ES6/CommonJS
      }
    }
    
    return errorCount;
    
  } catch (error) {
    return 1; // Erreur de lecture = erreur syntaxe
  }
}

/**
 * Scan récursif d'un dossier
 */
function scanDirectory(dir, depth = 0) {
  if (depth > 5) return; // Éviter récursion infinie
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      // Ignorer node_modules et autres dossiers non pertinents
      if (item === 'node_modules' || 
          item === '.git' || 
          item === 'dist' || 
          item === 'build' ||
          item.startsWith('.')) {
        continue;
      }
      
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDirectory(itemPath, depth + 1);
      } else if (item.endsWith('.js') || item.endsWith('.mjs')) {
        totalFiles++;
        const errorCount = hasJsSyntaxError(itemPath);
        
        if (errorCount > 0) {
          totalErrors += errorCount;
          errorFiles++;
          
          // Afficher seulement les plus problématiques
          if (errorCount > 5 || totalFiles % 50 === 0) {
            const relativePath = path.relative(process.cwd(), itemPath);
            console.log(`📁 ${relativePath.padEnd(70)} [${errorCount} erreurs]`);
          }
        }
      }
    }
  } catch (error) {
    // Ignorer erreurs accès dossiers
  }
}

/**
 * Scan principal
 */
function performQuickScan() {
  const startTime = Date.now();
  
  console.log('🚀 Démarrage scan syntaxe...');
  
  // Scanner les dossiers principaux du projet
  const mainDirs = [
    'backend',
    'frontend', 
    'scripts',
    '.'  // Fichiers racine
  ];
  
  for (const dir of mainDirs) {
    if (fs.existsSync(dir)) {
      console.log(`📂 Scan: ${dir}/`);
      scanDirectory(dir);
    }
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n📊 RÉSULTATS DU SCAN:');
  console.log('====================');
  console.log(`📁 Fichiers scannés: ${totalFiles}`);
  console.log(`❌ Fichiers avec erreurs: ${errorFiles}`);
  console.log(`🔥 Total erreurs détectées: ${totalErrors}`);
  console.log(`⏱️ Durée scan: ${duration}s`);
  
  // Calcul des pourcentages
  const errorFilePercent = totalFiles > 0 ? (errorFiles / totalFiles * 100).toFixed(1) : 0;
  const avgErrorsPerFile = errorFiles > 0 ? (totalErrors / errorFiles).toFixed(1) : 0;
  
  console.log(`📈 Taux fichiers corrompus: ${errorFilePercent}%`);
  console.log(`📊 Erreurs moyennes/fichier: ${avgErrorsPerFile}`);
  
  // Evaluation globale
  if (errorFiles === 0) {
    console.log('\n🎉 SUCCÈS TOTAL - Aucune erreur détectée!');
  } else if (errorFilePercent < 10) {
    console.log('\n✅ ÉTAT BON - Peu d\'erreurs restantes');
  } else if (errorFilePercent < 30) {
    console.log('\n⚠️ ÉTAT MOYEN - Corrections nécessaires'); 
  } else {
    console.log('\n🔥 ÉTAT CRITIQUE - Corrections massives requises');
  }
  
  return {
    totalFiles,
    errorFiles, 
    totalErrors,
    errorPercent: errorFilePercent,
    avgErrors: avgErrorsPerFile
  };
}

// Exécution si appelé directement
if (require.main === module) {
  const results = performQuickScan();
  
  if (results.errorFiles === 0) {
    console.log('\n🚀 Prêt pour commit et push!');
    process.exit(0);
  } else {
    console.log(`\n🔧 ${results.errorFiles} fichiers nécessitent corrections`);
    process.exit(1);
  }
}

module.exports = { performQuickScan };