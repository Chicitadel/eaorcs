const ContinuousProcurementIntelligenceEngine = require('../../engine/procurement/ContinuousProcurementIntelligenceEngine.js');
const assert = require('assert');

async function test() {
    const engine = new ContinuousProcurementIntelligenceEngine();
    const result = await engine.run();
    assert.strictEqual(result.engineType, 'CONTINUOUS_PROCUREMENT_INTELLIGENCE_ENGINE');
    assert.strictEqual(result.iso27001ContinuousMapping, 'PASS');
    assert.strictEqual(result.soc2Type2ContinuousMapping, 'PASS');
    assert.strictEqual(result.doraContinuousMapping, 'PASS');
    assert.strictEqual(result.euCraContinuousMapping, 'PASS');
    assert.strictEqual(result.euAiActContinuousMapping, 'PASS');
    assert.strictEqual(result.nis2ContinuousMapping, 'PASS');
    assert.strictEqual(result.fedRampContinuousMapping, 'PASS');
    assert.strictEqual(result.governmentRfpAutoMappingScorePercent, 99.2);
    assert.strictEqual(result.status, 'CONTINUOUS_PROCUREMENT_INTELLIGENCE_VERIFIED');
    console.log("Stream 5: Continuous Procurement Intelligence tests passed.");
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
