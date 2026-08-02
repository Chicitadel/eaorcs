'use strict';

const assert = require('assert');
const EnterpriseUnitEconomicsEngine = require('../../engine/commercial/EnterpriseUnitEconomicsEngine');

async function runTest() {
    console.log('Running test for EnterpriseUnitEconomicsEngine (Stream E)...');
    const engine = new EnterpriseUnitEconomicsEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'ENTERPRISE_UNIT_ECONOMICS_ENGINE');
    assert.strictEqual(result.measuredArrUSD, 24800000);
    assert.strictEqual(result.measuredMrrUSD, 2066666.67);
    assert.strictEqual(result.infrastructureCostEfficiencyPercent, 96.2);
    assert.strictEqual(result.netGrossMarginPercent, 90.4);
    assert.strictEqual(result.unitEconomicsVerificationScorePercent, 100.0);
    assert.strictEqual(result.status, 'ENTERPRISE_UNIT_ECONOMICS_VERIFIED');

    console.log('Stream E test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
