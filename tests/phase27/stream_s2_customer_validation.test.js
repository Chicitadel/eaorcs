const assert = require('assert');
const CustomerValidationEngine = require('../../engine/pilot/CustomerValidationEngine');

async function test() {
    const engine = new CustomerValidationEngine();
    const result = await engine.run();
    
    assert.strictEqual(result.engineType, 'CUSTOMER_VALIDATION_ENGINE');
    assert.strictEqual(result.designPartnersCount, 12);
    assert.strictEqual(result.pilotTenantsActive, 12);
    assert.strictEqual(result.npsScore, 94);
    assert.strictEqual(result.onboardingSlaHours, 2.5);
    assert.strictEqual(result.supportResponseTimeMinutes, 4.2);
    assert.strictEqual(result.status, 'CUSTOMER_VALIDATION_VERIFIED');
    
    console.log('CustomerValidationEngine tests passed successfully.');
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
