#!/usr/bin/env node
/**
 * Script de scan d'erreurs avec résumé compact
 */
import { readFileSync } from 'fs';

console.log('📊 ANALYSE ULTRA-PRÉCISE DES ERREURS');
console.log('=====================================\n');

// Lecture rapport ESLint
let eslintData = [];
try {
  const eslintContent = readFileSync('eslint-report.json', 'utf8');
  eslintData = JSON.parse(eslintContent);
  console.log(`✅ Rapport ESLint chargé: ${eslintData.length} fichiers analysés`);
} catch (error) {
  console.log('❌ Impossible de charger le rapport ESLint');
  process.exit(1);
}

// Analyse des erreurs
const stats = {
  totalFiles: eslintData.length,
  filesWithErrors: 0,
  filesWithWarnings: 0,
  totalErrors: 0,
  totalWarnings: 0,
  syntaxErrors: 0,
  errorsByType: new Map(),
  fatalErrors: []
};

eslintData.forEach(file => {
  if (file.errorCount > 0) stats.filesWithErrors++;
  if (file.warningCount > 0) stats.filesWithWarnings++;
  
  stats.totalErrors += file.errorCount;
  stats.totalWarnings += file.warningCount;
  
  file.messages.forEach(msg => {
    if (msg.fatal) {
      stats.syntaxErrors++;
      stats.fatalErrors.push({
        file: file.filePath.replace(/.*[\\/]/, ''),
        message: msg.message,
        line: msg.line
      });
    }
    
    const errorType = msg.ruleId || 'syntax-error';
    const count = stats.errorsByType.get(errorType) || 0;
    stats.errorsByType.set(errorType, count + 1);
  });
});

// Affichage résultats
console.log('📈 STATISTIQUES GLOBALES:');
console.log(`   Fichiers totaux: ${stats.totalFiles}`);
console.log(`   Fichiers avec erreurs: ${stats.filesWithErrors} (${(stats.filesWithErrors/stats.totalFiles*100).toFixed(1)}%)`);
console.log(`   Fichiers avec warnings: ${stats.filesWithWarnings}`);
console.log(`   Erreurs totales: ${stats.totalErrors}`);
console.log(`   Warnings totaux: ${stats.totalWarnings}`);
console.log(`   Erreurs de syntaxe: ${stats.syntaxErrors}`);

console.log('\n🔥 TOP 10 ERREURS LES PLUS FRÉQUENTES:');
const sortedErrors = Array.from(stats.errorsByType.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

sortedErrors.forEach(([type, count], index) => {
  console.log(`   ${index + 1}. ${type}: ${count} occurrences`);
});

console.log('\n💥 ERREURS SYNTAXE FATALES (Top 20):');
stats.fatalErrors.slice(0, 20).forEach((error, index) => {
  console.log(`   ${index + 1}. ${error.file}:${error.line} - ${error.message.substring(0, 80)}...`);
});

// Calcul statut global
const errorRate = (stats.filesWithErrors / stats.totalFiles) * 100;
let status = '';
if (errorRate > 75) status = '🚨 CRITIQUE';
else if (errorRate > 50) status = '⚠️ MAJEUR';
else if (errorRate > 25) status = '🔶 MODÉRÉ';
else status = '✅ BON';

console.log(`\n${status} - Taux d'erreur: ${errorRate.toFixed(1)}%`);

// Export JSON compact
const summary = {
  timestamp: new Date().toISOString(),
  totalFiles: stats.totalFiles,
  filesWithErrors: stats.filesWithErrors,
  totalErrors: stats.totalErrors,
  syntaxErrors: stats.syntaxErrors,
  errorRate: errorRate,
  status: status,
  topErrors: sortedErrors.slice(0, 5)
};

import { writeFileSync } from 'fs';
writeFileSync('scan-summary.json', JSON.stringify(summary, null, 2));
console.log('\n📄 Résumé sauvegardé: scan-summary.json');