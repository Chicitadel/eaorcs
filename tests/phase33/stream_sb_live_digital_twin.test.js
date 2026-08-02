'use strict';

const assert = require('assert');
const LiveDigitalTwinEngine = require('../../engine/twin/LiveDigitalTwinEngine');

async function runTest() {
    console.log('Running test for LiveDigitalTwinEngine (Stream B)...');
    const engine = new LiveDigitalTwinEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'LIVE_DIGITAL_TWIN_ENGINE');
    assert.strictEqual(result.synchronizedPlatformViewsCount, 12);
    assert.strictEqual(result.digitalTwinStateSyncLatencyMs, 4.2);
    assert.strictEqual(result.totalMonitoredEcosystemEntities, 1540);
    assert.strictEqual(result.digitalTwinFidelityScorePercent, 100.0);
    assert.strictEqual(result.status, 'LIVE_DIGITAL_TWIN_VERIFIED');

    console.log('Stream B test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
