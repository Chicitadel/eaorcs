const TrustFabricEngine = require('../../engine/trust/TrustFabricEngine');
const assert = require('assert');

async function runTest() {
    console.log('Running Trust Fabric Engine Test...');
    const engine = new TrustFabricEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'TRUST_FABRIC_ENGINE');
    assert.strictEqual(result.immutableTrustLedgerActive, true);
    assert.strictEqual(result.softwarePassportGenerated, true);
    assert.strictEqual(result.vendorTrustScore, 99.4);
    assert.strictEqual(result.releaseReputationGrade, 'AAA');
    assert.strictEqual(result.supplyChainLineageVerified, true);
    assert.strictEqual(result.status, 'TRUST_FABRIC_VERIFIED');

    console.log('Stream S8 passed.');
}

if (require.main === module) {
    runTest().catch(e => {
        console.error(e);
        process.exit(1);
    });
}
module.exports = runTest;
