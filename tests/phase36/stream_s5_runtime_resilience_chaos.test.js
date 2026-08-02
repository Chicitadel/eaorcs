'use strict';

const assert = require('assert');
const RuntimeResilienceChaosEngine = require('../../engine/quality/RuntimeResilienceChaosEngine');

async function runTest() {
    console.log('Running test for RuntimeResilienceChaosEngine (Stream S5)...');
    const engine = new RuntimeResilienceChaosEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'RUNTIME_RESILIENCE_CHAOS_ENGINE');
    assert.strictEqual(result.executedChaosDrillsCount, 24);
    assert.strictEqual(result.failoverLatencyMs, 78.5);
    assert.strictEqual(result.disasterRecoveryRecoveryTimeObjectiveSeconds, 12.0);
    assert.strictEqual(result.disasterRecoveryRecoveryPointObjectiveSeconds, 0.0);
    assert.strictEqual(result.runtimeResilienceScorePercent, 100.0);
    assert.strictEqual(result.status, 'RUNTIME_RESILIENCE_CHAOS_VERIFIED');

    console.log('Stream S5 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
