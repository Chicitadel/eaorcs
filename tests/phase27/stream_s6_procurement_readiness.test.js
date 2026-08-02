const assert = require('assert');
const ProcurementReadinessEngine = require('../../engine/procurement/ProcurementReadinessEngine');

async function runTests() {
  try {
    const engine = new ProcurementReadinessEngine();
    const result = await engine.run();
    assert.strictEqual(result.engineType, 'PROCUREMENT_READINESS_ENGINE');
    assert.strictEqual(result.iso27001Mapped, true);
    assert.strictEqual(result.soc2Type2Verified, true);
    assert.strictEqual(result.nist80053Mapped, true);
    assert.strictEqual(result.doraCompliant, true);
    assert.strictEqual(result.euCraCompliant, true);
    assert.strictEqual(result.euAiActMapped, true);
    assert.strictEqual(result.governmentPacksCount, 4);
    assert.strictEqual(result.status, 'PROCUREMENT_READINESS_VERIFIED');
    console.log('ProcurementReadinessEngine tests passed');
    process.exit(0);
  } catch (error) {
    console.error('ProcurementReadinessEngine tests failed:', error);
    process.exit(1);
  }
}

runTests();
