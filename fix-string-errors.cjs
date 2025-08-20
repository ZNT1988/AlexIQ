#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

console.log("🔧 CORRECTION CHAÎNES NON TERMINÉES...");

function fixStringErrors(content) {
  let fixed = content;
  
  // 1. Corriger les chaînes non terminées avec guillemets simples
  fixed = fixed.replace(/'([^']*?)$/gm, (match, content) => {
    return `'${content}'`;
  });
  
  // 2. Corriger les chaînes non terminées avec guillemets doubles
  fixed = fixed.replace(/"([^"]*?)$/gm, (match, content) => {
    return `"${content}"`;
  });
  
  // 3. Corriger les chaînes avec échappement cassé
  fixed = fixed.replace(/\\$/gm, "");
  
  // 4. Corriger les template literals non terminés
  fixed = fixed.replace(/`([^`]*?)$/gm, (match, content) => {
    return `\`${content}\``;
  });
  
  // 5. Corriger les chaînes multilignes cassées
  fixed = fixed.replace(/'([^']*?)\n([^']*?)'/g, "'$1 $2'");
  fixed = fixed.replace(/"([^"]*?)\n([^"]*?)"/g, '"$1 $2"');
  
  // 6. Corriger les chaînes avec des caractères spéciaux non échappés
  fixed = fixed.replace(/'([^']*?)\\([^']*?)'/g, "'$1\\\\$2'");
  fixed = fixed.replace(/"([^"]*?)\\([^"]*?)"/g, '"$1\\\\$2"');
  
  // 7. Corriger les expressions régulières malformées
  fixed = fixed.replace(/\/([^\/\n]*?)$/gm, (match, pattern) => {
    return `/${pattern}/g`;
  });
  
  // 8. Corriger les chaînes avec des apostrophes
  fixed = fixed.replace(/'([^']*?)'([^']*?)'/g, (match, part1, part2) => {
    return `'${part1}\\'${part2}'`;
  });
  
  // 9. Corriger les constantes de chaînes malformées
  fixed = fixed.replace(/const\s+(\w+)\s*=\s*([^;'"]*?)$/gm, (match, name, value) => {
    if (!value.includes('"') && !value.includes("'")) {
      return `const ${name} = "${value.trim()}";`;
    }
    return match;
  });
  
  return fixed;
}

// Fonction pour obtenir tous les fichiers JS
function getAllJSFiles() {
  const dirs = [
    "backend/alex-modules/consciousness",
    "backend/alex-modules/core", 
    "backend/alex-modules/intelligence",
    "backend/alex-modules/specialized",
    "backend/alex-core"
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

const files = getAllJSFiles();
let totalFixed = 0;

console.log(`🔍 Traitement de ${files.length} fichiers pour chaînes...`);

for (const file of files) {
  try {
    const content = fs.readFileSync(file, "utf8");
    const fixed = fixStringErrors(content);
    
    if (content !== fixed) {
      fs.writeFileSync(file, fixed, "utf8");
      console.log(`✅ ${file} - chaînes corrigées`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`❌ Erreur sur ${file}:`, error.message);
  }
}

console.log(`\n📊 Chaînes non terminées corrigées: ${totalFixed} fichiers`);