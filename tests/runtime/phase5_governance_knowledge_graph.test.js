/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Governance Knowledge Graph & Passport Test Suite
 * File           : phase5_governance_knowledge_graph.test.js
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
const fs = require('fs');
const path = require('path');

async function runGovernanceKnowledgeGraphSuite() {
  console.log('\n=== PHASE 5: Governance Knowledge Graph & Release Passport Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  // 1. GovernanceKnowledgeGraphEngine Verification
  try {
    const GovernanceKnowledgeGraphEngine = require('../../engine/governance/GovernanceKnowledgeGraphEngine');
    const graphEngine = new GovernanceKnowledgeGraphEngine();

    const graph = graphEngine.generateGovernanceGraph();
    assert.strictEqual(graph.isKnowledgeGraphUnified, true);
    assert.ok(graph.totalNodes >= 8);
    assert.ok(graph.totalEdges >= 4);

    console.log('✅ 1. GovernanceKnowledgeGraphEngine PASSED (Unified Knowledge Graph Created)');
    passed++;
  } catch (err) {
    console.error('❌ 1. GovernanceKnowledgeGraphEngine FAILED:', err.message);
    failed++;
  }

  // 2. GovernanceQueryEngine Verification
  try {
    const GovernanceQueryEngine = require('../../engine/governance/GovernanceQueryEngine');
    const queryEngine = new GovernanceQueryEngine();

    const result = queryEngine.queryCapabilityProvenance('CAP-TRUST-SCORE');
    assert.strictEqual(result.found, true);
    assert.ok(result.explanation.includes('implemented in SoftwareTrustKernel.js'));

    console.log('✅ 2. GovernanceQueryEngine PASSED (Natural Capability Provenance Query Evaluated)');
    passed++;
  } catch (err) {
    console.error('❌ 2. GovernanceQueryEngine FAILED:', err.message);
    failed++;
  }

  // 3. ReleaseDigitalPassportGenerator & ExternalEvidenceRegistry Verification
  try {
    const ReleaseDigitalPassportGenerator = require('../../engine/release/ReleaseDigitalPassportGenerator');
    const passportGen = new ReleaseDigitalPassportGenerator();

    const docsDir = path.join(__dirname, '../../docs');
    const result = passportGen.exportPassportFile(docsDir, { tests: '47/47 PASSED' });

    assert.ok(fs.existsSync(result.filePath));
    const passport = JSON.parse(fs.readFileSync(result.filePath, 'utf-8'));
    assert.strictEqual(passport.version, '2026.3.0-LTS');
    assert.ok(passport.signature.length === 64);

    console.log('✅ 3. ReleaseDigitalPassportGenerator PASSED (release.passport.json Written & Signed)');
    passed++;
  } catch (err) {
    console.error('❌ 3. ReleaseDigitalPassportGenerator FAILED:', err.message);
    failed++;
  }

  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} GOVERNANCE KNOWLEDGE GRAPH TESTS PASSED!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runGovernanceKnowledgeGraphSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runGovernanceKnowledgeGraphSuite };
