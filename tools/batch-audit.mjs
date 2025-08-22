#!/usr/bin/env node
import { execSync, spawnSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.split("="); return [k.replace(/^--/,""), v ?? true];
}));

const ROOT = process.cwd();
const DIR  = args.dir ?? "backend";
const START = Number(args.start ?? 0);
const LIMIT = Number(args.limit ?? 10);
const APPLY = Boolean(args.apply ?? false);

const files = [];
(function walk(p){
  for (const name of readdirSync(p)) {
    const fp = join(p, name);
    const st = statSync(fp);
    if (st.isDirectory()) {
      if (/node_modules|dist|reports/.test(name)) continue;
      walk(fp);
    } else if (/\.(m?js|cjs|jsx|ts)$/.test(name)) {
      files.push(fp);
    }
  }
})(join(ROOT, DIR));

files.sort();
const slice = files.slice(START, START + LIMIT);

const issues = [];
for (const file of slice) {
  const rel = file.replace(ROOT + "/", "").replace(/\\/g, "/");
  const src = readFileSync(file, "utf8");

  // 1) Syntax check
  const nodeCheck = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (nodeCheck.status !== 0) {
    issues.push({ file: rel, type: "syntax_error", detail: nodeCheck.stderr.trim() });
  }

  // 2) Patterns fake
  if (/Math\.random\s*\(/.test(src)) {
    issues.push({ file: rel, type: "fake_random", detail: "Math.random() détecté" });
  }
  if (/\bsimulate[A-Z]\w*\s*\(/.test(src)) {
    issues.push({ file: rel, type: "fake_simulate", detail: "simulate*() détecté" });
  }
  if (/\blet\s+true\s*;/.test(src)) {
    issues.push({ file: rel, type: "reserved_identifier", detail: "let true;" });
    if (APPLY) {
      const fixed = src.replace(/\blet\s+true\s*;/g, "/* removed reserved identifier */");
      writeFileSync(file, fixed, "utf8");
    }
  }
  if (/import\s+EventEmitter\s+from\s+["']events["']/.test(src)) {
    issues.push({ file: rel, type: "bad_import", detail: "EventEmitter default import" });
    if (APPLY) {
      const fixed = src.replace(/import\s+EventEmitter\s+from\s+["']events["']/g, 'import { EventEmitter } from "events"');
      writeFileSync(file, fixed, "utf8");
    }
  }
}

// 3) ESLint pass (rapport texte court)
let eslintTxt = "";
try {
  const r = execSync(`npx eslint ${slice.map(f=>`"${f}"`).join(" ")}`, { encoding: "utf8" });
  eslintTxt = r.trim();
} catch (e) {
  eslintTxt = e.stdout?.toString?.().trim?.() || String(e);
}

// 4) Rapport Markdown
const when = new Date().toISOString().replace(/[:T]/g, "-").slice(0,19);
const md = [];
md.push(`# Rapport batch (${START}..${START+LIMIT-1}) — ${when}`);
md.push(`Dossier: \`${DIR}\` — Fichiers scannés: **${slice.length}**`);
md.push(`\n## Problèmes détectés (${issues.length})`);
if (issues.length === 0) md.push("- Aucun ✅");
for (const it of issues) md.push(`- \`${it.file}\` — **${it.type}**: ${it.detail}`);
md.push(`\n## ESLint\n`);
md.push("```txt\n" + (eslintTxt || "OK ✅") + "\n```");
const outPath = `reports/batch-${when}.md`;
writeFileSync(outPath, md.join("\n"), "utf8");
console.log(`✅ Rapport écrit: ${outPath}`);