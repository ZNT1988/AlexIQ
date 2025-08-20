#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔍 VÉRIFICATION DES FICHIERS CORE HORS MODULES ALEX...");

function analyzeCorruption(content, filepath) {
  const lines = content.split("\n");
  let corruptionScore = 0;
  const issues = [];
  
  // Critères de corruption
  const autoVars = lines.filter(l => l.includes("// Variable auto-déclarée")).length;
  const regexErrors = lines.filter(l => l.includes("/g")).length;
  const stringErrors = lines.filter(l => l.includes("\\';") || l.includes("\\\"")).length;
  const importErrors = content.includes("import:") ? 1 : 0;
  const syntaxErrors = lines.filter(l => l.includes("try:") || l.includes("catch (" )).length;
  const malformedObjects = lines.filter(l => l.includes("{,") || l.includes(",}")).length;
  
  // Calculer le score de corruption
  if (autoVars > 0) {
    corruptionScore += autoVars * 2;
    issues.push(`${autoVars} variables auto-déclarées`);
  }
  
  if (regexErrors > 0) {
    corruptionScore += regexErrors * 3;
    issues.push(`${regexErrors} erreurs regex/g`);
  }
  
  if (stringErrors > 0) {
    corruptionScore += stringErrors * 2;
    issues.push(`${stringErrors} erreurs de chaînes`);
  }
  
  if (importErrors > 0) {
    corruptionScore += 5;
    issues.push("imports cassés");
  }
  
  if (syntaxErrors > 0) {
    corruptionScore += syntaxErrors;
    issues.push(`${syntaxErrors} erreurs try/catch`);
  }
  
  if (malformedObjects > 0) {
    corruptionScore += malformedObjects;
    issues.push(`${malformedObjects} objets malformés`);
  }
  
  // Vérifier les erreurs ESLint spécifiques
  try {
    execSync(`npx eslint "${filepath}" --no-eslintrc --config eslint.config.js`, { stdio: "pipe" });
  } catch (error) {
    const eslintErrors = error.stdout.toString().split("\n").filter(l => l.includes("error")).length;
    if (eslintErrors > 0) {
      corruptionScore += eslintErrors;
      issues.push(`${eslintErrors} erreurs ESLint`);
    }
  }
  
  return { score: corruptionScore, issues, size: content.length };
}

function getAllCoreFiles() {
  const dirs = [
    "backend/api",
    "backend/config", 
    "backend/middleware",
    "backend/routes",
    "backend/services",
    "backend/core",
    "backend/monitoring",
    "backend/cache",
    "backend/backup",
    "backend/business",
    "backend/cluster",
    "backend/diagnostics",
    "backend/integrations",
    "backend",
    "frontend",
    "."
  ];
  
  const files = [];
  
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      try {
        const dirFiles = fs.readdirSync(dir, { withFileTypes: true })
          .filter(dirent => dirent.isFile() && dirent.name.endsWith(".js"))
          .map(dirent => path.join(dir, dirent.name));
        files.push(...dirFiles);
      } catch (error) {
        console.warn(`Erreur lecture ${dir}:`, error.message);
      }
    }
  }
  
  return files.filter(f => !f.includes("alex-modules") && !f.includes("node_modules"));
}

const files = getAllCoreFiles();
console.log(`🔍 Analyse de ${files.length} fichiers core...`);

const corruptionReport = [];

for (const file of files) {
  try {
    const content = fs.readFileSync(file, "utf8");
    if (content.length > 50) { // Ignorer les fichiers très petits
      const analysis = analyzeCorruption(content, file);
      
      if (analysis.score > 0) {
        corruptionReport.push({
          file,
          score: analysis.score,
          issues: analysis.issues,
          size: analysis.size
        });
      }
    }
  } catch (error) {
    console.error(`❌ Erreur sur ${file}:`, error.message);
  }
}

// Trier par score de corruption (plus élevé = plus corrompu)
corruptionReport.sort((a, b) => b.score - a.score);

console.log(`\n📊 RAPPORT DE CORRUPTION (${corruptionReport.length} fichiers affectés):`);
console.log("=".repeat(70));

// Top 20 des fichiers les plus corrompus
const top20 = corruptionReport.slice(0, 20);

for (let i = 0; i < top20.length; i++) {
  const item = top20[i];
  const severity = item.score > 20 ? "🔥 CRITIQUE" : 
    item.score > 10 ? "⚠️  ÉLEVÉ" : 
      item.score > 5 ? "📋 MOYEN" : "📝 FAIBLE";
  
  console.log(`${i + 1}. ${severity} - Score: ${item.score}`);
  console.log(`   📁 ${item.file} (${Math.round(item.size/1024)}KB)`);
  console.log(`   🐛 ${item.issues.join(", ")}`);
  console.log("");
}

// Statistiques globales
const totalCorrupt = corruptionReport.length;
const totalCritical = corruptionReport.filter(r => r.score > 20).length;
const totalHigh = corruptionReport.filter(r => r.score > 10 && r.score <= 20).length;
const totalMedium = corruptionReport.filter(r => r.score > 5 && r.score <= 10).length;

console.log("📈 STATISTIQUES:");
console.log(`   🔥 Critiques (>20): ${totalCritical}`);
console.log(`   ⚠️  Élevés (10-20): ${totalHigh}`);
console.log(`   📋 Moyens (5-10): ${totalMedium}`);
console.log(`   📝 Total affectés: ${totalCorrupt}/${files.length}`);

// Recommandations
console.log("\n💡 RECOMMANDATIONS:");
if (totalCritical > 0) {
  console.log(`   1. Corriger en PRIORITÉ les ${totalCritical} fichiers critiques`);
}
if (totalHigh > 0) {
  console.log(`   2. Traiter ensuite les ${totalHigh} fichiers à corruption élevée`);
}
console.log("   3. Les fichiers moyens peuvent être corrigés par lot");

console.log("\n🎯 Analyse terminée !");