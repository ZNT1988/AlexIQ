#!/usr/bin/env node
// Scanner anti-fake STRICT pour frontend + backend
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const TARGETS = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ["backend", "frontend"];
const EXCLUDES = /node_modules|dist|build|reports|\.git|\.next|\.vite|coverage/;

// Chargement du contrat anti-fake
const contract = JSON.parse(readFileSync(join(ROOT, 'anti-fake.contract.json'), 'utf8'));

// Patterns spécifiques frontend
const FRONTEND_PATTERNS = {
  "mock_data": "(?:mock|fake|dummy).*(?:data|response|api)",
  "console_log": "console\\.log\\(",
  "hardcoded_urls": "(?:http://localhost|https://api\\.fake)",
  "todo_comments": "(?://|/\\*).*(?:TODO|FIXME|HACK)",
  "alert_debug": "(?:alert|confirm)\\("
};

// Fusionner patterns backend + frontend
const ALL_PATTERNS = { ...contract.flags, ...FRONTEND_PATTERNS };

const results = { backend: { files: [], flagged: [], real: [] }, frontend: { files: [], flagged: [], real: [] } };

function scanDirectory(targetDir) {
  const files = [];
  const scope = targetDir === 'frontend' ? 'frontend' : 'backend';
  
  function walk(p) {
    try {
      for (const name of readdirSync(p)) {
        const fp = join(p, name);
        const st = statSync(fp);
        if (st.isDirectory()) {
          if (!EXCLUDES.test(fp)) walk(fp);
        } else if (/\.(m?js|cjs|jsx|ts|tsx|vue)$/.test(name)) {
          files.push(fp);
        }
      }
    } catch (err) {
      console.error(`Erreur scan ${p}:`, err.message);
    }
  }
  
  if (statSync(join(ROOT, targetDir)).isDirectory()) {
    walk(join(ROOT, targetDir));
  }
  
  results[scope].files = files;
  return files;
}

