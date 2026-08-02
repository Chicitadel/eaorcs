'use strict';

const assert = require('assert');
const EcosystemOperationsKernelEngine = require('../../engine/kernel/EcosystemOperationsKernelEngine');

async function runTest() {
    console.log('Running test for EcosystemOperationsKernelEngine (Stream I)...');
    const engine = new EcosystemOperationsKernelEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'ECOSYSTEM_OPERATIONS_KERNEL_ENGINE');
    assert.strictEqual(result.totalEcosystemProductsServed, 14);
    assert.strictEqual(result.multiTenantTrustIsolationScorePercent, 100.0);
    assert.strictEqual(result.universalComplianceFeedLatencyMs, 3.1);
    assert.strictEqual(result.kernelAvailabilityPercent, 99.999);
    assert.strictEqual(result.status, 'ECOSYSTEM_OPERATIONS_KERNEL_VERIFIED');

    console.log('Stream I test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
