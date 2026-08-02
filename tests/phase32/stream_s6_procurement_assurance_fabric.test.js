const assert = require('assert');
const ProcurementAssuranceFabricEngine = require('../../engine/procurement/ProcurementAssuranceFabricEngine');

async function runTest() {
    console.log('Running Stream 6: Procurement Assurance Fabric Test');
    try {
        const engine = new ProcurementAssuranceFabricEngine();
        const result = await engine.run();
        
        assert.strictEqual(result.engineType, 'PROCUREMENT_ASSURANCE_FABRIC_ENGINE');
        assert.strictEqual(result.iso27001FreshnessMinutes, 15);
        assert.strictEqual(result.soc2FreshnessMinutes, 10);
        assert.strictEqual(result.doraFreshnessMinutes, 25);
        assert.strictEqual(result.euCraFreshnessMinutes, 20);
        assert.strictEqual(result.euAiActFreshnessMinutes, 18);
        assert.strictEqual(result.nis2FreshnessMinutes, 30);
        assert.strictEqual(result.automatedFreshnessExpirationActive, true);
        assert.strictEqual(result.auditDefensibilityScorePercent, 100.0);
        assert.strictEqual(result.status, 'PROCUREMENT_ASSURANCE_FABRIC_VERIFIED');
        
        console.log('Stream 6 tests passed successfully.');
    } catch (error) {
        console.error('Stream 6 tests failed:', error);
        process.exit(1);
    }
}

runTest();
