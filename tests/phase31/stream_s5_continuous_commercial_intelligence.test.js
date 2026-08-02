const assert = require('assert');
const ContinuousCommercialIntelligenceEngine = require('../../engine/commercial/ContinuousCommercialIntelligenceEngine');

async function runTest() {
    console.log('Running ContinuousCommercialIntelligenceEngine test...');
    const engine = new ContinuousCommercialIntelligenceEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'CONTINUOUS_COMMERCIAL_INTELLIGENCE_ENGINE');
    assert.strictEqual(result.activeTenantsCount, 1420);
    assert.strictEqual(result.arrUsd, 18500000);
    assert.strictEqual(result.grossMarginPercent, 86.4);
    assert.strictEqual(result.customerLtvUsd, 420000);
    assert.strictEqual(result.netRetentionRatePercent, 118.5);
    assert.strictEqual(result.conversionRatePercent, 14.2);
    assert.strictEqual(result.status, 'CONTINUOUS_COMMERCIAL_INTELLIGENCE_VERIFIED');

    console.log('ContinuousCommercialIntelligenceEngine test passed!');
}

runTest().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
