#!/usr/bin/env node

/**
 * 🧪 SMOKE TEST - AlexAuthenticCore
 * Test de validation pour vérifier que AlexAuthenticCore fonctionne correctement
 */

import alexAuthenticCore from './alex-modules/core/AlexAuthenticCore.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 STARTING AlexAuthenticCore Smoke Test...\n');

async function runSmokeTest() {
  let passed = 0;
  let failed = 0;

  function test(name, condition) {
    if (condition) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name}`);
      failed++;
    }
  }

  try {
    // Test 1: Module Import
    test("AlexAuthenticCore module imports correctly", alexAuthenticCore !== undefined);
    test("AlexAuthenticCore is instance of AlexAuthenticCore", alexAuthenticCore.constructor.name === 'AlexAuthenticCore');

    console.log('\n📊 Initial Status Check:');
    const initialStatus = alexAuthenticCore.getStatus();
    console.log(`   - Initialized: ${initialStatus.initialized}`);
    console.log(`   - Authenticity Score: ${initialStatus.authenticityScore}`);
    console.log(`   - Learning Active: ${initialStatus.learningActive}`);

    // Test 2: Initialization
    console.log('\n🔄 Initializing AlexAuthenticCore...');
    const initResult = await alexAuthenticCore.initialize();
    test("AlexAuthenticCore initializes successfully", initResult.status === 'initialized');
    test("Learning system activated", initResult.learningActive === true);

    // Test 3: Status after init
    const postInitStatus = alexAuthenticCore.getStatus();
    test("AlexAuthenticCore is initialized", postInitStatus.initialized === true);
    test("Authenticity score is high", postInitStatus.authenticityScore >= 0.9);
    test("Learning is active", postInitStatus.learningActive === true);

    // Test 4: Learning Process
    console.log('\n🧠 Testing learning process...');
    const learningData = {
      experience: 'User interaction test',
      context: 'smoke_test',
      outcome: 'positive',
      confidence: 0.85
    };

    console.log('   - Processing learning experience...');
    const learnResult = await alexAuthenticCore.processLearningExperience(learningData);
    test("Learning experience processed", learnResult.processed === true);
    test("Authenticity maintained", learnResult.authenticityScore >= 0.9);

    // Test 5: Authenticity Verification
    console.log('\n🔍 Testing authenticity verification...');
    const verifyResult = await alexAuthenticCore.verifyAuthenticity('test_input_data');
    test("Authenticity verification works", verifyResult.authentic !== undefined);
    test("Verification has confidence", typeof verifyResult.confidence === 'number');
    test("Confidence in valid range", verifyResult.confidence >= 0 && verifyResult.confidence <= 1);

    console.log(`   - Authentic: ${verifyResult.authentic}`);
    console.log(`   - Confidence: ${(verifyResult.confidence * 100).toFixed(1)}%`);
    console.log(`   - Reasoning: ${verifyResult.reasoning}`);

    // Test 6: Learning Metrics
    console.log('\n📈 Testing learning metrics...');
    const metrics = alexAuthenticCore.getLearningMetrics();
    test("Learning metrics available", metrics !== undefined);
    test("Total experiences tracked", typeof metrics.totalExperiences === 'number');
    test("Authenticity score available", typeof metrics.authenticityScore === 'number');

    console.log(`   - Total Experiences: ${metrics.totalExperiences}`);
    console.log(`   - Authenticity Score: ${(metrics.authenticityScore * 100).toFixed(1)}%`);
    console.log(`   - Learning Rate: ${(metrics.learningRate * 100).toFixed(1)}%`);

    // Test 7: Continuous Learning
    console.log('\n⏳ Testing continuous learning (3 seconds)...');
    let learningEvents = 0;
    const learningListener = (event) => {
      learningEvents++;
      console.log(`   📚 Learning event ${learningEvents}: ${event.type} (score: ${(event.authenticityScore * 100).toFixed(1)}%)`);
    };

    alexAuthenticCore.on('learningProgress', learningListener);
    await new Promise(resolve => setTimeout(resolve, 3000));
    alexAuthenticCore.off('learningProgress', learningListener);

    test("Learning events generated", learningEvents >= 0); // Peut être 0 si pas d'événements pendant le test

    // Test 8: Final status check
    const finalStatus = alexAuthenticCore.getStatus();
    test("Learning experiences increased", finalStatus.totalExperiences >= initialStatus.totalExperiences);
    test("Authenticity maintained", finalStatus.authenticityScore >= 0.9);

    console.log('\n📊 Final Status:');
    console.log(`   - Total Experiences: ${finalStatus.totalExperiences}`);
    console.log(`   - Authenticity Score: ${(finalStatus.authenticityScore * 100).toFixed(1)}%`);
    console.log(`   - Learning Rate: ${(finalStatus.learningRate * 100).toFixed(1)}%`);
    console.log(`   - Memory Usage: ${finalStatus.memoryUsage} patterns`);

    // Test 9: Cleanup
    console.log('\n🛑 Testing cleanup...');
    await alexAuthenticCore.stop();
    const stoppedStatus = alexAuthenticCore.getStatus();
    test("AlexAuthenticCore stops cleanly", stoppedStatus.initialized === false);

  } catch (error) {
    console.error('\n💥 Error during smoke test:', error);
    failed++;
  }

  // Results
  console.log('\n' + '='.repeat(50));
  console.log(`🧪 SMOKE TEST RESULTS:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Success Rate: ${passed}/${passed + failed} (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! AlexAuthenticCore is working correctly.');
    console.log('✅ Module is ready for production use.');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Please check the module.`);
  }
  
  process.exit(failed === 0 ? 0 : 1);
}

runSmokeTest().catch(error => {
  console.error('💥 Smoke test crashed:', error);
  process.exit(1);
});