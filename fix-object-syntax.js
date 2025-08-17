import fs from "fs";

const filePath = "backend/alex-modules/specialized/AlexAutonomousCore.js";
let content = fs.readFileSync(filePath, "utf8");

console.log("🔧 Correction des objets JavaScript...");

// Fix object syntax - more targeted approach
content = content.replace(/(\w+): ([^,\n}]+)\n\s+(\w+):/g, "$1: $2,\n      $3:");

// Fix missing commas in function parameters
content = content.replace(/(\w+)\n\s+(\w+)\n\s+(\w+)\n\s+\)/g, "$1,\n        $2,\n        $3\n      )");

// Fix array missing commas
content = content.replace(/(['"][\w\s']+['"])\n\s+(['"][\w\s']+['"])/g, "$1,\n      $2");

// Fix specific patterns
content = content.replace(/STR_ALEX_AUTONOMOUS/g, "'Alex Autonomous'");
content = content.replace(/STR_AUTONOMOUS/g, "'autonomous'");

// Fix broken string patterns
content = content.replace(/STR_/g, '", "');
content = content.replace(/"", ""/g, '", "');

fs.writeFileSync(filePath, content);
console.log("✅ Corrections appliquées à AlexAutonomousCore.js");