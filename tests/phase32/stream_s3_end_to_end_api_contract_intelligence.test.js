const assert = require('assert');
const EndToEndApiContractIntelligenceEngine = require('../../engine/contract/EndToEndApiContractIntelligenceEngine');

async function runTests() {
    console.log('Running EndToEndApiContractIntelligenceEngine tests...');
    const engine = new EndToEndApiContractIntelligenceEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'END_TO_END_API_CONTRACT_INTELLIGENCE_ENGINE');
    assert.strictEqual(result.blueprintToDomainLinksCount, 180);
    assert.strictEqual(result.openApiToAsyncApiEventLinksCount, 95);
    assert.strictEqual(result.sdkToGatewayLinksCount, 420);
    assert.strictEqual(result.runtimeToTelemetryUsageLinksCount, 1150);
    assert.strictEqual(result.endToEndTraceabilityScorePercent, 100.0);
    assert.strictEqual(result.status, 'END_TO_END_API_CONTRACT_INTELLIGENCE_VERIFIED');
    console.log('EndToEndApiContractIntelligenceEngine tests passed.');
}

runTests().catch(err => {
    console.error('Test failed', err);
    process.exit(1);
});
