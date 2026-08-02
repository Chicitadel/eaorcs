const assert = require('assert');
const ProductIntelligenceFabricEngine = require('../../engine/knowledge/ProductIntelligenceFabricEngine');

async function runTest() {
    console.log('Running ProductIntelligenceFabricEngine test...');
    const engine = new ProductIntelligenceFabricEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'PRODUCT_INTELLIGENCE_FABRIC_ENGINE');
    assert.strictEqual(result.subsystemDomainsMonitoredCount, 9);
    assert.strictEqual(result.licensingDomainSynced, true);
    assert.strictEqual(result.identityDomainSynced, true);
    assert.strictEqual(result.commerceDomainSynced, true);
    assert.strictEqual(result.supportDomainSynced, true);
    assert.strictEqual(result.docsDomainSynced, true);
    assert.strictEqual(result.marketplaceDomainSynced, true);
    assert.strictEqual(result.status, 'PRODUCT_INTELLIGENCE_FABRIC_VERIFIED');

    console.log('ProductIntelligenceFabricEngine test passed!');
}

runTest().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
