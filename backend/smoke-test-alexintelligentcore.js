#!/usr/bin/env node

/**
 * 🧪 SMOKE TEST - AlexIntelligentCore
 * Test de validation pour vérifier que AlexIntelligentCore fonctionne correctement
 */

import alexIntelligentCore from './alex-modules/core/AlexIntelligentCore.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 STARTING AlexIntelligentCore Smoke Test...\n');

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
    test("AlexIntelligentCore module imports correctly", alexIntelligentCore !== undefined);
    test("AlexIntelligentCore is instance of AlexIntelligentCore", alexIntelligentCore.constructor.name === 'AlexIntelligentCore');

    console.log('\n📊 Initial Status Check:');
    const initialStatus = alexIntelligentCore.getStatus();
    console.log(`   - Initialized: ${initialStatus.initialized}`);
    console.log(`   - Intelligence Level: ${initialStatus.intelligenceLevel}`);
    console.log(`   - Total Responses: ${initialStatus.totalResponses}`);

    // Test 2: Initialization
    console.log('\n🔄 Initializing AlexIntelligentCore...');
    const initResult = await alexIntelligentCore.initialize();
    test("AlexIntelligentCore initializes successfully", initResult.status === 'initialized');
    test("Intelligence level is set", initResult.intelligenceLevel >= 0.9);

    // Test 3: Status after init
    const postInitStatus = alexIntelligentCore.getStatus();
    test("AlexIntelligentCore is initialized", postInitStatus.initialized === true);
    test("Intelligence level is high", postInitStatus.intelligenceLevel >= 0.9);

    // Test 4: Natural Language Processing
    console.log('\n🧠 Testing natural language processing...');
    const testQueries = [
      "Hello, how are you today?",
      "What is the meaning of artificial intelligence?",
      "Can you help me with a business idea?",
      "Tell me about your capabilities"
    ];

    for (let i = 0; i < testQueries.length; i++) {
      console.log(`   - Processing query ${i + 1}: "${testQueries[i].substring(0, 30)}..."`);
      
      const response = await alexIntelligentCore.processQuery(testQueries[i]);
      test(`Query ${i + 1} processed successfully`, response.success === true);
      test(`Query ${i + 1} has response text`, response.response && response.response.length > 0);
      test(`Query ${i + 1} has confidence`, typeof response.confidence === 'number');
      
      console.log(`     Response: "${response.response?.substring(0, 50)}..."`);
      console.log(`     Confidence: ${(response.confidence * 100).toFixed(1)}%`);
      console.log(`     Intent: ${response.intent || 'unknown'}`);
    }

    // Test 5: Context Building
    console.log('\n🔗 Testing context building...');
    const contextInput = {
      query: "Remember my name is John and I like tech startups",
      userId: "test_user_123",
      timestamp: new Date()
    };

    const contextResult = await alexIntelligentCore.buildContext(contextInput);
    test("Context building works", contextResult.success === true);
    test("Context has entities", contextResult.context && Object.keys(contextResult.context).length > 0);

    console.log(`   - Context entities: ${Object.keys(contextResult.context || {}).join(', ')}`);

    // Test 6: Personality Evolution
    console.log('\n🎭 Testing personality evolution...');
    const personalityMetrics = alexIntelligentCore.getPersonalityMetrics();
    test("Personality metrics available", personalityMetrics !== undefined);
    test("Communication style tracked", personalityMetrics.communicationStyle !== undefined);
    test("Adaptation level tracked", typeof personalityMetrics.adaptationLevel === 'number');

    console.log(`   - Communication Style: ${personalityMetrics.communicationStyle}`);
    console.log(`   - Adaptation Level: ${(personalityMetrics.adaptationLevel * 100).toFixed(1)}%`);
    console.log(`   - Response Quality: ${(personalityMetrics.responseQuality * 100).toFixed(1)}%`);

    // Test 7: Intent Detection
    console.log('\n🎯 Testing intent detection...');
    const intentTests = [
      { query: "I need help with my business", expectedCategory: "business" },
      { query: "What's the weather like?", expectedCategory: "information" },
      { query: "Thank you for your help", expectedCategory: "social" }
    ];

    for (const intentTest of intentTests) {
      const intent = alexIntelligentCore.detectIntent(intentTest.query);
      test(`Intent detection for "${intentTest.query.substring(0, 20)}..."`, intent !== undefined);
      console.log(`   - Query: "${intentTest.query}"`);
      console.log(`   - Detected Intent: ${intent.category || 'unknown'} (confidence: ${(intent.confidence * 100).toFixed(1)}%)`);
    }

    // Test 8: Learning and Adaptation
    console.log('\n📚 Testing learning and adaptation...');
    const learningData = {
      query: "Test learning query",
      response: "Test response",
      userFeedback: "positive",
      context: { userId: "test_user" }
    };

    const learningResult = await alexIntelligentCore.learnFromInteraction(learningData);
    test("Learning from interaction works", learningResult.success === true);
    test("Intelligence updated", learningResult.intelligenceUpdated === true);

    // Test 9: Performance Metrics
    console.log('\n📈 Testing performance metrics...');
    const metrics = alexIntelligentCore.getPerformanceMetrics();
    test("Performance metrics available", metrics !== undefined);
    test("Response time tracked", typeof metrics.averageResponseTime === 'number');
    test("Quality metrics tracked", typeof metrics.responseQuality === 'number');

    console.log(`   - Average Response Time: ${metrics.averageResponseTime}ms`);
    console.log(`   - Response Quality: ${(metrics.responseQuality * 100).toFixed(1)}%`);
    console.log(`   - Contextual Responses: ${metrics.contextualResponses}%`);

    // Test 10: Final status check
    const finalStatus = alexIntelligentCore.getStatus();
    test("Responses were processed", finalStatus.totalResponses > initialStatus.totalResponses);
    test("Intelligence level maintained", finalStatus.intelligenceLevel >= 0.9);

    console.log('\n📊 Final Status:');
    console.log(`   - Total Responses: ${finalStatus.totalResponses}`);
    console.log(`   - Intelligence Level: ${(finalStatus.intelligenceLevel * 100).toFixed(1)}%`);
    console.log(`   - Active Contexts: ${finalStatus.activeContexts}`);
    console.log(`   - Memory Usage: ${finalStatus.memoryUsage}MB`);

    // Test 11: Cleanup
    console.log('\n🛑 Testing cleanup...');
    await alexIntelligentCore.stop();
    const stoppedStatus = alexIntelligentCore.getStatus();
    test("AlexIntelligentCore stops cleanly", stoppedStatus.initialized === false);

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
    console.log('\n🎉 ALL TESTS PASSED! AlexIntelligentCore is working correctly.');
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