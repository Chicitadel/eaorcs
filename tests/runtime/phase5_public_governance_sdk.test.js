/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Public Governance SDK Test Suite
 * File           : phase5_public_governance_sdk.test.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Platform Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');

async function runPublicGovernanceSdkSuite() {
  console.log('\n=== PHASE 5: Public Governance SDK (@airroofers/governance-sdk) Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  // 1. PublicGovernanceSdk Verification
  try {
    const PublicGovernanceSdk = require('../../sdk/PublicGovernanceSdk');
    const sdk = new PublicGovernanceSdk();

    const status = sdk.getSdkStatus();
    assert.strictEqual(status.sdkName, '@airroofers/governance-sdk');
    assert.strictEqual(status.version, '2026.3.0-LTS');
    assert.strictEqual(status.kernelStatus, 'FEATURE_COMPLETE_AND_FROZEN');

    // Test Policy Evaluation
    const policyResult = sdk.evaluatePolicy({ specVersion: '2026.3.0-LTS', passportSignature: 'a'.repeat(64), federationScore: 100 });
    assert.strictEqual(policyResult.status, 'PERMITTED');

    // Test Provenance Query
    const provResult = sdk.queryProvenance('CAP-TRUST-SCORE');
    assert.strictEqual(provResult.found, true);

    // Test Digital Passport Generation
    const passport = sdk.generateReleasePassport({ tests: '50/50 PASSED' });
    assert.strictEqual(passport.version, '2026.3.0-LTS');

    // Test Governance Scorecard Retrieval
    const scorecard = sdk.getGovernanceScorecard();
    assert.strictEqual(scorecard.overallStatus, 'GOVERNANCE_EXCELLENCE_PASS');

    // Test Registering Custom Solution Pack
    const packReg = sdk.registerSolutionPack({
      id: 'pack-fintech-v1',
      name: 'Financial Services Governance Pack',
      version: '1.0.0',
    });
    assert.strictEqual(packReg.status, 'PACK_REGISTERED');
    assert.strictEqual(packReg.packId, 'pack-fintech-v1');

    console.log('✅ 1. PublicGovernanceSdk PASSED (All 5 Public SDK Interfaces Verified & Solution Pack Registered)');
    passed++;
  } catch (err) {
    console.error('❌ 1. PublicGovernanceSdk FAILED:', err.message);
    failed++;
  }

  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} PUBLIC GOVERNANCE SDK TESTS PASSED!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runPublicGovernanceSdkSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runPublicGovernanceSdkSuite };
