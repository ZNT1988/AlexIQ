#!/usr/bin/env node
import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join, extname } from "path";

// Patterns de correction automatique
const fixes = [
  // Virgules orphelines
  { pattern: /{\s*,/g, replacement: "{" },
  { pattern: /,\s*}/g, replacement: "}" },
  { pattern: /\[\s*,/g, replacement: "[" },
  { pattern: /,\s*\]/g, replacement: "]" },
  { pattern: /,\s*,/g, replacement: "," },
  
  // Deux points mal placés
  { pattern: /:\s*{/g, replacement: " {" },
  { pattern: /export\s+class\s+(\w+):\s*{/g, replacement: "export class $1 {" },
  { pattern: /function\s+(\w+):\s*\(/g, replacement: "function $1(" },
  { pattern: /const\s*:\s*/g, replacement: "const " },
  { pattern: /let\s*:\s*/g, replacement: "let " },
  { pattern: /var\s*:\s*/g, replacement: "var " },
  
  // Try/catch mal formatés
  { pattern: /try\s*:/g, replacement: "try {" },
  { pattern: /catch\s*:/g, replacement: "catch (error) {" },
  { pattern: /finally\s*:/g, replacement: "finally {" },
  
  // Return mal formaté
  { pattern: /return\s*:/g, replacement: "return" },
  
  // Identifiants dupliqués (simple)
  { pattern: /const\s+(\w+)\s*=.*?\nconst\s+\1\s*=/g, replacement: (match, name) => {
    return match.replace(new RegExp(`const\\s+${name}\\s*=`, "g"), `const ${name}_2 =`);
  } },
  
  // Imports mal formatés
  { pattern: /import\s*{\s*}/g, replacement: "" },
  { pattern: /export\s*{\s*}/g, replacement: "" },
  
  // Parenthèses manquantes
  { pattern: /if\s*([^(].*?)\s*{/g, replacement: "if ($1) {" },
  { pattern: /while\s*([^(].*?)\s*{/g, replacement: "while ($1) {" },
  { pattern: /for\s*([^(].*?)\s*{/g, replacement: "for ($1) {" }
];

function getAllJsFiles(dirs) {
  const files = [];
  for (const dir of dirs) {
    try {
      const fullPath = join(process.cwd(), dir);
      for (const file of readdirSync(fullPath)) {
        const filePath = join(fullPath, file);
        if (statSync(filePath).isFile() && extname(filePath) === ".js") {
          files.push(filePath);
        }
      }
    } catch (err) {
      console.warn(`⚠️ Impossible de lire ${dir}: ${err.message}`);
    }
  }
  return files;
}

function applyFixes(content) {
  let fixed = content;
  let changesCount = 0;
  
  for (const fix of fixes) {
    const before = fixed;
    if (typeof fix.replacement === "function") {
      fixed = fixed.replace(fix.pattern, fix.replacement);
    } else {
      fixed = fixed.replace(fix.pattern, fix.replacement);
    }
    if (before !== fixed) {
      changesCount++;
    }
  }
  
  return { content: fixed, changes: changesCount };
}

const targetDirs = [
  "backend/alex-modules/consciousness",
  "backend/alex-modules/core", 
  "backend/alex-modules/intelligence",
  "backend/alex-modules/specialized"
];

console.log("🔧 Correction automatique des erreurs de syntaxe...");

const jsFiles = getAllJsFiles(targetDirs);
let totalFixes = 0;
let filesFixed = 0;

for (const file of jsFiles) {
  try {
    const content = readFileSync(file, "utf8");
    const result = applyFixes(content);
    
    if (result.changes > 0) {
      writeFileSync(file, result.content, "utf8");
      filesFixed++;
      totalFixes += result.changes;
      
      const relativePath = file.replace(process.cwd(), ".");
      console.log(`✅ ${relativePath} - ${result.changes} corrections`);
    }
  } catch (err) {
    const relativePath = file.replace(process.cwd(), ".");
    console.error(`❌ Erreur sur ${relativePath}: ${err.message}`);
  }
}

console.log("\n📊 Résultats:");
console.log(`Files traités: ${jsFiles.length}`);
console.log(`Files corrigés: ${filesFixed}`);
console.log(`Total corrections: ${totalFixes}`);

if (filesFixed > 0) {
  console.log("\n🎯 Relancer le test: node syntax-check-targeted.js");
}