/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Master Release Manifest Engine Freeze Test
 * File           : release_manifest.test.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Stream 1 — Master Release Manifest & Customer Trimming
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ReleaseManifestEngine = require('../../engine/packaging/ReleaseManifestEngine');
const buildCommercialPkg = require('../../scripts/packaging/build_commercial_package');

const rootDir = path.resolve(__dirname, '../../');
const tmpTestDir = path.join(rootDir, 'tmp', 'test_manifest');

console.log('[TEST] Running ReleaseManifestEngine Freeze Unit & Integration Tests...');

// 1. Test generateMasterReleaseManifest
const engine = new ReleaseManifestEngine();
const mockArtifacts = [
    { packageId: '01_source_snapshot', packageName: 'Full Source Snapshot', filename: '01_source_snapshot.zip', sha256: 'abc123hash', sizeMB: '1.20', audience: 'architects' }
];

const masterManifest = engine.generateMasterReleaseManifest({
    releaseId: 'REL-2026.3.1-LTS',
    gitCommit: 'testcommit123',
    buildId: 'BUILD-999',
    artifacts: mockArtifacts
});

assert.strictEqual(masterManifest.releaseId, 'REL-2026.3.1-LTS');
assert.strictEqual(masterManifest.gitCommit, 'testcommit123');
assert.strictEqual(masterManifest.buildId, 'BUILD-999');
assert.ok(masterManifest.provenance);
assert.ok(masterManifest.provenance.provenanceHash);
assert.strictEqual(masterManifest.artifacts.length, 1);
assert.strictEqual(masterManifest.registryReferences.platformRegistry, 'platform_registry.yaml');
assert.strictEqual(masterManifest.governanceSeals.lawsCertifiedCount, 14);

console.log('  ✓ generateMasterReleaseManifest test passed.');

// 2. Test deriveRBOM
const rbom = engine.deriveRBOM(masterManifest);
assert.strictEqual(rbom.release, 'REL-2026.3.1-LTS');
assert.strictEqual(rbom.gitCommit, 'testcommit123');
assert.strictEqual(rbom.artifactsCount, 1);
assert.ok(rbom.rbomHash);

console.log('  ✓ deriveRBOM test passed.');

// 3. Test deriveManifest
const manifestJson = engine.deriveManifest(masterManifest);
assert.strictEqual(manifestJson.releaseId, 'REL-2026.3.1-LTS');
assert.strictEqual(manifestJson.lawsCertified, 14);
assert.strictEqual(manifestJson.artifactsCount, 1);

console.log('  ✓ deriveManifest test passed.');

// 4. Test deriveProvenance
const provenance = engine.deriveProvenance(masterManifest);
assert.strictEqual(provenance.releaseId, 'REL-2026.3.1-LTS');
assert.strictEqual(provenance.gitCommit, 'testcommit123');
assert.ok(provenance.provenanceHash);

console.log('  ✓ deriveProvenance test passed.');

// 5. Test exportReleaseManifestYaml and registries export
fs.mkdirSync(tmpTestDir, { recursive: true });

const yamlPath = path.join(tmpTestDir, 'release_manifest.yaml');
const platformRegPath = path.join(tmpTestDir, 'platform_registry.yaml');
const capRegPath = path.join(tmpTestDir, 'capability_registry.yaml');
const govRegPath = path.join(tmpTestDir, 'governance_registry.yaml');

engine.exportReleaseManifestYaml(masterManifest, yamlPath);
engine.exportPlatformRegistryYaml(platformRegPath);
engine.exportCapabilityRegistryYaml(capRegPath);
engine.exportGovernanceRegistryYaml(govRegPath);

assert.ok(fs.existsSync(yamlPath));
assert.ok(fs.existsSync(platformRegPath));
assert.ok(fs.existsSync(capRegPath));
assert.ok(fs.existsSync(govRegPath));

const yamlContent = fs.readFileSync(yamlPath, 'utf8');
assert.ok(yamlContent.includes('releaseId: REL-2026.3.1-LTS'));
assert.ok(yamlContent.includes('gitCommit: testcommit123'));
assert.ok(yamlContent.includes('platform_registry.yaml'));

console.log('  ✓ exportReleaseManifestYaml and registry exports test passed.');

// 6. Test build_commercial_package path trimming
const commercialManifest = buildCommercialPkg.buildManifest(rootDir);
assert.ok(!commercialManifest.includedPaths.includes('bin/'), 'bin/ directory wildcard should be removed');
assert.ok(commercialManifest.includedPaths.includes('bin/eaorcs.js'), 'bin/eaorcs.js should be included');
assert.ok(commercialManifest.includedPaths.includes('bin/eaorcs'), 'bin/eaorcs should be included');
assert.ok(commercialManifest.includedPaths.includes('bin/eaorcs.cmd'), 'bin/eaorcs.cmd should be included');

console.log('  ✓ build_commercial_package path trimming test passed.');

// Cleanup test temp dir
try { fs.rmSync(tmpTestDir, { recursive: true, force: true }); } catch (e) {}

console.log('\n[SUCCESS] All ReleaseManifestEngine freeze tests passed successfully.');
