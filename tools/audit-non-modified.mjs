#!/usr/bin/env node
import { execSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

// Get all alex modules
const allAlexOutput = execSync("find backend -name '*.js' | grep alex", { encoding: "utf8" });
const allAlexFiles = allAlexOutput.split("\n").filter(line => line.trim());

// Get git modified JS files
const gitOutput = execSync("git status --porcelain", { encoding: "utf8" });
const modifiedFiles = new Set(gitOutput
  .split("\n")
  .filter(line => line.match(/^ M.*\.js$/))
  .map(line => line.slice(3).trim())
  .filter(file => file));

// Find non-modified alex modules
const nonModifiedAlexFiles = allAlexFiles.filter(file => !modifiedFiles.has(file));

console.log(`Total alex modules: ${allAlexFiles.length}`);
console.log(`Modified alex modules: ${allAlexFiles.length - nonModifiedAlexFiles.length}`);
console.log(`NON-modified alex modules: ${nonModifiedAlexFiles.length}`);

const issues = [];
for (const file of nonModifiedAlexFiles) {
  try {
    const src = readFileSync(file, "utf8");

    // 1) Syntax check
    const nodeCheck = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    if (nodeCheck.status !== 0) {
      issues.push({ file, type: "syntax_error", detail: nodeCheck.stderr.trim() });
    }

    // 2) Anti-fake patterns check
    const mathRandomMatches = src.match(/Math\.random\s*\(/g);
    if (mathRandomMatches) {
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

    // Check for hardcoded fake values
    if (/return\s*{\s*[^}]*:\s*"fake/i.test(src)) {
      issues.push({ file, type: "fake_data", detail: "Hardcoded fake data detected" });
    }

    // Check for TODO/FIXME without implementation
    if (/TODO|FIXME|PLACEHOLDER/i.test(src)) {
      const todoCount = (src.match(/TODO|FIXME|PLACEHOLDER/gi) || []).length;
      if (todoCount > 3) {
        issues.push({ file, type: "incomplete", detail: `${todoCount} TODO/FIXME markers` });
      }
    }

  } catch (error) {
    issues.push({ file, type: "read_error", detail: error.message });
  }
}

// Generate report
const when = new Date().toISOString().replace(/[:T]/g, "-").slice(0,19);
const md = [];
md.push(`# Rapport modules alex NON-modifiés — ${when}`);
md.push(`Total modules alex: **${allAlexFiles.length}**`);
md.push(`Modules modifiés (git): **${allAlexFiles.length - nonModifiedAlexFiles.length}**`);
md.push(`Modules NON-modifiés: **${nonModifiedAlexFiles.length}**`);
md.push(`\n## Problèmes détectés (${issues.length})`);

if (issues.length === 0) {
  md.push("- Aucun problème détecté ✅");
} else {
  for (const it of issues) {
    md.push(`- \`${it.file}\` — **${it.type}**: ${it.detail}`);
  }
}

md.push(`\n## Conformité anti-fake`);
const problemFiles = new Set(issues.map(i => i.file));
const conformeFiles = nonModifiedAlexFiles.length - problemFiles.size;
md.push(`- Modules conformes: **${conformeFiles}/${nonModifiedAlexFiles.length}** (${Math.round(conformeFiles/nonModifiedAlexFiles.length*100)}%)`);
md.push(`- Modules problématiques: **${problemFiles.size}/${nonModifiedAlexFiles.length}** (${Math.round(problemFiles.size/nonModifiedAlexFiles.length*100)}%)`);

md.push(`\n## Échantillon modules NON-modifiés`);
nonModifiedAlexFiles.slice(0, 10).forEach(file => {
  md.push(`- ${file}`);
});
if (nonModifiedAlexFiles.length > 10) {
  md.push(`- ... et ${nonModifiedAlexFiles.length - 10} autres`);
}

const outPath = `reports/non-modified-alex-${when}.md`;
writeFileSync(outPath, md.join("\n"), "utf8");
console.log(`✅ Rapport écrit: ${outPath}`);