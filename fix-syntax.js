import fs from "fs";

const filePath = "backend/alex-modules/specialized/AlexAutonomousCore.js";
let content = fs.readFileSync(filePath, "utf8");

console.log("🔧 Correction automatique des erreurs de syntaxe...");

// Correction des objets sans virgules
content = content.replace(/(\w+):\s*([^,\n}]+)\n\s*(\w+):/g, "$1: $2,\n      $3:");

// Correction des chaînes mal fermées
content = content.replace(/STR_/g, '", "');

// Correction des blocs try-catch mal fermés
content = content.replace(/} catch \(_error\) {\s*}\s*}/g, '} catch (error) {\n      console.error("Error:", error);\n    }\n  }');

// Correction des conditions if mal fermées  
content = content.replace(/async if\(/g, "if (");

// Sauvegarde
fs.writeFileSync(filePath, content);
console.log("✅ Corrections appliquées à AlexAutonomousCore.js");