const assert = require('assert');
const ProcurementIntelligenceFreshnessEngine = require('../../engine/procurement/ProcurementIntelligenceFreshnessEngine');

async function runTest() {
    console.log('Running ProcurementIntelligenceFreshnessEngine test...');
    const engine = new ProcurementIntelligenceFreshnessEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'PROCUREMENT_INTELLIGENCE_FRESHNESS_ENGINE');
    assert.strictEqual(result.iso27001EvidenceFreshnessHours, 1.2);
    assert.strictEqual(result.soc2EvidenceFreshnessHours, 0.8);
    assert.strictEqual(result.doraEvidenceFreshnessHours, 2.1);
    assert.strictEqual(result.euCraEvidenceFreshnessHours, 1.5);
    assert.strictEqual(result.stalenessAutoFailThresholdHours, 24.0);
    assert.strictEqual(result.procurementAuditDefensibilityScorePercent, 99.9);
    assert.strictEqual(result.status, 'PROCUREMENT_INTELLIGENCE_FRESHNESS_VERIFIED');

    console.log('ProcurementIntelligenceFreshnessEngine test passed!');
}

runTest().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
