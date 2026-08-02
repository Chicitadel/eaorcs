'use strict';

const assert = require('assert');
const CommercialIntelligenceEngine = require('../../engine/commercial/CommercialIntelligenceEngine');

async function runTest() {
    console.log('Running test for CommercialIntelligenceEngine (Stream P5)...');
    const engine = new CommercialIntelligenceEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'COMMERCIAL_INTELLIGENCE_ENGINE');
    assert.strictEqual(result.measuredArrUSD, 28400000);
    assert.strictEqual(result.measuredMrrUSD, 2366666.67);
    assert.strictEqual(result.liveBillingSubscriptionsIngestedCount, 1850);
    assert.strictEqual(result.netGrossMarginPercent, 91.2);
    assert.strictEqual(result.commercialIntelligenceScorePercent, 100.0);
    assert.strictEqual(result.status, 'COMMERCIAL_INTELLIGENCE_VERIFIED');

    console.log('Stream P5 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
