'use strict';

const assert = require('assert');
const AutomatedExternalAuditPortalEngine = require('../../engine/audit/AutomatedExternalAuditPortalEngine');

async function runTest() {
    console.log('Running test for AutomatedExternalAuditPortalEngine (Stream F)...');
    const engine = new AutomatedExternalAuditPortalEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'AUTOMATED_EXTERNAL_AUDIT_PORTAL_ENGINE');
    assert.strictEqual(result.reproducibleRegulatoryPackagesCount, 32);
    assert.strictEqual(result.cryptographicProofVerificationScorePercent, 100.0);
    assert.strictEqual(result.zeroFabricationClearance, 'FULLY_VERIFIED_AUTOMATED_EXTERNAL_AUDIT');
    assert.strictEqual(result.status, 'AUTOMATED_EXTERNAL_AUDIT_PORTAL_VERIFIED');

    console.log('Stream F test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
