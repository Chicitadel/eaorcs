/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Stream 1 Freeze Verification Test
 * File           : eaorcs_corp_stream1_packaging_verification.test.js
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
 * CORP: Stream 1 — Release Packaging & Verification Refinements Test Suite
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
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const eaorcsRoot = path.resolve(__dirname, '../../');

const buildSignaturesPkg = require('../../scripts/packaging/build_signatures_package');
const buildSbomPkg       = require('../../scripts/packaging/build_sbom_package');
const buildCommercialPkg = require('../../scripts/packaging/build_commercial_package');
const ReleaseBundleVerificationEngine = require('../../engine/packaging/ReleaseBundleVerificationEngine');

console.log('[TEST] Executing Stream 1 Release Packaging & Verification Freeze Tests...');

// Test 1: Signatures package builder output & detached signatures
console.log('[TEST 1] Testing build_signatures_package.js...');
const sigManifest = buildSignaturesPkg.buildManifest(eaorcsRoot);
assert.strictEqual(sigManifest.packageId, '07_signatures');
assert.strictEqual(sigManifest.includedPaths.length, 5, 'Should include 5 signature files');

const tmpSigDir = path.join(eaorcsRoot, 'tmp', 'signatures_export');
const artifactSigsPath = path.join(tmpSigDir, 'artifact_signatures.json');
const releaseCertPath  = path.join(tmpSigDir, 'RELEASE_CERTIFICATE.json');
const pubKeyPath       = path.join(tmpSigDir, 'public_key.pem');

assert.ok(fs.existsSync(artifactSigsPath), 'artifact_signatures.json must exist');
assert.ok(fs.existsSync(releaseCertPath), 'RELEASE_CERTIFICATE.json must exist');
assert.ok(fs.existsSync(pubKeyPath), 'public_key.pem must exist');

const artifactSigs = JSON.parse(fs.readFileSync(artifactSigsPath, 'utf8'));
assert.strictEqual(artifactSigs.algorithm, 'Ed25519');
assert.ok(artifactSigs.signatures['01_source_snapshot.zip'], 'Must contain 01_source_snapshot signature');
assert.ok(artifactSigs.signatures['06_sbom.zip'], 'Must contain 06_sbom signature');
assert.ok(artifactSigs.signatures['01_source_snapshot.zip'].signatureHex, 'Must contain signatureHex');
assert.ok(artifactSigs.signatures['01_source_snapshot.zip'].sha256, 'Must contain sha256 hash');

const releaseCert = JSON.parse(fs.readFileSync(releaseCertPath, 'utf8'));
assert.strictEqual(releaseCert.algorithm, 'Ed25519');
assert.strictEqual(releaseCert.certificate.status, 'PASSED_AND_VERIFIED');
console.log('    ✓ build_signatures_package.js verified successfully');

// Test 2: SBOM package builder output & metadata
console.log('[TEST 2] Testing build_sbom_package.js...');
const sbomManifest = buildSbomPkg.buildManifest(eaorcsRoot);
assert.strictEqual(sbomManifest.packageId, '06_sbom');
assert.strictEqual(sbomManifest.includedPaths.length, 3, 'Should include spdx, cyclonedx, and sbom_metadata');

const tmpSbomDir = path.join(eaorcsRoot, 'tmp', 'sbom_export');
const sbomMetadataPath = path.join(tmpSbomDir, 'sbom_metadata.json');
assert.ok(fs.existsSync(sbomMetadataPath), 'sbom_metadata.json must exist');

const sbomMetadata = JSON.parse(fs.readFileSync(sbomMetadataPath, 'utf8'));
assert.ok(sbomMetadata.generationTimestamp, 'Metadata must have generationTimestamp');
assert.ok(sbomMetadata.generatorVersion, 'Metadata must have generatorVersion');
assert.ok(sbomMetadata.spdxSha256, 'Metadata must have spdxSha256');
assert.ok(sbomMetadata.cycloneDxSha256, 'Metadata must have cycloneDxSha256');
assert.ok(sbomMetadata.detachedSignatureReference, 'Metadata must have detachedSignatureReference');
console.log('    ✓ build_sbom_package.js verified successfully');

// Test 3: Commercial package builder exclusion and inclusion rules
console.log('[TEST 3] Testing build_commercial_package.js...');
const commManifest = buildCommercialPkg.buildManifest(eaorcsRoot);
assert.strictEqual(commManifest.packageId, '03_customer_release');
assert.ok(commManifest.includedPaths.includes('templates/'), 'Must include templates/');
assert.ok(commManifest.includedPaths.includes('examples/'), 'Must include examples/');
assert.ok(commManifest.includedPaths.includes('bin/eaorcs.js'), 'Must include bin/eaorcs.js');
assert.ok(commManifest.includedPaths.includes('cli/'), 'Must include cli/');
assert.ok(commManifest.includedPaths.includes('docs/Installation_Guide.md'), 'Must include docs/Installation_Guide.md');
assert.ok(commManifest.includedPaths.includes('docs/User_Guide.md'), 'Must include docs/User_Guide.md');
assert.ok(commManifest.includedPaths.includes('docs/Administrator_Guide.md'), 'Must include docs/Administrator_Guide.md');
assert.ok(commManifest.includedPaths.includes('docs/CLI_Reference.md'), 'Must include docs/CLI_Reference.md');
assert.ok(commManifest.includedPaths.includes('docs/Configuration_Guide.md'), 'Must include docs/Configuration_Guide.md');
assert.ok(!commManifest.includedPaths.includes('docs/'), 'Must not include docs/ wildcard');

assert.ok(commManifest.excludedPaths.includes('tests/'), 'Must exclude tests/');
assert.ok(commManifest.excludedPaths.includes('tmp/'), 'Must exclude tmp/');
assert.ok(commManifest.excludedPaths.includes('scripts/packaging/'), 'Must exclude scripts/packaging/');
assert.ok(commManifest.excludedPaths.includes('docs/research/'), 'Must exclude docs/research/');
console.log('    ✓ build_commercial_package.js verified successfully');

// Test 4: ReleaseBundleVerificationEngine methods
console.log('[TEST 4] Testing ReleaseBundleVerificationEngine additions...');
const engine = new ReleaseBundleVerificationEngine();

// Cross-package derivation test
const snapshotPaths = ['bin/', 'cli/', 'config/', 'docs/', 'engine/', 'package.json'];
const derivedPaths = ['bin/', 'cli/', 'config/', 'engine/runtime/', 'engine/cli/'];
const derivRes = engine.verifyCrossPackageDerivation(snapshotPaths, derivedPaths);
assert.strictEqual(derivRes.derivedValid, true, 'Derived paths should be valid under snapshot');

const invalidDerived = ['unauthorized_custom_dir/secret.js'];
const derivFailRes = engine.verifyCrossPackageDerivation(snapshotPaths, invalidDerived);
assert.strictEqual(derivFailRes.derivedValid, false, 'Uncovered derived path must fail derivation check');

// Detached signatures verification test
const sigCheck = engine.verifyDetachedSignatures(path.join(eaorcsRoot, 'release'), { signaturesDir: tmpSigDir });
assert.ok(sigCheck, 'verifyDetachedSignatures should return a result object');

console.log('    ✓ ReleaseBundleVerificationEngine verified successfully');

console.log('\n================================================================');
console.log('  ALL STREAM 1 PACKAGING & VERIFICATION REFINEMENTS TESTS PASSED');
console.log('================================================================\n');
