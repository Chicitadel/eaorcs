/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Operational Correctness Test Suite
 * File           : phase5_operational_correctness.test.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Governance Authority
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

async function runOperationalCorrectnessSuite() {
  console.log('\n=== PHASE 5: Operational Correctness & SDK Consumer Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  // 1. EndToEndPipelineVerifierEngine Verification
  try {
    const EndToEndPipelineVerifierEngine = require('../../engine/governance/EndToEndPipelineVerifierEngine');
    const verifier = new EndToEndPipelineVerifierEngine();

    const result = verifier.verifyOperationalCorrectness();
    assert.strictEqual(result.status, 'OPERATIONAL_CORRECTNESS_VERIFIED');
    assert.strictEqual(result.allPillarsConformant, true);
    assert.strictEqual(result.verifiedPillarsCount, 6);

    console.log('✅ 1. EndToEndPipelineVerifierEngine PASSED (All 6 Operational Pillars Verified)');
    passed++;
  } catch (err) {
    console.error('❌ 1. EndToEndPipelineVerifierEngine FAILED:', err.message);
    failed++;
  }

  // 2. Clean External Consumer Demo Verification
  try {
    const { runExternalConsumerDemo } = require('../../sdk/examples/clean_external_consumer_sample');
    const demoResult = runExternalConsumerDemo();

    assert.strictEqual(demoResult.success, true);
    assert.strictEqual(demoResult.policyResult.status, 'PERMITTED');
    assert.strictEqual(demoResult.packResult.status, 'PACK_REGISTERED');

    console.log('✅ 2. Clean External Consumer Sample PASSED (@airroofers/governance-sdk Integration Verified)');
    passed++;
  } catch (err) {
    console.error('❌ 2. Clean External Consumer Sample FAILED:', err.message);
    failed++;
  }

  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} OPERATIONAL CORRECTNESS TESTS PASSED!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runOperationalCorrectnessSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runOperationalCorrectnessSuite };
