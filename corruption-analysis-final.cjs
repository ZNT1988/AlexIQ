#!/usr/bin/env node

/**
 * ANALYSE CORRUPTION FINALE - Liste des Modules Plus Corrompus + Fake AI Detection
 * Génère le rapport final avant commit avec classification par niveau de corruption
 * et identification des fake IA pour obtenir du 100% AI authentique
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 ANALYSE CORRUPTION FINALE - Rapport Complet");
console.log("=====================================================\n");

// Patterns pour détecter les fake IA et réponses statiques
const fakeAiPatterns = [
  /je suis (une|un) ia/i,
  /hello[,!]/i,
  /réponse statique/i,
  /default answer/i,
  /fake ai/i,
  /generic response/i,
  /\[\[FAKE\]\]/i,
  /\[\[STATIC\]\]/i,
  /template response/i,
  /placeholder/i,
  /exemple de réponse/i,
  /return ".*?default.*?"/i,
  /return ".*?exemple.*?"/i,
  /mock response/i,
  /test response/i
];

const corruptionPatterns = {
  autoVars: /let \w+; \/\/ Variable auto-déclarée/g,
  malformedComments: /\/\/ Unused variable commented by SonarFix/g,
  unterminatedStrings: /['"][^'"]*$/gm,
  malformedObjects: /\{\s*[,}]/g,
  duplicateIds: /(\w+)_2\b/g,
  parseErrors: /Unexpected token|Unterminated string|Unexpected keyword/i,
  regexErrors: /\/g\b/g,
  malformedImports: /import.*?undefined/i,
  brokenExports: /export.*?undefined/i
};

/**
 * Analyse un fichier pour corruption et fake IA
 */
