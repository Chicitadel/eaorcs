const assert = require('assert');
const CommercialOperationsIntelligenceEngine = require('../../engine/commercial/CommercialOperationsIntelligenceEngine');

async function runTest() {
    console.log('Running Stream 5: Commercial Operations Intelligence Test');
    try {
        const engine = new CommercialOperationsIntelligenceEngine();
        const result = await engine.run();
        
        assert.strictEqual(result.engineType, 'COMMERCIAL_OPERATIONS_INTELLIGENCE_ENGINE');
        assert.strictEqual(result.liveArrUsd, 19800000);
        assert.strictEqual(result.liveMrrUsd, 1650000);
        assert.strictEqual(result.customerAcquisitionCostUsd, 12500);
        assert.strictEqual(result.grossProfitMarginPercent, 88.2);
        assert.strictEqual(result.infrastructureCostRatioPercent, 4.8);
        assert.strictEqual(result.supportCostRatioPercent, 3.2);
        assert.strictEqual(result.status, 'COMMERCIAL_OPERATIONS_INTELLIGENCE_VERIFIED');
        
        console.log('Stream 5 tests passed successfully.');
    } catch (error) {
        console.error('Stream 5 tests failed:', error);
        process.exit(1);
    }
}

runTest();
