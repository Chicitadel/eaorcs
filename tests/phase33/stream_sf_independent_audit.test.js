const assert = require('assert');
const IndependentAuditEngine = require('../../engine/audit/IndependentAuditEngine');

async function runTest() {
    console.log('Running test for IndependentAuditEngine...');
    const engine = new IndependentAuditEngine();
    const result = await engine.run();
    assert.strictEqual(result.engineType, 'INDEPENDENT_AUDIT_ENGINE');
    assert.strictEqual(result.status, 'INDEPENDENT_AUDIT_VERIFIED');
    console.log('Test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