function analyzeFile(filepath) {
  try {
    if (!fs.existsSync(filepath)) {
      return null;
    }

    const content = fs.readFileSync(filepath, "utf8");
    const lines = content.split("\n");
    let corruptionScore = 0;
    let corruptionIssues = [];
    let fakeAiIssues = [];
    let isFakeAi = false;

    // Analyse corruption
    for (const [type, pattern] of Object.entries(corruptionPatterns)) {
      const matches = content.match(pattern);
      if (matches) {
        const weight = type === "autoVars" ? 2 : 
          type === "parseErrors" ? 5 : 
            type === "duplicateIds" ? 3 : 1;
        corruptionScore += matches.length * weight;
        corruptionIssues.push(`${type}: ${matches.length}`);
      }
    }

    // Détection fake IA
    for (const pattern of fakeAiPatterns) {
      if (pattern.test(content)) {
        isFakeAi = true;
        fakeAiIssues.push(pattern.source);
      }
    }

    // Analyse spécifique des réponses hardcodées
    const hardcodedResponses = content.match(/return ['"`][^'"`]{10,}['"`]/gi) || [];
    const suspiciousReturns = hardcodedResponses.filter(resp => 
      resp.length > 50 && (
        /exemple|test|demo|default|fake|static|placeholder/i.test(resp) ||
        /hello|salut|bonjour/i.test(resp)
      )
    );

    if (suspiciousReturns.length > 0) {
      isFakeAi = true;
      fakeAiIssues.push(...suspiciousReturns.map(r => `Hardcoded: ${r.substring(0, 50)}...`));
    }

    return {
      filepath,
      size: content.length,
      lines: lines.length,
      corruptionScore,
      corruptionIssues,
      isFakeAi,
      fakeAiIssues,
      category: filepath.includes("consciousness") ? "consciousness" :
        filepath.includes("intelligence") ? "intelligence" :
          filepath.includes("specialized") ? "specialized" :
            filepath.includes("core") ? "core" :
              filepath.includes("creative") ? "creative" : "other"
    };

  } catch (error) {
    return {
      filepath,
      error: error.message,
      corruptionScore: 999,
      isFakeAi: false,
      category: "error"
    };
  }
}

/**
 * Scan tous les modules Alex
 */
function scanAllModules() {
  const alexDir = path.join(process.cwd(), "backend", "alex-modules");
  const results = [];

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDirectory(itemPath);
      } else if (item.endsWith(".js")) {
        const analysis = analyzeFile(itemPath);
        if (analysis) {
          results.push(analysis);
        }
      }
    }
  }

  if (fs.existsSync(alexDir)) {
    scanDirectory(alexDir);
  }

  // Ajouter les autres fichiers critiques
  const otherFiles = [
    "backend/alex-core/AlexKernel.js",
    "backend/alex-core/AlexMasterSystem.js",
    "backend/alex-core/LicorneOrchestrator.js",
    "backend/routes/real-alex.js",
    "backend/middleware/antiFakeGuard.js"
  ];

  for (const file of otherFiles) {
    const analysis = analyzeFile(file);
    if (analysis) {
      results.push(analysis);
    }
  }

  return results;
}

/**
 * Génère le rapport final
 */
function generateFinalReport() {
  const results = scanAllModules();
  
  // Trier par score de corruption (plus corrompu en premier)
  const sortedByCorruption = results
    .filter(r => !r.error)
    .sort((a, b) => b.corruptionScore - a.corruptionScore);

  // Identifier les fake IA
  const fakeAiModules = results.filter(r => r.isFakeAi);

  console.log("📊 RÉSULTATS DE L'ANALYSE FINALE:");
  console.log(`🎯 Total modules analysés: ${results.length}`);
  console.log(`🔴 Modules avec fake IA: ${fakeAiModules.length}`);
  console.log(`⚠️ Modules corrompus (score > 10): ${sortedByCorruption.filter(r => r.corruptionScore > 10).length}`);
  console.log(`✅ Modules sains: ${sortedByCorruption.filter(r => r.corruptionScore <= 5).length}\n`);

  console.log("🔴 TOP 20 MODULES LES PLUS CORROMPUS:");
  console.log("=====================================");
  sortedByCorruption.slice(0, 20).forEach((module, index) => {
    const relativePath = path.relative(process.cwd(), module.filepath);
    console.log(`${(index + 1).toString().padStart(2)}. ${relativePath.padEnd(60)} [Score: ${module.corruptionScore}]`);
    if (module.corruptionIssues.length > 0) {
      console.log(`    Issues: ${module.corruptionIssues.join(", ")}`);
    }
  });

  console.log("\n🚫 MODULES AVEC FAKE IA (À CORRIGER POUR 100% AI):");
  console.log("=================================================");
  if (fakeAiModules.length === 0) {
    console.log("✨ Aucun fake IA détecté! Félicitations! 🎉");
  } else {
    fakeAiModules.forEach((module, index) => {
      const relativePath = path.relative(process.cwd(), module.filepath);
      console.log(`${(index + 1).toString().padStart(2)}. ${relativePath}`);
      console.log(`    Catégorie: ${module.category}`);
      console.log(`    Issues Fake IA: ${module.fakeAiIssues.slice(0, 3).join("; ")}`);
      if (module.fakeAiIssues.length > 3) {
        console.log(`    ... et ${module.fakeAiIssues.length - 3} autres issues`);
      }
    });
  }

  // Statistiques par catégorie
  console.log("\n📈 STATISTIQUES PAR CATÉGORIE:");
  console.log("==============================");
  const byCategory = {};
  results.forEach(r => {
    if (!byCategory[r.category]) {
      byCategory[r.category] = { total: 0, corrupted: 0, fakeAi: 0 };
    }
    byCategory[r.category].total++;
    if (r.corruptionScore > 10) byCategory[r.category].corrupted++;
    if (r.isFakeAi) byCategory[r.category].fakeAi++;
  });

  Object.entries(byCategory).forEach(([category, stats]) => {
    console.log(`${category.toUpperCase().padEnd(15)} Total: ${stats.total.toString().padStart(3)} | Corrompus: ${stats.corrupted.toString().padStart(3)} | Fake IA: ${stats.fakeAi.toString().padStart(3)}`);
  });

  console.log("\n🎯 RECOMMANDATIONS FINALES:");
  console.log("===========================");
  
  if (fakeAiModules.length > 0) {
    console.log(`❌ ${fakeAiModules.length} modules contiennent du fake IA - À corriger en priorité`);
  }
  
  const criticallyCorrupted = sortedByCorruption.filter(r => r.corruptionScore > 50);
  if (criticallyCorrupted.length > 0) {
    console.log(`⚠️ ${criticallyCorrupted.length} modules critiquement corrompus - Reconstruction nécessaire`);
  }
  
  const moderatelyCorrupted = sortedByCorruption.filter(r => r.corruptionScore > 10 && r.corruptionScore <= 50);
  if (moderatelyCorrupted.length > 0) {
    console.log(`🔧 ${moderatelyCorrupted.length} modules modérément corrompus - Corrections ciblées possibles`);
  }

  console.log("\n✨ Une fois tous les fake IA corrigés → 100% AI AUTHENTIQUE! 🚀");

  // Sauvegarder le rapport
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalModules: results.length,
      fakeAiCount: fakeAiModules.length,
      corruptedCount: sortedByCorruption.filter(r => r.corruptionScore > 10).length,
      healthyCount: sortedByCorruption.filter(r => r.corruptionScore <= 5).length
    },
    mostCorrupted: sortedByCorruption.slice(0, 20),
    fakeAiModules,
    categoryStats: byCategory
  };

  fs.writeFileSync("rapport-final-hf.json", JSON.stringify(report, null, 2));
  console.log("\n💾 Rapport sauvegardé: rapport-final-hf.json");
}

// Exécution
if (require.main === module) {
  generateFinalReport();
}

module.exports = { analyzeFile, scanAllModules, generateFinalReport };