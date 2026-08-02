const assert = require('assert');
const AutonomousQualityGovernanceEngine = require('../../engine/quality/AutonomousQualityGovernanceEngine');

async function runTest() {
    console.log('Running test for AutonomousQualityGovernanceEngine...');
    const engine = new AutonomousQualityGovernanceEngine();
    const result = await engine.run();
    assert.strictEqual(result.engineType, 'AUTONOMOUS_QUALITY_GOVERNANCE_ENGINE');
    assert.strictEqual(result.apiCompatibilityScorePercent, 100.0);
    assert.strictEqual(result.architecturalDriftScorePercent, 0.0);
    assert.strictEqual(result.dependencyHealthScorePercent, 100.0);
    assert.strictEqual(result.documentationDriftScorePercent, 100.0);
    assert.strictEqual(result.performanceRegressionScorePercent, 0.0);
    assert.strictEqual(result.securityPostureScorePercent, 100.0);
    assert.strictEqual(result.status, 'AUTONOMOUS_QUALITY_GOVERNANCE_VERIFIED');
    console.log('Test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
