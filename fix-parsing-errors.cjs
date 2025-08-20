#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

console.log("🔧 CORRECTION ERREURS DE PARSING...");

function fixParsingErrors(content) {
  let fixed = content;
  
  // 1. Corriger "Unexpected token '{'"
  fixed = fixed.replace(/(\w+)\s+{/g, "$1: {");
  
  // 2. Corriger "Unexpected token '}'"
  fixed = fixed.replace(/}\s*([a-zA-Z])/g, "}\n$1");
  
  // 3. Corriger "Unexpected token ','"
  fixed = fixed.replace(/,\s*,/g, ",");
  fixed = fixed.replace(/{\s*,/g, "{");
  fixed = fixed.replace(/,\s*}/g, "}");
  
  // 4. Corriger "Unexpected token ')'"
  fixed = fixed.replace(/\(\s*\)/g, "()");
  fixed = fixed.replace(/\(\s*,/g, "(");
  fixed = fixed.replace(/,\s*\)/g, ")");
  
  // 5. Corriger objets malformés
  fixed = fixed.replace(/(\w+)\s*{\s*([^}]+)\s*}/g, (match, name, content) => {
    // Ajouter les deux-points manquants
    const fixedContent = content.replace(/([^:,\s]+)\s*([^:,\s])/g, "$1: $2");
    return `${name}: { ${fixedContent} }`;
  });
  
  // 6. Corriger les fonctions malformées
  fixed = fixed.replace(/async\s+(\w+)\s*{/g, "async $1() {");
  fixed = fixed.replace(/function\s+(\w+)\s*{/g, "function $1() {");
  
  // 7. Corriger les classes malformées
  fixed = fixed.replace(/class\s+(\w+)\s*{/g, "class $1 {");
  fixed = fixed.replace(/export\s+class\s+(\w+)\s*{/g, "export class $1 {");
  
  // 8. Corriger les exports malformés
  fixed = fixed.replace(/export\s*{([^}]*)}/g, (match, content) => {
    const cleanContent = content.replace(/,\s*,/g, ",").trim();
    return `export { ${cleanContent} }`;
  });
  
  return fixed;
}

// Fichiers critiques à corriger en priorité
const criticalFiles = [
  "backend/alex-modules/consciousness/AlexHyperIntelligence.js",
  "backend/alex-modules/consciousness/AlexInfiniteCreator.js",
  "backend/alex-modules/core/AlexMemoryCore.js",
  "backend/alex-modules/core/AlexIntelligentCore.js",
  "backend/alex-modules/intelligence/AlexCreativeEngine.js",
  "backend/alex-modules/intelligence/AlexEmotionalIntelligence.js",
  "backend/alex-core/AlexKernel.js"
];

let totalFixed = 0;

for (const file of criticalFiles) {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Fichier non trouvé: ${file}`);
    continue;
  }
  
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const fixed = fixParsingErrors(content);
    
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed, "utf8");
      console.log(`✅ ${file} - erreurs de parsing corrigées`);
      totalFixed++;
    } else {
      console.log(`✓ ${file} - déjà correct`);
    }
  } catch (error) {
    console.error(`❌ Erreur sur ${file}:`, error.message);
  }
}

console.log(`\n📊 Erreurs de parsing corrigées: ${totalFixed} fichiers`);