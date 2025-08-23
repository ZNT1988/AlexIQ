#!/usr/bin/env node
// Calculer les pourcentages réel/fake/embellissement/coquille vide
import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('modules-analysis-data.json', 'utf8'));

console.log('📊 CALCUL DES POURCENTAGES - ANALYSE DÉTAILLÉE\n');

// Classification fine des problèmes
let fakeIA = 0;           // Math.random, simulate*
let embellissement = 0;   // Valeurs magiques, retours statiques  
let coquilleVide = 0;     // placeholder, TODO, FIXME, not_implemented
let erreursCode = 0;      // Catch silencieux, strictMode permanent
let authentique = 0;      // Aucun problème

data.forEach(module => {
  if (module.authentic) {
    authentique++;
    return;
  }
  
  // Analyser les types de problèmes
  const problems = module.problems || [];
  let hasClassified = false;
  
  problems.forEach(problem => {
    const p = problem.toLowerCase();
    
    if (p.includes('math.random') || p.includes('simulate')) {
      if (!hasClassified) { fakeIA++; hasClassified = true; }
    }
    else if (p.includes('valeur magique') || p.includes('retour de valeur statique')) {
      if (!hasClassified) { embellissement++; hasClassified = true; }
    }
    else if (p.includes('placeholder') || p.includes('todo') || p.includes('fixme') || p.includes('not_implemented')) {
      if (!hasClassified) { coquilleVide++; hasClassified = true; }
    }
    else if (p.includes('catch silencieux') || p.includes('strictmode permanent')) {
      if (!hasClassified) { erreursCode++; hasClassified = true; }
    }
  });
  
  // Si pas encore classifié, mettre dans erreurs code
  if (!hasClassified) {
    erreursCode++;
  }
});

const total = data.length;

console.log(`📈 RÉSULTATS SUR ${total} MODULES:\n`);

console.log(`✅ AUTHENTIQUE (100% réel):`);
console.log(`   ${authentique} modules (${Math.round(authentique/total*100)}%)\n`);

console.log(`⚠️  FAKE IA (simulation/random):`);
console.log(`   ${fakeIA} modules (${Math.round(fakeIA/total*100)}%)\n`);

console.log(`🎨 EMBELLISSEMENT (valeurs magiques):`);
console.log(`   ${embellissement} modules (${Math.round(embellissement/total*100)}%)\n`);

console.log(`🕳️  COQUILLE VIDE (placeholder/TODO):`);
console.log(`   ${coquilleVide} modules (${Math.round(coquilleVide/total*100)}%)\n`);

console.log(`💥 ERREURS CODE (catch/strictMode):`);
console.log(`   ${erreursCode} modules (${Math.round(erreursCode/total*100)}%)\n`);

// Vérification
const totalCheck = authentique + fakeIA + embellissement + coquilleVide + erreursCode;
console.log(`✓ Vérification: ${totalCheck}/${total} modules classifiés\n`);

// Statistiques modules avec IA
const avecIA = data.filter(m => m.aiFeatures && m.aiFeatures.length > 0).length;
const avecIAAuthentique = data.filter(m => m.authentic && m.aiFeatures && m.aiFeatures.length > 0).length;

console.log(`🤖 MODULES AVEC IA:`);
console.log(`   Total: ${avecIA} modules (${Math.round(avecIA/total*100)}%)`);
console.log(`   Authentiques: ${avecIAAuthentique} modules (${Math.round(avecIAAuthentique/total*100)}%)\n`);

// Analyse par taille de code
const totalLines = data.reduce((sum, m) => sum + (m.lines || 0), 0);
const authLines = data.filter(m => m.authentic).reduce((sum, m) => sum + (m.lines || 0), 0);
const fakeLines = data.filter(m => !m.authentic).reduce((sum, m) => sum + (m.lines || 0), 0);

console.log(`📝 ANALYSE PAR LIGNES DE CODE:`);
console.log(`   Total lignes: ${totalLines.toLocaleString()}`);
console.log(`   Lignes authentiques: ${authLines.toLocaleString()} (${Math.round(authLines/totalLines*100)}%)`);
console.log(`   Lignes problématiques: ${fakeLines.toLocaleString()} (${Math.round(fakeLines/totalLines*100)}%)\n`);

// Top 10 plus gros modules problématiques
console.log(`🔍 TOP 10 PLUS GROS MODULES PROBLÉMATIQUES:`);
const biggestProblems = data
  .filter(m => !m.authentic)
  .sort((a, b) => (b.lines || 0) - (a.lines || 0))
  .slice(0, 10);
  
biggestProblems.forEach((m, i) => {
  const mainProblem = m.problems?.[0] || 'Problème non identifié';
  console.log(`   ${i+1}. ${m.path} - ${m.lines} lignes - ${mainProblem.split(' - ')[0]}`);
});

console.log(`\n🎯 CONCLUSION:`);
console.log(`   - ${Math.round(authentique/total*100)}% du code est AUTHENTIQUE`);
console.log(`   - ${Math.round((fakeIA+embellissement)/total*100)}% nécessite correction fake/embellissement`);
console.log(`   - ${Math.round(coquilleVide/total*100)}% sont des coquilles vides à implémenter`);
console.log(`   - ${Math.round(erreursCode/total*100)}% ont des erreurs techniques`);

// Sauvegarder le rapport
const report = {
  total,
  authentique: { count: authentique, percent: Math.round(authentique/total*100) },
  fakeIA: { count: fakeIA, percent: Math.round(fakeIA/total*100) },
  embellissement: { count: embellissement, percent: Math.round(embellissement/total*100) },
  coquilleVide: { count: coquilleVide, percent: Math.round(coquilleVide/total*100) },
  erreursCode: { count: erreursCode, percent: Math.round(erreursCode/total*100) },
  avecIA: { count: avecIA, percent: Math.round(avecIA/total*100) },
  avecIAAuthentique: { count: avecIAAuthentique, percent: Math.round(avecIAAuthentique/total*100) },
  totalLines,
  authLines,
  fakeLines,
  biggestProblems: biggestProblems.map(m => ({
    path: m.path,
    lines: m.lines,
    problems: m.problems
  }))
};

import { writeFileSync } from 'fs';
writeFileSync('POURCENTAGES-REEL-FAKE.json', JSON.stringify(report, null, 2));
console.log(`\n📄 Rapport détaillé sauvé: POURCENTAGES-REEL-FAKE.json`);