const assert = require('assert');
const ContinuousContractIntelligenceEngine = require('../../engine/cicd/ContinuousContractIntelligenceEngine');

async function runTests() {
    console.log('Running Stream SF Tests...');
    const engine = new ContinuousContractIntelligenceEngine();
    const result = await engine.run();
    
    assert.strictEqual(result.engineType, 'CONTINUOUS_CONTRACT_INTELLIGENCE_ENGINE');
    assert.strictEqual(result.prBlueprintTraceabilityChecked, true);
    assert.strictEqual(result.platformContractComplianceVerified, true);
    assert.strictEqual(result.openApiAsyncApiZeroDriftEnforced, true);
    assert.strictEqual(result.sdkAdapterCompatibilityChecked, true);
    assert.strictEqual(result.backwardCompatibilityGatePassed, true);
    assert.strictEqual(result.status, 'CONTINUOUS_CONTRACT_INTELLIGENCE_VERIFIED');
    
    console.log('Stream SF Tests passed!');
}

runTests().catch(err => {
    console.error(err);
    process.exit(1);
});
