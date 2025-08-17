import fs from "fs";

// Lire le fichier
let content = fs.readFileSync("backend/alex-modules/specialized/AlexDecisionEngine.js", "utf8");

// Corrections de syntaxe spécifiques
content = content.replace(/name: 'Modèle Rationnel'\s+steps:/g, "name: 'Modèle Rationnel',\n      steps:");
content = content.replace(/\]\s+strengths:/g, "],\n      strengths:");
content = content.replace(/\]\s+limitations:/g, "],\n      limitations:");
content = content.replace(/\]\s+\}/g, "]\n      }");

// Ajouter des virgules manquantes entre les éléments de tableau
content = content.replace(/'([^']+)'\s+'([^']+)'/g, "'$1', '$2'");

// Ajouter des virgules entre les objets
content = content.replace(/\}\s+([a-zA-Z_]+):\s*\{/g, "},\n      $1: {");

// Corriger les structures d'objets mal formées
content = content.replace(/name: '([^']+)'\s+steps:/g, "name: '$1',\n        steps:");
content = content.replace(/name: '([^']+)'\s+strengths:/g, "name: '$1',\n        strengths:");
content = content.replace(/name: '([^']+)'\s+limitations:/g, "name: '$1',\n        limitations:");

console.log("Corrections appliquées au fichier AlexDecisionEngine.js");
fs.writeFileSync("backend/alex-modules/specialized/AlexDecisionEngine.js", content);