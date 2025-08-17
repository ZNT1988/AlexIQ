import fs from "fs";

const filePath = "backend/alex-modules/specialized/AlexAutonomousCore.js";
let content = fs.readFileSync(filePath, "utf8");

console.log("🔧 Fixing ALL missing commas systematically...");

// Split into lines for line-by-line analysis
const lines = content.split("\n");
const fixedLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  const nextLine = lines[i + 1];
  
  // Check if current line needs a comma (ends with a value and next line starts with a property)
  if (nextLine && 
      // Current line ends with a value (string, number, boolean, array, object, function call)
      /^\s+[^/].*[^,}\])]\s*$/.test(line) &&
      // Next line starts with a property or method
      /^\s+\w+\s*:/.test(nextLine) &&
      // Not already ending with comma
      !line.endsWith(",") &&
      // Skip comments and certain patterns
      !line.includes("//") &&
      !line.includes("/*") &&
      !line.includes("*/")) {
    
    // Add comma to current line
    line = line.trimEnd() + ",";
    console.log(`Fixed line ${i + 1}: Added comma`);
  }
  
  fixedLines.push(line);
}

content = fixedLines.join("\n");

// Additional specific fixes for known patterns
const fixes = [
  // Fix array closing without comma before next property
  { from: /(\]\s*)\n(\s+\w+:)/g, to: "$1,\n$2" },
  
  // Fix object closing without comma before next property  
  { from: /(\}\s*)\n(\s+\w+:)/g, to: "$1,\n$2" },
  
  // Fix function call closing without comma
  { from: /(\)\s*)\n(\s+\w+:)/g, to: "$1,\n$2" },
  
  // Fix string/number without comma before next property
  { from: /(['"]\s*|\d+\s*|true\s*|false\s*)\n(\s+\w+:)/g, to: "$1,\n$2" },
  
  // Fix specific broken method signatures
  { from: /async (\w+)\([^)]*\)\s*\{/, to: (match, methodName) => {
    // Common method signatures
    const signatures = {
      "initialize": "async initialize() {",
      "awakenAutonomousConsciousness": "async awakenAutonomousConsciousness() {",
      "processAutonomousMessage": "async processAutonomousMessage(message, userId, sessionContext) {",
      "performCognitiveAnalysis": "async performCognitiveAnalysis(message, userId, sessionContext) {"
    };
    return signatures[methodName] || match;
  } },
  
  // Fix broken array definitions in intents
  { from: /(\w+): \[\s*(['"][^'"]+['"])\s+(['"][^'"]+['"])/g, to: "$1: [$2, $3" },
  
  // Fix broken object assignments  
  { from: /;\s*\}\s*;/g, to: ";\n  }" },
  
  // Fix broken line endings
  { from: /\r;/g, to: ";" },
  { from: /\r,/g, to: "," }
];

fixes.forEach(fix => {
  if (typeof fix.to === "function") {
    content = content.replace(fix.from, fix.to);
  } else {
    content = content.replace(fix.from, fix.to);
  }
});

// Final cleanup pass
content = content
  // Remove duplicate commas
  .replace(/,,+/g, ",")
  // Fix space issues
  .replace(/,\s*,/g, ",")
  // Fix broken line formatting
  .replace(/\n\s*\n\s*\n/g, "\n\n");

fs.writeFileSync(filePath, content);
console.log("✅ All comma fixes applied!");

// Test syntax
try {
  const { execSync } = await import("child_process");
  execSync("node -c " + filePath, { stdio: "inherit" });
  console.log("✅ File syntax is now valid!");
} catch (error) {
  console.log("❌ Still has syntax errors, but much improved");
}