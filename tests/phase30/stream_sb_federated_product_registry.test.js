const assert = require('assert');
const FederatedProductRegistryEngine = require('../../engine/registry/FederatedProductRegistryEngine');

async function testFederatedProductRegistryEngine() {
    try {
        const engine = new FederatedProductRegistryEngine();
        const result = await engine.run();
        assert.strictEqual(result.engineType, 'FEDERATED_PRODUCT_REGISTRY_ENGINE');
        assert.strictEqual(result.airRoofersProductRegistrySynced, true);
        assert.strictEqual(result.editionRegistrySynced, true);
        assert.strictEqual(result.capabilityRegistryNodesCount, 240);
        assert.strictEqual(result.commercialRegistrySynced, true);
        assert.strictEqual(result.lifecycleRegistrySynced, true);
        assert.strictEqual(result.status, 'FEDERATED_PRODUCT_REGISTRY_VERIFIED');
        console.log('stream_sb_federated_product_registry.test.js: PASS');
        process.exit(0);
    } catch (err) {
        console.error('stream_sb_federated_product_registry.test.js: FAIL', err);
        process.exit(1);
    }
}

testFederatedProductRegistryEngine();
