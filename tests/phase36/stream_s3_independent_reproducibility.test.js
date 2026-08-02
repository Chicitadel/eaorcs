'use strict';

const assert = require('assert');
const IndependentReproducibilityEngine = require('../../engine/audit/IndependentReproducibilityEngine');

async function runTest() {
    console.log('Running test for IndependentReproducibilityEngine (Stream S3)...');
    const engine = new IndependentReproducibilityEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'INDEPENDENT_REPRODUCIBILITY_ENGINE');
    assert.strictEqual(result.reproducibleAuditToolkitsCount, 36);
    assert.strictEqual(result.externalAuditorVerificationScorePercent, 100.0);
    assert.strictEqual(result.zeroPreCalculatedSummaryDependenceClearance, 'FULLY_REPRODUCIBLE_INDEPENDENT_AUDIT');
    assert.strictEqual(result.status, 'INDEPENDENT_REPRODUCIBILITY_VERIFIED');

    console.log('Stream S3 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
