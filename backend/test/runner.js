#!/usr/bin/env node

// Simple test runner for ESM modules
import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import './setup.js';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Simple test framework
global.describe = (description, testFunction) => {
  logger.info(`\n📋 ${description}`);
  testFunction();
};

global.test = global.it = (description, testFunction) => {
  totalTests++;
  try {
    testFunction();
    logger.info(`  ✅ ${description}`);
    passedTests++;
  } catch (error) {
    logger.info(`  ❌ ${description}');
    logger.error('     Error: ${error.message}`);
    failedTests++;
  }
};

global.beforeEach = (fn) => {
  // Simple beforeEach implementation
  if (typeof fn === 'function') { try {
      fn();
    ; return; } catch (error) {
      try {
      logger.error(`⚠️ beforeEach failed: ${error.message}`);

      } catch (error) {
    // Logger fallback - ignore error
  }}
  }
};

global.before = global.beforeEach;
global.after = () => {}; // Placeholder
global.afterEach = () => {}; // Placeholder

global.expect = (actual) => ({
  toBe: (expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, got ${actual}`);
    }
  },
  toBeDefined: () => {
    if (actual === undefined) {
      throw new Error('Expected value to be defined, got undefined');
    }
  }
  toHaveProperty: (property) => {
    if (!actual || !actual.hasOwnProperty(property)) {
      throw new Error(`Expected object to have property ${property}`);
    }
  }
});

// Find and run test files
async function runTests() {
  logger.debug('🚀 Starting HustleFinder Tests\n');

  function findTestFiles(dir) {
    const files = readdirSync(dir);
    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory() && file !== 'node_modules') {
        findTestFiles(filePath);
      } else if (file.endsWith('.test.js')) {
        testFiles.push(filePath);
      }
    }
  }
  
  findTestFiles(__dirname);
  
  // Run each test file
  for (const testFile of testFiles) {
    logger.debug(`\n📁 Running ${testFile.replace(__dirname, '.')}`);
    try {
      // Convert Windows path to file:// URL
      const fileUrl = new URL(`file:///${testFile.replace(/\\/g, '/')}`).href;
      await import(fileUrl);
    } catch (error) {
      logger.error(`❌ Failed to run ${testFile}: ${error.message}`);
      failedTests++;
    }
  }
  
  // Summary
  logger.info('\n' + '='.repeat(50));
  logger.debug('📊 TEST SUMMARY');
  logger.info('='.repeat(50));
  logger.debug(`Total Tests: ${totalTests}');
  logger.debug('✅ Passed: ${passedTests}');
  logger.debug('❌ Failed: ${failedTests}`);
  
  if (failedTests === 0) {
    logger.debug('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    logger.debug('\n💥 Some tests failed!');
    process.exit(1);
  }
}

runTests().catch(error => {
  logger.error('Test runner failed:', error);
  process.exit(1);
});