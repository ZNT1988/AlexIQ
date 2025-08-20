#!/usr/bin/env node
/**
 * @fileoverview CI Configuration Validator
 * Script de validation de la configuration GitHub Actions et SonarQube
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CIConfigValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.validations = 0;
  }

  log(level, message, details = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level}: ${message}`);
    if (details) console.log('  Details:', details);
  }

  error(message, details = null) {
    this.errors.push({ message, details });
    this.log('ERROR', message, details);
  }

  warn(message, details = null) {
    this.warnings.push({ message, details });
    this.log('WARN', message, details);
  }

  info(message, details = null) {
    this.log('INFO', message, details);
  }

  success(message, details = null) {
    this.log('SUCCESS', message, details);
    this.validations++;
  }

  async validateGitHubWorkflows() {
    this.info('🔍 Validating GitHub Actions workflows...');

    const workflowsDir = path.join(__dirname, '.github', 'workflows');
    
    // Check workflows directory exists
    if (!fs.existsSync(workflowsDir)) {
      this.error('GitHub workflows directory not found', { path: workflowsDir });
      return;
    }

    // Check build.yml exists
    const buildYmlPath = path.join(workflowsDir, 'build.yml');
    if (!fs.existsSync(buildYmlPath)) {
      this.error('build.yml workflow not found', { path: buildYmlPath });
      return;
    }

    try {
      const buildYmlContent = fs.readFileSync(buildYmlPath, 'utf8');
      
      // Validate build.yml structure
      if (!buildYmlContent.includes('name: Build and SonarQube Analysis')) {
        this.error('build.yml missing proper name');
      } else {
        this.success('build.yml has correct name');
      }

      if (!buildYmlContent.includes('sonarqube:')) {
        this.error('build.yml missing SonarQube job');
      } else {
        this.success('build.yml has SonarQube job');
      }

      if (!buildYmlContent.includes('SONAR_TOKEN')) {
        this.error('build.yml missing SONAR_TOKEN environment variable');
      } else {
        this.success('build.yml has SONAR_TOKEN configured');
      }

      // Check for Phase tests
      const phases = ['phase1', 'phase2', 'phase3'];
      for (const phase of phases) {
        if (buildYmlContent.includes(`test-${phase}-`)) {
          this.success(`build.yml includes ${phase.toUpperCase()} tests`);
        } else {
          this.warn(`build.yml might be missing ${phase.toUpperCase()} tests`);
        }
      }

      // Check Node.js version
      if (buildYmlContent.includes("node-version: '18'")) {
        this.success('build.yml uses Node.js 18');
      } else {
        this.warn('build.yml might not be using recommended Node.js version');
      }

    } catch (error) {
      this.error('Failed to read build.yml', { error: error.message });
    }
  }

  async validateSonarConfig() {
    this.info('🔍 Validating SonarQube configuration...');

    const sonarConfigPath = path.join(__dirname, 'sonar-project.properties');
    
    if (!fs.existsSync(sonarConfigPath)) {
      this.error('sonar-project.properties not found', { path: sonarConfigPath });
      return;
    }

    try {
      const sonarConfig = fs.readFileSync(sonarConfigPath, 'utf8');
      
      // Validate required properties
      const requiredProperties = [
        'sonar.projectKey=ZNT1988_AlexIQ',
        'sonar.organization=alexiq',
        'sonar.sources=backend,frontend/src',
        'sonar.sourceEncoding=UTF-8'
      ];

      for (const property of requiredProperties) {
        if (sonarConfig.includes(property)) {
          this.success(`SonarQube config has: ${property.split('=')[0]}`);
        } else {
          this.error(`SonarQube config missing: ${property}`);
        }
      }

      // Validate exclusions
      if (sonarConfig.includes('sonar.exclusions=') && sonarConfig.includes('node_modules')) {
        this.success('SonarQube config has proper exclusions');
      } else {
        this.warn('SonarQube exclusions might need review');
      }

      // Validate inclusions for AI modules
      if (sonarConfig.includes('backend/alex-modules/**/*.js')) {
        this.success('SonarQube config includes AI modules');
      } else {
        this.warn('SonarQube config might not properly include AI modules');
      }

    } catch (error) {
      this.error('Failed to read sonar-project.properties', { error: error.message });
    }
  }

  async validateTestFiles() {
    this.info('🔍 Validating test files...');

    const testFiles = [
      'test-phase1-context-intelligence.js',
      'test-phase2-response-generation.js', 
      'test-phase3-autonomous-adaptation.js'
    ];

    for (const testFile of testFiles) {
      const testPath = path.join(__dirname, testFile);
      if (fs.existsSync(testPath)) {
        this.success(`Test file exists: ${testFile}`);
        
        try {
          const testContent = fs.readFileSync(testPath, 'utf8');
          if (testContent.includes('main()')) {
            this.success(`Test file ${testFile} has main() function`);
          } else {
            this.warn(`Test file ${testFile} might not be properly structured`);
          }
        } catch (error) {
          this.error(`Failed to read test file: ${testFile}`, { error: error.message });
        }
      } else {
        this.error(`Test file not found: ${testFile}`, { path: testPath });
      }
    }
  }

  async validatePackageJson() {
    this.info('🔍 Validating package.json...');

    const packageJsonPath = path.join(__dirname, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      this.error('package.json not found');
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (packageJson.scripts && packageJson.scripts.test) {
        this.success('package.json has test script');
      } else {
        this.warn('package.json might be missing test script');
      }

      if (packageJson.type === 'module') {
        this.success('package.json configured for ES modules');
      } else {
        this.warn('package.json might not be configured for ES modules');
      }

      // Check for essential dependencies
      const essentialDeps = ['sqlite3'];
      for (const dep of essentialDeps) {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          this.success(`package.json has dependency: ${dep}`);
        } else {
          this.warn(`package.json might be missing dependency: ${dep}`);
        }
      }

    } catch (error) {
      this.error('Failed to parse package.json', { error: error.message });
    }
  }

  async validateAIModules() {
    this.info('🔍 Validating AI modules structure...');

    const aiModulesPath = path.join(__dirname, 'backend', 'alex-modules', 'intelligence');
    
    if (!fs.existsSync(aiModulesPath)) {
      this.error('AI modules directory not found', { path: aiModulesPath });
      return;
    }

    const expectedModules = [
      'ContextIntelligenceEngine.js',
      'LearningMemorySystem.js',
      'IntelligentResponseGenerator.js',
      'ExternalAPIManager.js',
      'QualityConfidenceScorer.js',
      'DecisionMakingEngine.js',
      'SelfOptimizationSystem.js',
      'ConflictDetectionEngine.js'
    ];

    for (const module of expectedModules) {
      const modulePath = path.join(aiModulesPath, module);
      if (fs.existsSync(modulePath)) {
        this.success(`AI module exists: ${module}`);
      } else {
        this.error(`AI module not found: ${module}`, { path: modulePath });
      }
    }
  }

  async runValidation() {
    this.info('🚀 Starting CI Configuration Validation...');
    console.log('=' .repeat(80));

    try {
      await this.validateGitHubWorkflows();
      await this.validateSonarConfig();
      await this.validateTestFiles();
      await this.validatePackageJson();
      await this.validateAIModules();

      // Summary
      console.log('\n' + '='.repeat(80));
      console.log('📊 VALIDATION SUMMARY');
      console.log('='.repeat(80));
      console.log(`✅ Validations passed: ${this.validations}`);
      console.log(`⚠️  Warnings: ${this.warnings.length}`);
      console.log(`❌ Errors: ${this.errors.length}`);

      if (this.errors.length > 0) {
        console.log('\n🔴 ERRORS FOUND:');
        this.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.message}`);
          if (error.details) {
            console.log(`     Details: ${JSON.stringify(error.details)}`);
          }
        });
      }

      if (this.warnings.length > 0) {
        console.log('\n🟡 WARNINGS:');
        this.warnings.forEach((warning, index) => {
          console.log(`  ${index + 1}. ${warning.message}`);
        });
      }

      const overallSuccess = this.errors.length === 0;
      console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ READY FOR CI/CD' : '❌ NEEDS FIXES'}`);
      
      if (overallSuccess) {
        console.log('🚀 CI/CD configuration is ready for deployment!');
        console.log('🔗 SonarQube URL: https://sonarcloud.io/project/overview?id=NT1988_AlexIQ');
      } else {
        console.log('⚠️  Please fix the errors before deploying to CI/CD');
      }

      return overallSuccess;

    } catch (error) {
      this.error('Validation process failed', { error: error.message });
      return false;
    }
  }
}

// Run validation
async function main() {
  const validator = new CIConfigValidator();
  const success = await validator.runValidation();
  process.exit(success ? 0 : 1);
}

main();