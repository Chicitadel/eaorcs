'use strict';

const assert = require('assert');
const FederationControlPlaneEngine = require('../../engine/federation/FederationControlPlaneEngine');

async function runTest() {
    console.log('Running test for FederationControlPlaneEngine (Stream D)...');
    const engine = new FederationControlPlaneEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'FEDERATION_CONTROL_PLANE_ENGINE');
    assert.strictEqual(result.registeredSubsystemsCount, 18);
    assert.strictEqual(result.totalExecutedPolicyRules, 42500);
    assert.strictEqual(result.policyBypassesDetectedCount, 0);
    assert.strictEqual(result.automatedComplianceEnforcementScorePercent, 100.0);
    assert.strictEqual(result.status, 'FEDERATION_CONTROL_PLANE_VERIFIED');

    console.log('Stream D test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
