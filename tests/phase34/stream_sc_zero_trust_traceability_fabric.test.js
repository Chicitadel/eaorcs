'use strict';

const assert = require('assert');
const ZeroTrustTraceabilityFabricEngine = require('../../engine/traceability/ZeroTrustTraceabilityFabricEngine');

async function runTest() {
    console.log('Running test for ZeroTrustTraceabilityFabricEngine (Stream C)...');
    const engine = new ZeroTrustTraceabilityFabricEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'ZERO_TRUST_TRACEABILITY_FABRIC_ENGINE');
    assert.strictEqual(result.reconstructedFlowsCount, 32500);
    assert.strictEqual(result.untracedPacketsCount, 0);
    assert.strictEqual(result.traceReconstructionLatencyMs, 1.8);
    assert.strictEqual(result.zeroTrustLineOfSightScorePercent, 100.0);
    assert.strictEqual(result.status, 'ZERO_TRUST_TRACEABILITY_FABRIC_VERIFIED');

    console.log('Stream C test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
