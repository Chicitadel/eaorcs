const assert = require('assert');
const LivePlatformStateEngine = require('../../engine/state/LivePlatformStateEngine');

async function runTests() {
    console.log('Running LivePlatformStateEngine tests...');
    const engine = new LivePlatformStateEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'LIVE_PLATFORM_STATE_ENGINE');
    assert.strictEqual(result.renderedStateViewsCount, 12);
    assert.strictEqual(result.deploymentsStateSynced, true);
    assert.strictEqual(result.healthStateSynced, true);
    assert.strictEqual(result.incidentsStateSynced, true);
    assert.strictEqual(result.telemetryStateSynced, true);
    assert.strictEqual(result.licensingStateSynced, true);
    assert.strictEqual(result.billingStateSynced, true);
    assert.strictEqual(result.status, 'LIVE_PLATFORM_STATE_VERIFIED');
    console.log('LivePlatformStateEngine tests passed.');
}

runTests().catch(err => {
    console.error('Test failed', err);
    process.exit(1);
});
