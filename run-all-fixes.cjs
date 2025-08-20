#!/usr/bin/env node
const { execSync } = require("child_process");

console.log("🚀 EXÉCUTION DE TOUTES LES CORRECTIONS EN LOT...");
console.log("=".repeat(60));

const fixes = [
  {
    name: "Erreurs de parsing",
    script: "fix-parsing-errors.cjs",
    description: "Corrige les tokens inattendus et malformations"
  },
  {
    name: "Objets malformés", 
    script: "fix-object-syntax.cjs",
    description: "Corrige la syntaxe des objets et propriétés"
  },
  {
    name: "Chaînes non terminées",
    script: "fix-string-errors.cjs", 
    description: "Corrige les strings et expressions régulières"
  },
  {
    name: "Identifiants dupliqués",
    script: "fix-duplicates.cjs",
    description: "Résout les doublons de variables et fonctions"
  },
  {
    name: "Variables undefined",
    script: "fix-undefined-vars.cjs",
    description: "Ajoute les variables et globals manquants"
  }
];

let totalErrors = 0;
let totalFixed = 0;

// Vérifier les erreurs avant correction
console.log("📊 ÉTAT AVANT CORRECTION:");
try {
  execSync("npm run syntax", { stdio: "inherit" });
} catch (error) {
  console.log("⚠️ Erreurs détectées - correction en cours...\n");
}

// Exécuter toutes les corrections
fixes.forEach((fix, index) => {
  console.log(`\n${index + 1}. 🔧 ${fix.name.toUpperCase()}`);
  console.log(`   ${fix.description}`);
  console.log("-".repeat(50));
  
  try {
    execSync(`node ${fix.script}`, { stdio: "inherit" });
    console.log(`✅ ${fix.name} - Terminé`);
  } catch (error) {
    console.error(`❌ Erreur lors de ${fix.name}:`, error.message);
  }
});

// Vérifier les erreurs après correction
console.log("\n" + "=".repeat(60));
console.log("📊 ÉTAT APRÈS CORRECTION:");

try {
  execSync("npm run syntax", { stdio: "inherit" });
  console.log("\n🎉 TOUTES LES CORRECTIONS APPLIQUÉES AVEC SUCCÈS !");
} catch (error) {
  console.log("\n⚠️ Erreurs restantes - analyse recommandée");
}

console.log("\n📋 COMMANDES POUR VÉRIFIER:");
console.log("npm run syntax       # Vérifier syntaxe");
console.log("npm run audit:static # Vérifier sécurité");
console.log("npm start           # Tester démarrage");

console.log("\n🎯 CORRECTIONS TERMINÉES !");