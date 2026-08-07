const assert = require('assert');
const ReleaseAuthorizationEngine = require('../../engine/governance/ReleaseAuthorizationEngine');
const EvidencePlatformEngine = require('../../engine/telemetry/EvidencePlatformEngine');
const PackagingPlatformEngine = require('../../engine/packaging/PackagingPlatformEngine');

function runTests() {
    console.log('--- Running CORP Phase 3 Release Pipeline Tests ---');

    // 1. ReleaseAuthorizationEngine
    const authEngine = new ReleaseAuthorizationEngine();
    
    // 1. initializeRelease creates record in 'Qualification' phase
    const release = authEngine.initializeRelease('REL-001', 'PROF-001');
    assert.strictEqual(release.phase, 'Qualification', 'Should start in Qualification');
    
    // 2. advancePhase moves from Qualification -> Readiness -> Authorization -> Publication -> Evidence Freeze in sequence
    authEngine.advancePhase('REL-001', { check: 'readiness' });
    assert.strictEqual(authEngine.getPhaseStatus('REL-001').phase, 'Readiness');
    
    authEngine.advancePhase('REL-001', { check: 'auth' });
    assert.strictEqual(authEngine.getPhaseStatus('REL-001').phase, 'Authorization');
    
    authEngine.advancePhase('REL-001', { check: 'pub' });
    assert.strictEqual(authEngine.getPhaseStatus('REL-001').phase, 'Publication');
    
    authEngine.advancePhase('REL-001', { check: 'freeze' });
    assert.strictEqual(authEngine.getPhaseStatus('REL-001').phase, 'Evidence Freeze');

    // 3. canAdvance returns false when already in Evidence Freeze
    const advanceStatus = authEngine.canAdvance('REL-001');
    assert.strictEqual(advanceStatus.canAdvance, false, 'Should not advance past Evidence Freeze');

    // 4. Cannot skip phases
    const authEngine2 = new ReleaseAuthorizationEngine();
    authEngine2.initializeRelease('REL-002', 'PROF-002');
    assert.throws(() => {
        authEngine2.freezeEvidence('REL-002');
    }, /Cannot freeze evidence/);
    
    // 5. EvidencePlatformEngine
    const evEngine = new EvidencePlatformEngine();
    
    const evPkg = evEngine.createEvidencePackage('ExternalAudit', 'REL-001', { data: 'test' });
    assert.strictEqual(evPkg.packageType, 'ExternalAudit');

    // 6. addArtifact adds all 11 required artifact types
    const artifactTypes = [
        'ReleaseManifest', 'QualificationReport', 'GovernanceSnapshot',
        'WorkspaceGraph', 'SBOM', 'HashManifest', 'LicenseManifest',
        'DependencyManifest', 'DigitalSignature', 'CertificationSummary',
        'PlatformMetadata'
    ];
    for (const at of artifactTypes) {
        evEngine.addArtifact(evPkg.packageId, at, { content: at });
    }
    assert.strictEqual(evEngine.getPackageManifest(evPkg.packageId).artifacts.length, 11);

    // 7. sealPackage produces a SHA-256 hash
    const hash = evEngine.sealPackage(evPkg.packageId);
    assert.ok(hash, 'Should produce a hash');

    // 8. verifyPackageIntegrity returns valid: true for sealed package
    const integrity = evEngine.verifyPackageIntegrity(evPkg.packageId);
    assert.strictEqual(integrity.valid, true);

    // 9. listPackageTypes() returns all 8 package types
    const packageTypes = evEngine.listPackageTypes();
    assert.strictEqual(packageTypes.length, 8);

    // 10. PackagingPlatformEngine
    const pkgEngine = new PackagingPlatformEngine();
    const formats = pkgEngine.listFormats();
    assert.strictEqual(formats.length, 8);

    // 11. buildPackage returns buildStatus, hash, sizeBytes
    const buildRes = pkgEngine.buildPackage('DesktopInstaller', { v: 1 });
    assert.strictEqual(buildRes.buildStatus, 'SUCCESS');
    assert.ok(buildRes.hash);
    assert.ok(buildRes.sizeBytes > 0);

    // 12. signPackage returns a signature
    const signRes = pkgEngine.signPackage(buildRes.packageId, 'secret-key');
    assert.ok(signRes.signature);

    // 13. verifyPackageSignature returns valid: true after signing
    const sigCheck = pkgEngine.verifyPackageSignature(buildRes.packageId);
    assert.strictEqual(sigCheck.valid, true);

    console.log('--- All tests passed! ---');
}

try {
    runTests();
} catch (e) {
    console.error('Test Failed: ', e.message);
    process.exit(1);
}
