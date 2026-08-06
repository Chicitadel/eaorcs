/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : tests
 * File           : stream4_knowledge_and_twin.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
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
const SoftwareKnowledgeGraphEngine = require('../engine/knowledge/SoftwareKnowledgeGraphEngine.js');
const DigitalTwinExplorer = require('../engine/twin/DigitalTwinExplorer.js');

async function testSoftwareKnowledgeGraphEngine() {
    console.log('--- Testing SoftwareKnowledgeGraphEngine ---');
    const engine = new SoftwareKnowledgeGraphEngine();
    
    const runResult = await engine.run();
    assert.strictEqual(runResult.engineType, 'SOFTWARE_KNOWLEDGE_GRAPH_ENGINE');
    assert.strictEqual(runResult.status, 'SOFTWARE_KNOWLEDGE_GRAPH_VERIFIED');
    assert.strictEqual(runResult.governanceVerified, true);
    assert.strictEqual(runResult.layersConnectedCount, 9);
    assert.strictEqual(runResult.unifiedKnowledgeQueryable, true);

    // Test forward trace across 9 layers
    const fwd = engine.traceForward('REQ-001');
    assert.strictEqual(fwd.startNode.id, 'REQ-001');
    assert.ok(fwd.paths.length > 0, 'Forward trace paths should not be empty');
    assert.ok(fwd.reachedLayers.includes('BusinessObjective'), 'Should reach BusinessObjective layer');

    // Test backward trace
    const bwd = engine.traceBackward('BIZ-001');
    assert.strictEqual(bwd.endNode.id, 'BIZ-001');
    assert.ok(bwd.reachedLayers.includes('Requirement'), 'Backward trace should reach Requirement layer');

    // Test impact analysis
    const impact = engine.analyzeImpact('CODE-001');
    assert.strictEqual(impact.sourceNodeId, 'CODE-001');
    assert.ok(impact.totalImpactedAssets > 0, 'Impact analysis should return impacted assets');

    // Test coverage validation
    const coverage = engine.validateLineageCoverage();
    assert.ok(coverage.overallCompletenessScorePercent > 0, 'Coverage score should be positive');

    // Test search
    const searchRes = engine.searchNodes('Kernel');
    assert.ok(searchRes.length > 0, 'Search should find kernel node');

    // Test export
    const jsonExport = engine.exportGraph('JSON');
    assert.ok(jsonExport.nodes.length > 0, 'JSON export should contain nodes');

    const dotExport = engine.exportGraph('DOT');
    assert.ok(typeof dotExport === 'string' && dotExport.includes('digraph'), 'DOT export should be valid Graphviz string');

    console.log('✓ SoftwareKnowledgeGraphEngine tests passed successfully.');
}

async function testDigitalTwinExplorer() {
    console.log('--- Testing DigitalTwinExplorer ---');
    const explorer = new DigitalTwinExplorer();

    const runResult = await explorer.run();
    assert.strictEqual(runResult.engineType, 'DIGITAL_TWIN_EXPLORER');
    assert.strictEqual(runResult.status, 'DIGITAL_TWIN_EXPLORER_VERIFIED');
    assert.strictEqual(runResult.governanceVerified, true);

    // Test living graph
    const living = explorer.getLivingGraph();
    assert.ok(living.nodes.length >= 6, 'Living graph should have at least 6 nodes');
    assert.ok(living.edges.length >= 5, 'Living graph should have living edges');
    assert.strictEqual(living.summary.overallStatus, 'HEALTHY');

    // Test risk heatmap
    const heatmap = explorer.generateRiskHeatmap();
    assert.ok(heatmap.heatmapMatrix.length >= 6, 'Risk heatmap matrix should have node rows');
    assert.ok(heatmap.riskCategoriesEvaluated.length === 5, 'Should evaluate 5 risk categories');

    // Test Architecture Time Machine historical diffs
    const diff = explorer.getHistoricalDiff('arch-snap-t-30d', 'arch-snap-t-0d');
    assert.strictEqual(diff.architectureDriftDetected, true, 'Historical diff should detect architecture changes');
    assert.ok(diff.diffSummary.addedNodesCount > 0, 'Should have added nodes in diff');

    // Test explore node
    const nodeDetails = explorer.exploreNode('node-kernel-core');
    assert.strictEqual(nodeDetails.node.name, 'Kernel Core Engine');
    assert.ok(nodeDetails.connectedEdges.length > 0);

    console.log('✓ DigitalTwinExplorer tests passed successfully.');
}

async function main() {
    try {
        await testSoftwareKnowledgeGraphEngine();
        await testDigitalTwinExplorer();
        console.log('\n✅ ALL STREAM 4 TESTS PASSED (100% CLEAN)!');
    } catch (err) {
        console.error('❌ Test failed:', err);
        process.exit(1);
    }
}

main();
