const assert = require('assert');
const CustomerSuccessIntelligenceEngine = require('../../engine/pilot/CustomerSuccessIntelligenceEngine');

async function runTests() {
    console.log('Running tests for stream_sc_customer_success_intelligence...');
    const engine = new CustomerSuccessIntelligenceEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'CUSTOMER_SUCCESS_INTELLIGENCE_ENGINE');
    assert.strictEqual(result.featureAdoptionRatePercent, 88.5);
    assert.strictEqual(result.tenantMaturityIndex, 94.2);
    assert.strictEqual(result.renewalPredictionConfidencePercent, 96.8);
    assert.strictEqual(result.outcomeGraphNodesCount, 1250);
    assert.strictEqual(result.status, 'CUSTOMER_SUCCESS_INTELLIGENCE_VERIFIED');

    console.log('All tests passed for stream_sc_customer_success_intelligence.');
}

runTests().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
