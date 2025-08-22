#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

const files = process.argv.slice(2);
for (const f of files) {
  let s = readFileSync(f, "utf8");
  const before = s;

  // Replace corrupted ANTI-FAKE markers with proper status
  s = s.replace(/\/\* ANTI-FAKE: random removed \*\/ \(\(\)\=>\{ throw new Error\(\"random_usage_removed\"\); \}\)\(\)/g, '0 /* ANTI-FAKE: random removed */');

  // Replace other corrupted patterns
  s = s.replace(/\/\* ANTI-FAKE: simulate removed: \w+ \*\/ \(\(\)\=>\{ throw new Error\(\"simulate_usage_removed\"\); \}\)\(/g, '/* ANTI-FAKE: simulate removed */ (() => { throw new Error("not_implemented"); })(');

  if (s !== before) {
    writeFileSync(f, s, "utf8");
    console.log("Cleaned corrupted ANTI-FAKE markers:", f);
  }
}