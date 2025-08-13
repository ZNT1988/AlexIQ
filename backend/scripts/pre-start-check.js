// Pre-start check script for HustleFinder IA Hybrid System
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🦄 HustleFinder IA - Hybrid System Pre-start Check");
console.log("=================================================");

// Basic checks
const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

// Check if essential files exist (updated for hybrid architecture)
const essentialFiles = [
  "../index.js",
  "../config/logger.js",
  "../alex-modules/skills/CausalSkillGraph.js",
  "../alex-modules/routing/LearningRouter.js",
  "../alex-modules/business/AlexBusinessCreator.js",
  "../alex-modules/finance/AlexMoneyFlow.js",
];

essentialFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - OK`);
    checks.passed++;
  } else {
    console.log(`❌ ${file} - MISSING`);
    checks.failed++;
  }
});

console.log("\n📊 Pre-start check summary:");
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️ Warnings: ${checks.warnings}`);

if (checks.failed === 0) {
  console.log("\n🎉 All checks passed! Starting HustleFinder IA Hybrid System...\n");
  console.log("🚀 Modules Ready:");
  console.log("   • CausalSkillGraph - Intelligent Routing");
  console.log("   • LearningRouter - Hybrid Provider Selection");
  console.log("   • AlexBusinessCreator - Billion$ Generator");
  console.log("   • AlexMoneyFlow - Revenue Optimizer");
  console.log("\n💰 Ready for billion-dollar business generation!\n");
  process.exit(0);
} else {
  console.log("\n❌ Some hybrid system modules missing. Please fix issues before starting.\n");
  console.log("💡 Tip: Run 'node validate-system.js' to check all components");
  process.exit(1);
}
