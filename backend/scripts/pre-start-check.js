// Pre-start check script for Alex Ultimate backend
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Alex Ultimate Backend - Pre-start check");
console.log("==========================================");

// Basic checks
const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

// Check if essential files exist
const essentialFiles = [
  "../index.js",
  "../config/logger.js",
  "../consciousness/AlexConsciousness.js",
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
  console.log("\n🎉 All checks passed! Starting Alex Ultimate...\n");
  process.exit(0);
} else {
  console.log("\n❌ Some checks failed. Please fix issues before starting.\n");
  process.exit(1);
}
