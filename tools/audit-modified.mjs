#!/usr/bin/env node
import { execSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

// Get only git modified JS files
const gitOutput = execSync("git status --porcelain", { encoding: "utf8" });
const modifiedFiles = gitOutput
  .split("\n")
  .filter(line => line.match(/^ M.*\.js$/))
  .map(line => line.slice(3).trim())
  .filter(file => file);

console.log(`Found ${modifiedFiles.length} modified JS files`);

const issues = [];
for (const file of modifiedFiles) {
  const src = readFileSync(file, "utf8");

  // 1) Syntax check
  const nodeCheck = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (nodeCheck.status !== 0) {
    issues.push({ file, type: "syntax_error", detail: nodeCheck.stderr.trim() });
  }

  // 2) Patterns fake - more precise detection
  const mathRandomMatches = src.match(/Math\.random\s*\(/g);
  if (mathRandomMatches) {
    // Check if it's not just in comments
    const realMathRandom = src.split('\n').some(line => {
      return line.includes('Math.random(') && !line.trim().startsWith('//') && !line.trim().startsWith('*');
    });
    if (realMathRandom) {
      issues.push({ file, type: "fake_random", detail: `${mathRandomMatches.length} Math.random() calls` });
    }
  }

  if (/\bsimulate[A-Z]\w*\s*\(/.test(src)) {
    issues.push({ file, type: "fake_simulate", detail: "simulate*() détecté" });
  }
}

// 3) ESLint on modified files only (avoid massive output)
let eslintTxt = "";
try {
  const eslintFiles = modifiedFiles.slice(0, 20); // Limit to avoid timeout
  const r = execSync(`npx eslint ${eslintFiles.map(f=>`"${f}"`).join(" ")}`, { encoding: "utf8" });
  eslintTxt = r.trim();
} catch (e) {
  eslintTxt = e.stdout?.toString?.().trim?.() || String(e);
}

// 4) Report
const when = new Date().toISOString().replace(/[:T]/g, "-").slice(0,19);
const md = [];
md.push(`# Rapport modules modifiés — ${when}`);
md.push(`Modules git modifiés: **${modifiedFiles.length}**`);
md.push(`\n## Problèmes détectés (${issues.length})`);
if (issues.length === 0) md.push("- Aucun ✅");
for (const it of issues) md.push(`- \`${it.file}\` — **${it.type}**: ${it.detail}`);
md.push(`\n## Modules avec problèmes`);
const problemFiles = new Set(issues.map(i => i.file));
md.push(`${problemFiles.size} fichiers sur ${modifiedFiles.length} ont des problèmes (${Math.round(problemFiles.size/modifiedFiles.length*100)}%)`);
md.push(`\n## ESLint (premiers 20 modules)\n`);
md.push("```txt\n" + (eslintTxt || "OK ✅") + "\n```");

const outPath = `reports/modified-${when}.md`;
writeFileSync(outPath, md.join("\n"), "utf8");
console.log(`✅ Rapport écrit: ${outPath}`);