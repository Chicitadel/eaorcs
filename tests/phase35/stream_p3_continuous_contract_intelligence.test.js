'use strict';

const assert = require('assert');
const ContinuousContractIntelligenceEngine = require('../../engine/contract/ContinuousContractIntelligenceEngine');

async function runTest() {
    console.log('Running test for ContinuousContractIntelligenceEngine (Stream P3)...');
    const engine = new ContinuousContractIntelligenceEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'CONTINUOUS_CONTRACT_INTELLIGENCE_ENGINE');
    assert.strictEqual(result.prLevelEvaluatedContractsCount, 165);
    assert.strictEqual(result.openApiAsyncApiGraphqlSyncPercent, 100.0);
    assert.strictEqual(result.detectedContractDriftsCount, 0);
    assert.strictEqual(result.sdkBackwardCompatibilityScorePercent, 100.0);
    assert.strictEqual(result.contractIntelligenceStatus, 'CONTINUOUS_CONTRACT_INTELLIGENCE_VERIFIED');

    console.log('Stream P3 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
