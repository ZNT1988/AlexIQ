#!/usr/bin/env node

/**
 * AUDIT ULTRA-PRÉCIS GITHUB AlexIQ
 * Analyse complète du repository GitHub vs code local
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

class GitHubAuditor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      repository: "https://github.com/ZNT1988/AlexIQ.git",
      branch: "minimal-prod",
      analysis: {
        pushedFiles: [],
        stagedFiles: [],
        modifiedFiles: [],
        untrackedFiles: [],
        securityIssues: [],
        qualityIssues: [],
        recommendations: []
      },
      summary: {},
      critical: []
    };
  }

  async runCompleteAudit() {
    console.log("🔍 AUDIT ULTRA-PRÉCIS GITHUB AlexIQ");
    console.log("=".repeat(60));
    console.log(`📅 ${this.results.timestamp}`);
    console.log(`🔗 ${this.results.repository}`);
    console.log(`🌿 Branch: ${this.results.branch}\n`);

    await this.analyzeGitStatus();
    await this.analyzePushedFiles();
    await this.analyzeFileQuality();
    await this.analyzeSecurityRisks();
    await this.compareStagingWithPushed();
    await this.generateRecommendations();
    
    this.displayResults();
    this.saveAuditReport();
  }

  async analyzeGitStatus() {
    console.log("📊 ANALYSE DU STATUT GIT...");
    
    try {
      // Fichiers déjà pushés dans HEAD
      const pushedFiles = execSync("git ls-tree -r --name-only HEAD", { encoding: "utf8" })
        .split("\n").filter(f => f.trim());
      
      // Fichiers staged
      const stagedFiles = execSync("git diff --cached --name-only", { encoding: "utf8" })
        .split("\n").filter(f => f.trim());
      
      // Fichiers modifiés non staged
      const modifiedFiles = execSync("git diff --name-only", { encoding: "utf8" })
        .split("\n").filter(f => f.trim());
      
      // Fichiers non trackés
      const untrackedFiles = execSync("git ls-files --others --exclude-standard", { encoding: "utf8" })
        .split("\n").filter(f => f.trim());

      this.results.analysis.pushedFiles = pushedFiles;
      this.results.analysis.stagedFiles = stagedFiles;
      this.results.analysis.modifiedFiles = modifiedFiles;
      this.results.analysis.untrackedFiles = untrackedFiles;
      
      console.log(`✅ ${pushedFiles.length} fichiers déjà pushés sur GitHub`);
      console.log(`📋 ${stagedFiles.length} fichiers staged (prêts au push)`);
      console.log(`📝 ${modifiedFiles.length} fichiers modifiés localement`);
      console.log(`📄 ${untrackedFiles.length} fichiers non trackés\n`);
      
    } catch (error) {
      console.error("❌ Erreur analyse Git:", error.message);
    }
  }

  async analyzePushedFiles() {
    console.log("🔍 ANALYSE DES FICHIERS PUSHÉS...");
    
    const pushedFiles = this.results.analysis.pushedFiles;
    const criticalFiles = [];
    const configFiles = [];
    const moduleFiles = [];
    
    pushedFiles.forEach(file => {
      if (file.includes("config") || file.includes(".json") || file.includes(".env")) {
        configFiles.push(file);
      }
      if (file.includes("alex-modules")) {
        moduleFiles.push(file);
      }
      if (file.includes("package.json") || file.includes("docker") || file.includes("railway")) {
        criticalFiles.push(file);
      }
    });
    
    console.log(`🔧 ${configFiles.length} fichiers de configuration pushés`);
    console.log(`🧠 ${moduleFiles.length} modules Alex pushés`);
    console.log(`⚡ ${criticalFiles.length} fichiers critiques pushés\n`);
    
    this.results.analysis.configFiles = configFiles;
    this.results.analysis.moduleFiles = moduleFiles;
    this.results.analysis.criticalFiles = criticalFiles;
  }

  async analyzeFileQuality() {
    console.log("📈 ANALYSE QUALITÉ DU CODE PUSHÉ...");
    
    const qualityIssues = [];
    const jsFiles = this.results.analysis.pushedFiles.filter(f => f.endsWith(".js") || f.endsWith(".jsx"));
    
    for (const file of jsFiles.slice(0, 20)) { // Analyser les 20 premiers pour performance
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, "utf8");
          
          // Détection de code de mauvaise qualité
          if (content.includes("console.log") && !file.includes("test")) {
            qualityIssues.push({
              file: file,
              type: "DEBUG_CODE",
              message: "Console.log présent en production",
              severity: "medium"
            });
          }
          
          if (content.includes("TODO") || content.includes("FIXME")) {
            qualityIssues.push({
              file: file,
              type: "INCOMPLETE_CODE",
              message: "Code incomplet (TODO/FIXME)",
              severity: "low"
            });
          }
          
          if (content.includes("Math.random()") && !file.includes("test")) {
            qualityIssues.push({
              file: file,
              type: "RANDOM_LOGIC",
              message: "Logique aléatoire dans code business",
              severity: "high"
            });
          }
          
          // Détection de hardcoded values
          const hardcodedAPIs = content.match(/https?:\/\/[^"'\s]+/g);
          if (hardcodedAPIs && hardcodedAPIs.length > 0) {
            qualityIssues.push({
              file: file,
              type: "HARDCODED_URL",
              message: `URLs hardcodées: ${hardcodedAPIs.slice(0, 2).join(", ")}`,
              severity: "medium"
            });
          }
          
        } catch (error) {
          // Fichier non accessible
        }
      }
    }
    
    this.results.analysis.qualityIssues = qualityIssues;
    console.log(`📊 ${qualityIssues.length} problèmes de qualité détectés\n`);
  }

  async analyzeSecurityRisks() {
    console.log("🔒 ANALYSE SÉCURITÉ...");
    
    const securityIssues = [];
    const allFiles = [...this.results.analysis.pushedFiles, ...this.results.analysis.stagedFiles];
    
    allFiles.forEach(file => {
      // Fichiers sensibles
      if (file.includes(".env") || file.includes("secrets") || file.includes("private")) {
        securityIssues.push({
          file: file,
          type: "SENSITIVE_FILE",
          message: "Fichier potentiellement sensible",
          severity: "critical"
        });
      }
      
      // Extensions dangereuses
      if (file.endsWith(".key") || file.endsWith(".pem") || file.endsWith(".p12")) {
        securityIssues.push({
          file: file,
          type: "CRYPTO_FILE",
          message: "Fichier cryptographique détecté",
          severity: "critical"
        });
      }
      
      // Vérifier le contenu des fichiers JS pour des secrets
      if ((file.endsWith(".js") || file.endsWith(".jsx")) && fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, "utf8");
          
          // Patterns de clés API
          const apiKeyPatterns = [
            /sk-[a-zA-Z0-9]{48}/g, // OpenAI
            /AIza[a-zA-Z0-9_-]{35}/g, // Google
            /[a-zA-Z0-9]{32}/g // Général
          ];
          
          apiKeyPatterns.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
              securityIssues.push({
                file: file,
                type: "API_KEY_EXPOSURE",
                message: `Clé API potentielle détectée: ${matches[0].substring(0, 10)}...`,
                severity: "critical"
              });
            }
          });
          
        } catch (error) {
          // Fichier non accessible
        }
      }
    });
    
    this.results.analysis.securityIssues = securityIssues;
    console.log(`🚨 ${securityIssues.length} problèmes de sécurité détectés\n`);
  }

  async compareStagingWithPushed() {
    console.log("⚖️ COMPARAISON STAGING vs PUSHÉ...");
    
    const stagedChanges = [];
    const modifiedChanges = [];
    
    // Analyser les fichiers staged
    this.results.analysis.stagedFiles.forEach(file => {
      try {
        const diff = execSync(`git diff --cached "${file}"`, { encoding: "utf8" });
        const addedLines = (diff.match(/^\+/gm) || []).length;
        const deletedLines = (diff.match(/^-/gm) || []).length;
        
        stagedChanges.push({
          file: file,
          added: addedLines,
          deleted: deletedLines,
          impact: addedLines + deletedLines > 50 ? "high" : "medium"
        });
      } catch (error) {
        // Erreur de diff
      }
    });
    
    // Analyser les fichiers modifiés
    this.results.analysis.modifiedFiles.forEach(file => {
      try {
        const diff = execSync(`git diff "${file}"`, { encoding: "utf8" });
        const addedLines = (diff.match(/^\+/gm) || []).length;
        const deletedLines = (diff.match(/^-/gm) || []).length;
        
        if (addedLines + deletedLines > 0) {
          modifiedChanges.push({
            file: file,
            added: addedLines,
            deleted: deletedLines,
            impact: addedLines + deletedLines > 50 ? "high" : "medium"
          });
        }
      } catch (error) {
        // Erreur de diff
      }
    });
    
    this.results.analysis.stagedChanges = stagedChanges;
    this.results.analysis.modifiedChanges = modifiedChanges;
    
    console.log(`📋 ${stagedChanges.length} fichiers avec changements staged`);
    console.log(`📝 ${modifiedChanges.length} fichiers avec modifications locales\n`);
  }

  async generateRecommendations() {
    console.log("💡 GÉNÉRATION RECOMMANDATIONS...");
    
    const recommendations = [];
    
    // Sécurité
    const criticalSecurity = this.results.analysis.securityIssues.filter(i => i.severity === "critical");
    if (criticalSecurity.length > 0) {
      recommendations.push({
        priority: "CRITIQUE",
        type: "SÉCURITÉ",
        action: `Corriger immédiatement ${criticalSecurity.length} problèmes de sécurité critiques`,
        files: criticalSecurity.map(i => i.file)
      });
    }
    
    // Qualité
    const highQualityIssues = this.results.analysis.qualityIssues.filter(i => i.severity === "high");
    if (highQualityIssues.length > 0) {
      recommendations.push({
        priority: "HAUTE",
        type: "QUALITÉ",
        action: `Résoudre ${highQualityIssues.length} problèmes de qualité haute priorité`,
        files: highQualityIssues.map(i => i.file)
      });
    }
    
    // Changements non pushés
    if (this.results.analysis.modifiedFiles.length > 50) {
      recommendations.push({
        priority: "MOYENNE",
        type: "GIT",
        action: `Commit/push ${this.results.analysis.modifiedFiles.length} fichiers modifiés`,
        files: this.results.analysis.modifiedFiles.slice(0, 10)
      });
    }
    
    // Fichiers non trackés
    const jsUntracked = this.results.analysis.untrackedFiles.filter(f => f.endsWith(".js") || f.endsWith(".jsx"));
    if (jsUntracked.length > 0) {
      recommendations.push({
        priority: "BASSE",
        type: "GIT",
        action: `Tracker ${jsUntracked.length} fichiers JS non suivis`,
        files: jsUntracked.slice(0, 5)
      });
    }
    
    this.results.analysis.recommendations = recommendations;
    console.log(`📋 ${recommendations.length} recommandations générées\n`);
  }

  displayResults() {
    console.log("🎯 RÉSULTATS AUDIT GITHUB AlexIQ");
    console.log("=".repeat(60));
    
    // État du repository
    console.log("\n📊 ÉTAT DU REPOSITORY:");
    console.log(`  • Fichiers pushés sur GitHub: ${this.results.analysis.pushedFiles.length}`);
    console.log(`  • Modules Alex pushés: ${this.results.analysis.moduleFiles.length}`);
    console.log(`  • Fichiers de config pushés: ${this.results.analysis.configFiles.length}`);
    console.log(`  • Fichiers staged (à pusher): ${this.results.analysis.stagedFiles.length}`);
    console.log(`  • Fichiers modifiés localement: ${this.results.analysis.modifiedFiles.length}`);
    console.log(`  • Fichiers non trackés: ${this.results.analysis.untrackedFiles.length}`);
    
    // Problèmes de sécurité
    if (this.results.analysis.securityIssues.length > 0) {
      console.log("\n🚨 PROBLÈMES DE SÉCURITÉ:");
      const critical = this.results.analysis.securityIssues.filter(i => i.severity === "critical");
      const medium = this.results.analysis.securityIssues.filter(i => i.severity === "medium");
      
      if (critical.length > 0) {
        console.log(`  🔴 CRITIQUE: ${critical.length} problèmes`);
        critical.slice(0, 3).forEach(issue => {
          console.log(`    • ${issue.file}: ${issue.message}`);
        });
      }
      
      if (medium.length > 0) {
        console.log(`  🟡 MOYEN: ${medium.length} problèmes`);
      }
    }
    
    // Problèmes de qualité
    if (this.results.analysis.qualityIssues.length > 0) {
      console.log("\n📈 PROBLÈMES DE QUALITÉ:");
      const qualityByType = {};
      this.results.analysis.qualityIssues.forEach(issue => {
        qualityByType[issue.type] = (qualityByType[issue.type] || 0) + 1;
      });
      
      Object.entries(qualityByType).forEach(([type, count]) => {
        console.log(`  • ${type}: ${count} occurrences`);
      });
    }
    
    // Recommandations
    if (this.results.analysis.recommendations.length > 0) {
      console.log("\n💡 RECOMMANDATIONS:");
      this.results.analysis.recommendations.forEach((rec, index) => {
        const priority = rec.priority === "CRITIQUE" ? "🔴" : 
          rec.priority === "HAUTE" ? "🟠" : 
            rec.priority === "MOYENNE" ? "🟡" : "🟢";
        console.log(`  ${priority} ${rec.priority} - ${rec.type}: ${rec.action}`);
      });
    }
    
    // Score global
    const securityScore = Math.max(0, 100 - (this.results.analysis.securityIssues.length * 10));
    const qualityScore = Math.max(0, 100 - (this.results.analysis.qualityIssues.length * 5));
    const gitScore = this.results.analysis.modifiedFiles.length > 50 ? 70 : 90;
    const overallScore = Math.round((securityScore + qualityScore + gitScore) / 3);
    
    console.log("\n🎯 SCORE GLOBAL:");
    console.log(`  • Sécurité: ${securityScore}/100`);
    console.log(`  • Qualité: ${qualityScore}/100`);
    console.log(`  • Git: ${gitScore}/100`);
    console.log(`  • GLOBAL: ${overallScore}/100`);
    
    // Statut final
    const status = overallScore >= 90 ? "🟢 EXCELLENT" :
      overallScore >= 80 ? "🟡 BON" :
        overallScore >= 70 ? "🟠 MOYEN" : "🔴 CRITIQUE";
    
    console.log(`\n🏆 STATUT: ${status}`);
    
    this.results.summary = {
      overallScore,
      securityScore,
      qualityScore,
      gitScore,
      status: status.split(" ")[1],
      critical: this.results.analysis.securityIssues.filter(i => i.severity === "critical").length
    };
  }

  saveAuditReport() {
    const reportFile = "github-audit-report.json";
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Rapport détaillé sauvegardé: ${reportFile}`);
  }
}

// Exécution de l'audit
console.log("🚀 Lancement de l'audit GitHub AlexIQ...\n");
const auditor = new GitHubAuditor();
auditor.runCompleteAudit().catch(error => {
  console.error("❌ Erreur lors de l'audit:", error);
  process.exit(1);
});

export default GitHubAuditor;