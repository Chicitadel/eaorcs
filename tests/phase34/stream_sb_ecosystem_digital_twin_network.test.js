'use strict';

const assert = require('assert');
const EcosystemDigitalTwinNetworkEngine = require('../../engine/twin/EcosystemDigitalTwinNetworkEngine');

async function runTest() {
    console.log('Running test for EcosystemDigitalTwinNetworkEngine (Stream B)...');
    const engine = new EcosystemDigitalTwinNetworkEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'ECOSYSTEM_DIGITAL_TWIN_NETWORK_ENGINE');
    assert.strictEqual(result.synchronizedPlatformRegionsCount, 32);
    assert.strictEqual(result.monitoredNodesCount, 4800);
    assert.strictEqual(result.digitalTwinSyncLatencyMs, 2.1);
    assert.strictEqual(result.networkTopologyFidelityScorePercent, 100.0);
    assert.strictEqual(result.status, 'ECOSYSTEM_DIGITAL_TWIN_NETWORK_VERIFIED');

    console.log('Stream B test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
