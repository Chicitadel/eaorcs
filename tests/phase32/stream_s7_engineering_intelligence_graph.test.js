const assert = require('assert');
const EngineeringIntelligenceGraphEngine = require('../../engine/knowledge/EngineeringIntelligenceGraphEngine');

async function runTest() {
    console.log('Running test for EngineeringIntelligenceGraphEngine...');
    const engine = new EngineeringIntelligenceGraphEngine();
    const result = await engine.run();
    assert.strictEqual(result.engineType, 'ENGINEERING_INTELLIGENCE_GRAPH_ENGINE');
    assert.strictEqual(result.requirementsToCodeLinksCount, 2150);
    assert.strictEqual(result.testsToCiReleasesLinksCount, 1480);
    assert.strictEqual(result.incidentsToFixesLinksCount, 790);
    assert.strictEqual(result.customerOutcomesToEvidenceLinksCount, 610);
    assert.strictEqual(result.engineeringTraceabilityScorePercent, 100.0);
    assert.strictEqual(result.status, 'ENGINEERING_INTELLIGENCE_GRAPH_VERIFIED');
    console.log('Test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
