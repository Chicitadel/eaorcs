const assert = require('assert');
const LiveOperationsEngine = require('../../engine/operations/LiveOperationsEngine');

async function test() {
    const engine = new LiveOperationsEngine();
    const result = await engine.run();
    
    assert.strictEqual(result.engineType, 'LIVE_OPERATIONS_ENGINE');
    assert.strictEqual(result.k8sClustersVerified, 12);
    assert.strictEqual(result.telemetryActive, true);
    assert.strictEqual(result.slaVerifiedPercent, 99.999);
    assert.strictEqual(result.failoverMs, 85);
    assert.strictEqual(result.backupVerified, true);
    assert.strictEqual(result.status, 'LIVE_OPERATIONS_VERIFIED');
    
    console.log('LiveOperationsEngine tests passed successfully.');
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
