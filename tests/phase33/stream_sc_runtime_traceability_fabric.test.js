'use strict';

const assert = require('assert');
const RuntimeTraceabilityFabricEngine = require('../../engine/traceability/RuntimeTraceabilityFabricEngine');

async function runTest() {
    console.log('Running test for RuntimeTraceabilityFabricEngine (Stream C)...');
    const engine = new RuntimeTraceabilityFabricEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'RUNTIME_TRACEABILITY_FABRIC_ENGINE');
    assert.strictEqual(result.totalReconstructedRequestFlows, 18400);
    assert.strictEqual(result.unlinkedTransactionsCount, 0);
    assert.strictEqual(result.endToEndLineOfSightScorePercent, 100.0);
    assert.strictEqual(result.averageTraceReconstructionLatencyMs, 2.8);
    assert.strictEqual(result.status, 'RUNTIME_TRACEABILITY_FABRIC_VERIFIED');

    console.log('Stream C test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
