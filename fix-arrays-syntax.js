#!/usr/bin/env node

/**
 * Correction spécifique des arrays mal formatés
 */

import fs from 'fs';
import path from 'path';

const MODULES_DIR = path.resolve('./backend/alex-modules');

class ArraySyntaxFixer {
  constructor() {
    this.fixedFiles = [];
    this.stats = {
      totalFiles: 0,
      filesFixed: 0,
      errorsFixed: 0
    };
  }

  async fixAllModules() {
    console.log('🔧 Correction des arrays mal formatés...\n');
    
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
        } else if (entry.endsWith('.js')) {
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
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let content = originalContent;
      let fixes = 0;

      // 1. Corriger les arrays sans virgules entre éléments
      const arrayPattern = /(\w+):\s*\[([^\]]*)\]/gs;
      content = content.replace(arrayPattern, (match, propName, arrayContent) => {
        if (!arrayContent.includes(',') && arrayContent.includes('\n')) {
          // C'est un array multi-ligne sans virgules
          const lines = arrayContent.split('\n').map(line => line.trim()).filter(line => line);
          if (lines.length > 1) {
            const fixedArrayContent = lines.join(',\n      ');
            fixes++;
            return `${propName}: [${fixedArrayContent}]`;
          }
        }
        return match;
      });

      // 2. Corriger les objets avec propriétés sans virgules
      const objectPattern = /(\w+):\s*\{([^}]*)\}/gs;
      content = content.replace(objectPattern, (match, propName, objectContent) => {
        if (!objectContent.includes(',') && objectContent.includes('\n')) {
          // C'est un objet multi-ligne sans virgules
          const lines = objectContent.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('//'));
          
          if (lines.length > 1) {
            const fixedObjectContent = lines.map(line => {
              if (!line.endsWith(',') && !line.endsWith('{') && !line.endsWith('}')) {
                return line + ',';
              }
              return line;
            }).join('\n        ');
            fixes++;
            return `${propName}: {\n        ${fixedObjectContent}\n      }`;
          }
        }
        return match;
      });

      // 3. Corriger les virgules manquantes spécifiques
      content = content.replace(/(\w+:\s*0)(\n\s+\w+:)/g, '$1,$2');
      content = content.replace(/(\])(\n\s+\w+:)/g, '$1,$2');
      content = content.replace(/(true)(\n\s+\w+:)/g, '$1,$2');
      content = content.replace(/(false)(\n\s+\w+:)/g, '$1,$2');
      content = content.replace(/('[\w\s]+')(\n\s+\w+:)/g, '$1,$2');

      // 4. Corriger les arrays de regex
      content = content.replace(/(\/[^\/]+\/[gimuy]*)(\n\s*\/[^\/]+\/[gimuy]*)/g, '$1,$2');

      // 5. Corriger les propriétés sans deux-points
      content = content.replace(/^\s*(\w+)\s+(\[|\{)/gm, '      $1: $2');

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
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
    console.log('\n' + '='.repeat(50));
    console.log('🎯 CORRECTION ARRAYS TERMINÉE');
    console.log('='.repeat(50));
    
    console.log(`\n📊 Statistiques:`);
    console.log(`  • Fichiers analysés: ${this.stats.totalFiles}`);
    console.log(`  • Fichiers corrigés: ${this.stats.filesFixed}`);
    console.log(`  • Erreurs corrigées: ${this.stats.errorsFixed}`);
    
    console.log('\n🎉 Correction terminée!');
  }
}

// Exécution
const fixer = new ArraySyntaxFixer();
fixer.fixAllModules().catch(console.error);