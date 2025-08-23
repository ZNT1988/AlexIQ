#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const baseDir = './backend/alex-modules';

async function analyzeModuleFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Analyse du contenu
    const analysis = {
      totalLines: lines.length,
      codeLines: lines.filter(line => line.trim() && !line.trim().startsWith('//')).length,
      commentLines: lines.filter(line => line.trim().startsWith('//')).length,
      emptyLines: lines.filter(line => !line.trim()).length,
      
      // Structures détectées
      classes: [],
      functions: [],
      imports: [],
      exports: [],
      
      // Patterns problématiques
      mathRandom: (content.match(/Math\.random\(\)/g) || []).length,
      simulateFunctions: (content.match(/simulate\w+/g) || []).length,
      fakePatterns: (content.match(/fake|simulate|random|dummy/gi) || []).length,
      
      // APIs et dépendances
      aiApis: [],
      dependencies: [],
      
      // Modifications récentes
      antiFacteMarkers: (content.match(/ANTI-FAKE|anti-fake/gi) || []).length,
      recentFixes: [],
      
      // Fonctionnalité réelle
      realFunctionality: {
        hasConstructor: /constructor\s*\(/.test(content),
        hasAsyncMethods: /async\s+\w+\s*\(/.test(content),
        hasRealLogic: /if\s*\(.*\)\s*\{/.test(content) && !/if.*fake/.test(content),
        hasDataProcessing: /process|analyze|compute|calculate/.test(content),
        hasApiCalls: /fetch\s*\(|axios|http/.test(content)
      }
    };
    
    // Extraction des classes
    const classMatches = content.matchAll(/class\s+(\w+)(?:\s+extends\s+\w+)?\s*\{/g);
    for (const match of classMatches) {
      analysis.classes.push(match[1]);
    }
    
    // Extraction des fonctions
    const functionMatches = content.matchAll(/(?:async\s+)?function\s+(\w+)\s*\(|(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{|(\w+):\s*(?:async\s+)?function/g);
    for (const match of functionMatches) {
      analysis.functions.push(match[1] || match[2] || match[3]);
    }
    
    // Extraction des imports
    const importMatches = content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      analysis.imports.push(match[1]);
    }
    
    // Extraction des exports
    const exportMatches = content.matchAll(/export\s+(?:class|function|const|let|var)?\s*(\w+)/g);
    for (const match of exportMatches) {
      analysis.exports.push(match[1]);
    }
    
    // Détection APIs IA
    if (content.includes('openai') || content.includes('OpenAI')) analysis.aiApis.push('OpenAI');
    if (content.includes('anthropic') || content.includes('claude')) analysis.aiApis.push('Anthropic');
    if (content.includes('google') || content.includes('gemini')) analysis.aiApis.push('Google');
    
    // Score de qualité (0-100)
    analysis.qualityScore = calculateQualityScore(analysis, content);
    
    return analysis;
    
  } catch (error) {
    return {
      error: error.message,
      accessible: false
    };
  }
}

function calculateQualityScore(analysis, content) {
  let score = 0;
  
  // Points positifs
  if (analysis.classes.length > 0) score += 20;
  if (analysis.functions.length > 3) score += 15;
  if (analysis.realFunctionality.hasConstructor) score += 10;
  if (analysis.realFunctionality.hasAsyncMethods) score += 10;
  if (analysis.realFunctionality.hasRealLogic) score += 15;
  if (analysis.aiApis.length > 0) score += 10;
  if (analysis.codeLines > 50) score += 10;
  if (analysis.exports.length > 0) score += 10;
  
  // Points négatifs
  if (analysis.mathRandom > 0) score -= 30;
  if (analysis.simulateFunctions > 0) score -= 20;
  if (analysis.fakePatterns > 5) score -= 15;
  if (content.includes('TODO') || content.includes('FIXME')) score -= 10;
  if (analysis.codeLines < 20) score -= 20;
  
  return Math.max(0, Math.min(100, score));
}

async function getAllModules() {
  const modules = [];
  
  async function scanDir(dir, category = '') {
    const items = await fs.readdir(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        await scanDir(fullPath, path.basename(dir));
      } else if (item.endsWith('.js') && !item.startsWith('_')) {
        const relativePath = fullPath.replace('./backend/alex-modules/', '');
        const category = relativePath.split('/')[0];
        modules.push({
          path: fullPath,
          relativePath,
          category,
          filename: item,
          size: stat.size
        });
      }
    }
  }
  
  await scanDir(baseDir);
  return modules;
}

async function main() {
  console.log('🔍 ANALYSE DÉTAILLÉE DE TOUS LES MODULES ALEX\n');
  console.log('===============================================\n');
  
  const modules = await getAllModules();
  console.log(`📁 ${modules.length} modules détectés\n`);
  
  const results = {
    byCategory: {},
    summary: {
      total: modules.length,
      working: 0,
      broken: 0,
      empty: 0,
      totalLines: 0,
      totalSize: 0,
      avgQuality: 0
    }
  };
  
  // Analyse par module
  for (const module of modules) {
    console.log(`\n📄 ${module.relativePath}`);
    console.log(`   📏 Taille: ${module.size} bytes`);
    
    const analysis = await analyzeModuleFile(module.path);
    
    if (analysis.error) {
      console.log(`   ❌ Erreur: ${analysis.error}`);
      results.summary.broken++;
    } else {
      console.log(`   📊 Lignes: ${analysis.totalLines} (code: ${analysis.codeLines}, commentaires: ${analysis.commentLines})`);
      console.log(`   🏗️  Classes: ${analysis.classes.join(', ') || 'Aucune'}`);
      console.log(`   ⚡ Fonctions: ${analysis.functions.slice(0, 5).join(', ')}${analysis.functions.length > 5 ? '...' : ''}`);
      console.log(`   📦 Imports: ${analysis.imports.length}`);
      console.log(`   📤 Exports: ${analysis.exports.join(', ') || 'Aucun'}`);
      console.log(`   🤖 APIs IA: ${analysis.aiApis.join(', ') || 'Aucune'}`);
      console.log(`   🎯 Score qualité: ${analysis.qualityScore}/100`);
      
      if (analysis.mathRandom > 0) {
        console.log(`   ⚠️  Math.random() détecté: ${analysis.mathRandom} occurrences`);
      }
      if (analysis.simulateFunctions > 0) {
        console.log(`   ⚠️  Fonctions simulate: ${analysis.simulateFunctions} occurrences`);
      }
      if (analysis.antiFacteMarkers > 0) {
        console.log(`   ✅ Marqueurs anti-fake: ${analysis.antiFacteMarkers}`);
      }
      
      // Catégorisation
      if (analysis.qualityScore >= 60 && analysis.classes.length > 0) {
        results.summary.working++;
        console.log(`   ✅ Status: POTENTIELLEMENT FONCTIONNEL`);
      } else if (analysis.codeLines < 10) {
        results.summary.empty++;
        console.log(`   ⚠️  Status: VIDE/MINIMAL`);
      } else {
        results.summary.broken++;
        console.log(`   ❌ Status: PROBLÉMATIQUE`);
      }
      
      results.summary.totalLines += analysis.totalLines;
      results.summary.avgQuality += analysis.qualityScore;
    }
    
    results.summary.totalSize += module.size;
    
    // Groupement par catégorie
    if (!results.byCategory[module.category]) {
      results.byCategory[module.category] = {
        modules: [],
        totalLines: 0,
        avgQuality: 0
      };
    }
    results.byCategory[module.category].modules.push({
      ...module,
      analysis
    });
    if (!analysis.error) {
      results.byCategory[module.category].totalLines += analysis.totalLines;
      results.byCategory[module.category].avgQuality += analysis.qualityScore;
    }
  }
  
  // Calcul moyennes
  results.summary.avgQuality = results.summary.avgQuality / modules.length;
  
  for (const category in results.byCategory) {
    const cat = results.byCategory[category];
    cat.avgQuality = cat.avgQuality / cat.modules.length;
  }
  
  // Affichage résumé final
  console.log('\n\n🎯 RÉSUMÉ EXÉCUTIF');
  console.log('==================');
  console.log(`📊 Modules totaux: ${results.summary.total}`);
  console.log(`✅ Potentiellement fonctionnels: ${results.summary.working}`);
  console.log(`❌ Problématiques: ${results.summary.broken}`);
  console.log(`⚠️  Vides/Minimaux: ${results.summary.empty}`);
  console.log(`📏 Lignes totales: ${results.summary.totalLines.toLocaleString()}`);
  console.log(`💾 Taille totale: ${(results.summary.totalSize / 1024).toFixed(1)} KB`);
  console.log(`🎯 Score moyen: ${results.summary.avgQuality.toFixed(1)}/100`);
  
  console.log('\n📁 PAR CATÉGORIE:');
  for (const [category, data] of Object.entries(results.byCategory)) {
    console.log(`   ${category}: ${data.modules.length} modules, ${data.totalLines} lignes, score ${data.avgQuality.toFixed(1)}/100`);
  }
  
  // Modules les plus prometteurs
  const promising = modules
    .map(m => ({ ...m, analysis: results.byCategory[m.category].modules.find(mod => mod.filename === m.filename)?.analysis }))
    .filter(m => m.analysis && !m.analysis.error && m.analysis.qualityScore >= 60)
    .sort((a, b) => b.analysis.qualityScore - a.analysis.qualityScore)
    .slice(0, 10);
    
  if (promising.length > 0) {
    console.log('\n🌟 TOP 10 MODULES PROMETTEURS:');
    promising.forEach((m, i) => {
      console.log(`   ${i+1}. ${m.relativePath} (${m.analysis.qualityScore}/100)`);
    });
  }
  
  return results;
}

main().catch(console.error);