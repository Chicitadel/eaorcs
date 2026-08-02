'use strict';

const assert = require('assert');
const GlobalCryptographicProvenanceLedgerEngine = require('../../engine/trust/GlobalCryptographicProvenanceLedgerEngine');

async function runTest() {
    console.log('Running test for GlobalCryptographicProvenanceLedgerEngine (Stream A)...');
    const engine = new GlobalCryptographicProvenanceLedgerEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'GLOBAL_CRYPTOGRAPHIC_PROVENANCE_LEDGER_ENGINE');
    assert.strictEqual(result.totalCrossRegionDagNodes, 14200);
    assert.strictEqual(result.hsmSignatureVerificationScorePercent, 100.0);
    assert.strictEqual(result.multiPartyAttestationsCount, 42);
    assert.strictEqual(result.merkleDagDepth, 18);
    assert.strictEqual(result.tamperEvidentVerificationStatus, 'GLOBAL_ZERO_TAMPERING_VERIFIED');
    assert.strictEqual(result.status, 'GLOBAL_CRYPTOGRAPHIC_PROVENANCE_LEDGER_VERIFIED');

    console.log('Stream A test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
