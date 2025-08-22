#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const files = process.argv.slice(2);
for (const f of files) {
  let s = readFileSync(f, "utf8");
  const before = s;

  // Fix literal \n in JavaScript strings
  s = s.replace(/\\n/g, '\n');

  // Fix imports EventEmitter
  s = s.replace(/import\s+EventEmitter\s+from\s+["']events["']/g, 'import { EventEmitter } from "events"');

  // Marqueurs anti-fake (devront être remplacés par vraies métriques manuelles)
  s = s.replace(/Math\.random\s*\(/g, '/* ANTI-FAKE: random removed */ (()=>{ throw new Error("random_usage_removed"); })(');
  s = s.replace(/\bsimulate([A-Z]\w*)\s*\(/g, '/* ANTI-FAKE: simulate removed: $1 */ (()=>{ throw new Error("simulate_usage_removed"); })(');

  if (s !== before) {
    writeFileSync(f, s, "utf8");
    console.log("Patched:", f);
  }
}
spawnSync("npx", ["eslint", "--fix", ...files], { stdio: "inherit" });