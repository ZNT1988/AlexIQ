#!/usr/bin/env node

/**
 * Correction finale des erreurs de syntaxe restantes
 */

import fs from "fs";
import path from "path";

const MODULES_DIR = path.resolve("./backend/alex-modules");

class FinalSyntaxFixer {
  constructor() {
    this.fixedFiles = [];
    this.stats = {
      totalFiles: 0,
      filesFixed: 0,
      errorsFixed: 0
    };
  }

  async fixAllModules() {
    console.log("🔧 Correction finale des erreurs de syntaxe...\n");
    
    const moduleFiles = this.findAllModules();
    this.stats.totalFiles = moduleFiles.length;
    
    for (const filePath of moduleFiles) {
      await this.fixModule(filePath);
    }
    
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
        } else if (entry.endsWith(".js")) {
          modules.push(fullPath);
        }
      }
    };

    scanDirectory(MODULES_DIR);
    return modules;
  }

  async fixModule(filePath) {
    const fileName = path.basename(filePath);

    try {
      const originalContent = fs.readFileSync(filePath, "utf8");
      let content = originalContent;
      let fixes = 0;

      // 1. Corriger "import:" vers "import"
      const importFixed = content.replace(/import:\s*\{/g, "import {");
      if (importFixed !== content) {
        content = importFixed;
        fixes++;
      }

      // 2. Corriger "} catch (error) {:" vers "} catch (error) {"
      const catchFixed = content.replace(/}\s*catch\s*\([^)]*\)\s*\{:/g, "} catch (error) {");
      if (catchFixed !== content) {
        content = catchFixed;
        fixes++;
      }

      // 3. Corriger "try:" vers "try"
      const tryFixed = content.replace(/try:\s*\{/g, "try {");
      if (tryFixed !== content) {
        content = tryFixed;
        fixes++;
      }

      // 4. Corriger "return:" vers "return"
      const returnFixed = content.replace(/return:\s*\{/g, "return {");
      if (returnFixed !== content) {
        content = returnFixed;
        fixes++;
      }

      // 5. Corriger "for (const:" vers "for (const"
      const forFixed = content.replace(/for\s*\(const:\s*/g, "for (const ");
      if (forFixed !== content) {
        content = forFixed;
        fixes++;
      }

      // 6. Corriger "else:" vers "else"
      const elseFixed = content.replace(/else:\s*\{/g, "else {");
      if (elseFixed !== content) {
        content = elseFixed;
        fixes++;
      }

      // 7. Corriger les extends avec deux-points
      const extendsFixed = content.replace(/extends\s+\w+:\s*\{/g, (match) => {
        return match.replace(":", " ");
      });
      if (extendsFixed !== content) {
        content = extendsFixed;
        fixes++;
      }

      // 8. Corriger les propriétés d'objet manquantes
      const objectPropFixed = content.replace(/(\w+):\s*\{,/g, "$1: {");
      if (objectPropFixed !== content) {
        content = objectPropFixed;
        fixes++;
      }

      // 9. Corriger les virgules en trop
      const commaFixed = content.replace(/,(\s*[\}\]])/g, "$1");
      if (commaFixed !== content) {
        content = commaFixed;
        fixes++;
      }

      // 10. Corriger les case sans break
      const caseFixed = content.replace(/(case\s+['"][^'"]+['"]:\s*)(\/\/[^\n]*\n\s*)(break;)/g, "$1\n        $2        $3");
      if (caseFixed !== content) {
        content = caseFixed;
        fixes++;
      }

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, "utf8");
        this.fixedFiles.push({ file: fileName, fixes: fixes });
        this.stats.filesFixed++;
        this.stats.errorsFixed += fixes;
        console.log(`✅ ${fileName}: ${fixes} corrections`);
      }

    } catch (error) {
      console.log(`❌ ${fileName}: ${error.message}`);
    }
  }

  displayResults() {
    console.log("\n" + "=".repeat(50));
    console.log("🎯 CORRECTION FINALE TERMINÉE");
    console.log("=".repeat(50));
    
    console.log("\n📊 Statistiques:");
    console.log(`  • Fichiers analysés: ${this.stats.totalFiles}`);
    console.log(`  • Fichiers corrigés: ${this.stats.filesFixed}`);
    console.log(`  • Erreurs corrigées: ${this.stats.errorsFixed}`);
    
    if (this.fixedFiles.length > 0) {
      console.log("\n✅ Fichiers corrigés:");
      this.fixedFiles.slice(0, 10).forEach(fix => {
        console.log(`  • ${fix.file}: ${fix.fixes} corrections`);
      });
      
      if (this.fixedFiles.length > 10) {
        console.log(`  • ... et ${this.fixedFiles.length - 10} autres`);
      }
    }
    
    console.log("\n🎉 Correction terminée!");
  }
}

// Exécution
const fixer = new FinalSyntaxFixer();
fixer.fixAllModules().catch(console.error);