'use strict';

const assert = require('assert');
const AutonomousFederationControlPlaneEngine = require('../../engine/federation/AutonomousFederationControlPlaneEngine');

async function runTest() {
    console.log('Running test for AutonomousFederationControlPlaneEngine (Stream D)...');
    const engine = new AutonomousFederationControlPlaneEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'AUTONOMOUS_FEDERATION_CONTROL_PLANE_ENGINE');
    assert.strictEqual(result.federatedEnterpriseDomainsCount, 24);
    assert.strictEqual(result.executedPolicyRulesCount, 85000);
    assert.strictEqual(result.detectedPolicyBypassesCount, 0);
    assert.strictEqual(result.autonomousComplianceEnforcementScorePercent, 100.0);
    assert.strictEqual(result.status, 'AUTONOMOUS_FEDERATION_CONTROL_PLANE_VERIFIED');

    console.log('Stream D test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
