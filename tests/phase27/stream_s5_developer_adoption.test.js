const assert = require('assert');
const DeveloperAdoptionEngine = require('../../engine/sdk/DeveloperAdoptionEngine');

async function runTests() {
  try {
    const engine = new DeveloperAdoptionEngine();
    const result = await engine.run();
    assert.strictEqual(result.engineType, 'DEVELOPER_ADOPTION_ENGINE');
    assert.strictEqual(result.cliInstallerVerified, true);
    assert.strictEqual(result.vscodePluginSync, true);
    assert.strictEqual(result.jetbrainsPluginSync, true);
    assert.strictEqual(result.sampleReposCount, 8);
    assert.strictEqual(result.githubActionsTemplatesCount, 5);
    assert.strictEqual(result.status, 'DEVELOPER_ADOPTION_VERIFIED');
    console.log('DeveloperAdoptionEngine tests passed');
    process.exit(0);
  } catch (error) {
    console.error('DeveloperAdoptionEngine tests failed:', error);
    process.exit(1);
  }
}

runTests();
