#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');

// Exécuter l'audit et capturer les résultats CSV
console.log('🔍 Analyse des résultats d\'audit...\n');

try {
  const auditOutput = execSync('node audit-security.js', { encoding: 'utf8' });
  
  // Extraire uniquement la section CSV
  const csvSection = auditOutput.split('=== DONNÉES CSV ===')[1];
  if (!csvSection) {
    console.log('❌ Pas de données CSV trouvées');
    process.exit(1);
  }
  
  const csvLines = csvSection.trim().split('\n').slice(1); // Ignorer l'en-tête
  
  // Analyser et filtrer les vrais problèmes
  const realIssues = [];
  const excludePatterns = [
    /audit-security\.js/,  // Notre script d'audit lui-même
    /node_modules/,
    /\.min\.js/,
    /package-lock\.json/
  ];
  
  csvLines.forEach(line => {
    if (!line.trim()) return;
    
    const [file, lineNum, pattern, match, context] = line.split('","').map(s => s.replace(/^"|"$/g, ''));
    
    // Exclure certains fichiers
    if (excludePatterns.some(p => p.test(file))) return;
    
    // Filtrer les vrais problèmes de sécurité
    const isRealIssue = 
      // URLs hardcodées avec domaines externes
      (pattern === 'HARDCODED_URL' && match.includes('api.')) ||
      // Clés API statiques 
      (pattern === 'API_KEY_STATIC' && !context.includes('process.env')) ||
      (pattern === 'TOKEN_STATIC' && !context.includes('process.env')) ||
      (pattern === 'OPENAI_KEY' && match.startsWith('sk-')) ||
      // URLs API hardcodées
      (pattern === 'OPENAI_URL') ||
      (pattern === 'ANTHROPIC_URL') ||
      // Prompts très longs > 300 chars
      (pattern === 'LONG_PROMPT' && match.length > 300) ||
      (pattern === 'TEMPLATE_LITERAL' && match.length > 300) ||
      // process.env manquants près d'appels réseau
      (pattern === 'MISSING_ENV' && !context.includes('process.env'));
    
    if (isRealIssue) {
      realIssues.push({
        file: file.replace(/\\/g, '/'), // Normaliser les chemins
        line: parseInt(lineNum),
        pattern,
        match: match.substring(0, 100) + (match.length > 100 ? '...' : ''),
        context: context.substring(0, 200) + (context.length > 200 ? '...' : ''),
        severity: getSeverity(pattern, match, context)
      });
    }
  });
  
  // Grouper par fichier et trier par sévérité
  const byFile = realIssues.reduce((acc, issue) => {
    if (!acc[issue.file]) acc[issue.file] = [];
    acc[issue.file].push(issue);
    return acc;
  }, {});
  
  // Rapport final
  console.log('=== PROBLÈMES CRITIQUES DÉTECTÉS ===\n');
  console.log(`📊 TOTAL: ${realIssues.length} problèmes dans ${Object.keys(byFile).length} fichiers\n`);
  
  Object.entries(byFile).forEach(([file, issues]) => {
    console.log(`📄 **${file}**`);
    issues.sort((a, b) => b.severity - a.severity).forEach(issue => {
      const severityEmoji = issue.severity >= 9 ? '🔴' : issue.severity >= 7 ? '🟡' : '🔵';
      console.log(`  ${severityEmoji} Ligne ${issue.line}: ${issue.pattern}`);
      console.log(`     Match: "${issue.match}"`);
      console.log(`     Context: ${issue.context}`);
      console.log('');
    });
    console.log('---\n');
  });
  
  // Statistiques par type
  console.log('=== STATISTIQUES PAR TYPE ===\n');
  const stats = realIssues.reduce((acc, issue) => {
    acc[issue.pattern] = (acc[issue.pattern] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(stats).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`${type}: ${count} occurrences`);
  });
  
  // Export JSON pour traitement
  fs.writeFileSync('./audit-results.json', JSON.stringify({
    summary: {
      totalIssues: realIssues.length,
      filesAffected: Object.keys(byFile).length,
      byType: stats
    },
    issues: realIssues,
    byFile: byFile
  }, null, 2));
  
  console.log('\n✅ Résultats sauvegardés dans audit-results.json');
  
} catch (error) {
  console.error('❌ Erreur lors de l\'analyse:', error.message);
  process.exit(1);
}

function getSeverity(pattern, match, context) {
  // Scores de sévérité (1-10)
  if (pattern === 'OPENAI_KEY' && match.startsWith('sk-')) return 10; // Clé API exposée
  if (pattern === 'API_KEY_STATIC' && !context.includes('env')) return 10;
  if (pattern === 'OPENAI_URL' || pattern === 'ANTHROPIC_URL') return 8; // URL API hardcodée
  if (pattern === 'LONG_PROMPT' && match.length > 500) return 7; // Prompt très long
  if (pattern === 'HARDCODED_URL' && match.includes('api.')) return 7;
  if (pattern === 'MISSING_ENV') return 6;
  return 5;
}