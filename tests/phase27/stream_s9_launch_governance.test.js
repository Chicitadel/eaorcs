const LaunchGovernanceEngine = require('../../engine/governance/LaunchGovernanceEngine');
const assert = require('assert');

async function runTest() {
    console.log('Running Launch Governance Engine Test...');
    const engine = new LaunchGovernanceEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'LAUNCH_GOVERNANCE_ENGINE');
    assert.strictEqual(result.launchGatesVerifiedCount, 11);
    assert.strictEqual(result.passedGatesCount, 11);
    assert.strictEqual(result.architectureGatePassed, true);
    assert.strictEqual(result.blueprintGatePassed, true);
    assert.strictEqual(result.apiGatePassed, true);
    assert.strictEqual(result.securityGatePassed, true);
    assert.strictEqual(result.runtimeGatePassed, true);
    assert.strictEqual(result.evidenceGatePassed, true);
    assert.strictEqual(result.commercialGatePassed, true);
    assert.strictEqual(result.documentationGatePassed, true);
    assert.strictEqual(result.supportGatePassed, true);
    assert.strictEqual(result.certificationGatePassed, true);
    assert.strictEqual(result.executiveLaunchGatePassed, true);
    assert.strictEqual(result.status, 'LAUNCH_GOVERNANCE_VERIFIED');

    console.log('Stream S9 passed.');
}

if (require.main === module) {
    runTest().catch(e => {
        console.error(e);
        process.exit(1);
    });
}
module.exports = runTest;
