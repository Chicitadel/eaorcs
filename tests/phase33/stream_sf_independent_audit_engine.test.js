'use strict';

const assert = require('assert');
const IndependentAuditEngine = require('../../engine/audit/IndependentAuditEngine');

async function runTest() {
    console.log('Running test for IndependentAuditEngine (Stream F)...');
    const engine = new IndependentAuditEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'INDEPENDENT_AUDIT_ENGINE');
    assert.strictEqual(result.totalReproducibleAuditPackages, 24);
    assert.strictEqual(result.cryptographicProofVerificationScorePercent, 100.0);
    assert.strictEqual(result.zeroFabricationClearance, 'FULLY_VERIFIED_INDEPENDENT_AUDIT');
    assert.strictEqual(result.status, 'INDEPENDENT_AUDIT_ENGINE_VERIFIED');

    console.log('Stream F test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
