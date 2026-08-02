'use strict';

const assert = require('assert');
const AutomatedLaunchCertificationEngine = require('../../engine/certification/AutomatedLaunchCertificationEngine');

async function runTest() {
    console.log('Running test for AutomatedLaunchCertificationEngine (Stream S9)...');
    const engine = new AutomatedLaunchCertificationEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'AUTOMATED_LAUNCH_CERTIFICATION_ENGINE');
    assert.strictEqual(result.evaluatedLaunchGatesCount, 16);
    assert.strictEqual(result.passedLaunchGatesCount, 16);
    assert.strictEqual(result.zeroStaticAssumptionVerificationScorePercent, 100.0);
    assert.strictEqual(result.launchCertificationClearance, 'FULL_LIVE_PRODUCTION_GO_LIVE_APPROVED');
    assert.strictEqual(result.status, 'AUTOMATED_LAUNCH_CERTIFICATION_VERIFIED');

    console.log('Stream S9 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
