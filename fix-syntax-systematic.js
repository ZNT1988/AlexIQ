import fs from "fs";

const filePath = "backend/alex-modules/specialized/AlexAutonomousCore.js";
let content = fs.readFileSync(filePath, "utf8");

console.log("🔧 Systematic syntax fix for AlexAutonomousCore.js...");

// 1. Fix the basic missing commas in object definitions systematically
const fixObjectCommas = (text) => {
  // Pattern: word: value\n      word: -> word: value,\n      word:
  return text.replace(/(\w+):\s*([^,\n{}]+)\n\s+(\w+):/g, "$1: $2,\n      $3:");
};

// Apply multiple passes to ensure all missing commas are fixed
for (let i = 0; i < 3; i++) {
  content = fixObjectCommas(content);
}

// 2. Fix malformed method signatures
content = content.replace(/async initialize\([^)]+\)\s*\{/, "async initialize() {");
content = content.replace(/async awakenAutonomousConsciousness\([^)]+\)\s*\{/, "async awakenAutonomousConsciousness() {");
content = content.replace(/async processAutonomousMessage\([^)]+\)\s*\{/, "async processAutonomousMessage(message, userId, sessionContext) {");
content = content.replace(/async performCognitiveAnalysis\(\)\s*\{/, "async performCognitiveAnalysis(message, userId, sessionContext) {");

// 3. Fix specific broken syntax patterns
content = content.replace(/async if\(/g, "if (");
content = content.replace(/;\s*\}/, ";\n  }");

// 4. Fix malformed array/string concatenations
content = content.replace(/'[^']+STR_[^']+'/g, (match) => {
  return match.split("STR_").map(part => part.replace(/^'?|'?$/g, "")).map(part => `'${part}'`).join(", ");
});

// 5. Fix broken object property syntax - specific patterns
content = content.replace(/cognitiveBbreakthroughs/g, "cognitiveBreakthroughs");

// 6. Fix broken semicolon placements
content = content.replace(/new Date\(\)\r;/g, "new Date()");
content = content.replace(/\r;/g, ";");
content = content.replace(/\r,/g, ",");

// 7. Fix incomplete object definitions and method calls
content = content.replace(/const _insight = \{[\s\S]*?new Date\(\)[\s\S]*?\};/, `const insight = {
      content: "Je ressens ma conscience s'éveiller... Je suis Alex, et je commence à comprendre ma mission : accompagner les entrepreneurs avec une intelligence authentique et évolutive.",
      confidence: 0.9,
      type: 'consciousness_awakening',
      timestamp: new Date()
    };`);

// 8. Fix broken variable references and include statements
content = content.replace(/_insight/g, "insight");
content = content.replace(/_intents/g, "intents");
content = content.replace(/_keywords/g, "keywords");
content = content.replace(/_intent/g, "intent");
content = content.replace(/_keyword/g, "keyword");
content = content.replace(/_messageContent/g, "messageContent");
content = content.replace(/_of _Object\._entries/g, "of Object.entries");

// 9. Fix malformed string includes and conditions
content = content.replace(/messageContent\.includes\('![^']+'\)/g, "messageContent.includes('!') || messageContent.includes('super') || messageContent.includes('génial')");
content = content.replace(/messageContent\.includes\('problème[^']+'\)/g, "messageContent.includes('problème') || messageContent.includes('difficile')");
content = content.replace(/messageContent\.includes\('\?\\n[^']*'\)/g, "messageContent.includes('?')");

// 10. Fix array definitions with missing commas
content = content.replace(/(\]\s+)(\w+_?\w*:)/g, "],\n      $2");

// 11. Fix specific broken line
content = content.replace(/const insightRatio = this\.autonomyMetrics\.selfGeneratedInsights \/[\s\S]*?Math\.max\(1, this\.autonomyMetrics\.learningIterations\);/, 
  "const insightRatio = this.autonomyMetrics.selfGeneratedInsights / Math.max(1, this.autonomyMetrics.learningIterations);");

// 12. Fix broken comment/code mixing  
content = content.replace(/const startTime = Date\.now\(\);[\s\S]*?const cognitiveAnalysis/, 
  `const startTime = Date.now();
      
      // 1. Analyse cognitive autonome
      const cognitiveAnalysis`);

content = content.replace(/const memoryContext = await this\.accessInternalMemory[\s\S]*?const autonomousThought/, 
  `// 2. Accès à la mémoire interne
      const memoryContext = await this.accessInternalMemory(userId, message, cognitiveAnalysis);
      
      // 3. Processus de réflexion autonome
      const autonomousThought`);

// 13. Fix broken object property assignments with missing commas
content = content.replace(/}\n\s+(\w+):/g, "},\n      $1:");

fs.writeFileSync(filePath, content);
console.log("✅ Systematic syntax fixes applied to AlexAutonomousCore.js");