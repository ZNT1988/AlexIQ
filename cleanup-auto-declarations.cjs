#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

console.log("🧹 NETTOYAGE DES VARIABLES AUTO-DÉCLARÉES EXCESSIVES...");

function cleanupAutoDeclarations(content) {
  let cleaned = content;
  
  // 1. Supprimer toutes les variables auto-déclarées en début de fichier
  const autoDeclarationPattern = /^let\s+\w+;\s*\/\/\s*Variable\s+auto-déclarée\s*$/gm;
  cleaned = cleaned.replace(autoDeclarationPattern, "");
  
  // 2. Supprimer les lignes vides multiples créées par la suppression
  cleaned = cleaned.replace(/\n\n\n+/g, "\n\n");
  
  // 3. Supprimer les commentaires Node.js globals redondants
  cleaned = cleaned.replace(/\/\/ Node\.js globals\s*\n\/\* global [^*]+ \*\/\s*\n\n/g, "");
  
  // 4. Nettoyer les imports cassés
  cleaned = cleaned.replace(/import:\s*\{\s*\n/g, "import {\n");
  cleaned = cleaned.replace(/\}\s*\nfrom\s+['"][^'"]+['"];\s*import/g, "} from 'events';\nimport");
  
  // 5. Corriger les exports cassés  
  cleaned = cleaned.replace(/export\s+class\s+(\w+)\s+extends,\s*\n\s*(\w+):\s*\{/g, "export class $1 extends $2 {");
  
  // 6. Corriger les constantes string malformées
  cleaned = cleaned.replace(/const\s+(\w+)\s*=\s*'([^']+)';\s*const\s+(\w+)\s*=\s*'([^']+)';\s*\/\*\*\/g/g, 
    "const $1 = '$2';\nconst $3 = '$4';");
  
  // 7. Corriger les patterns de commentaires cassés
  cleaned = cleaned.replace(/\/\*\*\/g\s*\n\s*\*\s*([^\n]+)/g, "/**\n * $1");
  
  // 8. Corriger les blocs try-catch malformés
  cleaned = cleaned.replace(/,\s*try:\s*\{/g, "\n    try {");
  cleaned = cleaned.replace(/\}\s*catch\s*\(error\)\s*\{\s*\/\/\s*Logger\s+fallback\s+-\s+ignore\s+error\/g\s*\}/g, 
    "} catch (error) {\n      // Logger fallback - ignore error\n    }");
  
  // 9. Corriger les assignations de propriétés malformées
  cleaned = cleaned.replace(/:\s*,\s*\n/g, ",\n");
  cleaned = cleaned.replace(/,\s*\{,\s*\n/g, " {\n");
  
  // 10. Rétablir la structure de base des modules si elle est cassée
  if (cleaned.includes("export class") && !cleaned.includes("import")) {
    // Ajouter les imports manquants de base
    const basicImports = `import { EventEmitter } from 'events';
import logger from '../config/logger.js';

`;
    cleaned = basicImports + cleaned;
  }
  
  // 11. Nettoyer les structures d'objets cassées
  cleaned = cleaned.replace(/\{\s*,\s*\n/g, "{\n");
  cleaned = cleaned.replace(/,\s*\{,\s*\n/g, " {\n");
  
  return cleaned;
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
let totalCleaned = 0;

console.log(`🔍 Nettoyage de ${files.length} fichiers corrompus...`);

for (const file of files) {
  try {
    const content = fs.readFileSync(file, "utf8");
    const originalSize = content.length;
    
    // Vérifier si le fichier contient des variables auto-déclarées
    if (content.includes("// Variable auto-déclarée")) {
      const cleaned = cleanupAutoDeclarations(content);
      const newSize = cleaned.length;
      
      fs.writeFileSync(file, cleaned, "utf8");
      console.log(`✅ ${file} - nettoyé (${originalSize} → ${newSize} chars)`);
      totalCleaned++;
    }
  } catch (error) {
    console.error(`❌ Erreur sur ${file}:`, error.message);
  }
}

console.log(`\n📊 Fichiers nettoyés: ${totalCleaned}/${files.length}`);
console.log("🎯 Variables auto-déclarées supprimées avec succès !");