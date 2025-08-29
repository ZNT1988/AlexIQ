#!/usr/bin/env node

/**
 * 🧪 SMOKE TEST - OwnerIdentity Core
 * Test de validation pour vérifier que OwnerIdentity fonctionne correctement
 */

import ownerIdentity from './alex-modules/core/OwnerIdentity.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 STARTING OwnerIdentity Smoke Test...\n');

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
    test("OwnerIdentity module imports correctly", ownerIdentity !== undefined);
    test("OwnerIdentity is instance of OwnerIdentity", ownerIdentity.constructor.name === 'OwnerIdentity');

    console.log('\n📊 Initial Status Check:');
    const initialStatus = ownerIdentity.getStatus();
    console.log(`   - Initialized: ${initialStatus.initialized}`);
    console.log(`   - Owner Authenticated: ${initialStatus.ownerAuthenticated}`);
    console.log(`   - Security Level: ${initialStatus.securityLevel}`);

    // Test 2: Initialization
    console.log('\n🔄 Initializing OwnerIdentity...');
    const initResult = await ownerIdentity.initialize();
    test("OwnerIdentity initializes successfully", initResult.success === true);
    test("Database is initialized", initResult.databaseInitialized === true);

    // Test 3: Status after init
    const postInitStatus = ownerIdentity.getStatus();
    test("OwnerIdentity is initialized", postInitStatus.initialized === true);
    test("Security level is set", postInitStatus.securityLevel === 'high');

    // Test 4: Identity Management
    console.log('\n👤 Testing identity management...');
    const testProfile = {
      name: 'Test Owner',
      email: 'test@hustlefinder.ai',
      role: 'owner',
      permissions: ['full_access', 'admin']
    };

    console.log('   - Creating test identity...');
    const createResult = await ownerIdentity.createOwnerIdentity(testProfile, 'test_secure_key_123');
    test("Owner identity created", createResult.success === true);
    test("Identity has ID", createResult.identityId !== undefined);

    // Test 5: Authentication
    console.log('\n🔐 Testing authentication...');
    const authResult = await ownerIdentity.authenticateOwner(createResult.identityId, 'test_secure_key_123');
    test("Owner authentication succeeds", authResult.success === true);
    test("Valid session created", authResult.sessionId !== undefined);
    test("Session has expiration", authResult.expiresAt !== undefined);

    console.log(`   - Session ID: ${authResult.sessionId?.substring(0, 8)}...`);
    console.log(`   - Expires: ${new Date(authResult.expiresAt).toLocaleString()}`);

    // Test 6: Session Validation
    console.log('\n🎫 Testing session validation...');
    const sessionCheck = ownerIdentity.validateSession(authResult.sessionId);
    test("Session validation works", sessionCheck.valid === true);
    test("Session has owner ID", sessionCheck.ownerId !== undefined);

    // Test 7: Permissions
    console.log('\n🛡️ Testing permissions...');
    const hasFullAccess = ownerIdentity.hasPermission(authResult.sessionId, 'full_access');
    const hasAdminAccess = ownerIdentity.hasPermission(authResult.sessionId, 'admin');
    const hasInvalidPerm = ownerIdentity.hasPermission(authResult.sessionId, 'invalid_permission');

    test("Full access permission granted", hasFullAccess === true);
    test("Admin permission granted", hasAdminAccess === true);
    test("Invalid permission denied", hasInvalidPerm === false);

    // Test 8: Identity Retrieval
    console.log('\n📋 Testing identity retrieval...');
    const retrievedIdentity = await ownerIdentity.getOwnerIdentity(createResult.identityId);
    test("Identity retrieval works", retrievedIdentity.success === true);
    test("Retrieved identity matches", retrievedIdentity.identity.name === testProfile.name);
    test("Sensitive data not exposed", retrievedIdentity.identity.secureKey === undefined);

    // Test 9: Final status check
    const finalStatus = ownerIdentity.getStatus();
    test("Owner is authenticated", finalStatus.ownerAuthenticated === true);
    test("Active sessions exist", finalStatus.activeSessions > 0);

    console.log('\n📊 Final Status:');
    console.log(`   - Total Identities: ${finalStatus.totalIdentities}`);
    console.log(`   - Active Sessions: ${finalStatus.activeSessions}`);
    console.log(`   - Security Events: ${finalStatus.securityEvents}`);
    console.log(`   - Last Activity: ${finalStatus.lastActivity}`);

    // Test 10: Cleanup
    console.log('\n🛑 Testing cleanup...');
    await ownerIdentity.stop();
    const stoppedStatus = ownerIdentity.getStatus();
    test("OwnerIdentity stops cleanly", stoppedStatus.initialized === false);

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
    console.log('\n🎉 ALL TESTS PASSED! OwnerIdentity is working correctly.');
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