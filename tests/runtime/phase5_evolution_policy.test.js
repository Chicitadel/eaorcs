/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Phase 5 Evolution Policy Test Suite
 * File           : phase5_evolution_policy.test.js
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
const fs = require('fs');
const path = require('path');

async function runPhase5EvolutionSuite() {
  console.log('\n=== PHASE 5: Platform Evolution Policy Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  // 1. PLATFORM_EVOLUTION_POLICY.md Existence & Verification
  try {
    const policyPath = path.join(__dirname, '../../PLATFORM_EVOLUTION_POLICY.md');
    assert.ok(fs.existsSync(policyPath), 'PLATFORM_EVOLUTION_POLICY.md must exist');

    const content = fs.readFileSync(policyPath, 'utf-8');
    assert.ok(content.includes('Category A: ALLOWED'));
    assert.ok(content.includes('Category B: REQUIRES ARB APPROVAL'));
    assert.ok(content.includes('Category C: PROHIBITED'));

    console.log('✅ 1. PLATFORM_EVOLUTION_POLICY.md Document Verified');
    passed++;
  } catch (err) {
    console.error('❌ 1. PLATFORM_EVOLUTION_POLICY.md Verification FAILED:', err.message);
    failed++;
  }

  // 2. PlatformEvolutionPolicyValidator Engine Test
  try {
    const PlatformEvolutionPolicyValidator = require('../../engine/governance/PlatformEvolutionPolicyValidator');
    const validator = new PlatformEvolutionPolicyValidator();

    // Allowed change (New connector)
    const res1 = validator.evaluateChange({ type: 'NEW_CONNECTOR' });
    assert.strictEqual(res1.category, 'ALLOWED');
    assert.strictEqual(res1.allowed, true);

    // Requires ARB Approval change (Boot sequence modification without token)
    const res2 = validator.evaluateChange({ type: 'BOOT_SEQUENCE_MODIFICATION' });
    assert.strictEqual(res2.category, 'REQUIRES_ARB_APPROVAL');
    assert.strictEqual(res2.allowed, false);

    // Requires ARB Approval with valid token
    const res3 = validator.evaluateChange({ type: 'BOOT_SEQUENCE_MODIFICATION', arbApprovalToken: 'arb-token-123' });
    assert.strictEqual(res3.category, 'REQUIRES_ARB_APPROVAL');
    assert.strictEqual(res3.allowed, true);

    // Prohibited change (Shadow identity)
    const res4 = validator.evaluateChange({ type: 'SHADOW_IDENTITY' });
    assert.strictEqual(res4.category, 'PROHIBITED');
    assert.strictEqual(res4.allowed, false);

    console.log('✅ 2. PlatformEvolutionPolicyValidator Engine PASSED (Allowed, ARB Approval & Prohibited Correctly Classified)');
    passed++;
  } catch (err) {
    console.error('❌ 2. PlatformEvolutionPolicyValidator Engine FAILED:', err.message);
    failed++;
  }

  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} PHASE 5 EVOLUTION POLICY TESTS PASSED!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runPhase5EvolutionSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runPhase5EvolutionSuite };
