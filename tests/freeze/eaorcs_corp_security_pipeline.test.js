const assert = require('assert');
const SecurityPipelineEngine = require('../../engine/security/SecurityPipelineEngine');

async function testSecurityPipelineSuite() {
    console.log('--- Running SecurityPipelineEngine Tests ---');
    const engine = new SecurityPipelineEngine();

    // 1. SAST eval finding
    const sast1 = engine.runSASTScan([{ path: 'a.js', content: 'eval("x")' }]);
    assert.strictEqual(sast1.clean, false);
    assert.strictEqual(sast1.severity.critical, 1);
    console.log('[PASS] 1. SAST eval finding detected');

    // 2. SAST clean
    const sast2 = engine.runSASTScan([{ path: 'a.js', content: 'const x = 1;' }]);
    assert.strictEqual(sast2.clean, true);
    console.log('[PASS] 2. SAST clean file verified');

    // 3. Dependency vuln
    const dep1 = engine.runDependencyScan({ 'lodash': '4.17.20' });
    assert.strictEqual(dep1.clean, false);
    assert.strictEqual(dep1.vulnerable.length, 1);
    console.log('[PASS] 3. Dependency vulnerability detected');

    // 4. Dependency clean
    const dep2 = engine.runDependencyScan({ 'lodash': '4.17.21' });
    assert.strictEqual(dep2.clean, true);
    console.log('[PASS] 4. Dependency clean version verified');

    // 5. License scan
    const lic1 = engine.runLicenseScan({ 'express': '4.0.0' }, ['MIT']);
    assert.strictEqual(typeof lic1.compliant, 'boolean');
    console.log('[PASS] 5. License scan performed');

    // 6. Secret scan finding
    const sec1 = engine.runSecretScan([{ path: 'a.js', content: 'const key = "AKIAIOSFODNN7EXAMPLE";' }]);
    assert.strictEqual(sec1.clean, false);
    assert.strictEqual(sec1.findings.length, 1);
    console.log('[PASS] 6. Secret scan finding detected');

    // 7. Secret scan clean
    const sec2 = engine.runSecretScan([{ path: 'a.js', content: 'const x = 1;' }]);
    assert.strictEqual(sec2.clean, true);
    console.log('[PASS] 7. Secret scan clean file verified');

    // 8. Full pipeline clean
    const full1 = engine.runFullPipeline([{ path: 'a.js', content: 'const x = 1;' }], { 'lodash': '4.17.21' }, ['MIT']);
    assert.strictEqual(full1.overallClean, true);
    assert.strictEqual(typeof full1.evidenceHash, 'string');
    console.log('[PASS] 8. Full pipeline clean run verified');

    // 9. Generate report
    const rpt = engine.generateSecurityReport(full1);
    assert.strictEqual(typeof rpt.reportId, 'string');
    assert.strictEqual(typeof rpt.generatedAt, 'string');
    console.log('[PASS] 9. Security report generated');

    // 10. Full pipeline finding block gate
    const full2 = engine.runFullPipeline([{ path: 'a.js', content: 'eval("x")' }]);
    assert.strictEqual(full2.gates.sast, false);
    assert.strictEqual(full2.overallClean, false);
    console.log('[PASS] 10. Full pipeline finding blocked gate');

    console.log('All SecurityPipelineEngine tests passed.');
}

if (require.main === module) {
    testSecurityPipelineSuite().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = testSecurityPipelineSuite;
