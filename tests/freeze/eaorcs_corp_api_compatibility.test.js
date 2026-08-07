const assert = require('assert');
const ExternalAPICompatibilityEngine = require('../../engine/validation/ExternalAPICompatibilityEngine');
const UpgradeQualificationEngine = require('../../engine/validation/UpgradeQualificationEngine');

async function testAPICompatibilitySuite() {
    console.log('--- Running ExternalAPICompatibilityEngine & UpgradeQualificationEngine Tests ---');
    const apiEngine = new ExternalAPICompatibilityEngine();
    const upEngine = new UpgradeQualificationEngine();

    // 1. Integrations count
    const apiRpt = apiEngine.getCompatibilityReport();
    assert.strictEqual(apiRpt.totalIntegrations, 6);
    console.log('[PASS] 1. Pre-registered 6 integrations verified');

    // 2. validateIntegrationContract
    const contract = apiEngine.validateIntegrationContract('GITHUB');
    assert.strictEqual(contract.valid, true);
    assert.strictEqual(typeof contract.evidenceHash, 'string');
    console.log('[PASS] 2. validateIntegrationContract verified');

    // 3. runCompatibilitySuite
    const suite = apiEngine.runCompatibilitySuite('GITLAB');
    assert.strictEqual(suite.passed, true);
    assert.strictEqual(suite.scenarios.length, 3);
    console.log('[PASS] 3. runCompatibilitySuite verified');

    // 4. generateCompatibilityMatrix
    const matrix = apiEngine.generateCompatibilityMatrix();
    assert.strictEqual(matrix.totalIntegrations, 6);
    console.log('[PASS] 4. generateCompatibilityMatrix verified');

    // 5. detectBreakingChange
    const brk = apiEngine.detectBreakingChange('GITHUB', '1.0.0', '2.0.0');
    assert.strictEqual(brk.hasBreakingChange, true);
    console.log('[PASS] 5. detectBreakingChange verified');

    // 6. Upgrade buildUpgradePath
    const pathRes = upEngine.buildUpgradePath('v2026.1.0', 'v2026.3.1-LTS');
    assert.strictEqual(pathRes.path.length, 4);
    console.log('[PASS] 6. buildUpgradePath generated 4-step path');

    // 7. validateUpgradePath
    const valRes = upEngine.validateUpgradePath('v2026.1.0', 'v2026.3.1-LTS');
    assert.strictEqual(valRes.valid, true);
    assert.strictEqual(valRes.unqualifiedSteps.length, 0);
    console.log('[PASS] 7. validateUpgradePath verified path');

    // 8. runUpgradeScenario
    const runRes = upEngine.runUpgradeScenario('v2026.1.0', 'v2026.2.0', () => ({ success: true }));
    assert.strictEqual(runRes.passed, true);
    console.log('[PASS] 8. runUpgradeScenario executed migration function');

    // 9. getUpgradeMatrix
    const upMatrix = upEngine.getUpgradeMatrix();
    assert.strictEqual(upMatrix.matrix['v2026.1.0']['v2026.2.0'], 'QUALIFIED');
    console.log('[PASS] 9. getUpgradeMatrix verified qualification state');

    // 10. generateUpgradeReport
    const upRpt = upEngine.generateUpgradeReport('v2026.1.0', 'v2026.3.1-LTS');
    assert.strictEqual(typeof upRpt.evidenceHash, 'string');
    assert.strictEqual(upRpt.qualified, true);
    console.log('[PASS] 10. generateUpgradeReport generated evidence');

    console.log('All ExternalAPICompatibilityEngine & UpgradeQualificationEngine tests passed.');
}

if (require.main === module) {
    testAPICompatibilitySuite().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = testAPICompatibilitySuite;
