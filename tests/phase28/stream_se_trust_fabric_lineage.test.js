const assert = require('assert');
const TrustFabricLineageEngine = require('../../engine/trust/TrustFabricLineageEngine');

async function test() {
    const engine = new TrustFabricLineageEngine();
    const result = await engine.run();
    
    assert.strictEqual(result.engineType, 'TRUST_FABRIC_LINEAGE_ENGINE');
    assert.strictEqual(result.releaseReputationHistoryGrade, 'AAA');
    assert.strictEqual(result.supplierLineageVerified, true);
    assert.strictEqual(result.artifactAncestryHashVerified, true);
    assert.strictEqual(result.osapSoftwarePassportGenerated, true);
    assert.strictEqual(result.engineeringMemoryRecordsCount, 3400);
    assert.strictEqual(result.status, 'TRUST_FABRIC_LINEAGE_VERIFIED');
    
    console.log('stream_se_trust_fabric_lineage.test.js passed');
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
