const assert = require('assert');
const EcosystemIntelligencePlatformEngine = require('../../engine/spec/EcosystemIntelligencePlatformEngine');

async function runTest() {
    console.log('Running test for EcosystemIntelligencePlatformEngine...');
    const engine = new EcosystemIntelligencePlatformEngine();
    const result = await engine.run();
    assert.strictEqual(result.engineType, 'ECOSYSTEM_INTELLIGENCE_PLATFORM_ENGINE');
    assert.strictEqual(result.subsystemOptimizationsGeneratedCount, 14);
    assert.strictEqual(result.sharedServiceOptimizationsCount, 8);
    assert.strictEqual(result.developerWorkflowBoostPercent, 38.0);
    assert.strictEqual(result.overallPlatformEfficiencyScorePercent, 99.8);
    assert.strictEqual(result.status, 'ECOSYSTEM_INTELLIGENCE_PLATFORM_VERIFIED');
    console.log('Test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
