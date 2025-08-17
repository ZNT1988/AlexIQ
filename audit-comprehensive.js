#!/usr/bin/env node

/**
 * Script d'audit compréhensif pour les modules Alex
 * Identifie : erreurs syntaxe, appels API statiques, constantes manquantes
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const MODULES_DIR = path.resolve('./backend/alex-modules');
const RESULTS_FILE = 'audit-results.json';

class ModuleAuditor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      totalModules: 0,
      problemsFound: 0,
      categories: {
        syntaxErrors: [],
        staticResponses: [],
        missingConstants: [],
        fakeApiCalls: [],
        incompleteCode: [],
        nodeCompatibility: []
      },
      summary: {}
    };
  }

  async auditAllModules() {
    console.log('🔍 Début de l\'audit des modules Alex...\n');
    
    // Vérifier que le répertoire existe
    if (!fs.existsSync(MODULES_DIR)) {
      throw new Error(`Répertoire des modules non trouvé: ${MODULES_DIR}`);
    }
    
    console.log(`📁 Scan du répertoire: ${MODULES_DIR}`);
    
    const moduleFiles = this.findAllModules();
    this.results.totalModules = moduleFiles.length;
    
    console.log(`📊 ${moduleFiles.length} modules trouvés\n`);

    for (const filePath of moduleFiles) {
      await this.auditModule(filePath);
    }

    this.generateSummary();
    this.saveResults();
    this.displayResults();
  }

  findAllModules() {
    const modules = [];
    
    const scanDirectory = (dir) => {
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (entry.endsWith('.js')) {
          modules.push(fullPath);
        }
      }
    };

    scanDirectory(MODULES_DIR);
    return modules;
  }

  async auditModule(filePath) {
    const fileName = path.basename(filePath);
    console.log(`🔧 Audit: ${fileName}`);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      // Audit des erreurs de syntaxe
      this.checkSyntaxErrors(filePath, content, lines);
      
      // Audit des appels API statiques/fake
      this.checkFakeApiCalls(filePath, content, lines);
      
      // Audit des constantes manquantes
      this.checkMissingConstants(filePath, content, lines);
      
      // Audit du code incomplet
      this.checkIncompleteCode(filePath, content, lines);
      
      // Audit des réponses statiques
      this.checkStaticResponses(filePath, content, lines);

    } catch (error) {
      this.results.categories.syntaxErrors.push({
        file: filePath,
        type: 'READ_ERROR',
        error: error.message,
        line: 0
      });
    }
  }

  checkSyntaxErrors(filePath, content, lines) {
    const issues = [];

    // Vérifier les objets avec virgules manquantes
    const objectRegex = /\{[^}]*\}/gs;
    const matches = content.match(objectRegex) || [];
    
    for (const match of matches) {
      if (match.includes('\n')) { // Multi-ligne
        const properties = match.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
        for (let i = 0; i < properties.length - 1; i++) {
          const line = properties[i].trim();
          if (line && !line.endsWith(',') && !line.endsWith('{') && properties[i + 1].trim() && !properties[i + 1].trim().startsWith('}')) {
            const lineNumber = this.findLineNumber(lines, line);
            issues.push({
              type: 'MISSING_COMMA',
              line: lineNumber,
              content: line,
              suggestion: 'Ajouter une virgule à la fin de la ligne'
            });
          }
        }
      }
    }

    // Vérifier les arrays avec virgules manquantes
    const arrayRegex = /\[[^\]]*\]/gs;
    const arrayMatches = content.match(arrayRegex) || [];
    
    for (const match of arrayMatches) {
      if (match.includes('\n')) {
        const elements = match.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
        for (let i = 0; i < elements.length - 1; i++) {
          const line = elements[i].trim();
          if (line && !line.endsWith(',') && !line.endsWith('[') && elements[i + 1].trim() && !elements[i + 1].trim().startsWith(']')) {
            const lineNumber = this.findLineNumber(lines, line);
            issues.push({
              type: 'MISSING_COMMA_ARRAY',
              line: lineNumber,
              content: line,
              suggestion: 'Ajouter une virgule à la fin de l\'élément'
            });
          }
        }
      }
    }

    // Vérifier les erreurs de syntaxe spécifiques
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Détecter processLongOperation non résolu
      if (trimmed.includes('this.processLongOperation(args)')) {
        issues.push({
          type: 'UNRESOLVED_CODE',
          line: lineNum,
          content: trimmed,
          suggestion: 'Remplacer par le code approprié'
        });
      }

      // Détecter les chaînes de caractères concaténées incorrectement
      if (trimmed.includes('STR_MODIFIER')) {
        issues.push({
          type: 'UNRESOLVED_STRING_MODIFIER',
          line: lineNum,
          content: trimmed,
          suggestion: 'Remplacer STR_MODIFIER par le bon modificateur'
        });
      }

      // Détecter try/catch mal formés
      if (trimmed.includes('} catch (_error) {') && lines[index + 1] && lines[index + 1].trim() === '}}') {
        issues.push({
          type: 'EMPTY_CATCH_BLOCK',
          line: lineNum,
          content: trimmed,
          suggestion: 'Implémenter la gestion d\'erreur ou commenter'
        });
      }
    });

    if (issues.length > 0) {
      this.results.categories.syntaxErrors.push({
        file: filePath,
        issues: issues
      });
    }
  }

  checkFakeApiCalls(filePath, content, lines) {
    const fakePatterns = [
      /return\s*["'`][^"'`]*["'`]\s*;?\s*\/\/\s*(fake|static|mock)/i,
      /return\s*\{\s*response:\s*["'`][^"'`]*["'`]/i,
      /Math\.random\(\)/i, // Souvent utilisé pour des réponses fake
      /return\s*["'`].*simulation.*["'`]/i,
      /return\s*["'`].*exemple.*["'`]/i,
      /\/\*\s*TODO.*API.*\*\//i
    ];

    const issues = [];
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      fakePatterns.forEach(pattern => {
        if (pattern.test(trimmed)) {
          issues.push({
            type: 'FAKE_API_CALL',
            line: lineNum,
            content: trimmed,
            pattern: pattern.source
          });
        }
      });

      // Détecter les fonctions qui retournent des strings statiques
      if (/async\s+\w+.*\{[\s\S]*?return\s*["'`]/.test(content)) {
        const match = trimmed.match(/async\s+(\w+)/);
        if (match && trimmed.includes('return "')) {
          issues.push({
            type: 'STATIC_ASYNC_RESPONSE',
            line: lineNum,
            content: trimmed,
            function: match[1]
          });
        }
      }
    });

    if (issues.length > 0) {
      this.results.categories.fakeApiCalls.push({
        file: filePath,
        issues: issues
      });
    }
  }

  checkMissingConstants(filePath, content, lines) {
    const issues = [];
    const definedConstants = new Set();
    const usedConstants = new Set();

    // Trouver les constantes définies
    lines.forEach(line => {
      const constMatch = line.match(/const\s+(\w+)\s*=/);
      if (constMatch) {
        definedConstants.add(constMatch[1]);
      }
    });

    // Trouver les constantes utilisées mais non définies
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const constMatches = line.match(/\b(STR_\w+)\b/g) || [];
      
      constMatches.forEach(constName => {
        usedConstants.add(constName);
        if (!definedConstants.has(constName)) {
          issues.push({
            type: 'UNDEFINED_CONSTANT',
            line: lineNum,
            content: line.trim(),
            constant: constName
          });
        }
      });
    });

    if (issues.length > 0) {
      this.results.categories.missingConstants.push({
        file: filePath,
        issues: issues,
        defined: Array.from(definedConstants),
        used: Array.from(usedConstants)
      });
    }
  }

  checkIncompleteCode(filePath, content, lines) {
    const issues = [];
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Code incomplet commun
      const incompletePatterns = [
        /\/\/ TODO/i,
        /\/\/ FIXME/i,
        /\/\/ XXX/i,
        /\.\.\.$/,  // Ligne finissant par ...
        /\/\*\s*à compléter/i,
        /throw new Error\(['"]not implemented/i
      ];

      incompletePatterns.forEach(pattern => {
        if (pattern.test(trimmed)) {
          issues.push({
            type: 'INCOMPLETE_CODE',
            line: lineNum,
            content: trimmed,
            pattern: pattern.source
          });
        }
      });

      // Fonctions vides
      if (trimmed.match(/^\w+\s*\([^)]*\)\s*\{\s*\}$/)) {
        issues.push({
          type: 'EMPTY_FUNCTION',
          line: lineNum,
          content: trimmed
        });
      }
    });

    if (issues.length > 0) {
      this.results.categories.incompleteCode.push({
        file: filePath,
        issues: issues
      });
    }
  }

  checkStaticResponses(filePath, content, lines) {
    const issues = [];
    
    // Rechercher des tableaux de réponses statiques
    const staticResponsePatterns = [
      /responses\s*=\s*\[/i,
      /suggestions\s*=\s*\[/i,
      /greetings\s*=\s*\[/i,
      /const\s+\w*responses?\w*\s*=\s*\[/i
    ];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      staticResponsePatterns.forEach(pattern => {
        if (pattern.test(line)) {
          issues.push({
            type: 'STATIC_RESPONSE_ARRAY',
            line: lineNum,
            content: line.trim()
          });
        }
      });
    });

    if (issues.length > 0) {
      this.results.categories.staticResponses.push({
        file: filePath,
        issues: issues
      });
    }
  }

  findLineNumber(lines, searchText) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText.substring(0, 30))) {
        return i + 1;
      }
    }
    return 0;
  }

  generateSummary() {
    const categories = this.results.categories;
    
    this.results.summary = {
      totalIssues: Object.values(categories).reduce((sum, cat) => sum + cat.length, 0),
      syntaxErrors: categories.syntaxErrors.length,
      fakeApiCalls: categories.fakeApiCalls.length,
      missingConstants: categories.missingConstants.length,
      incompleteCode: categories.incompleteCode.length,
      staticResponses: categories.staticResponses.length,
      criticalFiles: this.identifyCriticalFiles()
    };

    this.results.problemsFound = this.results.summary.totalIssues;
  }

  identifyCriticalFiles() {
    const critical = [];
    
    Object.values(this.results.categories).forEach(category => {
      category.forEach(item => {
        const fileName = path.basename(item.file);
        const issueCount = item.issues ? item.issues.length : 1;
        
        if (issueCount > 5) {
          critical.push({
            file: fileName,
            path: item.file,
            issueCount: issueCount
          });
        }
      });
    });

    return critical.sort((a, b) => b.issueCount - a.issueCount);
  }

  saveResults() {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Résultats sauvegardés dans ${RESULTS_FILE}`);
  }

  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSULTATS DE L\'AUDIT');
    console.log('='.repeat(60));
    
    console.log(`\n📁 Modules analysés: ${this.results.totalModules}`);
    console.log(`🔴 Problèmes trouvés: ${this.results.problemsFound}`);
    
    const summary = this.results.summary;
    console.log(`\n📋 DÉTAIL PAR CATÉGORIE:`);
    console.log(`  • Erreurs de syntaxe: ${summary.syntaxErrors}`);
    console.log(`  • Appels API fake: ${summary.fakeApiCalls}`);
    console.log(`  • Constantes manquantes: ${summary.missingConstants}`);
    console.log(`  • Code incomplet: ${summary.incompleteCode}`);
    console.log(`  • Réponses statiques: ${summary.staticResponses}`);
    
    if (summary.criticalFiles.length > 0) {
      console.log(`\n🚨 FICHIERS CRITIQUES (>5 problèmes):`);
      summary.criticalFiles.slice(0, 10).forEach(file => {
        console.log(`  • ${file.file}: ${file.issueCount} problèmes`);
      });
    }

    console.log(`\n🎯 RECOMMANDATIONS:`);
    if (summary.syntaxErrors > 0) {
      console.log(`  1. Corriger les ${summary.syntaxErrors} erreurs de syntaxe en priorité`);
    }
    if (summary.fakeApiCalls > 0) {
      console.log(`  2. Remplacer les ${summary.fakeApiCalls} appels API fake par de vrais appels`);
    }
    if (summary.missingConstants > 0) {
      console.log(`  3. Définir les ${summary.missingConstants} constantes manquantes`);
    }
    
    console.log(`\n✅ Audit terminé! Voir ${RESULTS_FILE} pour les détails complets.`);
  }
}

// Exécution du script
console.log('🚀 Démarrage de l\'audit...');
const auditor = new ModuleAuditor();
auditor.auditAllModules().catch(error => {
  console.error('❌ Erreur lors de l\'audit:', error);
  process.exit(1);
});

export default ModuleAuditor;