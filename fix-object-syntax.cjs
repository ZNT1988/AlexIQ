#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

console.log("🔧 CORRECTION OBJETS MALFORMÉS...");

function fixObjectSyntax(content) {
  let fixed = content;
  
  // 1. Corriger les propriétés d'objets sans deux-points
  fixed = fixed.replace(/(\w+)\s+([a-zA-Z_$][\w$]*)\s*:/g, "$1: $2:");
  fixed = fixed.replace(/(\w+)\s+{/g, "$1: {");
  
  // 2. Corriger les virgules manquantes dans les objets
  fixed = fixed.replace(/}\s*([a-zA-Z_$][\w$]*)\s*:/g, "},\n  $1:");
  fixed = fixed.replace(/([^,\s}])\s*(\w+):/g, "$1,\n  $2:");
  
  // 3. Corriger les objets avec propriétés malformées
  fixed = fixed.replace(/{\s*([^}]+)\s*}/g, (match, content) => {
    // Ajouter les virgules manquantes entre propriétés
    const lines = content.split("\n").map(line => line.trim()).filter(line => line);
    const fixedLines = lines.map((line, index) => {
      if (index < lines.length - 1 && !line.endsWith(",") && !line.endsWith("{")) {
        return line + ",";
      }
      return line;
    });
    return `{\n    ${fixedLines.join("\n    ")}\n  }`;
  });
  
  // 4. Corriger les tableaux malformés
  fixed = fixed.replace(/\[\s*([^\]]+)\s*\]/g, (match, content) => {
    const items = content.split(/\s+/).filter(item => item.trim());
    return `[${items.map(item => `"${item.replace(/['"]/g, "")}"`).join(", ")}]`;
  });
  
  // 5. Corriger les propriétés sans valeur
  fixed = fixed.replace(/(\w+):\s*(\w+)\s*([,}])/g, (match, key, value, ending) => {
    // Si la valeur n'est pas entre guillemets ou n'est pas un nombre/boolean
    if (!/^(true|false|\d+|".*"|'.*'|null|undefined)$/.test(value)) {
      return `${key}: "${value}"${ending}`;
    }
    return match;
  });
  
  // 6. Corriger les fonctions dans les objets
  fixed = fixed.replace(/(\w+)\s*{([^}]+)}/g, (match, name, body) => {
    if (body.includes("return") || body.includes("function")) {
      return `${name}() {\n    ${body.trim()}\n  }`;
    }
    return match;
  });
  
  return fixed;
}

// Fonction pour traiter tous les fichiers alex-modules
function getAllAlexModuleFiles() {
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

const files = getAllAlexModuleFiles();
let totalFixed = 0;

console.log(`🔍 Traitement de ${files.length} fichiers Alex modules...`);

for (const file of files) {
  try {
    const content = fs.readFileSync(file, "utf8");
    const fixed = fixObjectSyntax(content);
    
    if (content !== fixed) {
      fs.writeFileSync(file, fixed, "utf8");
      console.log(`✅ ${file} - objets corrigés`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`❌ Erreur sur ${file}:`, error.message);
  }
}

console.log(`\n📊 Objets malformés corrigés: ${totalFixed} fichiers`);