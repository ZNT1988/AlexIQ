#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "alex-modules");
const FRONT = path.join(__dirname, "..", "..", "frontend");

const suspiciousStrings = [
  /return\s+["'`][^${}]*?(bonjour|hello|je suis.*ia|default answer|static reply|fake ai)["'`]\s*;?/i,
  /console\.log\s*\(\s*["'`].*(ia consciente|omnipotente).*["'`]\s*\)/i
];

function scanDir(dir, filter = (f)=>/\.(js|mjs|cjs)$/.test(f)) {
  const out = [];
  (function walk(p){
    for (const f of fs.readdirSync(p)) {
      const full = path.join(p,f);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (filter(full)) out.push(full);
    }
  })(dir);
  return out;
}

function scanFiles(files) {
  const findings = [];
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    suspiciousStrings.forEach(rx => { if (rx.test(src)) findings.push({ file, rule: rx.toString() }); });
  }
  return findings;
}

function checkFrontEnvLeak() {
  if (!fs.existsSync(FRONT)) return [];
  const files = scanDir(FRONT, f => /\.(js|ts|tsx|jsx|mjs|cjs)$/.test(f));
  const leaks = [];
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    if (/process\.env\.(OPENAI|ANTHROPIC|GOOGLE|CLE_API)/i.test(src)) leaks.push(file);
  }
  return leaks;
}

console.log("🔎 Audit statique profond…");
const files = scanDir(ROOT);
const findings = scanFiles(files);
if (findings.length) {
  console.log("⚠️ Retours statiques suspects:");
  findings.forEach(f => console.log(`- ${f.file} | rule: ${f.rule}`));
} else {
  console.log("✅ Aucun retour statique suspect détecté dans alex-modules/");
}
const leaks = checkFrontEnvLeak();
if (leaks.length) {
  console.log("\n⚠️ Fuite potentielle de variables d'env dans le FRONT:");
  leaks.forEach(f => console.log(" -", f));
} else {
  console.log("\n✅ Pas d'accès direct aux clés dans le frontend.");
}