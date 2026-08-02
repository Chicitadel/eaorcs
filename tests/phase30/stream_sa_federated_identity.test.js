const assert = require('assert');
const FederatedIdentityIntegrationEngine = require('../../engine/federation/FederatedIdentityIntegrationEngine');

async function testFederatedIdentityIntegrationEngine() {
    try {
        const engine = new FederatedIdentityIntegrationEngine();
        const result = await engine.run();
        assert.strictEqual(result.engineType, 'FEDERATED_IDENTITY_INTEGRATION_ENGINE');
        assert.strictEqual(result.centralIamSynced, true);
        assert.strictEqual(result.webAuthnMfaPolicyEnforced, true);
        assert.strictEqual(result.authorizationGraphNodesCount, 1850);
        assert.strictEqual(result.zeroTrustAccessScorePercent, 100);
        assert.strictEqual(result.status, 'FEDERATED_IDENTITY_INTEGRATION_VERIFIED');
        console.log('stream_sa_federated_identity.test.js: PASS');
        process.exit(0);
    } catch (err) {
        console.error('stream_sa_federated_identity.test.js: FAIL', err);
        process.exit(1);
    }
}

testFederatedIdentityIntegrationEngine();
