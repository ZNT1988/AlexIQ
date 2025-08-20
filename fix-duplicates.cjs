#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

console.log("🔧 CORRECTION IDENTIFIANTS DUPLIQUÉS...");

function fixDuplicateIdentifiers(content) {
  let fixed = content;
  
  // 1. Détecter et corriger les constantes dupliquées
  const constMatches = [...fixed.matchAll(/const\s+(\w+)\s*=/g)];
  const constNames = {};
  
  constMatches.forEach(match => {
    const name = match[1];
    if (constNames[name]) {
      constNames[name]++;
      // Renommer les duplicatas
      fixed = fixed.replace(
        new RegExp(`const\\s+${name}\\s*=`, "g"),
        (match, offset) => {
          // Garder le premier, renommer les suivants
          if (offset === constMatches.find(m => m[1] === name).index) {
            return match;
          }
          return `const ${name}_${constNames[name]} =`;
        }
      );
    } else {
      constNames[name] = 1;
    }
  });
  
  // 2. Corriger les variables let dupliquées
  const letMatches = [...fixed.matchAll(/let\s+(\w+)\s*=/g)];
  const letNames = {};
  
  letMatches.forEach(match => {
    const name = match[1];
    if (letNames[name]) {
      letNames[name]++;
      fixed = fixed.replace(
        new RegExp(`let\\s+${name}\\s*=`, "g"),
        (match, offset) => {
          if (offset === letMatches.find(m => m[1] === name).index) {
            return match;
          }
          return `let ${name}_${letNames[name]} =`;
        }
      );
    } else {
      letNames[name] = 1;
    }
  });
  
  // 3. Corriger les fonctions dupliquées
  const funcMatches = [...fixed.matchAll(/function\s+(\w+)\s*\(/g)];
  const funcNames = {};
  
  funcMatches.forEach(match => {
    const name = match[1];
    if (funcNames[name]) {
      funcNames[name]++;
      fixed = fixed.replace(
        new RegExp(`function\\s+${name}\\s*\\(`, "g"),
        (match, offset) => {
          if (offset === funcMatches.find(m => m[1] === name).index) {
            return match;
          }
          return `function ${name}_${funcNames[name]}(`;
        }
      );
    } else {
      funcNames[name] = 1;
    }
  });
  
  // 4. Corriger les classes dupliquées
  const classMatches = [...fixed.matchAll(/class\s+(\w+)\s*{/g)];
  const classNames = {};
  
  classMatches.forEach(match => {
    const name = match[1];
    if (classNames[name]) {
      classNames[name]++;
      fixed = fixed.replace(
        new RegExp(`class\\s+${name}\\s*{`, "g"),
        (match, offset) => {
          if (offset === classMatches.find(m => m[1] === name).index) {
            return match;
          }
          return `class ${name}_${classNames[name]} {`;
        }
      );
    } else {
      classNames[name] = 1;
    }
  });
  
  // 5. Corriger les imports dupliqués
  const importLines = fixed.split("\n").filter(line => line.trim().startsWith("import"));
  const uniqueImports = [...new Set(importLines)];
  
  if (importLines.length !== uniqueImports.length) {
    const nonImportLines = fixed.split("\n").filter(line => !line.trim().startsWith("import"));
    fixed = uniqueImports.concat(nonImportLines).join("\n");
  }
  
  // 6. Corriger les exports dupliqués
  const exportLines = fixed.split("\n").filter(line => line.trim().startsWith("export"));
  const uniqueExports = [...new Set(exportLines)];
  
  if (exportLines.length !== uniqueExports.length) {
    exportLines.forEach(line => {
      if (uniqueExports.includes(line)) {
        // Garder seulement la première occurrence
        fixed = fixed.replace(new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), 
          (match, offset) => {
            if (offset === fixed.indexOf(line)) {
              return match;
            }
            return "// " + match; // Commenter les duplicatas
          }
        );
      }
    });
  }
  
  // 7. Cas spéciaux pour les identifiants STR_*
  const strIdentifiers = [...fixed.matchAll(/const\s+(STR_\w+)\s*=/g)];
  const strNames = {};
  
  strIdentifiers.forEach(match => {
    const name = match[1];
    if (strNames[name]) {
      strNames[name]++;
      const newName = `${name}_${strNames[name]}`;
      // Remplacer toutes les occurrences sauf la première déclaration
      fixed = fixed.replace(
        new RegExp(`\\b${name}\\b`, "g"),
        (match, offset) => {
          if (offset === strIdentifiers.find(m => m[1] === name).index + match.indexOf(name)) {
            return match;
          }
          return newName;
        }
      );
    } else {
      strNames[name] = 1;
    }
  });
  
  return fixed;
}

// Traiter tous les fichiers
function getAllFiles() {
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

const files = getAllFiles();
let totalFixed = 0;

console.log(`🔍 Traitement de ${files.length} fichiers pour doublons...`);

for (const file of files) {
  try {
    const content = fs.readFileSync(file, "utf8");
    const fixed = fixDuplicateIdentifiers(content);
    
    if (content !== fixed) {
      fs.writeFileSync(file, fixed, "utf8");
      console.log(`✅ ${file} - doublons corrigés`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`❌ Erreur sur ${file}:`, error.message);
  }
}

console.log(`\n📊 Identifiants dupliqués corrigés: ${totalFixed} fichiers`);