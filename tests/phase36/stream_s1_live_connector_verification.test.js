'use strict';

const assert = require('assert');
const LiveConnectorVerificationEngine = require('../../engine/connectors/LiveConnectorVerificationEngine');

async function runTest() {
    console.log('Running test for LiveConnectorVerificationEngine (Stream S1)...');
    const engine = new LiveConnectorVerificationEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'LIVE_CONNECTOR_VERIFICATION_ENGINE');
    assert.strictEqual(result.totalMonitoredAdapters, 8);
    assert.strictEqual(result.verifiedLiveServicesCount, 8);
    assert.strictEqual(result.averageAdapterLatencyMs, 2.4);
    assert.strictEqual(result.liveConnectorInteroperabilityScorePercent, 100.0);
    assert.strictEqual(result.status, 'LIVE_CONNECTOR_VERIFICATION_VERIFIED');

    console.log('Stream S1 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
