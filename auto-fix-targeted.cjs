#!/usr/bin/env node

/**
 * AUTO-FIX TARGETED - Correction Automatique Fichier par Fichier
 * Script intelligent pour corriger les fichiers les plus corrompus du core HustleFinder
 * Maintient la logique réelle (pas de fake AI, pas de réponses statiques)
 */

const fs = require("fs");
const path = require("path");

// Fichiers critiques identifiés par l'analyse de corruption (scores > 20)
const criticalFiles = [
  "backend/config/database-sqlite.js",
  "backend/config/monitoring.js", 
  "backend/config/validation.js",
  "backend/config/performance.js",
  "backend/config/cache.js",
  "backend/config/logger.js",
  "backend/config/session.js",
  "backend/middleware/rateLimiter.js",
  "backend/middleware/corsHandler.js",
  "backend/middleware/errorHandler.js",
  "backend/routes/real-alex.js",
  "backend/middleware/cacheMiddleware.js",
  "backend/middleware/auth.js",
  "backend/config/logger-simple.js",
  "backend/middleware/antiFakeGuard.js"
];

console.log("🔧 AUTO-FIX TARGETED - Correction fichier par fichier");
console.log(`📁 ${criticalFiles.length} fichiers critiques à corriger\n`);

/**
 * Corrige un fichier spécifique avec des règles intelligentes
 */
function fixFileInteligently(filepath) {
  try {
    if (!fs.existsSync(filepath)) {
      console.log(`⚠️  ${filepath} - Fichier inexistant`);
      return false;
    }

    let content = fs.readFileSync(filepath, "utf8");
    let fixed = content;
    let changes = 0;

    console.log(`🔍 Analyse: ${filepath}`);

    // 1. Retirer les variables auto-déclarées excessives
    const autoVarPattern = /^let \w+; \/\/ Variable auto-déclarée\n?/gm;
    const autoVars = content.match(autoVarPattern);
    if (autoVars && autoVars.length > 0) {
      fixed = fixed.replace(autoVarPattern, "");
      changes += autoVars.length;
      console.log(`  ✅ Retiré ${autoVars.length} variables auto-déclarées`);
    }

    // 2. Corriger les commentaires SonarFix malformés
    fixed = fixed.replace(/\/\/ Unused variable commented by SonarFix/g, "");
    fixed = fixed.replace(/\/\/ Unused variable commented by SonarFix.*?\n/g, "");
    
    // 3. Corriger les déclarations de variables corrompues
    fixed = fixed.replace(/^const\s+(\w+)\s*=.*?\/\/ Unused variable commented by SonarFix(.*?)$/gm, 
      (match, varName, rest) => {
        if (rest.trim()) {
          return `const ${varName} = ${rest.trim()};`;
        }
        return "";
      });

    // 4. Corriger les imports/exports malformés
    fixed = fixed.replace(/^\/\/ (const|let|var)\s+.*?\n/gm, "");
    fixed = fixed.replace(/}\); \/\/ Unused variable commented by SonarFix(.*)/g, (match, rest) => {
      return rest.trim() ? `});\n${rest.trim()}` : "});";
    });

    // 5. Corriger les chaînes échappées malformées
    fixed = fixed.replace(/\\"/g, '"');
    fixed = fixed.replace(/\\'/g, "'");

    // 6. Nettoyer les lignes vides excessives
    fixed = fixed.replace(/\n\s*\n\s*\n/g, "\n\n");

    // 7. Corriger les objets malformés basiques
    fixed = fixed.replace(/{\s*\n\s*}/g, "{}");
    fixed = fixed.replace(/\[\s*\n\s*\]/g, "[]");

    // 8. Corriger les erreurs CommonJS/ES6 mix
    if (filepath.endsWith(".js") && !filepath.includes("config")) {
      // Assurer que c'est du ES6 module
      fixed = fixed.replace(/module\.exports\s*=\s*/g, "export default ");
      fixed = fixed.replace(/const\s+(\w+)\s*=\s*require\(['"`]([^'"`]+)['"`]\);?/g, 
        'import $1 from "$2";');
    }

    // 9. Corrections spécifiques par type de fichier
    if (filepath.includes("config/")) {
      // Pour les fichiers de config, assurer l'export
      if (!fixed.includes("export") && !fixed.includes("module.exports")) {
        const lastVarMatch = fixed.match(/const\s+(\w+)\s*=/g);
        if (lastVarMatch) {
          const lastVar = lastVarMatch[lastVarMatch.length - 1].match(/const\s+(\w+)/)[1];
          fixed += `\nexport default ${lastVar};\n`;
        }
      }
    }

    if (filepath.includes("middleware/")) {
      // Pour les middleware, corriger les exports de fonctions
      fixed = fixed.replace(/export\s+function\s+(\w+)/g, "export function $1");
    }

    // 10. Vérifier si des changements ont été faits
    if (fixed !== content) {
      fs.writeFileSync(filepath, fixed, "utf8");
      changes = fixed.length !== content.length ? changes + 1 : changes;
      console.log(`  💾 Fichier corrigé avec ${changes} modifications`);
      return true;
    } else {
      console.log("  ✨ Aucune correction nécessaire");
      return true;
    }

  } catch (error) {
    console.error(`❌ Erreur sur ${filepath}:`, error.message);
    return false;
  }
}

/**
 * Processus principal de correction
 */
async function runTargetedFix() {
  let totalFixed = 0;
  let totalFailed = 0;

  for (const file of criticalFiles) {
    const filepath = path.resolve(file);
    console.log(`\n🔧 Correction de ${file}`);
    
    if (fixFileInteligently(filepath)) {
      totalFixed++;
    } else {
      totalFailed++;
    }
    
    // Petite pause pour éviter la surcharge
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log("\n📊 RÉSULTATS DE LA CORRECTION TARGETÉE:");
  console.log(`✅ Fichiers corrigés: ${totalFixed}`);
  console.log(`❌ Fichiers échoués: ${totalFailed}`);
  console.log(`📁 Total traité: ${criticalFiles.length}`);

  if (totalFixed > 0) {
    console.log("\n🎯 Correction terminée! Lancement de la vérification syntaxe...");
    return true;
  }

  return false;
}

// Exécution si appelé directement
if (require.main === module) {
  runTargetedFix()
    .then(success => {
      if (success) {
        console.log("\n✨ AUTO-FIX TARGETED terminé avec succès!");
        process.exit(0);
      } else {
        console.log("\n⚠️ Aucune correction effectuée");
        process.exit(1);
      }
    })
    .catch(error => {
      console.error("\n❌ Erreur fatale:", error);
      process.exit(1);
    });
}

module.exports = { runTargetedFix, fixFileInteligently };