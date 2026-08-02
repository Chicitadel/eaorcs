const assert = require('assert');
const EvidenceProvenanceFabricEngine = require('../../engine/evidence/EvidenceProvenanceFabricEngine');

async function runTests() {
    console.log('Running EvidenceProvenanceFabricEngine tests...');
    const engine = new EvidenceProvenanceFabricEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'EVIDENCE_PROVENANCE_FABRIC_ENGINE');
    assert.strictEqual(result.provenanceChainLength, 5400);
    assert.strictEqual(result.cryptographicAttestationSha256, 'sha256-9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
    assert.strictEqual(result.sbomSignatureVerified, true);
    assert.strictEqual(result.auditReportProvenanceVerified, true);
    assert.strictEqual(result.procurementPackageSignatureVerified, true);
    assert.strictEqual(result.status, 'EVIDENCE_PROVENANCE_FABRIC_VERIFIED');
    console.log('EvidenceProvenanceFabricEngine tests passed.');
}

runTests().catch(err => {
    console.error('Test failed', err);
    process.exit(1);
});
