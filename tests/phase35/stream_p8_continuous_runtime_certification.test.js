'use strict';

const assert = require('assert');
const ContinuousRuntimeCertificationEngine = require('../../engine/certification/ContinuousRuntimeCertificationEngine');

async function runTest() {
    console.log('Running test for ContinuousRuntimeCertificationEngine (Stream P8)...');
    const engine = new ContinuousRuntimeCertificationEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'CONTINUOUS_RUNTIME_CERTIFICATION_ENGINE');
    assert.strictEqual(result.eventDrivenCertificationTriggersCount, 520);
    assert.strictEqual(result.liveEvidenceBackedCertificationScorePercent, 100.0);
    assert.strictEqual(result.recomputedScoreDimensionsCount, 7);
    assert.strictEqual(result.zeroStaticAssumptionClearance, 'FULLY_VERIFIED_LIVE_RUNTIME_CERTIFICATION');
    assert.strictEqual(result.status, 'CONTINUOUS_RUNTIME_CERTIFICATION_VERIFIED');

    console.log('Stream P8 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
