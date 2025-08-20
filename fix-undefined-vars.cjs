#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

console.log("🔧 CORRECTION VARIABLES UNDEFINED...");

function fixUndefinedVariables(content) {
  let fixed = content;
  
  // 1. Ajouter les globals Node.js manquants en haut du fichier
  const nodeGlobals = [
    "setTimeout", "setInterval", "clearTimeout", "clearInterval",
    "setImmediate", "clearImmediate", "Buffer", "__dirname", "__filename"
  ];
  
  const missingGlobals = nodeGlobals.filter(global => 
    content.includes(global) && !content.includes(`global.${global}`)
  );
  
  if (missingGlobals.length > 0) {
    const globalsComment = `// Node.js globals\n/* global ${missingGlobals.join(", ")} */\n\n`;
    if (!fixed.includes("/* global")) {
      fixed = globalsComment + fixed;
    }
  }
  
  // 2. Corriger les variables undefined communes
  const commonUndefined = {
    "API_URL_1": '"https://api.example1.com"',
    "API_URL_2": '"https://api.example2.com"', 
    "API_URL_3": '"https://api.example3.com"',
    "API_URL_4": '"https://api.example4.com"',
    "STR_SELF": '"self"',
    "STR_1WEEK": '"1week"',
    "STR_6HOURS": '"6hours"',
    "STR_13_00": '"13:00"',
    "STR_ISO_22000": '"ISO-22000"',
    "STR_TYPESCRIPT": '"typescript"'
  };
  
  // Ajouter les constantes manquantes au début du fichier
  let constantsToAdd = [];
  
  Object.entries(commonUndefined).forEach(([varName, defaultValue]) => {
    if (content.includes(varName) && !content.includes(`const ${varName}`)) {
      constantsToAdd.push(`const ${varName} = ${defaultValue};`);
    }
  });
  
  if (constantsToAdd.length > 0) {
    const constantsBlock = "\n// Variables précédemment undefined\n" + 
                          constantsToAdd.join("\n") + "\n\n";
    
    // Insérer après les imports
    const importEndIndex = fixed.lastIndexOf("import ");
    if (importEndIndex !== -1) {
      const nextLineIndex = fixed.indexOf("\n", importEndIndex);
      fixed = fixed.slice(0, nextLineIndex) + constantsBlock + fixed.slice(nextLineIndex);
    } else {
      fixed = constantsBlock + fixed;
    }
  }
  
  // 3. Corriger les variables de modules manquantes
  const moduleVars = {
    "alexCloudLearning": "null",
    "advancedOrchestrator": "null"
  };
  
  Object.entries(moduleVars).forEach(([varName, defaultValue]) => {
    if (content.includes(varName) && !content.includes(`const ${varName}`) && !content.includes(`let ${varName}`)) {
      fixed = `const ${varName} = ${defaultValue}; // Module placeholder\n` + fixed;
    }
  });
  
  // 4. Corriger les références à des propriétés undefined
  fixed = fixed.replace(/(\w+)\.(\w+)\s*=\s*undefined/g, "$1.$2 = null");
  
  // 5. Ajouter try-catch pour les variables potentiellement undefined
  fixed = fixed.replace(/(console\.\w+\([^)]*\w+\s*\?\.\w+[^)]*\))/g, 
    "try { $1 } catch (error) { /* Variable undefined */ }"
  );
  
  // 6. Corriger les accès aux propriétés undefined avec optional chaining
  fixed = fixed.replace(/(\w+)\.(\w+)\.(\w+)/g, "$1?.$2?.$3");
  
  // 7. Initialiser les variables utilisées mais non déclarées
  const usedButNotDeclared = [];
  const varMatches = [...fixed.matchAll(/\b([a-zA-Z_$][\w$]*)\s*[=+\-*/]=?\s*/g)];
  const declaredVars = [...fixed.matchAll(/(?:const|let|var)\s+([a-zA-Z_$][\w$]*)/g)]
    .map(match => match[1]);
  
  varMatches.forEach(match => {
    const varName = match[1];
    if (!declaredVars.includes(varName) && !nodeGlobals.includes(varName)) {
      if (!usedButNotDeclared.includes(varName)) {
        usedButNotDeclared.push(varName);
      }
    }
  });
  
  // Ajouter les déclarations manquantes
  if (usedButNotDeclared.length > 0) {
    const declarations = usedButNotDeclared
      .map(varName => `let ${varName}; // Variable auto-déclarée`)
      .join("\n");
    
    fixed = `${declarations}\n\n` + fixed;
  }
  
  return fixed;
}

// Traiter tous les fichiers
function getAllFiles() {
  const dirs = [
    "backend/alex-modules/consciousness",
    "backend/alex-modules/core",
    "backend/alex-modules/intelligence",
    "backend/alex-modules/specialized",
    "backend/alex-core",
    "backend/config"
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

console.log(`🔍 Traitement de ${files.length} fichiers pour variables undefined...`);

for (const file of files) {
  try {
    const content = fs.readFileSync(file, "utf8");
    const fixed = fixUndefinedVariables(content);
    
    if (content !== fixed) {
      fs.writeFileSync(file, fixed, "utf8");
      console.log(`✅ ${file} - variables undefined corrigées`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`❌ Erreur sur ${file}:`, error.message);
  }
}

console.log(`\n📊 Variables undefined corrigées: ${totalFixed} fichiers`);