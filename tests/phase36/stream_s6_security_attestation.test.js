'use strict';

const assert = require('assert');
const SecurityAttestationEngine = require('../../engine/security/SecurityAttestationEngine');

async function runTest() {
    console.log('Running test for SecurityAttestationEngine (Stream S6)...');
    const engine = new SecurityAttestationEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'SECURITY_ATTESTATION_ENGINE');
    assert.strictEqual(result.sastScansPassedCount, 120);
    assert.strictEqual(result.dastScansPassedCount, 45);
    assert.strictEqual(result.criticalOrHighVulnerabilitiesCount, 0);
    assert.strictEqual(result.signedSbomManifestAttested, true);
    assert.strictEqual(result.securityPostureScorePercent, 100.0);
    assert.strictEqual(result.status, 'SECURITY_ATTESTATION_VERIFIED');

    console.log('Stream S6 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
