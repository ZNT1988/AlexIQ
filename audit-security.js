#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Patterns à détecter
const SECURITY_PATTERNS = [
  // Secrets/API keys
  { name: 'OPENAI_KEY', pattern: /sk-[a-zA-Z0-9]{20,}/g },
  { name: 'API_KEY_STATIC', pattern: /['"`]api[_-]?key['"`]\s*:\s*['"`][a-zA-Z0-9-_]{10,}['"`]/gi },
  { name: 'TOKEN_STATIC', pattern: /['"`]token['"`]\s*:\s*['"`][a-zA-Z0-9-_]{10,}['"`]/gi },
  { name: 'BEARER_TOKEN', pattern: /Bearer\s+[a-zA-Z0-9-_]{10,}/gi },
  
  // URLs statiques
  { name: 'OPENAI_URL', pattern: /https?:\/\/api\.openai\.com/gi },
  { name: 'ANTHROPIC_URL', pattern: /https?:\/\/api\.anthropic\.com/gi },
  { name: 'HARDCODED_URL', pattern: /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  
  // Providers/services
  { name: 'OPENAI_REF', pattern: /openai|gpt-[0-9]/gi },
  { name: 'ANTHROPIC_REF', pattern: /anthropic|claude/gi },
  
  // Prompts longs statiques
  { name: 'LONG_PROMPT', pattern: /(['"`])[^'"`\n]{300,}\1/g },
  { name: 'TEMPLATE_LITERAL', pattern: /`[^`]{300,}`/g },
  
  // process.env manquants près d'appels réseau
  { name: 'MISSING_ENV', pattern: /(fetch|axios|request|http[s]?\.)/gi }
];

const EXCLUDED_DIRS = [
  'node_modules', 'dist', 'build', '.next', '.vite', '.turbo', '.cache', 
  'coverage', '.git', '.vscode', '.idea'
];

const INCLUDED_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.json', '.yml', '.yaml', '.env'];

function shouldScanFile(filePath) {
  const ext = path.extname(filePath);
  return INCLUDED_EXTENSIONS.includes(ext);
}

function shouldScanDirectory(dirName) {
  return !EXCLUDED_DIRS.includes(dirName) && !dirName.startsWith('.');
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const findings = [];

    SECURITY_PATTERNS.forEach(({ name, pattern }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        const lineContent = lines[lineNumber - 1]?.trim() || '';
        
        findings.push({
          file: filePath,
          line: lineNumber,
          pattern: name,
          match: match[0],
          context: lineContent.substring(0, 200) + (lineContent.length > 200 ? '...' : '')
        });
      }
    });

    return findings;
  } catch (error) {
    console.error(`Erreur lecture ${filePath}:`, error.message);
    return [];
  }
}

function scanDirectory(dirPath) {
  let allFindings = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && shouldScanDirectory(item)) {
        allFindings = allFindings.concat(scanDirectory(itemPath));
      } else if (stat.isFile() && shouldScanFile(itemPath)) {
        allFindings = allFindings.concat(scanFile(itemPath));
      }
    }
  } catch (error) {
    console.error(`Erreur scan directory ${dirPath}:`, error.message);
  }
  
  return allFindings;
}

function generateReport(findings) {
  console.log('\n=== RAPPORT D\'AUDIT SÉCURITÉ HustleFinderIA ===\n');
  
  // Grouper par type de problème
  const byPattern = findings.reduce((acc, finding) => {
    if (!acc[finding.pattern]) acc[finding.pattern] = [];
    acc[finding.pattern].push(finding);
    return acc;
  }, {});
  
  // Statistiques
  console.log(`📊 RÉSUMÉ: ${findings.length} problèmes détectés\n`);
  
  Object.entries(byPattern).forEach(([pattern, items]) => {
    console.log(`🔍 ${pattern} (${items.length} occurrences):`);
    items.forEach(item => {
      const relativePath = path.relative(process.cwd(), item.file);
      console.log(`  📄 ${relativePath}:${item.line}`);
      console.log(`     Match: "${item.match}"`);
      console.log(`     Context: ${item.context}`);
      console.log('');
    });
    console.log('---\n');
  });
  
  // Tableau CSV pour traitement
  console.log('\n=== DONNÉES CSV ===');
  console.log('File,Line,Pattern,Match,Context');
  findings.forEach(f => {
    const relativePath = path.relative(process.cwd(), f.file);
    console.log(`"${relativePath}",${f.line},"${f.pattern}","${f.match.replace(/"/g, '""')}","${f.context.replace(/"/g, '""')}"`);
  });
}

// Exécution
console.log('🔍 Audit sécurité en cours...');
const rootDir = process.cwd();
const findings = scanDirectory(rootDir);
generateReport(findings);

console.log(`\n✅ Audit terminé. ${findings.length} problèmes détectés.`);