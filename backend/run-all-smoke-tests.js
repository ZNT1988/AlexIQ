#!/usr/bin/env node

/**
 * 🧪 ALL SMOKE TESTS RUNNER
 * Exécute tous les smoke tests des modules core corrigés
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const smokeTests = [
  {
    name: 'OwnerIdentity',
    file: 'smoke-test-owneridentity.js',
    description: 'Test du système d\'authentification et gestion des identités'
  },
  {
    name: 'AlexAuthenticCore', 
    file: 'smoke-test-alexauthenticcore.js',
    description: 'Test du système d\'apprentissage authentique et anti-fake'
  },
  {
    name: 'AlexIntelligentCore',
    file: 'smoke-test-alexintelligentcore.js', 
    description: 'Test du système de traitement intelligent et NLP'
  },
  {
    name: 'AutonomyCore',
    file: 'smoke-test-autonomy.js',
    description: 'Test du système de décisions autonomes'
  }
];

console.log('🚀 RUNNING ALL CORE MODULE SMOKE TESTS');
console.log('=' .repeat(60));

async function runTest(testConfig) {
  return new Promise((resolve) => {
    console.log(`\n📋 Testing ${testConfig.name}...`);
    console.log(`📝 ${testConfig.description}`);
    console.log('-'.repeat(50));

    const testProcess = spawn('node', [testConfig.file], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    testProcess.on('close', (code) => {
      const success = code === 0;
      console.log(`\n${success ? '✅' : '❌'} ${testConfig.name} - ${success ? 'PASSED' : 'FAILED'}`);
      resolve({
        name: testConfig.name,
        success: success,
        exitCode: code
      });
    });

    testProcess.on('error', (error) => {
      console.error(`💥 Error running ${testConfig.name}:`, error);
      resolve({
        name: testConfig.name,
        success: false,
        error: error.message
      });
    });
  });
}

async function runAllTests() {
  const startTime = Date.now();
  const results = [];

  console.log(`🧪 Starting ${smokeTests.length} smoke tests...\n`);

  for (const test of smokeTests) {
    const result = await runTest(test);
    results.push(result);
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎯 SMOKE TESTS SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('-'.repeat(60));
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  console.log(`⏱️  Total time: ${duration.toFixed(2)}s`);
  console.log(`🎯 Success rate: ${((passed / results.length) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 ALL SMOKE TESTS PASSED!');
    console.log('✅ All core modules are working correctly.');
    console.log('✅ Ready for production deployment.');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed.`);
    console.log('❌ Please check the failing modules before deployment.');
  }

  console.log('\n📋 Core Modules Status:');
  smokeTests.forEach((test, index) => {
    const result = results[index];
    console.log(`   ${result.success ? '✅' : '❌'} ${test.name}: ${result.success ? 'Ready' : 'Needs attention'}`);
  });

  process.exit(failed === 0 ? 0 : 1);
}

// Ensure data directory exists
import { mkdirSync } from 'fs';
try {
  mkdirSync(path.join(__dirname, 'data'), { recursive: true });
} catch (error) {
  // Directory might already exist
}

runAllTests().catch(error => {
  console.error('💥 Test runner crashed:', error);
  process.exit(1);
});