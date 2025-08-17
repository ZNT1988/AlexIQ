#!/usr/bin/env node
import { readdirSync, statSync, readFileSync } from "fs";
import { join, extname } from "path";
import { pathToFileURL } from "url";
import { execSync } from "child_process";

function getAllJsFiles(dir, files = []) {
  for (const file of readdirSync(dir)) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      getAllJsFiles(fullPath, files);
    } else if (extname(fullPath) === ".js") {
      files.push(fullPath);
    }
  }
  return files;
}

function checkSyntax(file) {
  try {
    // Essaie de parser le fichier avec Node
    new Function(readFileSync(file, "utf8"));
    return null; // pas d'erreur
  } catch (err) {
    return {
      file,
      message: err.message,
      stack: err.stack
    };
  }
}

console.log("🔍 Vérification de la syntaxe JavaScript...");

const jsFiles = getAllJsFiles(process.cwd());
let errors = [];

for (const file of jsFiles) {
  const err = checkSyntax(file);
  if (err) {
    errors.push(err);
    console.error(`❌ Erreur dans ${file}`);
    console.error(`   → ${err.message}`);
  }
}

if (errors.length === 0) {
  console.log("✅ Aucun problème de syntaxe trouvé !");
} else {
  console.log(`⚠️ ${errors.length} fichiers avec des erreurs de syntaxe.`);

  // Tentative correction auto si eslint est installé
  try {
    console.log("🛠️ Tentative de correction avec ESLint...");
    execSync("npx eslint . --ext .js --fix", { stdio: "inherit" });
  } catch {
    console.log("ℹ️ ESLint n'est pas installé. Lance : npm install eslint -D");
  }
}