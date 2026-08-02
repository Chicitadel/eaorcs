'use strict';

const assert = require('assert');
const EvidenceProvenanceChainEngine = require('../../engine/evidence/EvidenceProvenanceChainEngine');

async function runTest() {
    console.log('Running test for EvidenceProvenanceChainEngine (Stream S2)...');
    const engine = new EvidenceProvenanceChainEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'EVIDENCE_PROVENANCE_CHAIN_ENGINE');
    assert.strictEqual(result.totalSignedEvidenceRecords, 18500);
    assert.strictEqual(result.rfc3161TimestampTokensCount, 18500);
    assert.strictEqual(result.ed25519SignedAttestationsCount, 48);
    assert.strictEqual(result.zeroTamperingProvenanceScorePercent, 100.0);
    assert.strictEqual(result.status, 'EVIDENCE_PROVENANCE_CHAIN_VERIFIED');

    console.log('Stream S2 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
