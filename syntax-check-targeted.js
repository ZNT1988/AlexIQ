#!/usr/bin/env node
import { readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { execSync } from "child_process";

// Focus sur les modules Alex critiques
const targetDirs = [
  "backend/alex-modules/consciousness",
  "backend/alex-modules/core", 
  "backend/alex-modules/intelligence",
  "backend/alex-modules/specialized"
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

function checkNodeSyntax(file) {
  try {
    execSync(`node --check "${file}"`, { stdio: "pipe" });
    return null; // Pas d'erreur
  } catch (err) {
    return {
      file,
      message: err.stderr?.toString() || err.message,
      stdout: err.stdout?.toString() || ""
    };
  }
}

console.log("🎯 Vérification syntaxe modules Alex critiques...");

const jsFiles = getAllJsFiles(targetDirs);
let errors = [];
let checked = 0;

for (const file of jsFiles) {
  checked++;
  const err = checkNodeSyntax(file);
  if (err) {
    errors.push(err);
    const relativePath = file.replace(process.cwd(), ".");
    console.error(`❌ ${relativePath}`);
    // Extraire ligne d'erreur si possible
    const lines = err.message.split("\n");
    for (const line of lines) {
      if (line.includes("SyntaxError") || line.includes("Error:")) {
        console.error(`   → ${line.trim()}`);
        break;
      }
    }
  } else {
    process.stdout.write(".");
  }
}

console.log(`\n📊 Résultats: ${checked} fichiers vérifiés`);

if (errors.length === 0) {
  console.log("✅ Tous les modules Alex ont une syntaxe correcte !");
} else {
  console.log(`⚠️ ${errors.length} fichiers avec erreurs de syntaxe.`);
  
  // Lister les 10 premiers fichiers problématiques
  console.log("\n🔧 Fichiers à corriger en priorité:");
  errors.slice(0, 10).forEach((err, i) => {
    const relativePath = err.file.replace(process.cwd(), ".");
    console.log(`${i + 1}. ${relativePath}`);
  });
  
  if (errors.length > 10) {
    console.log(`   ... et ${errors.length - 10} autres fichiers`);
  }
}