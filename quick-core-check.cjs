#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

console.log("🔍 VÉRIFICATION RAPIDE DES FICHIERS CORE...");

function analyzeCorruption(content, filepath) {
  const lines = content.split("\n");
  let corruptionScore = 0;
  const issues = [];
  
  // Critères de corruption (sans ESLint pour la rapidité)
  const autoVars = lines.filter(l => l.includes("// Variable auto-déclarée")).length;
  const regexErrors = lines.filter(l => l.includes("/g")).length;
  const stringErrors = lines.filter(l => l.includes("\\';") || l.includes('\\";')).length;
  const importErrors = content.includes("import:") ? 1 : 0;
  const malformedTry = lines.filter(l => l.includes("try:") || l.includes("} catch (")).length;
  const malformedObjects = lines.filter(l => l.includes("{,") || l.includes(",}")).length;
  const unterminatedStrings = lines.filter(l => /const\s+\w+\s*=\s*'[^']*$/.test(l)).length;
  
  // Calculer le score de corruption
  corruptionScore += autoVars * 2;
  if (autoVars > 0) issues.push(`${autoVars} variables auto-déclarées`);
  
  corruptionScore += regexErrors * 3;
  if (regexErrors > 0) issues.push(`${regexErrors} erreurs regex/g`);
  
  corruptionScore += stringErrors * 2;
  if (stringErrors > 0) issues.push(`${stringErrors} erreurs de chaînes`);
  
  corruptionScore += importErrors * 5;
  if (importErrors > 0) issues.push("imports cassés");
  
  corruptionScore += malformedTry * 2;
  if (malformedTry > 0) issues.push(`${malformedTry} try/catch malformés`);
  
  corruptionScore += malformedObjects;
  if (malformedObjects > 0) issues.push(`${malformedObjects} objets malformés`);
  
  corruptionScore += unterminatedStrings * 3;
  if (unterminatedStrings > 0) issues.push(`${unterminatedStrings} chaînes non terminées`);
  
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
    "backend/integrations"
  ];
  
  // Ajouter les fichiers JS dans le dossier backend racine
  const rootFiles = ["backend/index.js", "backend/jest.config.js"];
  
  const files = [...rootFiles.filter(f => fs.existsSync(f))];
  
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
  
  return files;
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

// Montrer tous les fichiers corrompus
for (let i = 0; i < corruptionReport.length; i++) {
  const item = corruptionReport[i];
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
const totalClean = files.length - totalCorrupt;

console.log("📈 STATISTIQUES:");
console.log(`   🔥 Critiques (>20): ${totalCritical}`);
console.log(`   ⚠️  Élevés (10-20): ${totalHigh}`);
console.log(`   📋 Moyens (5-10): ${totalMedium}`);
console.log(`   ✅ Propres: ${totalClean}`);
console.log(`   📝 Total: ${files.length}`);

console.log("\n🎯 Analyse terminée !");