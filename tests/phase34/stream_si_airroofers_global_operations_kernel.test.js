'use strict';

const assert = require('assert');
const AirRoofersGlobalOperationsKernelEngine = require('../../engine/kernel/AirRoofersGlobalOperationsKernelEngine');

async function runTest() {
    console.log('Running test for AirRoofersGlobalOperationsKernelEngine (Stream I)...');
    const engine = new AirRoofersGlobalOperationsKernelEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'AIRROOFERS_GLOBAL_OPERATIONS_KERNEL_ENGINE');
    assert.strictEqual(result.totalEcosystemProductsServed, 18);
    assert.strictEqual(result.multiTenantTrustIsolationScorePercent, 100.0);
    assert.strictEqual(result.universalComplianceFeedLatencyMs, 1.9);
    assert.strictEqual(result.kernelAvailabilityPercent, 99.999);
    assert.strictEqual(result.status, 'AIRROOFERS_GLOBAL_OPERATIONS_KERNEL_VERIFIED');

    console.log('Stream I test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
