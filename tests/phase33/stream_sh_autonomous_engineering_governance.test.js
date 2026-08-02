const assert = require('assert');
const AutonomousEngineeringGovernanceEngine = require('../../engine/quality/AutonomousEngineeringGovernanceEngine');

async function runTest() {
    console.log('Running test for AutonomousEngineeringGovernanceEngine...');
    const engine = new AutonomousEngineeringGovernanceEngine();
    const result = await engine.run();
    assert.ok(result);
    console.log('Test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
