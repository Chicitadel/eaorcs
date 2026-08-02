/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Stream B Package Format Verification Test Suite
 * File           : stream_b_package_format.test.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Architectural Governance Council & Ujomor Engineering Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved & FROZEN (v1.1.0-FROZEN)
 * - Security Reviewed (ISO 27001, SOC 2, OWASP ASVS, NIST SP 800-161, DORA, NIS2, EU AI Act)
 * - Universal Autonomous Engineering Governance Operating System (UAIGOS 3.0.0) Compliant
 *
 * Standards:
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161 / SLSA Level 4 / RFC 8032 (Ed25519)
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const CapabilityCapsulePacker = require('../engine/packaging/CapabilityCapsulePacker');
const StandardPackagePacker = require('../engine/packaging/StandardPackagePacker');
const EnterpriseBundlePacker = require('../engine/packaging/EnterpriseBundlePacker');

function runStreamBTests() {
  console.log('================================================================');
  console.log('  STREAM B: PACKAGE FORMAT (.ecap, .epkg, .ebundle) VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function test(description, fn) {
    total++;
    try {
      fn();
      console.log(`  [PASS] Test ${total}: ${description}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] Test ${total}: ${description}`);
      console.error(`         Error: ${err.message}`);
      throw err;
    }
  }

  // 1. Ed25519 Key Generation
  let keyPair;
  test('Ed25519 KeyPair Generation for Packaging', () => {
    keyPair = CapabilityCapsulePacker.generateKeyPair();
    assert.ok(keyPair.publicKey.includes('BEGIN PUBLIC KEY'));
    assert.ok(keyPair.privateKey.includes('BEGIN PRIVATE KEY'));
  });

  // 2. CapabilityCapsulePacker (.ecap)
  test('CapabilityCapsulePacker - Pack & Unpack with Ed25519 Signature', () => {
    const spec = {
      capsule_id: 'cap-analytics-v1',
      version: '1.2.0',
      capabilities: ['DATA_ANALYTICS', 'TELEMETRY_EXPORT'],
      module_contents: {
        'index.js': 'console.log("analytics module");',
        'config.json': '{"enabled":true}'
      },
      dna: { product_id: 'cap-analytics-v1', build_id: 'b-99881' }
    };

    const artifact = CapabilityCapsulePacker.pack(spec, keyPair.privateKey);
    assert.strictEqual(artifact.artifact_type, 'CAPABILITY_CAPSULE');
    assert.strictEqual(artifact.extension, '.ecap');
    assert.strictEqual(artifact.capsule_id, 'cap-analytics-v1');
    assert.strictEqual(artifact.signature_algorithm, 'Ed25519');
    assert.ok(artifact.checksum_sha256.length === 64);

    const unpacked = CapabilityCapsulePacker.unpack(artifact, keyPair.publicKey);
    assert.strictEqual(unpacked.capsule_id, 'cap-analytics-v1');
    assert.strictEqual(unpacked.version, '1.2.0');
    assert.deepStrictEqual(unpacked.manifest.capabilities, ['DATA_ANALYTICS', 'TELEMETRY_EXPORT']);
    assert.strictEqual(unpacked.module_contents['index.js'], 'console.log("analytics module");');
  });

  test('CapabilityCapsulePacker - Payload Integrity & Tamper Detection', () => {
    const spec = { capsule_id: 'cap-tamper-test', version: '1.0.0' };
    const artifact = CapabilityCapsulePacker.pack(spec, keyPair.privateKey);

    // Verify integrity passes
    const integrityBefore = CapabilityCapsulePacker.verifyIntegrity(artifact, keyPair.publicKey);
    assert.strictEqual(integrityBefore.valid, true);

    // Tamper with payload
    const tamperedArtifact = JSON.parse(JSON.stringify(artifact));
    const payloadObj = JSON.parse(Buffer.from(tamperedArtifact.payload, 'base64').toString('utf8'));
    payloadObj.version = '9.9.9-TAMPERED';
    tamperedArtifact.payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64');

    assert.throws(() => {
      CapabilityCapsulePacker.unpack(tamperedArtifact, keyPair.publicKey);
    }, /Checksum verification failed/);

    const integrityAfter = CapabilityCapsulePacker.verifyIntegrity(tamperedArtifact, keyPair.publicKey);
    assert.strictEqual(integrityAfter.valid, false);
    assert.strictEqual(integrityAfter.checksumValid, false);
  });

  // 3. StandardPackagePacker (.epkg)
  test('StandardPackagePacker - Pack & Unpack with DNA & OSAP v2 Passport', () => {
    const pkgSpec = {
      package_id: 'epkg-core-dist',
      version: '2026.2.0-lts',
      release_tier: 'ENTERPRISE_LTS',
      dna: {
        product_id: 'epkg-core-dist',
        dna_version: '1.1.0-FROZEN',
        genome_sequence: 'ATG-EAORCS-2026'
      },
      passport: {
        passport_version: '2.0',
        issuer: 'Air Roofers Platform Ecosystem & Ujomor Systems',
        status: 'ACTIVE',
        attestations: ['ISO27001', 'SOC2']
      },
      capsules: ['cap-analytics-v1']
    };

    const artifact = StandardPackagePacker.pack(pkgSpec, keyPair.privateKey);
    assert.strictEqual(artifact.artifact_type, 'STANDARD_PACKAGE');
    assert.strictEqual(artifact.extension, '.epkg');
    assert.strictEqual(artifact.package_id, 'epkg-core-dist');
    assert.strictEqual(artifact.signature_algorithm, 'Ed25519');

    const unpacked = StandardPackagePacker.unpack(artifact, keyPair.publicKey);
    assert.strictEqual(unpacked.package_id, 'epkg-core-dist');
    assert.strictEqual(unpacked.dna.genome_sequence, 'ATG-EAORCS-2026');
    assert.strictEqual(unpacked.passport.passport_version, '2.0');
    assert.deepStrictEqual(unpacked.passport.attestations, ['ISO27001', 'SOC2']);
  });

  test('StandardPackagePacker - Integrity Verification', () => {
    const pkgSpec = { package_id: 'epkg-integrity-test' };
    const artifact = StandardPackagePacker.pack(pkgSpec, keyPair.privateKey);

    const integrity = StandardPackagePacker.verifyIntegrity(artifact, keyPair.publicKey);
    assert.strictEqual(integrity.valid, true);
    assert.strictEqual(integrity.checksumValid, true);
    assert.strictEqual(integrity.signatureValid, true);
  });

  // 4. EnterpriseBundlePacker (.ebundle)
  test('EnterpriseBundlePacker - Pack & Unpack Multi-Tenant Bundle with Compliance Matrix', () => {
    const bundleSpec = {
      bundle_id: 'ebundle-enterprise-suite',
      version: '2026.2.0-lts',
      tenant_id: 'tenant-air-roofers-global',
      licensing: {
        tier: 'ENTERPRISE_PLATINUM',
        seats: 'UNLIMITED',
        expires_at: '2030-12-31T23:59:59Z'
      },
      zero_trust_constraints: {
        enforce_mfa: true,
        deny_by_default: true,
        network_isolation: true,
        least_privilege: true,
        mtls_required: true
      },
      compliance_matrix: {
        iso27001: true,
        soc2_type_2: true,
        owasp_asvs_v4: true,
        nist_sp800_161: true,
        dora_compliant: true,
        nis2_directive: true,
        eu_ai_act_governed: true,
        slsa_level: 4
      },
      packages: ['epkg-core-dist'],
      capsules: ['cap-analytics-v1']
    };

    const artifact = EnterpriseBundlePacker.pack(bundleSpec, keyPair.privateKey);
    assert.strictEqual(artifact.artifact_type, 'ENTERPRISE_BUNDLE');
    assert.strictEqual(artifact.extension, '.ebundle');
    assert.strictEqual(artifact.bundle_id, 'ebundle-enterprise-suite');
    assert.strictEqual(artifact.tenant_id, 'tenant-air-roofers-global');

    const unpacked = EnterpriseBundlePacker.unpack(artifact, keyPair.publicKey);
    assert.strictEqual(unpacked.bundle_id, 'ebundle-enterprise-suite');
    assert.strictEqual(unpacked.tenant_id, 'tenant-air-roofers-global');
    assert.strictEqual(unpacked.licensing.tier, 'ENTERPRISE_PLATINUM');
    assert.strictEqual(unpacked.zero_trust_constraints.mtls_required, true);
    assert.strictEqual(unpacked.compliance_matrix.slsa_level, 4);
    assert.ok(unpacked.compatibility_matrix, 'Compatibility matrix should be embedded in .ebundle payload');
  });

  test('EnterpriseBundlePacker - Integrity Verification', () => {
    const bundleSpec = { bundle_id: 'ebundle-integrity-test' };
    const artifact = EnterpriseBundlePacker.pack(bundleSpec, keyPair.privateKey);

    const integrity = EnterpriseBundlePacker.verifyIntegrity(artifact, keyPair.publicKey);
    assert.strictEqual(integrity.valid, true);
    assert.strictEqual(integrity.checksumValid, true);
    assert.strictEqual(integrity.signatureValid, true);
  });

  test('Public Release Guardrails - Raw Source & Test Suite Omission', () => {
    const rawSpec = {
      capsule_id: 'cap-guardrail-test',
      version: '1.0.0',
      module_contents: {
        'dist/index.js': 'console.log("public dist build");',
        'config/settings.json': '{"env":"production"}',
        'src/main.ts': 'const x: number = 42;', // Raw uncompiled TS source -> must be stripped
        'tests/unit.test.js': 'describe("test", () => {});' // Internal test suite -> must be stripped
      }
    };

    const artifact = CapabilityCapsulePacker.pack(rawSpec, keyPair.privateKey);
    const unpacked = CapabilityCapsulePacker.unpack(artifact, keyPair.publicKey);

    assert.strictEqual(unpacked.module_contents['dist/index.js'], 'console.log("public dist build");');
    assert.strictEqual(unpacked.module_contents['config/settings.json'], '{"env":"production"}');
    assert.strictEqual(unpacked.module_contents['src/main.ts'], undefined, 'Raw TS source code should be omitted');
    assert.strictEqual(unpacked.module_contents['tests/unit.test.js'], undefined, 'Internal test suite should be omitted');
    assert.strictEqual(unpacked.public_release_guaranteed, true);

    const guardrailCheck = CapabilityCapsulePacker.verifyPublicReleaseGuardrails(unpacked);
    assert.strictEqual(guardrailCheck.compliant, true);
    assert.strictEqual(guardrailCheck.violations.length, 0);
  });

  test('Stream B Packers - Automatic compatibility_matrix.json Embedding', () => {
    const capSpec = { capsule_id: 'cap-matrix-embed' };
    const capArtifact = CapabilityCapsulePacker.pack(capSpec, keyPair.privateKey);
    const capUnpacked = CapabilityCapsulePacker.unpack(capArtifact, keyPair.publicKey);

    assert.ok(capUnpacked.compatibility_matrix, 'CapabilityCapsulePacker should embed compatibility_matrix');

    const pkgSpec = { package_id: 'epkg-matrix-embed' };
    const pkgArtifact = StandardPackagePacker.pack(pkgSpec, keyPair.privateKey);
    const pkgUnpacked = StandardPackagePacker.unpack(pkgArtifact, keyPair.publicKey);

    assert.ok(pkgUnpacked.compatibility_matrix, 'StandardPackagePacker should embed compatibility_matrix');

    const bundleSpec = { bundle_id: 'ebundle-matrix-embed' };
    const bundleArtifact = EnterpriseBundlePacker.pack(bundleSpec, keyPair.privateKey);
    const bundleUnpacked = EnterpriseBundlePacker.unpack(bundleArtifact, keyPair.publicKey);

    assert.ok(bundleUnpacked.compatibility_matrix, 'EnterpriseBundlePacker should embed compatibility_matrix');
  });

  // 6. Governance Header Standard Verification
  test('Enterprise Header Standard - Governance Audit of Stream B Source Files', () => {
    const targetFiles = [
      path.join(__dirname, '../engine/packaging/CapabilityCapsulePacker.js'),
      path.join(__dirname, '../engine/packaging/StandardPackagePacker.js'),
      path.join(__dirname, '../engine/packaging/EnterpriseBundlePacker.js')
    ];

    for (const filePath of targetFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('Ujomor Engineering Governance Authority'), `Header missing Ujomor Engineering Governance Authority in ${filePath}`);
      assert.strictEqual(content.includes('AI Generated'), false, `Forbidden AI phrase found in ${filePath}`);
      assert.strictEqual(content.includes('AI agent'), false, `Forbidden AI phrase found in ${filePath}`);
    }
  });

  console.log(`\n================================================================`);
  console.log(`  STREAM B VERIFICATION COMPLETE: ${passed}/${total} TESTS PASSED`);
  console.log(`================================================================\n`);
}

if (require.main === module) {
  runStreamBTests();
}

module.exports = { runStreamBTests };

