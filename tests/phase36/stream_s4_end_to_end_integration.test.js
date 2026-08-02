'use strict';

const assert = require('assert');
const EndToEndIntegrationSuiteEngine = require('../../engine/integration/EndToEndIntegrationSuiteEngine');

async function runTest() {
    console.log('Running test for EndToEndIntegrationSuiteEngine (Stream S4)...');
    const engine = new EndToEndIntegrationSuiteEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'END_TO_END_INTEGRATION_SUITE_ENGINE');
    assert.strictEqual(result.fullStackWorkflowScenariosTestedCount, 42);
    assert.strictEqual(result.zeroWorkflowBreakageScorePercent, 100.0);
    assert.strictEqual(result.crossDomainReconciliationScorePercent, 100.0);
    assert.strictEqual(result.averageWorkflowLatencyMs, 4.8);
    assert.strictEqual(result.status, 'END_TO_END_INTEGRATION_SUITE_VERIFIED');

    console.log('Stream S4 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
