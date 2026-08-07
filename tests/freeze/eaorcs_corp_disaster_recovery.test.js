const assert = require('assert');
const DisasterRecoveryEngine = require('../../engine/operations/DisasterRecoveryEngine');

async function testDisasterRecoverySuite() {
    console.log('--- Running DisasterRecoveryEngine Tests ---');
    const engine = new DisasterRecoveryEngine();

    // 1. Pre-registered scenarios
    assert.strictEqual(engine.scenarios.size, 4);
    console.log('[PASS] 1. Pre-registered 4 scenarios verified');

    // 2. runScenario
    const sc1 = engine.runScenario('DR-001');
    assert.strictEqual(sc1.passed, true);
    assert.strictEqual(sc1.slaPassed, true);
    assert.strictEqual(sc1.steps.length, 4);
    console.log('[PASS] 2. runScenario DR-001 executed steps');

    // 3. runScenario DR-003 rollback
    const sc3 = engine.runScenario('DR-003');
    assert.strictEqual(sc3.passed, true);
    console.log('[PASS] 3. runScenario DR-003 rollback executed');

    // 4. validateRollback
    const valRb = engine.validateRollback('v2026.3.0', 'v2026.2.0', () => ({ success: true }));
    assert.strictEqual(valRb.passed, true);
    assert.strictEqual(valRb.slaMs, 300000);
    console.log('[PASS] 4. validateRollback verified SLA');

    // 5. runFullDRSuite
    const full = engine.runFullDRSuite();
    assert.strictEqual(full.allPassed, true);
    assert.strictEqual(typeof full.evidenceHash, 'string');
    console.log('[PASS] 5. runFullDRSuite passed all scenarios');

    // 6. generateDRReport
    const rpt = engine.generateDRReport(full);
    assert.strictEqual(rpt.slaCompliance, '4/4');
    assert.strictEqual(typeof rpt.reportId, 'string');
    console.log('[PASS] 6. generateDRReport generated compliance summary');

    // 7. getRecoveryRunbook
    const runbook = engine.getRecoveryRunbook('DR-002');
    assert.strictEqual(runbook.steps.length, 4);
    console.log('[PASS] 7. getRecoveryRunbook retrieved steps');

    // 8. registerScenario
    const reg = engine.registerScenario({ scenarioId: 'DR-005', name: 'Custom DR', type: 'CUSTOM', slaMs: 60000 });
    assert.strictEqual(reg.registered, true);
    assert.strictEqual(engine.scenarios.size, 5);
    console.log('[PASS] 8. registerScenario registered new scenario');

    console.log('All DisasterRecoveryEngine tests passed.');
}

if (require.main === module) {
    testDisasterRecoverySuite().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = testDisasterRecoverySuite;
