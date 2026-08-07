/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Phase 2 Intelligence Test Suite
 * File           : eaorcs_corp_phase2_intelligence.test.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Phase 2 Intelligence
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const GovernanceKnowledgeGraphEngine = require('../../engine/governance/GovernanceKnowledgeGraphEngine');
const QualificationDAGEngine = require('../../engine/execution/QualificationDAGEngine');
const MeasuredDeterminismEngine = require('../../engine/validation/MeasuredDeterminismEngine');

async function runTests() {
    console.log('--- Running EAORCS Phase 2 Intelligence Tests ---');

    // Test GovernanceKnowledgeGraphEngine
    const graphEngine = new GovernanceKnowledgeGraphEngine();
    
    // 1. buildGraph() returns nodes, edges, metadata
    const graph = graphEngine.buildGraph();
    assert(graph.nodes.length > 0, 'Graph should have nodes');
    assert(graph.edges.length > 0, 'Graph should have edges');
    assert(graph.metadata, 'Graph should have metadata');
    console.log('PASS 1: GovernanceKnowledgeGraphEngine.buildGraph()');

    // 2. findDependencies('GOV-L7') returns GOV-L6
    const l7Deps = graphEngine.findDependencies('GOV-L7');
    assert(l7Deps.includes('GOV-L6'), 'GOV-L7 should depend on GOV-L6');
    console.log('PASS 2: findDependencies() returns correct deps');

    // 3. computeImpact('GOV-L1') returns all 6 downstream artifacts
    const l1Impact = graphEngine.computeImpact('GOV-L1');
    assert(l1Impact.length === 6, 'GOV-L1 should impact 6 artifacts');
    console.log('PASS 3: computeImpact() returns downstream artifacts');

    // 4. searchArtifacts('Constitution') returns at least 1 result
    const searchRes = graphEngine.searchArtifacts('Constitution');
    assert(searchRes.length >= 1, 'Should find Constitution');
    console.log('PASS 4: searchArtifacts() works');

    // 5. diffGraphs works
    const snapshotA = graphEngine.buildGraph();
    const snapshotB = JSON.parse(JSON.stringify(snapshotA));
    snapshotB.nodes.push({ id: 'GOV-L8', title: 'Metrics', tier: 8 });
    const diff = graphEngine.diffGraphs(snapshotA, snapshotB);
    assert(diff.addedNodes.some(n => n.id === 'GOV-L8'), 'diffGraphs should detect added node');
    console.log('PASS 5: diffGraphs() works');

    // Test QualificationDAGEngine
    const dagEngine = new QualificationDAGEngine();

    // 6. detectCycles() returns hasCycles: false
    const cycles = dagEngine.detectCycles();
    assert(cycles.hasCycles === false, 'Default streams should not have cycles');
    console.log('PASS 6: detectCycles() returns hasCycles: false');

    // 7. getExecutionOrder() returns S_TRACEABILITY and S_ARCHITECTURE before S_SECURITY and S_GOVERNANCE
    const order = dagEngine.getExecutionOrder();
    const traceIdx = order.indexOf('S_TRACEABILITY');
    const archIdx = order.indexOf('S_ARCHITECTURE');
    const secIdx = order.indexOf('S_SECURITY');
    const govIdx = order.indexOf('S_GOVERNANCE');
    assert(traceIdx < secIdx, 'TRACEABILITY before SECURITY');
    assert(archIdx < govIdx, 'ARCHITECTURE before GOVERNANCE');
    console.log('PASS 7: getExecutionOrder() returns correct topology');

    // 8. executeDAG() runs all streams and returns passed results
    const execResult = await dagEngine.executeDAG();
    assert(execResult.passed.includes('S_RELEASE'), 'Should pass S_RELEASE');
    console.log('PASS 8: executeDAG() passes streams');

    // 9. executeIncremental(['S_SECURITY']) only re-runs S_SECURITY and S_COMMERCIAL and S_RELEASE
    const incResult = await dagEngine.executeIncremental(['S_SECURITY']);
    assert(incResult.passed.includes('S_SECURITY') && incResult.passed.includes('S_RELEASE'), 'executeIncremental works');
    console.log('PASS 9: executeIncremental() works');

    // Test MeasuredDeterminismEngine
    const detEngine = new MeasuredDeterminismEngine();
    
    // 10. measureFunctionalDeterminism() returns measuredPct: 100
    const funcDet = await detEngine.measureFunctionalDeterminism(() => ({ success: true }), 5);
    assert(funcDet.measuredPct === 100, 'Deterministic function should be 100%');
    console.log('PASS 10: measureFunctionalDeterminism() returns 100%');

    // 11. generateEvidenceReport() returns evidenceHash
    const report = detEngine.generateEvidenceReport({
        executionSamples: funcDet.samples,
        consistencyPct: funcDet.measuredPct,
        sloStatus: 'MET'
    });
    assert(report.evidenceHash, 'Report should contain evidenceHash');
    console.log('PASS 11: generateEvidenceReport() works');

    // 12. checkSLO(100, 99.9) returns sloMet: true; checkSLO(95, 99.9) returns sloMet: false
    assert(detEngine.checkSLO(100, 99.9).sloMet === true, '100% should meet 99.9% SLO');
    assert(detEngine.checkSLO(95, 99.9).sloMet === false, '95% should not meet 99.9% SLO');
    console.log('PASS 12: checkSLO() logic is correct');

    console.log('\n--- All Phase 2 Tests PASSED ---');
}

runTests().catch(err => {
    console.error(err);
    process.exit(1);
});
