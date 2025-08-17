#!/usr/bin/env node
const { readdirSync, statSync, readFileSync } = require("fs");
const { join, extname } = require("path");
const { execSync } = require("child_process");

function getAllJsFiles(dir, files = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const st = statSync(p);
    if (st.isDirectory()) getAllJsFiles(p, files);
    else if ([".js", ".mjs", ".cjs"].includes(extname(p))) files.push(p);
  }
  return files;
}

function checkSyntax(file) {
  try { new Function(readFileSync(file, "utf8")); return null; }
  catch (err) { return { file, message: err.message }; }
}

console.log("🔍 Vérification syntaxe JS…");
const files = getAllJsFiles(process.cwd());
const errors = [];
for (const f of files) { const e = checkSyntax(f); if (e) { errors.push(e); console.error(`❌ ${e.file}\n   → ${e.message}`);} }
if (!errors.length) { console.log("✅ Aucun problème de syntaxe."); process.exit(0); }
console.log(`⚠️ ${errors.length} fichiers en erreur. Tentative de correction ESLint…`);
try { execSync("npx eslint . --ext .js,.mjs,.cjs --fix", { stdio: "inherit" }); }
catch { console.log("ℹ️ Installe ESLint: npm i -D eslint"); }