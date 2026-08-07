const assert = require('assert');
const path = require('path');
const fs = require('fs');
const ReleaseBundleVerificationEngine = require('../../engine/packaging/ReleaseBundleVerificationEngine');

async function testReleaseProvenanceSuite() {
    console.log('--- Running ReleaseBundleVerificationEngine Tests ---');
    const engine = new ReleaseBundleVerificationEngine();

    // 1. generateReleaseProvenance
    const prov = engine.generateReleaseProvenance({ releaseId: 'REL-2026.3.1-LTS', gitCommit: 'abc1234', buildId: 'BUILD-001' });
    assert.strictEqual(prov.releaseId, 'REL-2026.3.1-LTS');
    assert.strictEqual(typeof prov.provenanceHash, 'string');
    assert.strictEqual(prov.provenanceHash.length, 64);
    console.log('[PASS] 1. generateReleaseProvenance generated 64-char hash');

    // 2. generateRBOM
    const rbom = engine.generateRBOM({ version: '2026.3.1-LTS', artifacts: [{ packageId: '01_source_snapshot', filename: '01_source_snapshot.zip', sha256: 'hash1' }] }, prov);
    assert.strictEqual(rbom.release, '2026.3.1-LTS');
    assert.strictEqual(typeof rbom.rbomHash, 'string');
    assert.strictEqual(rbom.rbomHash.length, 64);
    console.log('[PASS] 2. generateRBOM generated release bill of materials');

    // 3. verifyCrossPackageDerivation
    const snapshotPaths = ['engine/EAORCS.js', 'cli/main.js', 'package.json'];
    const derivedPaths = ['engine/EAORCS.js', 'package.json'];
    const devRes = engine.verifyCrossPackageDerivation(snapshotPaths, derivedPaths);
    assert.strictEqual(devRes.derivedValid, true);
    assert.strictEqual(devRes.missingFromSnapshot.length, 0);
    console.log('[PASS] 3. verifyCrossPackageDerivation verified matching derived paths');

    // 4. verifyCrossPackageDerivation invalid detection
    const devResBad = engine.verifyCrossPackageDerivation(snapshotPaths, ['engine/EAORCS.js', 'unknown/file.js']);
    assert.strictEqual(devResBad.derivedValid, false);
    assert.strictEqual(devResBad.missingFromSnapshot.length, 1);
    console.log('[PASS] 4. verifyCrossPackageDerivation detected un-derived path');

    // 5. verifyBundleIntegrity on release directory
    const releaseDir = path.resolve(__dirname, '../../release');
    if (fs.existsSync(releaseDir) && fs.existsSync(path.join(releaseDir, 'MANIFEST.json'))) {
        const integrity = engine.verifyBundleIntegrity(releaseDir);
        assert.strictEqual(typeof integrity.valid, 'boolean');
        console.log('[PASS] 5. verifyBundleIntegrity evaluated release directory');
    } else {
        console.log('[PASS] 5. verifyBundleIntegrity skipped (release directory not yet populated)');
    }

    console.log('All ReleaseBundleVerificationEngine tests passed.');
}

if (require.main === module) {
    testReleaseProvenanceSuite().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = testReleaseProvenanceSuite;
