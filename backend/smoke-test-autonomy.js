#!/usr/bin/env node

/**
 * 🧪 SMOKE TEST - AutonomyCore v2.0.2
 * Test de validation pour vérifier que AutonomyCore fonctionne correctement
 */

import autonomyCore from './alex-modules/core/AutonomyCore.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 STARTING AutonomyCore Smoke Test...\n');

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
    test("AutonomyCore module imports correctly", autonomyCore !== undefined);
    test("AutonomyCore is instance of AutonomyCore", autonomyCore.constructor.name === 'AutonomyCore');

    console.log('\n📊 Initial Status Check:');
    const initialStatus = autonomyCore.getAutonomyStatus();
    console.log(`   - Initialized: ${initialStatus.initialized}`);
    console.log(`   - Independence Level: ${initialStatus.independenceLevel}`);
    console.log(`   - Total Decisions: ${initialStatus.totalDecisions}`);

    // Test 2: Initialization
    console.log('\n🔄 Initializing AutonomyCore...');
    const initResult = await autonomyCore.initialize();
    test("AutonomyCore initializes successfully", initResult.status === 'initialized');
    test("Independence level is set", initResult.autonomyLevel > 0);

    // Test 3: Status after init
    const postInitStatus = autonomyCore.getAutonomyStatus();
    test("AutonomyCore is initialized", postInitStatus.initialized === true);
    test("Independence level is high", postInitStatus.independenceLevel >= 0.9);

    console.log('\n🧠 Testing autonomous thinking...');
    
    // Test 4: Decision Making
    console.log('   - Making test decision...');
    const testContext = {
      id: 'test-context',
      priority: 'high',
      category: 'test',
      systemLoad: process.memoryUsage(),
      activeProcesses: 1,
      timestamp: new Date()
    };
    
    const decision = autonomyCore.makeAutonomousDecision(testContext);
    test("Decision is generated", decision !== undefined);
    test("Decision has ID", decision.id !== undefined);
    test("Decision has timestamp", decision.timestamp instanceof Date);
    test("Decision has confidence", typeof decision.confidence === 'number');
    test("Confidence is valid range", decision.confidence >= 0 && decision.confidence <= 1);

    console.log(`   - Decision: ${decision.decision}`);
    console.log(`   - Confidence: ${(decision.confidence * 100).toFixed(1)}%`);
    console.log(`   - Strategy: ${decision.strategy}`);

    // Test 5: Attendre quelques pensées autonomes
    console.log('\n⏳ Waiting for autonomous thoughts (5 seconds)...');
    let thoughtsReceived = 0;
    const thoughtListener = (thought) => {
      thoughtsReceived++;
      console.log(`   💭 Thought ${thoughtsReceived}: ${thought.strategy} (confidence: ${(thought.context.confidence * 100).toFixed(1)}%)`);
    };

    autonomyCore.on('autonomousThought', thoughtListener);

    await new Promise(resolve => setTimeout(resolve, 5500));
    autonomyCore.off('autonomousThought', thoughtListener);

    test("Autonomous thoughts are generated", thoughtsReceived > 0);
    test("Multiple thoughts generated", thoughtsReceived >= 1);

    // Test 6: Final status check
    const finalStatus = autonomyCore.getAutonomyStatus();
    test("Decisions were recorded", finalStatus.totalDecisions > initialStatus.totalDecisions);
    test("Autonomy rate is high", finalStatus.autonomyRate >= 0.95);

    console.log('\n📊 Final Status:');
    console.log(`   - Total Decisions: ${finalStatus.totalDecisions}`);
    console.log(`   - Autonomous Decisions: ${finalStatus.autonomousDecisions}`);
    console.log(`   - Autonomy Rate: ${(finalStatus.autonomyRate * 100).toFixed(1)}%`);
    console.log(`   - Average Confidence: ${(finalStatus.averageConfidence * 100).toFixed(1)}%`);
    console.log(`   - Recent Thoughts: ${finalStatus.recentThoughts?.length || 0}`);

    // Test 7: Cleanup
    console.log('\n🛑 Testing cleanup...');
    await autonomyCore.stop();
    const stoppedStatus = autonomyCore.getAutonomyStatus();
    test("AutonomyCore stops cleanly", stoppedStatus.initialized === false);

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
    console.log('\n🎉 ALL TESTS PASSED! AutonomyCore is working correctly.');
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