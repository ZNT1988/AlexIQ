// Test des vraies APIs sans fake
import 'dotenv/config';
import { callOpenAI } from './services/openai.js';
import { callAnthropic } from './services/anthropic.js';
import { callGoogle } from './services/google.js';

console.log('🧪 Test des vraies APIs - AUCUN FAKE');
console.log('================================');

const testMessage = "Explique en une phrase ce qu'est l'intelligence artificielle";

async function testAllAPIs() {
  console.log(`📝 Message test: "${testMessage}"`);
  console.log('\n🔄 Test des 3 APIs en parallèle...\n');

  // Test en parallèle pour performance
  const [openaiResult, anthropicResult, googleResult] = await Promise.allSettled([
    callOpenAI(testMessage),
    callAnthropic(testMessage), 
    callGoogle(testMessage)
  ]);

  // Résultats OpenAI
  console.log('🤖 OPENAI RESULT:');
  if (openaiResult.status === 'fulfilled') {
    console.log('✅ SUCCESS:', openaiResult.value.substring(0, 100) + '...');
  } else {
    console.log('❌ ERROR:', openaiResult.reason);
  }

  // Résultats Anthropic
  console.log('\n🧠 ANTHROPIC RESULT:');
  if (anthropicResult.status === 'fulfilled') {
    console.log('✅ SUCCESS:', anthropicResult.value.substring(0, 100) + '...');
  } else {
    console.log('❌ ERROR:', anthropicResult.reason);
  }

  // Résultats Google
  console.log('\n🌐 GOOGLE RESULT:');
  if (googleResult.status === 'fulfilled') {
    console.log('✅ SUCCESS:', googleResult.value.substring(0, 100) + '...');
  } else {
    console.log('❌ ERROR:', googleResult.reason);
  }

  console.log('\n🎯 RÉSUMÉ:');
  console.log(`OpenAI: ${openaiResult.status === 'fulfilled' ? '✅ OK' : '❌ FAIL'}`);
  console.log(`Anthropic: ${anthropicResult.status === 'fulfilled' ? '✅ OK' : '❌ FAIL'}`);
  console.log(`Google: ${googleResult.status === 'fulfilled' ? '✅ OK' : '❌ FAIL'}`);
}

testAllAPIs().catch(console.error);