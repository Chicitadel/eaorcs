'use strict';

const assert = require('assert');
const ProductIntelligenceEngine = require('../../engine/saas/ProductIntelligenceEngine');

async function runTest() {
    console.log('Running test for ProductIntelligenceEngine (Stream P4)...');
    const engine = new ProductIntelligenceEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'PRODUCT_INTELLIGENCE_ENGINE');
    assert.strictEqual(result.monitoredTenantsCount, 1850);
    assert.strictEqual(result.featureAdoptionRatePercent, 91.4);
    assert.strictEqual(result.renewalConfidencePercent, 97.8);
    assert.strictEqual(result.customerHealthScore, 96.5);
    assert.strictEqual(result.slaCompliancePercent, 99.995);
    assert.strictEqual(result.productIntelligenceStatus, 'PRODUCT_INTELLIGENCE_VERIFIED');

    console.log('Stream P4 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
