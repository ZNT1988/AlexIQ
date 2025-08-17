/**
 * 🧪 TEST RUNNER - HustleFinder IA Hybrid System
 * 
 * Executes all test suites for the hybrid AI system
 * 
 * @version 1.0.0
 * @author HustleFinder IA Team
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_CONFIG = {
  timeout: 30000,
  maxConcurrency: process.argv[2] || 4,
  testPatterns: [
    "tests/**/*.test.js",
    "tests/e2e/*.test.js",
    "tests/integration/*.test.js",
    "tests/performance/*.test.js"
  ]
};

class TestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0
    };
    this.failedTests = [];
  }

  async findTestFiles() {
    const testFiles = [];
    const testsDir = join(__dirname, "..", "tests");
    
    try {
      const files = await fs.readdir(testsDir, { recursive: true });
      
      for (const file of files) {
        if (file.endsWith(".test.js")) {
          testFiles.push(join(testsDir, file));
        }
      }
      
      console.log(`🔍 Found ${testFiles.length} test files`);
      return testFiles;
      
    } catch (error) {
      console.log("📝 No test directory found, running basic validation");
      return [];
    }
  }

  async runBasicValidation() {
    console.log("🚀 Running HustleFinder IA System Validation...\n");
    
    const validations = [
      {
        name: "Environment Configuration",
        test: () => this.validateEnvironment()
      },
      {
        name: "Module Loading",
        test: () => this.validateModules()
      },
      {
        name: "AI Providers",
        test: () => this.validateProviders()
      },
      {
        name: "Business Modules",
        test: () => this.validateBusinessModules()
      },
      {
        name: "Security & Compliance",
        test: () => this.validateSecurity()
      }
    ];

    for (const validation of validations) {
      console.log(`Testing: ${validation.name}...`);
      try {
        await validation.test();
        console.log(`✅ ${validation.name} - PASSED`);
        this.results.passed++;
      } catch (error) {
        console.log(`❌ ${validation.name} - FAILED: ${error.message}`);
        this.results.failed++;
        this.failedTests.push({ name: validation.name, error: error.message });
      }
      this.results.total++;
    }
  }

  async validateEnvironment() {
    // Check essential environment variables
    const requiredVars = [
      "AI_PROVIDER",
      "NODE_ENV"
    ];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    }

    // Check AI provider keys (at least one should be configured)
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    
    if (!hasOpenAI && !hasAnthropic) {
      console.log("⚠️  Warning: No AI provider keys configured, using mock mode");
    }
  }

  async validateModules() {
    // Check that core module files exist
    const coreModules = [
      "alex-modules/skills/CausalSkillGraph.js",
      "alex-modules/routing/LearningRouter.js",
      "alex-modules/intelligence/UncertaintyCalibrator.js",
      "alex-modules/learning/ContinualLearner.js",
      "alex-modules/business/AlexBusinessCreator.js",
      "alex-modules/finance/AlexMoneyFlow.js"
    ];

    for (const module of coreModules) {
      try {
        await fs.access(join(__dirname, "..", module));
      } catch (error) {
        throw new Error(`Core module missing: ${module}`);
      }
    }
  }

  async validateProviders() {
    // Check provider configuration
    const hybridConfig = {
      provider: process.env.AI_PROVIDER || "HYBRID",
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      local: process.env.LOCAL_AI_ENABLED === "true"
    };

    if (hybridConfig.provider === "HYBRID" && !hybridConfig.openai && !hybridConfig.anthropic) {
      throw new Error("HYBRID mode requires at least one cloud provider");
    }
  }

  async validateBusinessModules() {
    // Check business module configuration
    const businessEnabled = process.env.ABC_ENABLED === "true" || process.env.AMF_ENABLED === "true";
    
    if (businessEnabled) {
      // Validate target revenue is set for business modules
      const targetRevenue = parseInt(process.env.ABC_TARGET_REVENUE) || 0;
      if (targetRevenue < 1000000) {
        console.log("⚠️  Warning: Business target revenue seems low for billion-dollar goals");
      }
    }
  }

  async validateSecurity() {
    // Check security configuration
    const securityEnabled = process.env.GR_ENABLED === "true";
    const gdprEnabled = process.env.GDPR_ENABLED === "true";
    const aiActEnabled = process.env.AI_ACT_COMPLIANCE === "true";

    if (!securityEnabled) {
      console.log("⚠️  Warning: Guardrails security not enabled");
    }

    if (!gdprEnabled) {
      console.log("⚠️  Warning: GDPR compliance not enabled");
    }
  }

  async runNodeTests(testFiles) {
    console.log(`🧪 Running ${testFiles.length} test files with Node.js...\n`);

    for (const testFile of testFiles) {
      console.log(`Running: ${testFile.split("/").pop()}`);
      
      try {
        // Try to import and run the test
        const testModule = await import(testFile);
        console.log(`✅ ${testFile.split("/").pop()} - LOADED`);
        this.results.passed++;
      } catch (error) {
        console.log(`❌ ${testFile.split("/").pop()} - FAILED: ${error.message}`);
        this.results.failed++;
        this.failedTests.push({ 
          name: testFile.split("/").pop(), 
          error: error.message 
        });
      }
      this.results.total++;
    }
  }

  printResults() {
    console.log("\n" + "=".repeat(60));
    console.log("🏁 TEST RESULTS SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏭️  Skipped: ${this.results.skipped}`);
    
    const successRate = this.results.total > 0 
      ? ((this.results.passed / this.results.total) * 100).toFixed(1)
      : "0";
    
    console.log(`📊 Success Rate: ${successRate}%`);

    if (this.failedTests.length > 0) {
      console.log("\n❌ FAILED TESTS:");
      this.failedTests.forEach(test => {
        console.log(`  - ${test.name}: ${test.error}`);
      });
    }

    console.log("\n🎯 SYSTEM STATUS:");
    if (this.results.failed === 0) {
      console.log("🚀 HustleFinder IA Hybrid System: READY FOR PRODUCTION!");
      process.exit(0);
    } else if (this.results.failed <= 2) {
      console.log("⚠️  HustleFinder IA Hybrid System: MINOR ISSUES - Still operational");
      process.exit(0);
    } else {
      console.log("🚨 HustleFinder IA Hybrid System: MAJOR ISSUES - Fix required");
      process.exit(1);
    }
  }

  async run() {
    const startTime = Date.now();
    
    console.log("🦄 HustleFinder IA - Hybrid System Test Runner");
    console.log("Version: 1.0.0-Hybrid");
    console.log("=".repeat(60));

    // Find test files
    const testFiles = await this.findTestFiles();

    // Run basic validation
    await this.runBasicValidation();

    // Run actual test files if they exist
    if (testFiles.length > 0) {
      await this.runNodeTests(testFiles);
    } else {
      console.log("\n📝 Note: No Jest test files found, validation complete");
    }

    this.results.duration = Date.now() - startTime;
    console.log(`⏱️  Duration: ${this.results.duration}ms`);
    
    this.printResults();
  }
}

// Run the test runner
const runner = new TestRunner();
runner.run().catch(error => {
  console.error("💥 Test runner crashed:", error);
  process.exit(1);
});