/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : PEP Stream B — Platform Integration Verification Test Suite
 * File           : tests/pep/stream_b_platform_integration.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const AirRoofersPlatformSuite = require('../../adapters/AirRoofersPlatformSuite');
const PlatformContractValidator = require('../../adapters/PlatformContractValidator');

async function runStreamBTests() {
  console.log('================================================================================');
  console.log('  EAORCS PEP STREAM B: PLATFORM INTEGRATION VERIFICATION SUITE');
  console.log('================================================================================\n');

  const suite = new AirRoofersPlatformSuite({ offlineMode: true });
  const validator = new PlatformContractValidator();

  // Test 1: Platform Suite Health & Initialization
  console.log('[TEST 1] Verifying AirRoofersPlatformSuite Initialization & Health...');
  const health = await suite.checkHealth();
  assert.strictEqual(health.overall, true, 'Overall health must be true');
  assert.strictEqual(health.healthyCount, 8, 'All 8 adapters must report healthy');
  assert.strictEqual(health.totalAdapters, 8, 'Total adapters count must be 8');
  console.log('  ✅ Platform Suite initialized with 8/8 healthy adapters.\n');

  // Test 2: Platform Contract Validation Across All 8 Adapters
  console.log('[TEST 2] Executing PlatformContractValidator across all 8 Adapters...');
  const contractValidation = await validator.validateAllContracts(suite, 'offline');
  assert.strictEqual(contractValidation.success, true, 'Contract validation must pass 100%');
  assert.strictEqual(contractValidation.passedAdapters, 8, 'All 8 adapters must pass contract validation');
  
  const adaptersList = ['identity', 'billing', 'licensing', 'storage', 'telemetry', 'support', 'notifications', 'search'];
  for (const name of adaptersList) {
    const res = contractValidation.results[name];
    assert.strictEqual(res.passed, true, `Adapter contract for ${name} must pass`);
    console.log(`  - Adapter [${name.toUpperCase()}]: Schema Contract Validated (${res.checks.length} checks passed)`);
  }
  console.log('  ✅ 8/8 Adapter Schema Contracts verified.\n');

  // Test 3: End-to-End Suite Integration Execution
  console.log('[TEST 3] Running End-to-End Integration Suite Test...');
  const suiteTestResult = await suite.executeIntegrationSuiteTest();
  assert.strictEqual(suiteTestResult.success, true, 'Integration suite test must pass cleanly');
  assert.strictEqual(suiteTestResult.healthyCount, 8, 'All 8 adapters must complete suite test');
  assert.strictEqual(suiteTestResult.adapterResults.identity.success, true, 'Identity adapter suite test passed');
  assert.strictEqual(suiteTestResult.adapterResults.billing.success, true, 'Billing adapter suite test passed');
  assert.strictEqual(suiteTestResult.adapterResults.licensing.success, true, 'Licensing adapter suite test passed');
  assert.strictEqual(suiteTestResult.adapterResults.storage.success, true, 'Storage adapter suite test passed');
  assert.strictEqual(suiteTestResult.adapterResults.telemetry.success, true, 'Telemetry adapter suite test passed');
  assert.strictEqual(suiteTestResult.adapterResults.support.success, true, 'Support adapter suite test passed');
  assert.strictEqual(suiteTestResult.adapterResults.notifications.success, true, 'Notifications adapter suite test passed');
  assert.strictEqual(suiteTestResult.adapterResults.search.success, true, 'Search adapter suite test passed');
  console.log('  ✅ End-to-End Integration Suite execution verified across all 8 adapters.\n');

  // Test 4: Fallback State Transition Verification
  console.log('[TEST 4] Verifying Fallback State Transitions (Offline <-> Online)...');
  const transitionResult = await validator.verifyFallbackStateTransition(suite);
  assert.strictEqual(transitionResult.success, true, 'Fallback state transition must succeed');
  assert.strictEqual(transitionResult.transitionVerified, true, 'Transition verification flag must be true');
  assert.strictEqual(transitionResult.offlinePassed, true, 'Offline mode contract validation passed');
  assert.strictEqual(transitionResult.onlinePassed, true, 'Online mode contract validation passed');
  assert.strictEqual(transitionResult.restoredOfflinePassed, true, 'Restored offline mode contract validation passed');
  console.log('  ✅ Fallback State Transitions (Offline <-> Online) verified cleanly.\n');

  // Test 5: Detailed Adapter Functionality & Storage Lifecycle Verification
  console.log('[TEST 5] Testing Storage Adapter Lifecycle & Index Search Capabilities...');
  const adapters = suite.getAdapters();
  
  // Storage lifecycle
  const testFile = 'stream_b_test/artifact.json';
  const data = { audit: 'PEP Stream B', score: 100 };
  const writeRes = await adapters.storage.write(testFile, data);
  assert.strictEqual(writeRes.status, 'written');
  
  const readData = await adapters.storage.read(testFile);
  assert.strictEqual(readData.audit, 'PEP Stream B');
  assert.strictEqual(readData.score, 100);

  const exists = await adapters.storage.exists(testFile);
  assert.strictEqual(exists, true);

  await adapters.storage.delete(testFile);
  const existsAfterDelete = await adapters.storage.exists(testFile);
  assert.strictEqual(existsAfterDelete, false);
  console.log('  ✅ Storage Adapter full CRUD lifecycle verified.\n');

  // Search indexing
  console.log('[TEST 6] Testing Search Adapter Multi-Collection Indexing & Querying...');
  await adapters.search.indexOsapPassport({ id: 'pass_b_001', name: 'Stream B Trust Passport', score: 100 });
  await adapters.search.indexAuditLog({ id: 'audit_b_001', event: 'Stream B Audit', status: 'PASSED' });
  await adapters.search.indexTrustGraphNode({ id: 'node_b_001', label: 'Stream B Node' });

  const passportSearchResults = await adapters.search.searchCollection('osap_passports', 'Stream B');
  assert.strictEqual(passportSearchResults.length, 1);
  assert.strictEqual(passportSearchResults[0].id, 'pass_b_001');

  const globalSearchResults = await adapters.search.globalSearch('Stream B');
  assert.strictEqual(globalSearchResults.length, 3, 'Global search must return matches from all 3 collections');
  console.log('  ✅ Search Adapter multi-collection indexing & global search verified.\n');

  console.log('================================================================================');
  console.log('  🎉 PEP STREAM B PLATFORM INTEGRATION SUITE: PASSED 100% CLEANLY');
  console.log('================================================================================\n');
}

runStreamBTests().catch(err => {
  console.error('❌ PEP STREAM B TEST SUITE FAILED:', err);
  process.exit(1);
});
