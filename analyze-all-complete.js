#!/usr/bin/env node
// Analyse complète de TOUS les modules backend
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const BACKEND_PATH = join(ROOT, 'backend');

// Patterns pour détecter les problèmes
const FAKE_PATTERNS = [
  { pattern: /Math\.random\s*\(/g, issue: "Math.random() - génération aléatoire fake" },
  { pattern: /\bsimulate[A-Z]\w*\s*\(/g, issue: "simulate*() - fonction de simulation fake" },
  { pattern: /\bplaceholder\b/gi, issue: "placeholder - code non implémenté" },
  { pattern: /\btodo\b/gi, issue: "TODO - code incomplet" },
  { pattern: /\bfixme\b/gi, issue: "FIXME - code à corriger" },
  { pattern: /return\s+(0\.\d{2,}|1\.0+)\s*;.*(?:score|health|confidence|level)/i, issue: "Valeur magique hardcodée pour score/health" },
  { pattern: /\breturn\s+["'](?:high|low|normal|good|bad)["']\s*;/gi, issue: "Retour de valeur statique fake" },
  { pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g, issue: "Catch silencieux - erreurs ignorées" },
  { pattern: /throw new Error\(["']not_implemented["']\)/gi, issue: "Méthode non implémentée" },
  { pattern: /strictMode.*true.*throw/gi, issue: "StrictMode permanent - module inutilisable" }
];

// Patterns pour détecter les vraies APIs IA
const AI_PATTERNS = [
  { pattern: /openai|gpt-|claude|anthropic|gemini|vertex/gi, type: "Vraie API IA" },
  { pattern: /fetch.*api\.openai\.com|api\.anthropic\.com/gi, type: "Appel API authentique" },
  { pattern: /process\.(memoryUsage|cpuUsage)|os\.loadavg|performance\.now/g, type: "Vraies métriques système" }
];

// Fonction pour analyser un fichier
function analyzeFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const relativePath = filePath.replace(ROOT + '\\', '').replace(/\\/g, '/');
    
    const result = {
      path: relativePath,
      size: content.length,
      lines: content.split('\n').length,
      problems: [],
      aiFeatures: [],
      authentic: true,
      category: categorizeFile(relativePath)
    };
    
    // Détecter les problèmes
    for (const { pattern, issue } of FAKE_PATTERNS) {
      if (pattern.test(content)) {
        result.problems.push(issue);
        result.authentic = false;
      }
    }
    
    // Détecter les features IA
    for (const { pattern, type } of AI_PATTERNS) {
      if (pattern.test(content)) {
        result.aiFeatures.push(type);
      }
    }
    
    // Extraire les fonctions principales
    const functions = [...content.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)|(\w+)\s*(?:\([^)]*\))?\s*(?:=>|{)/g)]
      .map(m => m[1] || m[2])
      .filter(f => f && f.length > 2)
      .slice(0, 5); // Top 5 fonctions
    
    result.functions = functions;
    
    return result;
    
  } catch (error) {
    return {
      path: filePath.replace(ROOT + '\\', '').replace(/\\/g, '/'),
      problems: [`Erreur lecture: ${error.message}`],
      authentic: false,
      category: 'ERROR'
    };
  }
}

// Catégoriser les fichiers
function categorizeFile(path) {
  if (path.includes('/services/')) return 'SERVICES';
  if (path.includes('/config/')) return 'CONFIG';
  if (path.includes('/middleware/')) return 'MIDDLEWARE';
  if (path.includes('/routes/')) return 'ROUTES';
  if (path.includes('/alex-modules/intelligence/')) return 'INTELLIGENCE';
  if (path.includes('/alex-modules/consciousness/')) return 'CONSCIOUSNESS';
  if (path.includes('/alex-modules/core/')) return 'CORE';
  if (path.includes('/alex-modules/specialized/')) return 'SPECIALIZED';
  if (path.includes('/monitoring/')) return 'MONITORING';
  if (path.includes('/security/')) return 'SECURITY';
  if (path.includes('/utils/') || path.includes('/tools/')) return 'UTILS';
  return 'OTHER';
}

// Scanner tous les fichiers JS
function scanAllFiles() {
  const allFiles = [];
  
  function walkDir(dir) {
    try {
      const items = readdirSync(dir);
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walkDir(fullPath);
        } else if (stat.isFile() && item.endsWith('.js')) {
          allFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Erreur scan ${dir}:`, error.message);
    }
  }
  
  walkDir(BACKEND_PATH);
  return allFiles;
}

// Main
console.log('🔍 ANALYSE COMPLÈTE DE TOUS LES MODULES BACKEND...\n');

const allJSFiles = scanAllFiles();
console.log(`📊 ${allJSFiles.length} fichiers JavaScript trouvés\n`);

const results = allJSFiles.map(analyzeFile);

// Statistiques globales
const authentic = results.filter(r => r.authentic);
const withProblems = results.filter(r => !r.authentic);
const withAI = results.filter(r => r.aiFeatures?.length > 0);

console.log(`📈 STATISTIQUES GLOBALES:`);
console.log(`✅ Modules authentiques: ${authentic.length}/${results.length} (${Math.round(authentic.length/results.length*100)}%)`);
console.log(`⚠️  Modules avec problèmes: ${withProblems.length}`);
console.log(`🤖 Modules avec IA: ${withAI.length}\n`);

// Grouper par catégorie
const byCategory = {};
results.forEach(r => {
  if (!byCategory[r.category]) byCategory[r.category] = [];
  byCategory[r.category].push(r);
});

// Rapport détaillé
let report = `# ANALYSE COMPLÈTE - TOUS LES MODULES BACKEND\n\n`;
report += `## 📊 RÉSUMÉ EXÉCUTIF\n\n`;
report += `- **Total modules**: ${results.length}\n`;
report += `- **Modules authentiques**: ${authentic.length} (${Math.round(authentic.length/results.length*100)}%)\n`;
report += `- **Modules avec problèmes**: ${withProblems.length}\n`;
report += `- **Modules avec IA**: ${withAI.length}\n\n`;

report += `## 🗂️ ANALYSE PAR CATÉGORIE\n\n`;

Object.keys(byCategory).sort().forEach(category => {
  const modules = byCategory[category];
  const categoryAuth = modules.filter(m => m.authentic).length;
  
  report += `### ${category} (${modules.length} modules - ${categoryAuth} authentiques)\n\n`;
  
  modules.forEach(module => {
    const status = module.authentic ? '✅' : '❌';
    const aiStatus = module.aiFeatures?.length > 0 ? ' 🤖' : '';
    
    report += `${status}${aiStatus} **${module.path}**\n`;
    
    if (module.functions?.length > 0) {
      report += `   - Fonctions: ${module.functions.join(', ')}\n`;
    }
    
    if (module.aiFeatures?.length > 0) {
      report += `   - IA: ${module.aiFeatures.join(', ')}\n`;
    }
    
    if (module.problems?.length > 0) {
      report += `   - ⚠️ Problèmes: ${module.problems.join(', ')}\n`;
    }
    
    report += '\n';
  });
  
  report += '\n';
});

// Top modules authentiques avec IA
const topAuthenticAI = results
  .filter(r => r.authentic && r.aiFeatures?.length > 0)
  .sort((a, b) => b.aiFeatures.length - a.aiFeatures.length)
  .slice(0, 20);

report += `## 🏆 TOP 20 MODULES AUTHENTIQUES AVEC IA\n\n`;
topAuthenticAI.forEach((module, i) => {
  report += `${i+1}. **${module.path}**\n`;
  report += `   - IA: ${module.aiFeatures.join(', ')}\n`;
  if (module.functions?.length > 0) {
    report += `   - Fonctions: ${module.functions.slice(0, 3).join(', ')}\n`;
  }
  report += '\n';
});

// Modules à corriger
const toFix = withProblems.sort((a, b) => (b.problems?.length || 0) - (a.problems?.length || 0));

report += `## 🔧 MODULES À CORRIGER (${toFix.length})\n\n`;
toFix.slice(0, 50).forEach((module, i) => {
  report += `${i+1}. **${module.path}**\n`;
  report += `   - Problèmes: ${module.problems.join(', ')}\n\n`;
});

// Sauvegarder le rapport
writeFileSync('ANALYSE-COMPLETE-TOUS-MODULES.md', report);
writeFileSync('modules-analysis-data.json', JSON.stringify(results, null, 2));

console.log('✅ RAPPORT SAUVEGARDÉ:');
console.log('📄 ANALYSE-COMPLETE-TOUS-MODULES.md');
console.log('📊 modules-analysis-data.json');

console.log(`\n🎯 MODULES AUTHENTIQUES AVEC IA: ${topAuthenticAI.length}`);
console.log(`🔧 MODULES À CORRIGER: ${withProblems.length}`);