const assert = require('assert');
const LiveFederationVerificationEngine = require('../../engine/federation/LiveFederationVerificationEngine');

async function testLiveFederationVerificationEngine() {
  const engine = new LiveFederationVerificationEngine();
  const result = await engine.run();

  assert.strictEqual(result.engineType, 'LIVE_FEDERATION_VERIFICATION_ENGINE');
  assert.strictEqual(result.liveIamVerification, 'VERIFIED_ACTIVE');
  assert.strictEqual(result.liveLicensingVerification, 'VERIFIED_ACTIVE');
  assert.strictEqual(result.liveBillingVerification, 'VERIFIED_ACTIVE');
  assert.strictEqual(result.liveTelemetryVerification, 'VERIFIED_ACTIVE');
  assert.strictEqual(result.liveRegistryVerification, 'VERIFIED_ACTIVE');
  assert.strictEqual(result.status, 'LIVE_FEDERATION_VERIFICATION_VERIFIED');

  console.log('Stream 1: Live Federation Verification test passed');
}

testLiveFederationVerificationEngine().catch((err) => {
  console.error(err);
  process.exit(1);
});
