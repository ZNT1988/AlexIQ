import fs from "fs";
import path from "path";

console.log("🔍 AUDIT AUTOMATIQUE MODULES ALEX - Détection code réel vs placeholder");

const modulesDir = "backend/alex-modules";
const results = [];

// Patterns pour détecter du code réel vs fake
const realCodePatterns = [
  /await.*\.create\(/,                     // Appels API OpenAI/Anthropic
  /fetch\s*\(/,                          // Appels HTTP réels
  /axios\./,                             // Requêtes Axios
  /sqlite3/,                             // Base de données SQLite
  /new sqlite3\.Database/,               // SQLite connection
  /await.*\.query/,                      // Requêtes DB
  /JSON\.parse\(/,                       // Parsing JSON réel
  /crypto\.randomBytes/,                 // Cryptographie
  /require\(['"].+['"].*\)/,             // Imports de libs externes
  /import.*from.*['"].+['"];/,           // Imports ES6 réels
  /process\.env\./,                      // Variables environnement
  /setTimeout|setInterval/,              // Timers réels
  /EventEmitter/,                        // Events réels
  /WebSocket|ws/,                        // WebSockets
  /express|fastify|koa/,                 // Serveurs web
  /mongoose|prisma|sequelize/            // ORMs
];

const fakeCodePatterns = [
  /return\s*['"`].*Je suis.*['"`]/,      // Réponses statiques typiques
  /return\s*['"`].*IA.*['"`]/,           // Réponses IA statiques  
  /return\s*\{\s*result:\s*['"`]/,       // Objets résultats statiques
  /console\.log.*placeholder/i,          // Placeholders évidents
  /TODO|FIXME|PLACEHOLDER/i,             // Commentaires TODO
  /return\s*\{\s*status:\s*['"`]success['"`]/,  // Status success statique
  /return.*math\.random/i,               // Valeurs aléatoires simples
  /lorem ipsum/i,                        // Texte de remplissage
  /return\s*0\.\d+\s*;/,                // Scores/valeurs hardcodées
  /return\s*['"`]not implemented['"`]/i   // Non implémenté
];

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n").length;
    
    // Comptage patterns réels
    let realPatternCount = 0;
    let realPatterns = [];
    realCodePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        realPatternCount++;
        realPatterns.push(pattern.source);
      }
    });
    
    // Comptage patterns fake
    let fakePatternCount = 0;
    let fakePatterns = [];
    fakeCodePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        fakePatternCount++;
        fakePatterns.push(pattern.source);
      }
    });
    
    // Détection API calls spécifiques
    const hasOpenAI = /openai|gpt-|chat\.completions/.test(content);
    const hasAnthropic = /anthropic|claude/.test(content);
    const hasGoogle = /google|gemini|vertex/.test(content);
    const hasSQLite = /sqlite3|\.db/.test(content);
    const hasExpress = /express|app\.get|app\.post/.test(content);
    
    // Classification
    let classification = "UNKNOWN";
    let confidence = 0;
    
    if (realPatternCount >= 3 && fakePatternCount <= 1) {
      classification = "REAL";
      confidence = Math.min(95, 60 + (realPatternCount * 10));
    } else if (fakePatternCount >= 2 && realPatternCount <= 1) {
      classification = "FAKE/PLACEHOLDER";
      confidence = Math.min(95, 60 + (fakePatternCount * 15));
    } else if (realPatternCount >= 1 && fakePatternCount >= 1) {
      classification = "MIXED";
      confidence = 50 + (realPatternCount * 5) - (fakePatternCount * 5);
    } else if (lines < 50 && realPatternCount === 0) {
      classification = "MINIMAL/STUB";
      confidence = 70;
    } else {
      classification = "UNCLEAR";
      confidence = 30;
    }
    
    return {
      file: path.basename(filePath),
      category: path.dirname(filePath).split("/").pop(),
      lines: lines,
      classification: classification,
      confidence: confidence,
      realPatterns: realPatternCount,
      fakePatterns: fakePatternCount,
      hasOpenAI: hasOpenAI,
      hasAnthropic: hasAnthropic,
      hasGoogle: hasGoogle,
      hasSQLite: hasSQLite,
      hasExpress: hasExpress,
      detectedReal: realPatterns.slice(0, 3).join(", "),
      detectedFake: fakePatterns.slice(0, 3).join(", ")
    };
    
  } catch (error) {
    return {
      file: path.basename(filePath),
      category: path.dirname(filePath).split("/").pop(),
      classification: "ERROR",
      error: error.message
    };
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && file !== "node_modules" && file !== ".git") {
      scanDirectory(fullPath);
    } else if (file.endsWith(".js") && !file.includes("test") && !file.includes("spec")) {
      const analysis = analyzeFile(fullPath);
      results.push(analysis);
    }
  });
}

// Lancer l'analyse
scanDirectory(modulesDir);

// Trier par catégorie et classification
results.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  if (a.classification !== b.classification) return b.confidence - a.confidence;
  return a.file.localeCompare(b.file);
});

// Générer rapport console
console.log("\n📊 RÉSULTATS AUDIT:");
console.log(`Total modules analysés: ${results.length}`);

const summary = {};
results.forEach(r => {
  summary[r.classification] = (summary[r.classification] || 0) + 1;
});

console.log("\n📈 RÉPARTITION:");
Object.entries(summary).forEach(([classification, count]) => {
  const percentage = ((count / results.length) * 100).toFixed(1);
  console.log(`${classification}: ${count} modules (${percentage}%)`);
});

// Générer CSV détaillé
const csvHeader = "Fichier,Catégorie,Classification,Confiance %,Lignes,Patterns Réels,Patterns Fake,OpenAI,Anthropic,Google,SQLite,Express,Patterns Réels Détectés,Patterns Fake Détectés\n";
const csvContent = results.map(r => {
  return `"${r.file}","${r.category}","${r.classification}",${r.confidence || 0},${r.lines || 0},${r.realPatterns || 0},${r.fakePatterns || 0},${r.hasOpenAI || false},${r.hasAnthropic || false},${r.hasGoogle || false},${r.hasSQLite || false},${r.hasExpress || false},"${r.detectedReal || ""}","${r.detectedFake || ""}"`;
}).join("\n");

fs.writeFileSync("alex-modules-audit.csv", csvHeader + csvContent);

console.log("\n✅ Rapport détaillé généré: alex-modules-audit.csv");

// Affichage des modules par catégorie
const categories = [...new Set(results.map(r => r.category))];
categories.forEach(category => {
  const categoryModules = results.filter(r => r.category === category);
  console.log(`\n🗂️ ${category.toUpperCase()} (${categoryModules.length} modules):`);
  
  const categoryGroups = {};
  categoryModules.forEach(m => {
    categoryGroups[m.classification] = (categoryGroups[m.classification] || []);
    categoryGroups[m.classification].push(m);
  });
  
  Object.entries(categoryGroups).forEach(([classification, modules]) => {
    console.log(`  ${classification}: ${modules.length} modules`);
    if (classification === "REAL" || classification === "MIXED") {
      modules.slice(0, 3).forEach(m => {
        console.log(`    ✅ ${m.file} (${m.confidence}%)`);
      });
    } else if (classification === "FAKE/PLACEHOLDER") {
      modules.slice(0, 3).forEach(m => {
        console.log(`    ❌ ${m.file} (${m.confidence}%)`);
      });
    }
  });
});

console.log("\n🎯 PROCHAINES ACTIONS RECOMMANDÉES:");
console.log("1. Examiner modules MIXED pour les améliorer");
console.log("2. Remplacer modules FAKE/PLACEHOLDER par du vrai code");
console.log("3. Connecter modules réels aux APIs (OpenAI, Anthropic)");
console.log("4. Vérifier modules UNCLEAR manuellement");