const assert = require('assert');
const IndependentAssuranceEngine = require('../../engine/audit/IndependentAssuranceEngine');

async function test() {
    const engine = new IndependentAssuranceEngine();
    const result = await engine.run();
    
    assert.strictEqual(result.engineType, 'INDEPENDENT_ASSURANCE_ENGINE');
    assert.strictEqual(result.penTestVulnerabilitiesCount, 0);
    assert.strictEqual(result.slsaLevel, 3);
    assert.strictEqual(result.rfc3161TimestampsCount, 250);
    assert.strictEqual(result.sbomValidated, true);
    assert.strictEqual(result.supplyChainAudited, true);
    assert.strictEqual(result.status, 'INDEPENDENT_ASSURANCE_VERIFIED');
    
    console.log('IndependentAssuranceEngine tests passed successfully.');
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
