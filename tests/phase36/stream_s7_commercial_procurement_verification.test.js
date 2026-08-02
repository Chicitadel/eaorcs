'use strict';

const assert = require('assert');
const CommercialProcurementVerificationEngine = require('../../engine/commercial/CommercialProcurementVerificationEngine');

async function runTest() {
    console.log('Running test for CommercialProcurementVerificationEngine (Stream S7)...');
    const engine = new CommercialProcurementVerificationEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'COMMERCIAL_PROCUREMENT_VERIFICATION_ENGINE');
    assert.strictEqual(result.liveSubscriptionsVerifiedCount, 1850);
    assert.strictEqual(result.billingSyncIntegrityScorePercent, 100.0);
    assert.strictEqual(result.procurementPacksVerifiedCount, 42);
    assert.strictEqual(result.autoRfpQuestionnaireAccuracyPercent, 100.0);
    assert.strictEqual(result.status, 'COMMERCIAL_PROCUREMENT_VERIFICATION_VERIFIED');

    console.log('Stream S7 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
