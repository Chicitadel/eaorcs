/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Governance Graph & Scorecard Test Suite
 * File           : phase5_governance_graph_and_scorecard.test.js
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

async function runGovernanceGraphAndScorecardSuite() {
  console.log('\n=== PHASE 5: Governance Graph, ADR Engine & Scorecard Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  // 1. ArchitectureDecisionRegistryEngine Verification
  try {
    const ArchitectureDecisionRegistryEngine = require('../../engine/governance/ArchitectureDecisionRegistryEngine');
    const adrEngine = new ArchitectureDecisionRegistryEngine();

    const adr1 = adrEngine.getAdr('ADR-001');
    assert.strictEqual(adr1.status, 'RATIFIED_AND_FROZEN');
    assert.strictEqual(adr1.release, '2026.3.0-LTS');

    const adrs = adrEngine.getAllAdrs();
    assert.strictEqual(adrs.length, 7);

    const verification = adrEngine.verifyAdrCompliance();
    assert.strictEqual(verification.allFrozen, true);

    console.log('✅ 1. ArchitectureDecisionRegistryEngine PASSED (ADR-001 through ADR-007 Verified & Ratified)');
    passed++;
  } catch (err) {
    console.error('❌ 1. ArchitectureDecisionRegistryEngine FAILED:', err.message);
    failed++;
  }

  // 2. SpecificationDependencyGraphEngine Verification
  try {
    const SpecificationDependencyGraphEngine = require('../../engine/governance/SpecificationDependencyGraphEngine');
    const graphEngine = new SpecificationDependencyGraphEngine();

    const graph = graphEngine.generateTraceabilityGraph();
    assert.strictEqual(graph.bidirectionalTraceabilityVerified, true);
    assert.ok(graph.totalNodes >= 11);
    assert.strictEqual(graph.totalEdges, 7);

    console.log('✅ 2. SpecificationDependencyGraphEngine PASSED (Bidirectional Specification Traceability Graph Verified)');
    passed++;
  } catch (err) {
    console.error('❌ 2. SpecificationDependencyGraphEngine FAILED:', err.message);
    failed++;
  }

  // 3. GovernanceScorecardEngine Verification
  try {
    const GovernanceScorecardEngine = require('../../engine/governance/GovernanceScorecardEngine');
    const scorecardEngine = new GovernanceScorecardEngine();

    const scorecard = scorecardEngine.generateGovernanceScorecard();
    assert.strictEqual(scorecard.version, '2026.3.0-LTS');
    assert.ok(scorecard.compositeGovernanceScore >= 95);
    assert.strictEqual(scorecard.overallStatus, 'GOVERNANCE_EXCELLENCE_PASS');
    assert.strictEqual(scorecard.dimensions.length, 8);

    console.log('✅ 3. GovernanceScorecardEngine PASSED (Composite Governance Score >= 95, Status PASS)');
    passed++;
  } catch (err) {
    console.error('❌ 3. GovernanceScorecardEngine FAILED:', err.message);
    failed++;
  }

  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} GOVERNANCE GRAPH & SCORECARD TESTS PASSED!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runGovernanceGraphAndScorecardSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runGovernanceGraphAndScorecardSuite };
