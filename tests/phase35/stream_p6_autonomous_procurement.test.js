'use strict';

const assert = require('assert');
const AutonomousProcurementEngine = require('../../engine/procurement/AutonomousProcurementEngine');

async function runTest() {
    console.log('Running test for AutonomousProcurementEngine (Stream P6)...');
    const engine = new AutonomousProcurementEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'AUTONOMOUS_PROCUREMENT_ENGINE');
    assert.strictEqual(result.generatedProcurementPacksCount, 38);
    assert.strictEqual(result.autoFilledRfpQuestionnairesCount, 24);
    assert.strictEqual(result.frameworksMappedCount, 8);
    assert.strictEqual(result.procurementAutomationScorePercent, 100.0);
    assert.strictEqual(result.status, 'AUTONOMOUS_PROCUREMENT_VERIFIED');

    console.log('Stream P6 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
