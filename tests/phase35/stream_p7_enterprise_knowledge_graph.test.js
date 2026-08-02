'use strict';

const assert = require('assert');
const EnterpriseKnowledgeGraphEngine = require('../../engine/knowledge/EnterpriseKnowledgeGraphEngine');

async function runTest() {
    console.log('Running test for EnterpriseKnowledgeGraphEngine (Stream P7)...');
    const engine = new EnterpriseKnowledgeGraphEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'ENTERPRISE_KNOWLEDGE_GRAPH_ENGINE');
    assert.strictEqual(result.totalKnowledgeGraphLinks, 18400);
    assert.strictEqual(result.blueprintToCodeTraceabilityLinksCount, 3200);
    assert.strictEqual(result.testsToCiDeploymentsLinksCount, 2450);
    assert.strictEqual(result.telemetryToCommercialOutcomesLinksCount, 1820);
    assert.strictEqual(result.knowledgeGraphConsistencyScorePercent, 100.0);
    assert.strictEqual(result.status, 'ENTERPRISE_KNOWLEDGE_GRAPH_VERIFIED');

    console.log('Stream P7 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
