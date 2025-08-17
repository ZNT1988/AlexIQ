import fs from "fs";

const filePath = "backend/alex-modules/specialized/AlexAutonomousCore.js";
let content = fs.readFileSync(filePath, "utf8");

console.log("🔧 Correction ciblée AlexAutonomousCore.js...");

// Fix missing commas in object properties (pattern très spécifique)
content = content.replace(/(\w+):\s*([^,\n}]+)\n\s+(\w+):/g, "$1: $2,\n      $3:");

// Fix multiple passes for nested objects
for (let i = 0; i < 5; i++) {
  content = content.replace(/(\w+):\s*([^,\n}]+)\n\s+(\w+):/g, "$1: $2,\n      $3:");
}

// Fix specific patterns that might remain
content = content.replace(/new Map\(\)\n\s+(\w+):/g, "new Map(),\n      $1:");
content = content.replace(/\[\]\n\s+(\w+):/g, "[],\n      $1:");
content = content.replace(/new Date\(\)\n\s+(\w+):/g, "new Date(),\n      $1:");

fs.writeFileSync(filePath, content);
console.log("✅ Corrections appliquées à AlexAutonomousCore.js");