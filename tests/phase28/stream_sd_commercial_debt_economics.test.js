const assert = require('assert');
const CommercialDebtEconomicsEngine = require('../../engine/commercial/CommercialDebtEconomicsEngine');

async function test() {
    const engine = new CommercialDebtEconomicsEngine();
    const result = await engine.run();
    
    assert.strictEqual(result.engineType, 'COMMERCIAL_DEBT_ECONOMICS_ENGINE');
    assert.strictEqual(result.engineeringCostPredictionModel, 'ACTIVE');
    assert.strictEqual(result.specificationValueEstimationUsd, 4500000);
    assert.strictEqual(result.releaseRoiMultiplier, 4.8);
    assert.strictEqual(result.technicalDebtEconomicsIndex, 96.4);
    assert.strictEqual(result.status, 'COMMERCIAL_DEBT_ECONOMICS_VERIFIED');
    
    console.log('stream_sd_commercial_debt_economics.test.js passed');
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
