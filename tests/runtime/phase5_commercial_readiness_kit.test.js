/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Commercial Readiness Execution Kit Test Suite
 * File           : phase5_commercial_readiness_kit.test.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Commercial Execution Authority
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

async function runCommercialReadinessKitSuite() {
  console.log('\n=== PHASE 5: Commercial Readiness Execution Kit Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  // 1. CommercialLaunchKitEngine Verification
  try {
    const CommercialLaunchKitEngine = require('../../engine/commercial/CommercialLaunchKitEngine');
    const kitEngine = new CommercialLaunchKitEngine();

    const pkg = kitEngine.generateCommercialExecutionPackage();
    assert.strictEqual(pkg.version, '2026.3.0-LTS');
    assert.strictEqual(pkg.prioritiesStatus.length, 8);
    assert.strictEqual(pkg.overallReadinessPct, 85);
    assert.ok(pkg.fundingModel.includes('EAORCS SaaS Revenue Funds CiviScore'));

    console.log('✅ 1. CommercialLaunchKitEngine PASSED (8 Priorities Orchestrated & Funding Strategy Ratified)');
    passed++;
  } catch (err) {
    console.error('❌ 1. CommercialLaunchKitEngine FAILED:', err.message);
    failed++;
  }

  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} COMMERCIAL READINESS KIT TESTS PASSED!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runCommercialReadinessKitSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runCommercialReadinessKitSuite };
