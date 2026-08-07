const assert = require('assert');
const ReproducibleBuildEngine = require('../../engine/validation/ReproducibleBuildEngine');

async function testReproducibleBuildSuite() {
    console.log('--- Running ReproducibleBuildEngine Tests ---');
    const engine = new ReproducibleBuildEngine();

    // 1. captureSourceFingerprint
    const fp1 = engine.captureSourceFingerprint([{ path: 'a.js', content: 'hello' }]);
    assert.strictEqual(typeof fp1.fingerprint, 'string');
    assert.strictEqual(fp1.fingerprint.length, 64);
    console.log('[PASS] 1. captureSourceFingerprint returns 64-char hex');

    // 2. Deterministic fingerprinting
    const fp2 = engine.captureSourceFingerprint([{ path: 'a.js', content: 'hello' }]);
    assert.strictEqual(fp1.fingerprint, fp2.fingerprint);
    console.log('[PASS] 2. Deterministic fingerprinting verified');

    // 3. runReproducibleBuild deterministic
    const res1 = engine.runReproducibleBuild(() => 'fixed-output', 3);
    assert.strictEqual(res1.allIdentical, true);
    assert.strictEqual(res1.agreementPct, 100);
    console.log('[PASS] 3. runReproducibleBuild deterministic passed');

    // 4. runReproducibleBuild non-deterministic
    let count = 0;
    const res2 = engine.runReproducibleBuild(() => `output-${++count}`, 2);
    assert.strictEqual(res2.allIdentical, false);
    console.log('[PASS] 4. runReproducibleBuild non-deterministic detected');

    // 5. compareBuilds identical
    const comp1 = engine.compareBuilds('hash1', 'hash1');
    assert.strictEqual(comp1.identical, true);
    console.log('[PASS] 5. compareBuilds identical passed');

    // 6. compareBuilds different
    const comp2 = engine.compareBuilds('hash1', 'hash2');
    assert.strictEqual(comp2.identical, false);
    console.log('[PASS] 6. compareBuilds different passed');

    // 7. recordBuildBaseline
    const base = engine.recordBuildBaseline('v2026.3.1', fp1.fingerprint, res1.hashes[0]);
    assert.strictEqual(base.tag, 'v2026.3.1');
    console.log('[PASS] 7. recordBuildBaseline recorded baseline');

    // 8. verifyAgainstBaseline
    const ver1 = engine.verifyAgainstBaseline('v2026.3.1', res1.hashes[0], base.outputHash);
    assert.strictEqual(ver1.verified, true);
    const ver2 = engine.verifyAgainstBaseline('v2026.3.1', 'wrong-hash', base.outputHash);
    assert.strictEqual(ver2.verified, false);
    console.log('[PASS] 8. verifyAgainstBaseline verified matching and non-matching hashes');

    console.log('All ReproducibleBuildEngine tests passed.');
}

if (require.main === module) {
    testReproducibleBuildSuite().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = testReproducibleBuildSuite;
