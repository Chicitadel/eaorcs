const assert = require('assert');
const ProcurementAutomationEngine = require('../../engine/procurement/ProcurementAutomationEngine');

async function test() {
    const engine = new ProcurementAutomationEngine();
    const result = await engine.run();
    
    assert.strictEqual(result.engineType, 'PROCUREMENT_AUTOMATION_ENGINE');
    assert.strictEqual(result.iso27001EvidencePackGenerated, true);
    assert.strictEqual(result.soc2Type2MappingVerified, true);
    assert.strictEqual(result.doraEvidencePackGenerated, true);
    assert.strictEqual(result.euCraEvidencePackGenerated, true);
    assert.strictEqual(result.euAiActEvidencePackGenerated, true);
    assert.strictEqual(result.procurementQuestionnairesAutoFilledCount, 15);
    assert.strictEqual(result.status, 'PROCUREMENT_AUTOMATION_VERIFIED');
    
    console.log('stream_sf_procurement_automation.test.js passed');
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
