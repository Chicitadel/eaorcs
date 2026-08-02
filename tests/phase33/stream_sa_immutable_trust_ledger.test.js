'use strict';

const assert = require('assert');
const ImmutableTrustLedgerEngine = require('../../engine/trust/ImmutableTrustLedgerEngine');

async function runTest() {
    console.log('Running test for ImmutableTrustLedgerEngine (Stream A)...');
    const engine = new ImmutableTrustLedgerEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'IMMUTABLE_TRUST_LEDGER_ENGINE');
    assert.strictEqual(result.totalChainedRecords, 6850);
    assert.strictEqual(result.cryptographicVerificationScorePercent, 100.0);
    assert.strictEqual(result.merkleTreeDepth, 14);
    assert.strictEqual(result.tamperEvidentVerificationStatus, 'VERIFIED_ZERO_TAMPERING');
    assert.strictEqual(result.status, 'IMMUTABLE_TRUST_LEDGER_VERIFIED');

    console.log('Stream A test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
