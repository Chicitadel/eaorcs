'use strict';

const assert = require('assert');
const OperationalEconomicsEngine = require('../../engine/commercial/OperationalEconomicsEngine');

async function runTest() {
    console.log('Running test for OperationalEconomicsEngine (Stream E)...');
    const engine = new OperationalEconomicsEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'OPERATIONAL_ECONOMICS_ENGINE');
    assert.strictEqual(result.measuredArrUSD, 21400000);
    assert.strictEqual(result.measuredMrrUSD, 1783333.33);
    assert.strictEqual(result.infrastructureCostEfficiencyPercent, 94.6);
    assert.strictEqual(result.netGrossMarginPercent, 88.2);
    assert.strictEqual(result.unitEconomicsVerificationScorePercent, 100.0);
    assert.strictEqual(result.status, 'OPERATIONAL_ECONOMICS_VERIFIED');

    console.log('Stream E test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
