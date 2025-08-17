// Pre-start check script for HustleFinder IA Hybrid System
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



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
    
    checks.passed++;
  } else {
    
    checks.failed++;
  }
});





if (checks.failed === 0) {
  
  
  
  
  
  
  
  process.exit(0);
} else {
  
  
  process.exit(1);
}
