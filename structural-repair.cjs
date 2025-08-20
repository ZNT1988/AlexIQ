#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

console.log("🔧 RÉPARATION STRUCTURELLE DES FICHIERS...");

function repairStructuralIssues(content, filename) {
  let fixed = content;
  
  // 1. Corriger les imports cassés
  fixed = fixed.replace(/import:\s*\{/g, "import {");
  fixed = fixed.replace(/,\/g\s*\n/g, "\n");
  fixed = fixed.replace(/\/\*\*\/g\s*\n/g, "");
  
  // 2. Corriger les commentaires malformés en début de fichier
  fixed = fixed.replace(/^\/\/ Constantes pour chaînes dupliquées \(optimisation SonarJS\)\/g\s*\nconst\s+(\w+)\s*=\s*'([^']+)';\s*\/\*\*$/gm, 
    "// Constantes pour chaînes dupliquées (optimisation SonarJS)\nconst $1 = '$2';\n\n/**");
  
  // 3. Nettoyer les structures d'export cassées  
  fixed = fixed.replace(/export\s+class\s+(\w+)\s+extends,\s*\n\s*(\w+):\s*\{/g, "export class $1 extends $2 {");
  fixed = fixed.replace(/export\s+class\s+(\w+)\s+extends\s*,\s*\n\s*E,\s*\n\s*ventEmitter:\s*\{/g, "export class $1 extends EventEmitter {");
  
  // 4. Corriger les chaînes non terminées
  fixed = fixed.replace(/const\s+(\w+)\s*=\s*'([^']*\\';)/g, "const $1 = '$2';");
  fixed = fixed.replace(/const\s+(\w+)\s*=\s*'([^']*)\'\s*const/g, "const $1 = '$2';\nconst");
  
  // 5. Réparer les imports malformés avec from
  fixed = fixed.replace(/\}\s*\nfrom\s+['"]([^'"]+)['"];\s*import/g, "} from '$1';\nimport");
  fixed = fixed.replace(/from\s+'([^']+)';\s*\/g/g, "from '$1';");
  
  // 6. Corriger les try-catch malformés
  fixed = fixed.replace(/,\s*try:\s*\{/g, "\n    try {");
  fixed = fixed.replace(/\}\s*catch\s*\(error\)\s*\{\s*\/\/\s*Logger\s+fallback\s+-\s+ignore\s+error\/g\s*\}/g, 
    "} catch (error) {\n      // Logger fallback - ignore error\n    }");
  
  // 7. Corriger les structures d'objets cassées
  fixed = fixed.replace(/\{,\s*\n/g, "{\n");
  fixed = fixed.replace(/,\s*\{,\s*\n/g, " {\n");
  fixed = fixed.replace(/:\s*,\s*\n/g, ",\n");
  
  // 8. Corriger les déclarations de constantes dupliquées
  fixed = fixed.replace(/(const\s+\w+\s*=\s*'[^']*';\s*)(const\s+\w+\s*=\s*'[^']*';\s*)\/\*\*\/g/g, "$1$2\n/**");
  
  // 9. Réparer les patterns spécifiques aux erreurs detectées
  
  // Erreur: Unexpected token import
  fixed = fixed.replace(/\s*import\s*\n/g, " import ");
  
  // Erreur: Unterminated string constant
  fixed = fixed.replace(/const\s+(\w+)\s*=\s*'([^']*$)/gm, "const $1 = '$2';");
  fixed = fixed.replace(/const\s+(\w+)\s*=\s*'([^']*)\s*const/g, "const $1 = '$2';\nconst");
  
  // Erreur: Unexpected keyword 'const'
  fixed = fixed.replace(/^(\s*)const\s/gm, "$1const ");
  
  // Erreur: Unexpected token ,
  fixed = fixed.replace(/\s*,\s*\n(\s*)const/g, "\n$1const");
  fixed = fixed.replace(/\{\s*,/g, "{");
  
  // 10. Ajouter les imports manquants si nécessaire
  if (fixed.includes("export class") && !fixed.includes("import")) {
    const basicImports = `import { EventEmitter } from 'events';
import logger from '../config/logger.js';

`;
    fixed = basicImports + fixed;
  }
  
  // 11. Corriger les patterns de fin de fichier
  fixed = fixed.replace(/\s*\/\/ Export par défaut\/g\s*\nexport default/g, "\n// Export par défaut\nexport default");
  
  // 12. Nettoyer les fins de ligne malformées
  fixed = fixed.replace(/;\s*\/g\s*$/gm, ";");
  fixed = fixed.replace(/\s*\/g\s*\n/g, "\n");
  
  return fixed;
}

// Réparer des patterns spécifiques par type de fichier
function repairSpecificPatterns(content, filename) {
  let fixed = content;
  
  if (filename.includes("ContextIntelligence.js")) {
    // Corriger les patterns spécifiques à ContextIntelligence
    fixed = fixed.replace(/const\s+STR_QUESTION\s*=\s*'question\\';'\s*\/\*\*/, 
      "const STR_QUESTION = 'question';\n\n/**");
  }
  
  if (filename.includes("AlexCreativeEngine.js")) {
    // Corriger les patterns spécifiques à AlexCreativeEngine
    fixed = fixed.replace(/const\s+STR_CINEMATIC\s*=\s*'cinematic\\';'\s*const/, 
      "const STR_CINEMATIC = 'cinematic';\nconst");
  }
  
  return fixed;
}

// Traiter tous les fichiers
function getAllFiles() {
  const dirs = [
    "backend/alex-modules/consciousness",
    "backend/alex-modules/core", 
    "backend/alex-modules/intelligence",
    "backend/alex-modules/specialized"
  ];
  
  const files = [];
  
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      const dirFiles = fs.readdirSync(dir)
        .filter(file => file.endsWith(".js"))
        .map(file => path.join(dir, file));
      files.push(...dirFiles);
    }
  }
  
  return files;
}

const files = getAllFiles();
let totalRepaired = 0;

console.log(`🔍 Réparation structurelle de ${files.length} fichiers...`);

for (const file of files) {
  try {
    const content = fs.readFileSync(file, "utf8");
    const originalSize = content.length;
    
    // Appliquer les réparations
    let repaired = repairStructuralIssues(content, file);
    repaired = repairSpecificPatterns(repaired, file);
    
    const newSize = repaired.length;
    
    if (content !== repaired) {
      fs.writeFileSync(file, repaired, "utf8");
      console.log(`✅ ${file} - réparé (${originalSize} → ${newSize} chars)`);
      totalRepaired++;
    }
  } catch (error) {
    console.error(`❌ Erreur sur ${file}:`, error.message);
  }
}

console.log(`\n📊 Fichiers réparés: ${totalRepaired}/${files.length}`);
console.log("🎯 Réparation structurelle terminée !");