/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Air Roofers Ecosystem Conformance Test Suite
 * File           : ecosystem_conformance.test.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Platform Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Air Roofers Product Development Standard Verified
 * - Air Roofers API Matrix Verified
 * - Air Roofers Product Integration Guide Verified
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');

async function runEcosystemConformanceSuite() {
  console.log('\n=== AIR ROOFERS ECOSYSTEM CONFORMANCE SUITE ===\n');
  let passed = 0;
  let failed = 0;

  // 1. Ecosystem Conformance Engine Test
  try {
    const EcosystemConformanceEngine = require('../../engine/ecosystem/EcosystemConformanceEngine');
    const engine = new EcosystemConformanceEngine();

    const auditReport = engine.runFullEcosystemAudit();
    assert.strictEqual(auditReport.overallStatus, 'ECOSYSTEM_CONFORMANT');
    assert.strictEqual(auditReport.conformanceScore, 100);
    assert.strictEqual(auditReport.sections.apiMatrix.compliant, true);
    assert.strictEqual(auditReport.sections.productIntegration.compliant, true);
    assert.strictEqual(auditReport.sections.boundedContextIsolation.compliant, true);
    assert.strictEqual(auditReport.sections.sdkDuplication.compliant, true);
    assert.strictEqual(auditReport.sections.platformAcceptanceGate.passed, true);

    console.log('✅ 1. EcosystemConformanceEngine PASSED (100% Conformance)');
    passed++;
  } catch (err) {
    console.error('❌ 1. EcosystemConformanceEngine FAILED:', err.message);
    failed++;
  }

  // 2. Platform Dependency Graph Engine Test
  try {
    const PlatformDependencyGraphEngine = require('../../engine/ecosystem/PlatformDependencyGraphEngine');
    const graphEngine = new PlatformDependencyGraphEngine();

    const driftReport = graphEngine.detectArchitecturalDrift();
    assert.strictEqual(driftReport.clean, true);
    assert.strictEqual(driftReport.status, 'GRAPH_HEALTHY');
    assert.strictEqual(driftReport.unapprovedDependenciesCount, 0);
    assert.strictEqual(driftReport.circularDependenciesCount, 0);

    const summary = graphEngine.getGraphSummary();
    assert.ok(summary.totalNodes >= 9);
    assert.ok(summary.totalEdges >= 5);

    console.log('✅ 2. PlatformDependencyGraphEngine PASSED (Graph Healthy, Zero Drift)');
    passed++;
  } catch (err) {
    console.error('❌ 2. PlatformDependencyGraphEngine FAILED:', err.message);
    failed++;
  }

  // 3. Negative Test: Unapproved Dependency Detection
  try {
    const PlatformDependencyGraphEngine = require('../../engine/ecosystem/PlatformDependencyGraphEngine');
    const graphEngine = new PlatformDependencyGraphEngine();

    // Register an unapproved direct coupling between two products (e.g. EAORCS directly coupling to CiviScore DB)
    graphEngine.registerDependency('eaorcs-kernel', 'civiscore-capability', 'DIRECT_DB_COUPLING', false);

    const driftReport = graphEngine.detectArchitecturalDrift();
    assert.strictEqual(driftReport.clean, false);
    assert.strictEqual(driftReport.status, 'DRIFT_DETECTED');
    assert.strictEqual(driftReport.unapprovedDependenciesCount, 1);

    console.log('✅ 3. Unapproved Dependency Drift Detection PASSED (Correctly Flagged Drift)');
    passed++;
  } catch (err) {
    console.error('❌ 3. Unapproved Dependency Drift Detection FAILED:', err.message);
    failed++;
  }

  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} AIR ROOFERS ECOSYSTEM CONFORMANCE TESTS PASSED!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runEcosystemConformanceSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runEcosystemConformanceSuite };