function analyzeFile(filePath, scope) {
  try {
    const content = readFileSync(filePath, "utf8");
    const relativePath = filePath.replace(ROOT + (process.platform === 'win32' ? '\\' : '/'), '').replace(/\\/g, '/');
    
    let isFlagged = false;
    const violations = [];
    
    // Vérifier patterns selon scope
    const patternsToCheck = scope === 'frontend' ? ALL_PATTERNS : contract.flags;
    
    for (const [ruleName, pattern] of Object.entries(patternsToCheck)) {
      try {
        const regex = new RegExp(pattern, 'gi');
        const matches = [...content.matchAll(regex)];
        
        if (matches.length > 0) {
          isFlagged = true;
          matches.slice(0, 3).forEach(match => { // Limite 3 matches par règle
            const lineNum = content.substring(0, match.index).split('\n').length;
            const line = content.split('\n')[lineNum - 1]?.trim() || '';
            violations.push({
              rule: ruleName,
              line: lineNum,
              content: line.substring(0, 100), // Tronquer lignes longues
              match: match[0]
            });
          });
        }
      } catch (regexErr) {
        console.error(`Erreur regex ${ruleName}:`, regexErr.message);
      }
    }
    
    // Vérifier sources réelles (seulement pour backend)
    if (scope === 'backend' && !isFlagged) {
      const hasRequiredSources = contract.required_sources.some(source => {
        if (source === "os") return /\bos\.|loadavg|cpus|totalmem/i.test(content);
        if (source === "process") return /\bprocess\.|memoryUsage|cpuUsage/i.test(content);
        if (source === "real_api_call") return /fetch\(|axios\.|openai|anthropic|google.*api/i.test(content);
        return false;
      });
      
      // Si module retourne des métriques sans sources réelles
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
    
    const result = { path: relativePath, violations, scope };
    
    if (isFlagged) {
      results[scope].flagged.push(result);
    } else {
      results[scope].real.push(relativePath);
    }
    
  } catch (error) {
    console.error(`Erreur analyse ${filePath}:`, error.message);
    results[scope].flagged.push({
      path: filePath.replace(ROOT + (process.platform === 'win32' ? '\\' : '/'), '').replace(/\\/g, '/'),
      violations: [{ rule: "read_error", line: 0, content: error.message, match: "ERROR" }],
      scope
    });
  }
}

// Scanner chaque target
console.error('🔍 SCAN ANTI-FAKE STRICT - BACKEND + FRONTEND\n');

for (const target of TARGETS) {
  console.error(`📂 Scan de ${target}/...`);
  
  try {
    const files = scanDirectory(target);
    const scope = target === 'frontend' ? 'frontend' : 'backend';
    
    console.error(`  📁 ${files.length} fichiers trouvés`);
    
    // Analyser chaque fichier
    files.forEach(file => analyzeFile(file, scope));
    
    const realCount = results[scope].real.length;
    const flaggedCount = results[scope].flagged.length;
    const total = files.length;
    
    console.error(`  ✅ REAL: ${realCount} (${Math.round(realCount/total*100)}%)`);
    console.error(`  ❌ FLAGGED: ${flaggedCount} (${Math.round(flaggedCount/total*100)}%)`);
    
  } catch (err) {
    console.error(`❌ Erreur scan ${target}:`, err.message);
  }
}

// Totaux globaux
const totalFiles = Object.values(results).reduce((sum, r) => sum + r.files.length, 0);
const totalReal = Object.values(results).reduce((sum, r) => sum + r.real.length, 0);
const totalFlagged = Object.values(results).reduce((sum, r) => sum + r.flagged.length, 0);

console.error(`\n📊 TOTAUX GLOBAUX:`);
console.error(`📁 Total fichiers: ${totalFiles}`);
console.error(`✅ REAL (conformes): ${totalReal} (${Math.round(totalReal/totalFiles*100)}%)`);
console.error(`❌ FLAGGED (violations): ${totalFlagged} (${Math.round(totalFlagged/totalFiles*100)}%)`);

// Top violations
const allFlagged = [...results.backend.flagged, ...results.frontend.flagged];
if (allFlagged.length > 0) {
  console.error(`\n❌ TOP 10 VIOLATIONS:`);
  allFlagged.slice(0, 10).forEach((f, i) => {
    console.error(`${i+1}. ${f.path} (${f.scope})`);
    f.violations.slice(0, 2).forEach(v => {
      console.error(`   - ${v.rule}: ${v.match}`);
    });
  });
}

// Sauvegarder résultats
const summary = {
  timestamp: new Date().toISOString(),
  targets: TARGETS,
  contract_version: "strict_fullstack",
  backend: {
    total_files: results.backend.files.length,
    real_count: results.backend.real.length,
    flagged_count: results.backend.flagged.length,
    real_percent: Math.round(results.backend.real.length / results.backend.files.length * 100),
    flagged_percent: Math.round(results.backend.flagged.length / results.backend.files.length * 100)
  },
  frontend: {
    total_files: results.frontend.files.length,
    real_count: results.frontend.real.length,
    flagged_count: results.frontend.flagged.length,
    real_percent: Math.round(results.frontend.real.length / results.frontend.files.length * 100),
    flagged_percent: Math.round(results.frontend.flagged.length / results.frontend.files.length * 100)
  },
  global: {
    total_files: totalFiles,
    real_count: totalReal,
    flagged_count: totalFlagged,
    real_percent: Math.round(totalReal/totalFiles*100),
    flagged_percent: Math.round(totalFlagged/totalFiles*100)
  }
};

// Écrire fichiers de sortie
writeFileSync('fullstack-audit-summary.json', JSON.stringify(summary, null, 2));
writeFileSync('backend-flagged.txt', results.backend.flagged.map(f => f.path).join('\n'));
writeFileSync('frontend-flagged.txt', results.frontend.flagged.map(f => f.path).join('\n'));
writeFileSync('backend-real.txt', results.backend.real.join('\n'));
writeFileSync('frontend-real.txt', results.frontend.real.join('\n'));

// Rapport détaillé
let report = `# AUDIT ANTI-FAKE STRICT - FULLSTACK\n\n`;
report += `**Timestamp:** ${summary.timestamp}\n`;
report += `**Targets:** ${TARGETS.join(', ')}\n`;
report += `**Contract:** anti-fake.contract.json + frontend patterns\n\n`;

report += `## 📊 RÉSULTATS GLOBAUX\n\n`;
report += `- **Total fichiers:** ${totalFiles}\n`;
report += `- **REAL (conformes):** ${totalReal} (${summary.global.real_percent}%)\n`;
report += `- **FLAGGED (violations):** ${totalFlagged} (${summary.global.flagged_percent}%)\n\n`;

report += `### Backend (${results.backend.files.length} fichiers)\n`;
report += `- REAL: ${results.backend.real.length} (${summary.backend.real_percent}%)\n`;
report += `- FLAGGED: ${results.backend.flagged.length} (${summary.backend.flagged_percent}%)\n\n`;

report += `### Frontend (${results.frontend.files.length} fichiers)\n`;
report += `- REAL: ${results.frontend.real.length} (${summary.frontend.real_percent}%)\n`;
report += `- FLAGGED: ${results.frontend.flagged.length} (${summary.frontend.flagged_percent}%)\n\n`;

// Ajouter détails violations
if (totalFlagged > 0) {
  report += `## ❌ VIOLATIONS DÉTECTÉES\n\n`;
  
  ['backend', 'frontend'].forEach(scope => {
    if (results[scope].flagged.length > 0) {
      report += `### ${scope.toUpperCase()}\n\n`;
      results[scope].flagged.slice(0, 20).forEach((f, i) => {
        report += `${i+1}. **${f.path}**\n`;
        f.violations.forEach(v => {
          report += `   - **${v.rule}** (ligne ${v.line}): \`${v.match}\`\n`;
          if (v.content && v.content !== v.match) {
            report += `     Context: \`${v.content}\`\n`;
          }
        });
        report += `\n`;
      });
      report += `\n`;
    }
  });
}

writeFileSync('AUDIT-FULLSTACK-STRICT.md', report);

console.error(`\n📄 ARTEFACTS GÉNÉRÉS:`);
console.error(`- fullstack-audit-summary.json`);
console.error(`- backend-flagged.txt / frontend-flagged.txt`);
console.error(`- backend-real.txt / frontend-real.txt`);
console.error(`- AUDIT-FULLSTACK-STRICT.md`);

process.exit(totalFlagged > 0 ? 1 : 0);