#!/usr/bin/env node
// Scanner anti-fake STRICT selon contrat
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const TARGET = process.argv[2] || "backend";
const EXCLUDES = /node_modules|dist|build|reports|\.git|frontend\/dist/;

// Chargement du contrat anti-fake
const contract = JSON.parse(readFileSync(join(ROOT, 'anti-fake.contract.json'), 'utf8'));

const files = [];
(function walk(p){
  for (const name of readdirSync(p)) {
    const fp = join(p, name);
    const st = statSync(fp);
    if (st.isDirectory()) { 
      if (!EXCLUDES.test(fp)) walk(fp); 
    } else if (/\.(m?js|cjs|jsx|ts)$/.test(name)) {
      files.push(fp);
    }
  }
})(join(ROOT, TARGET));

const flagged = [];
const real = [];

for (const f of files) {
  const content = readFileSync(f, "utf8");
  const relativePath = f.replace(ROOT + (process.platform === 'win32' ? '\\' : '/'), '').replace(/\\/g, '/');
  
  let isFlagged = false;
  const violations = [];
  
  // Vérifier chaque règle du contrat
  for (const [ruleName, pattern] of Object.entries(contract.flags)) {
    const regex = new RegExp(pattern, 'gi');
    const matches = [...content.matchAll(regex)];
    
    if (matches.length > 0) {
      isFlagged = true;
      matches.forEach(match => {
        const lineNum = content.substring(0, match.index).split('\n').length;
        const line = content.split('\n')[lineNum - 1]?.trim() || '';
        violations.push({
          rule: ruleName,
          line: lineNum,
          content: line,
          match: match[0]
        });
      });
    }
  }
  
  // Vérifier sources requises pour modules non-flagged
  if (!isFlagged) {
    const hasRequiredSources = contract.required_sources.some(source => {
      if (source === "os") return /\bos\.|loadavg|cpus|totalmem/i.test(content);
      if (source === "process") return /\bprocess\.|memoryUsage|cpuUsage/i.test(content);  
      if (source === "real_api_call") return /fetch\(|axios\.|openai|anthropic|google.*api/i.test(content);
      return false;
    });
    
    // Si pas de sources réelles ET contient des retours de métriques, flag comme suspect
    if (!hasRequiredSources && /return.*\{.*(?:health|score|confidence|level|status).*\}/i.test(content)) {
      isFlagged = true;
      violations.push({
        rule: "missing_real_sources",
        line: 0,
        content: "Module retourne des métriques sans sources réelles",
        match: "no real data sources"
      });
    }
  }
  
  if (isFlagged) {
    flagged.push({ path: relativePath, violations });
  } else {
    real.push(relativePath);
  }
}

// Rapport console
const totalFiles = files.length;
const realCount = real.length;
const flaggedCount = flagged.length;

console.error(`🔍 SCAN ANTI-FAKE STRICT - BACKEND SEULEMENT`);
console.error(`📊 Périmètre: ${TARGET}/`);
console.error(`📁 Total fichiers: ${totalFiles}`);
console.error(`✅ REAL (conformes): ${realCount} (${Math.round(realCount/totalFiles*100)}%)`);
console.error(`❌ FLAGGED (violations): ${flaggedCount} (${Math.round(flaggedCount/totalFiles*100)}%)`);

if (flaggedCount > 0) {
  console.error(`\n❌ VIOLATIONS DÉTECTÉES:`);
  flagged.slice(0, 10).forEach((f, i) => {
    console.error(`${i+1}. ${f.path}`);
    f.violations.slice(0, 2).forEach(v => {
      console.error(`   - ${v.rule} (ligne ${v.line}): ${v.match}`);
    });
  });
  
  if (flagged.length > 10) {
    console.error(`   ... et ${flagged.length - 10} autres modules flaggés`);
  }
}

// Sauvegarder artefacts
const summary = {
  timestamp: new Date().toISOString(),
  perimetre: TARGET,
  contract_version: "strict",
  total_files: totalFiles,
  real_count: realCount,
  flagged_count: flaggedCount,
  real_percent: Math.round(realCount/totalFiles*100),
  flagged_percent: Math.round(flaggedCount/totalFiles*100)
};

writeFileSync('hf_backend_only_summary.json', JSON.stringify(summary, null, 2));
writeFileSync('notre_flagged.txt', flagged.map(f => f.path).join('\n'));
writeFileSync('notre_real.txt', real.join('\n'));

// Rapport détaillé MD
let report = `# AUDIT ANTI-FAKE STRICT - BACKEND SEULEMENT\n\n`;
report += `**Timestamp:** ${summary.timestamp}\n`;
report += `**Périmètre:** ${TARGET}/\n`;
report += `**Contrat:** anti-fake.contract.json\n\n`;
report += `## 📊 RÉSULTATS\n\n`;
report += `- **Total fichiers:** ${totalFiles}\n`;
report += `- **REAL (conformes):** ${realCount} (${summary.real_percent}%)\n`;
report += `- **FLAGGED (violations):** ${flaggedCount} (${summary.flagged_percent}%)\n\n`;

if (flaggedCount > 0) {
  report += `## ❌ MODULES FLAGGÉS AVEC EXTRAITS\n\n`;
  flagged.forEach((f, i) => {
    report += `### ${i+1}. ${f.path}\n\n`;
    f.violations.forEach(v => {
      report += `**Règle violée:** ${v.rule}\n`;
      report += `**Ligne ${v.line}:** \`${v.content}\`\n`;
      report += `**Match:** \`${v.match}\`\n\n`;
    });
    report += `---\n\n`;
  });
}

writeFileSync('AUDIT-ANTI-FAKE-STRICT.md', report);

console.error(`\n📄 ARTEFACTS GÉNÉRÉS:`);
console.error(`- hf_backend_only_summary.json (totaux + %)`);
console.error(`- notre_flagged.txt (liste modules flaggés)`);
console.error(`- notre_real.txt (liste modules conformes)`);
console.error(`- AUDIT-ANTI-FAKE-STRICT.md (rapport avec extraits)`);

// Exit code selon résultat
process.exit(flaggedCount > 0 ? 1 : 0);