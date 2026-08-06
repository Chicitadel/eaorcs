/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Specification Registry & Drift Detector Test Suite
 * File           : phase5_specification_drift.test.js
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

async function runSpecificationDriftSuite() {
  console.log('\n=== PHASE 5: Specification Registry & Drift Detector Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  // 1. SpecificationRegistry Verification
  try {
    const SpecificationRegistry = require('../../engine/governance/SpecificationRegistry');
    const registry = new SpecificationRegistry();

    const specs = registry.getAllSpecifications();
    assert.strictEqual(specs.length, 4);

    const status = registry.getFoundationStatus();
    assert.strictEqual(status.foundationFrozen, true);
    assert.strictEqual(status.capabilityExtensionsActive, true);
    assert.strictEqual(status.commercialEvolutionActive, true);
    assert.strictEqual(status.masterVersion, '2026.3.0-LTS');

    console.log('✅ 1. SpecificationRegistry PASSED (Foundation Frozen & Specification Metadata Verified)');
    passed++;
  } catch (err) {
    console.error('❌ 1. SpecificationRegistry FAILED:', err.message);
    failed++;
  }

  // 2. SpecificationDriftDetectorEngine & Documentation Coverage Gates
  try {
    const SpecificationDriftDetectorEngine = require('../../engine/governance/SpecificationDriftDetectorEngine');
    const detector = new SpecificationDriftDetectorEngine();

    // Test clean modules
    const cleanEval = detector.evaluateImplementationDrift([
      { name: 'SoftwareTrustKernel', implementsVersion: '2026.3.0-LTS' },
      { name: 'PlatformServiceAdapters', implementsVersion: '2026.3.0-LTS' },
    ]);
    assert.strictEqual(cleanEval.driftDetected, false);
    assert.strictEqual(cleanEval.status, 'SPECIFICATION_CONFORMANT');

    // Test drifted module
    const driftedEval = detector.evaluateImplementationDrift([
      { name: 'DriftedEngine', implementsVersion: '2.0.0-DEPRECATED' },
    ]);
    assert.strictEqual(driftedEval.driftDetected, true);
    assert.strictEqual(driftedEval.status, 'SPECIFICATION_DRIFT_DETECTED');

    // Test Documentation Coverage
    const docEval = detector.evaluateDocumentationCoverage();
    assert.strictEqual(docEval.status, 'DOCUMENTATION_GATES_PASSED');
    assert.strictEqual(docEval.apiReferenceCoveragePct, 100);

    console.log('✅ 2. SpecificationDriftDetectorEngine PASSED (Implementation Drift & Doc Gates Verified)');
    passed++;
  } catch (err) {
    console.error('❌ 2. SpecificationDriftDetectorEngine FAILED:', err.message);
    failed++;
  }

  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} SPECIFICATION DRIFT TESTS PASSED!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runSpecificationDriftSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runSpecificationDriftSuite };
