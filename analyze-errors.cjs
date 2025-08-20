#!/usr/bin/env node
const fs = require("fs");
const { execSync } = require("child_process");

console.log("🔍 ANALYSE DÉTAILLÉE DES ERREURS...");

// Analyser les types d'erreurs avec ESLint
try {
  const output = execSync("npx eslint . --ext .js,.mjs,.cjs --format json", { 
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024 // 50MB buffer
  });
  
  const results = JSON.parse(output);
  const errorTypes = {};
  const fileErrors = {};
  
  results.forEach(file => {
    if (file.messages.length > 0) {
      const fileName = file.filePath.replace(process.cwd(), "");
      fileErrors[fileName] = file.messages.length;
      
      file.messages.forEach(msg => {
        const errorType = msg.ruleId || "parsing-error";
        const key = `${errorType}: ${msg.message.substring(0, 100)}`;
        
        if (!errorTypes[key]) {
          errorTypes[key] = {
            count: 0,
            files: new Set(),
            severity: msg.severity
          };
        }
        
        errorTypes[key].count++;
        errorTypes[key].files.add(fileName);
      });
    }
  });
  
  // Trier par fréquence
  const sortedErrors = Object.entries(errorTypes)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20); // Top 20 erreurs
  
  console.log("\n📊 TOP 20 DES ERREURS PAR FRÉQUENCE:\n");
  
  sortedErrors.forEach(([error, data], index) => {
    console.log(`${index + 1}. [${data.count}x] ${error}`);
    console.log(`   Fichiers affectés: ${data.files.size}`);
    console.log("");
  });
  
  // Fichiers les plus problématiques
  const sortedFiles = Object.entries(fileErrors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
    
  console.log("\n🔥 FICHIERS LES PLUS PROBLÉMATIQUES:\n");
  
  sortedFiles.forEach(([file, count], index) => {
    console.log(`${index + 1}. ${file} (${count} erreurs)`);
  });
  
  // Créer un rapport détaillé
  const report = {
    totalFiles: results.length,
    filesWithErrors: Object.keys(fileErrors).length,
    totalErrors: Object.values(fileErrors).reduce((sum, count) => sum + count, 0),
    errorsByType: errorTypes,
    topErrors: sortedErrors,
    topFiles: sortedFiles
  };
  
  fs.writeFileSync("error-analysis-report.json", JSON.stringify(report, null, 2));
  console.log("\n📄 Rapport détaillé sauvé: error-analysis-report.json");
  
} catch (error) {
  console.error("❌ Erreur lors de l'analyse:", error.message);
}