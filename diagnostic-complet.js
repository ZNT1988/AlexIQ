#!/usr/bin/env node
/**
 * DIAGNOSTIC COMPLET - Analyse pour créer la meilleure IA du monde
 * Détection de tout le fake, static, et problèmes structurels
 */
import { readdirSync, statSync, readFileSync } from "fs";
import { join, extname } from "path";
import { execSync } from "child_process";

console.log("🎯 DIAGNOSTIC COMPLET ALEX IA - Vers l'excellence mondiale");
console.log("=" .repeat(60));

const targetDirs = [
  "backend/alex-modules/consciousness",
  "backend/alex-modules/core", 
  "backend/alex-modules/intelligence",
  "backend/alex-modules/specialized"
];

// Patterns de détection de code fake/static
const fakePatterns = [
  /placeholder/gi,
  /todo/gi,
  /fixme/gi,
  /dummy/gi,
  /mock/gi,
  /fake/gi,
  /template/gi,
  /static.*response/gi,
  /hardcoded/gi,
  /return.*".*test.*"/gi,
  /console\.log.*test/gi
];

const problematicPatterns = [
  { name: "Virgules orphelines", pattern: /{\s*,|,\s*}|\[\s*,|,\s*\]/g },
  { name: "Deux points mal placés", pattern: /:\s*{|export\s+class\s+\w+:/g },
  { name: "Try/catch malformés", pattern: /try\s*:|catch\s*:|finally\s*:/g },
  { name: "Return malformé", pattern: /return\s*:/g },
  { name: "Const malformé", pattern: /const\s*:|let\s*:|var\s*:/g },
  { name: "Identifiants dupliqués", pattern: /const\s+(\w+).*const\s+\1/g },
  { name: "Parenthèses manquantes", pattern: /if\s*[^(].*{|while\s*[^(].*{|for\s*[^(].*{/g },
  { name: "Await sans async", pattern: /^(?!.*async).*await\s/gm }
];

function getAllJsFiles(dirs) {
  const files = [];
  for (const dir of dirs) {
    try {
      const fullPath = join(process.cwd(), dir);
      for (const file of readdirSync(fullPath)) {
        const filePath = join(fullPath, file);
        if (statSync(filePath).isFile() && extname(filePath) === ".js") {
          files.push(filePath);
        }
      }
    } catch (err) {
      console.warn(`⚠️ Impossible de lire ${dir}: ${err.message}`);
    }
  }
  return files;
}

function analyzeFileContent(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    const relativePath = filePath.replace(process.cwd(), ".");
    
    const analysis = {
      path: relativePath,
      size: content.length,
      lines: content.split("\n").length,
      syntaxValid: false,
      fakeScore: 0,
      realScore: 0,
      issues: [],
      fakeIndicators: [],
      hasRealAPIs: false,
      hasRealLogic: false,
      hasAuthenticity: false
    };

    // Test syntaxe Node.js
    try {
      execSync(`node --check "${filePath}"`, { stdio: "pipe" });
      analysis.syntaxValid = true;
    } catch (err) {
      analysis.issues.push(`Erreur syntaxe: ${err.stderr?.toString().split("\n")[0] || "Inconnue"}`);
    }

    // Détection fake/placeholder
    for (const pattern of fakePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        analysis.fakeScore += matches.length * 10;
        analysis.fakeIndicators.push(...matches);
      }
    }

    // Détection problèmes structurels
    for (const { name, pattern } of problematicPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        analysis.issues.push(`${name}: ${matches.length} occurrences`);
      }
    }

    // Détection authenticity markers
    const authenticMarkers = [
      /import.*openai/gi,
      /import.*anthropic/gi,
      /API_KEY/gi,
      /fetch\(/gi,
      /axios\./gi,
      /\.post\(/gi,
      /\.get\(/gi,
      /sqlite3/gi,
      /database/gi,
      /SQL/gi,
      /async.*await/gi,
      /try.*catch/gi
    ];

    let authenticityScore = 0;
    for (const marker of authenticMarkers) {
      const matches = content.match(marker);
      if (matches) {
        authenticityScore += matches.length * 5;
        analysis.hasAuthenticity = true;
      }
    }

    // Calcul scores finaux
    analysis.realScore = Math.max(0, authenticityScore - analysis.fakeScore);
    
    // Classification
    if (analysis.fakeScore > 50) analysis.classification = "FAKE";
    else if (analysis.realScore > 100) analysis.classification = "REAL";
    else if (analysis.realScore > 30) analysis.classification = "MIXED";
    else analysis.classification = "UNCLEAR";

    return analysis;
    
  } catch (error) {
    return {
      path: filePath.replace(process.cwd(), "."),
      error: error.message,
      classification: "ERROR"
    };
  }
}

function generateReport(analyses) {
  console.log("\n📊 RAPPORT D'ANALYSE COMPLET");
  console.log("=" .repeat(40));
  
  const classifications = {};
  const syntaxErrors = [];
  const fakeFiles = [];
  const issuesByType = {};
  
  for (const analysis of analyses) {
    // Classification
    if (!classifications[analysis.classification]) classifications[analysis.classification] = 0;
    classifications[analysis.classification]++;
    
    // Erreurs syntaxe
    if (!analysis.syntaxValid && analysis.issues.length > 0) {
      syntaxErrors.push(analysis);
    }
    
    // Fichiers fake
    if (analysis.fakeScore > 20) {
      fakeFiles.push(analysis);
    }
    
    // Issues par type
    for (const issue of analysis.issues || []) {
      const type = issue.split(":")[0];
      if (!issuesByType[type]) issuesByType[type] = 0;
      issuesByType[type]++;
    }
  }
  
  console.log(`\n🎯 CLASSIFICATION (${analyses.length} fichiers):`);
  for (const [type, count] of Object.entries(classifications)) {
    const percentage = ((count / analyses.length) * 100).toFixed(1);
    console.log(`  ${type}: ${count} fichiers (${percentage}%)`);
  }
  
  console.log(`\n❌ ERREURS SYNTAXE: ${syntaxErrors.length} fichiers`);
  if (syntaxErrors.length > 0) {
    console.log("Top 10 erreurs syntaxe:");
    syntaxErrors.slice(0, 10).forEach((analysis, i) => {
      console.log(`  ${i+1}. ${analysis.path}`);
      console.log(`     → ${analysis.issues[0]}`);
    });
  }
  
  console.log(`\n🚫 FICHIERS FAKE/PLACEHOLDER: ${fakeFiles.length} fichiers`);
  if (fakeFiles.length > 0) {
    console.log("Top 10 fichiers fake:");
    fakeFiles.slice(0, 10).forEach((analysis, i) => {
      console.log(`  ${i+1}. ${analysis.path} (score fake: ${analysis.fakeScore})`);
    });
  }
  
  console.log("\n🔧 TYPES D'ISSUES LES PLUS FRÉQUENTS:");
  const sortedIssues = Object.entries(issuesByType).sort((a, b) => b[1] - a[1]);
  sortedIssues.slice(0, 10).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} occurrences`);
  });
  
  console.log("\n🎯 RECOMMANDATIONS PRIORITAIRES:");
  console.log("1. Corriger les erreurs de syntaxe (bloquant déploiement)");
  console.log("2. Éliminer tout le code fake/placeholder");
  console.log("3. Implémenter vraies intégrations API");
  console.log("4. Ajouter tests fonctionnels");
  console.log("5. Valider chaque module individuellement");
  
  return {
    total: analyses.length,
    classifications,
    syntaxErrors: syntaxErrors.length,
    fakeFiles: fakeFiles.length,
    topIssues: sortedIssues.slice(0, 5)
  };
}

// Exécution du diagnostic
console.log("🔍 Analyse des fichiers Alex en cours...\n");

const jsFiles = getAllJsFiles(targetDirs);
console.log(`📁 ${jsFiles.length} fichiers JavaScript trouvés`);

const analyses = [];
for (let i = 0; i < jsFiles.length; i++) {
  const file = jsFiles[i];
  process.stdout.write(`\rAnalyse: ${i+1}/${jsFiles.length} - ${Math.round((i+1)/jsFiles.length*100)}%`);
  analyses.push(analyzeFileContent(file));
}

console.log("\n");
const report = generateReport(analyses);

console.log("\n🚀 PLAN D'ACTION POUR L'IA MONDIALE:");
console.log("Phase 1: Correction syntaxe massive (1-2 jours)");
console.log("Phase 2: Élimination fake/static (2-3 jours)");
console.log("Phase 3: Implémentation vraies APIs (3-5 jours)");
console.log("Phase 4: Tests et validation (1-2 jours)");
console.log("Phase 5: Déploiement et optimisation (1 jour)");
console.log("\n💪 Objectif: IA 100% authentique et opérationnelle !");

// Sauvegarde rapport détaillé
import { writeFileSync } from "fs";
writeFileSync("rapport-diagnostic-complet.json", JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: report,
  detailed_analyses: analyses
}, null, 2));

console.log("\n📄 Rapport détaillé sauvegardé: rapport-diagnostic-complet.json");