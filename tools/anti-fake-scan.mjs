#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const TARGET = process.argv[2] || "backend";
const EXCLUDES = /node_modules|dist|build|\.git|frontend\/dist/;

const PATTERNS = [
  ["math_random", /\bMath\.random\s*\(/g],
  // crypto.randomBytes non via guard
  ["crypto_random_bytes", /\bcrypto\.randomBytes\s*\(/g],
  ["crypto_random_bytes_unscoped", /(^|[^.\w])randomBytes\s*\(/g],
  ["simulate_call", /\bsimulate[A-Z]\w*\s*\(/g],
  ["placeholder", /\bplaceholder\b/i],
  ["static_prediction", /return\s*['"](normal|high|low)['"]\s*;/i],
  ["hardcoded_confidence", /\bconfidence\s*:\s*(0?\.\d+|1(?:\.0+)?)\b/],
  ["bad_eventemitter_import", /import\s+EventEmitter\s+from\s+['"]events['"]/],
  ["esm_cjs_mix", /(import|export).*(module\.exports|require\()/s],
];

function walk(d, out=[]) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    const st = statSync(p);
    if (st.isDirectory()) { if (!EXCLUDES.test(p)) walk(p, out); }
    else if (/\.(m?js|cjs|jsx|ts|tsx)$/.test(n)) out.push(p);
  }
  return out;
}

const files = walk(join(ROOT, TARGET));
let hits = [];
for (const f of files) {
  const s = readFileSync(f, "utf8");
  for (const [name, rx] of PATTERNS) {
    if (rx.test(s)) hits.push({ file: f, issue: name });
  }
}

// Tolérer usages autorisés via guard
hits = hits.filter(h => {
  if (h.issue.startsWith("crypto_random")) {
    const s = readFileSync(h.file.startsWith(ROOT) ? h.file : join(ROOT, h.file), "utf8");
    // Si le fichier importe safeRandomBytes, on tolère (devra être purpose-checked)
    if (/from\s+["'].*guards\/RandomPolicy["']/.test(s)) return false;
  }
  return true;
});

if (hits.length) {
  console.error("❌ Anti-fake violations:");
  for (const h of hits) console.error(` - ${h.file.replace(ROOT, ".")}: ${h.issue}`);
  process.exit(1);
}
console.log("✅ Anti-fake scan OK");