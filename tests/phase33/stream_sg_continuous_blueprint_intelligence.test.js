const assert = require('assert');
const ContinuousBlueprintIntelligenceEngine = require('../../engine/knowledge/ContinuousBlueprintIntelligenceEngine');

async function runTest() {
    console.log('Running test for ContinuousBlueprintIntelligenceEngine...');
    const engine = new ContinuousBlueprintIntelligenceEngine();
    const result = await engine.run();
    assert.strictEqual(result.engineType, 'CONTINUOUS_BLUEPRINT_INTELLIGENCE_ENGINE');
    assert.strictEqual(result.status, 'CONTINUOUS_BLUEPRINT_INTELLIGENCE_VERIFIED');
    console.log('Test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
