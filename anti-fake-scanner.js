#!/usr/bin/env node
/**
 * Scanner Anti-Fake Ultra-Précis
 * Détection de tous les patterns fake, static, placeholder
 */
import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('🕵️ SCANNER ANTI-FAKE ULTRA-PRÉCIS');
console.log('==================================\n');

const targetDirs = [
  'backend/alex-modules/consciousness',
  'backend/alex-modules/core', 
  'backend/alex-modules/intelligence',
  'backend/alex-modules/specialized'
];

// Patterns fake sophistiqués
const fakePatterns = [
  { name: 'Placeholders', pattern: /placeholder|todo|fixme|dummy|mock|fake|template/gi },
  { name: 'Static Responses', pattern: /return\s*["'`][^"'`]*test|static.*response|hardcoded/gi },
  { name: 'Console Logs', pattern: /console\.log.*test|console\.log.*fake/gi },
  { name: 'Hello Fake', pattern: /hello\s*fake|fake\s*hello/gi },
  { name: 'Empty Functions', pattern: /function[^{]*{\s*}/g },
  { name: 'Return Strings', pattern: /return\s*["'`](test|example|sample|demo)["'`]/gi },
  { name: 'Lorem Ipsum', pattern: /lorem\s*ipsum|dolor\s*sit\s*amet/gi },
  { name: 'Default Values', pattern: /value\s*=\s*["'`](default|example|test)["'`]/gi }
];

// Patterns de qualité code
const qualityPatterns = [
  { name: 'Magic Numbers', pattern: /(?<![.\w])\d{4,}(?![.\w])/g },
  { name: 'Long Functions', pattern: /function[^{]*{[\s\S]{2000,}?}/g },
  { name: 'Deep Nesting', pattern: /(\s{8,}if|\s{8,}for|\s{8,}while)/g },
  { name: 'No Error Handling', pattern: /async\s+function[^{]*{[^}]*}(?![^{]*catch)/g }
];

const results = {
  totalFiles: 0,
  fakeFiles: [],
  qualityIssues: [],
  fakeScore: 0,
  qualityScore: 0
};

// Scan de tous les fichiers
targetDirs.forEach(dir => {
  try {
    const fullPath = join(process.cwd(), dir);
    const files = readdirSync(fullPath);
    
    files.filter(f => f.endsWith('.js')).forEach(file => {
      const filePath = join(fullPath, file);
      results.totalFiles++;
      
      try {
        const content = readFileSync(filePath, 'utf8');
        const fileAnalysis = analyzeFile(filePath, content, file);
        
        if (fileAnalysis.fakeScore > 0) {
          results.fakeFiles.push(fileAnalysis);
        }
        
        if (fileAnalysis.qualityIssues.length > 0) {
          results.qualityIssues.push(...fileAnalysis.qualityIssues);
        }
        
        results.fakeScore += fileAnalysis.fakeScore;
        results.qualityScore += fileAnalysis.qualityScore;
      } catch (error) {
        console.log(`⚠️ Erreur lecture: ${file}`);
      }
    });
  } catch (error) {
    console.log(`📁 Dossier ignoré: ${dir}`);
  }
});

function analyzeFile(filePath, content, fileName) {
  const analysis = {
    file: fileName,
    path: filePath,
    fakeScore: 0,
    qualityScore: 0,
    fakePatterns: [],
    qualityIssues: [],
    size: content.length,
    lines: content.split('\n').length
  };
  
  // Détection patterns fake
  fakePatterns.forEach(pattern => {
    const matches = content.match(pattern.pattern);
    if (matches) {
      analysis.fakeScore += matches.length * 10;
      analysis.fakePatterns.push({
        type: pattern.name,
        count: matches.length,
        examples: matches.slice(0, 3)
      });
    }
  });
  
  // Détection issues qualité
  qualityPatterns.forEach(pattern => {
    const matches = content.match(pattern.pattern);
    if (matches) {
      analysis.qualityScore += matches.length * 5;
      analysis.qualityIssues.push({
        file: fileName,
        type: pattern.name,
        count: matches.length
      });
    }
  });
  
  // Score authenticity basé sur des heuristiques
  const authenticityIndicators = [
    /import.*crypto/g,
    /EventEmitter/g,
    /async.*function/g,
    /logger\./g,
    /\.emit\(/g,
    /try\s*{[\s\S]*catch/g
  ];
  
  let authenticityScore = 0;
  authenticityIndicators.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) authenticityScore += matches.length;
  });
  
  analysis.authenticityScore = authenticityScore;
  analysis.isFake = analysis.fakeScore > 30 || (analysis.fakeScore > 10 && authenticityScore < 5);
  
  return analysis;
}

// Tri et affichage résultats
results.fakeFiles.sort((a, b) => b.fakeScore - a.fakeScore);

console.log('📊 RÉSULTATS SCAN ANTI-FAKE:');
console.log(`   Fichiers analysés: ${results.totalFiles}`);
console.log(`   Fichiers fake détectés: ${results.fakeFiles.length}`);
console.log(`   Score fake global: ${results.fakeScore}`);
console.log(`   Issues qualité: ${results.qualityIssues.length}`);

console.log('\n🚫 TOP 10 FICHIERS FAKE:');
results.fakeFiles.slice(0, 10).forEach((file, index) => {
  console.log(`   ${index + 1}. ${file.file} (score: ${file.fakeScore})`);
  file.fakePatterns.forEach(pattern => {
    console.log(`      - ${pattern.type}: ${pattern.count} occurrences`);
  });
});

console.log('\n🔧 ISSUES QUALITÉ PAR TYPE:');
const qualityByType = new Map();
results.qualityIssues.forEach(issue => {
  const count = qualityByType.get(issue.type) || 0;
  qualityByType.set(issue.type, count + issue.count);
});

Array.from(qualityByType.entries())
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`   ${type}: ${count} occurrences`);
  });

// Recommandations
console.log('\n💡 RECOMMANDATIONS PRIORITAIRES:');
if (results.fakeFiles.length > 10) {
  console.log('   1. 🚨 URGENT: Éliminer les fichiers fake en priorité');
}
if (results.qualityIssues.length > 50) {
  console.log('   2. 🔧 Refactoring qualité code nécessaire');
}
if (results.fakeScore > 500) {
  console.log('   3. 🏗️ Reconstruction complète de certains modules');
}

// Export détaillé
import { writeFileSync } from 'fs';
writeFileSync('anti-fake-report.json', JSON.stringify(results, null, 2));
console.log('\n📄 Rapport détaillé: anti-fake-report.json');