const assert = require('assert');
const MarketplaceReadinessEngine = require('../../engine/marketplace/MarketplaceReadinessEngine');

async function runTests() {
  try {
    const engine = new MarketplaceReadinessEngine();
    const result = await engine.run();
    assert.strictEqual(result.engineType, 'MARKETPLACE_READINESS_ENGINE');
    assert.strictEqual(result.githubReleaseReady, true);
    assert.strictEqual(result.dockerHubImagesCount, 6);
    assert.strictEqual(result.docPortalUrl, 'https://docs.airroofers.eu/eaorcs');
    assert.strictEqual(result.demoSandboxActive, true);
    assert.strictEqual(result.pricingTierCount, 4);
    assert.strictEqual(result.status, 'MARKETPLACE_READINESS_VERIFIED');
    console.log('MarketplaceReadinessEngine tests passed');
    process.exit(0);
  } catch (error) {
    console.error('MarketplaceReadinessEngine tests failed:', error);
    process.exit(1);
  }
}

runTests();
