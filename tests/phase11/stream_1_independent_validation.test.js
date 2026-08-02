/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 11 Stream 1 — Independent Validation & Lab Attestation Test Suite
 * File           : tests/phase11/stream_1_independent_validation.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const crypto = require('crypto');
const ReproducibleAuditEngine = require('../../engine/validation/ReproducibleAuditEngine');

function runStream1ValidationSuite() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 11 STREAM 1: INDEPENDENT VALIDATION & LAB ATTESTATION SUITE');
  console.log('================================================================================\n');

  const engine = new ReproducibleAuditEngine({
    engineVersion: '2026.1.0-LTS',
    organization: 'Ujomor Systems Engineering & Governance Authority'
  });

  // Generate test key pairs (Ed25519 and RSA)
  const ed25519LabKey = crypto.generateKeyPairSync('ed25519');
  const rsaLabKey = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const authorityKey = crypto.generateKeyPairSync('ed25519');

  // ---------------------------------------------------------------------------
  // 1. Third-Party Lab Registration & Key Management
  // ---------------------------------------------------------------------------
  console.log('[1/5] Testing Third-Party Lab Registration & Key Management...');

  const lab1 = engine.registerLab({
    labId: 'lab-tuv-cyber',
    name: 'TÜV Rheinland Cyber Security Laboratory',
    type: 'INDEPENDENT_TESTING_LAB',
    publicKey: ed25519LabKey.publicKey,
    standards: ['ISO_IEC_17025', 'ENISA_CERTIFIED', 'ISO_27001']
  });

  assert.strictEqual(lab1.labId, 'lab-tuv-cyber', 'Lab ID mismatch');
  assert.strictEqual(lab1.status, 'ACTIVE', 'Lab status should be ACTIVE');
  assert.strictEqual(engine.registeredLabs.size, 1, 'Expected 1 registered lab');

  const lab2 = engine.registerLab({
    labId: 'lab-cure53-sec',
    name: 'Cure53 Security Assessment Lab',
    type: 'PENETRATION_TESTING_FIRM',
    publicKey: rsaLabKey.publicKey,
    standards: ['OWASP_ASVS_L3', 'CREST', 'SOC2_TYPE2']
  });

  assert.strictEqual(lab2.labId, 'lab-cure53-sec', 'Lab 2 ID mismatch');
  assert.strictEqual(engine.registeredLabs.size, 2, 'Expected 2 registered labs');
  console.log('      ✓ Third-party lab registration passed cleanly.');

  // ---------------------------------------------------------------------------
  // 2. Cryptographic Lab Signature & Proof Verification
  // ---------------------------------------------------------------------------
  console.log('\n[2/5] Testing Cryptographic Lab Signature & Proof Verification...');

  const proofPayload = ReproducibleAuditEngine.createSignedLabProof(ed25519LabKey.privateKey, {
    labId: 'lab-tuv-cyber',
    attestationId: 'att-tuv-2026-001',
    payload: {
      assessment: 'OWASP ASVS v4.0.3 Level 3 Security Verification',
      verifiedComponents: ['AuthN', 'AuthZ', 'CryptoEngine', 'AuditLedger'],
      findingsCount: { critical: 0, high: 0, medium: 0 },
      conformanceStatus: 'FULLY_CONFORMANT'
    }
  });

  const proofResult = engine.verifyLabProof(proofPayload);
  assert.strictEqual(proofResult.valid, true, `Proof verification failed: ${proofResult.reason}`);
  assert.strictEqual(proofResult.labId, 'lab-tuv-cyber', 'Proof labId mismatch');

  // Verify tampering detection in proof payload
  const tamperedProof = JSON.parse(JSON.stringify(proofPayload));
  tamperedProof.payload.findingsCount.critical = 5; // Mutate payload
  const tamperedResult = engine.verifyLabProof(tamperedProof);
  assert.strictEqual(tamperedResult.valid, false, 'Tampered proof should fail verification');

  // Verify unregistered lab rejection
  const unregisteredProof = JSON.parse(JSON.stringify(proofPayload));
  unregisteredProof.labId = 'lab-unknown-hacker';
  const unregisteredResult = engine.verifyLabProof(unregisteredProof);
  assert.strictEqual(unregisteredResult.valid, false, 'Unregistered lab proof should fail');

  console.log('      ✓ Cryptographic lab proof verification and tamper detection passed.');

  // ---------------------------------------------------------------------------
  // 3. ISO 27001 & OWASP ASVS Audit Certificate Signing & Verification
  // ---------------------------------------------------------------------------
  console.log('\n[3/5] Testing ISO 27001 / OWASP ASVS Certificate Signing & Verification...');

  const certificate = engine.signAuditCertificate({
    certificateId: 'CERT-ISO-27001-OWASP-L3-2026',
    subject: 'EAORCS Enterprise Platform Release 2026.1.0-LTS',
    standards: ['ISO_27001_2022', 'OWASP_ASVS_V4_0_3_LEVEL_3'],
    scope: 'Complete System Architecture, Governance Engine, and Cryptographic Ledger',
    complianceScore: 100.0,
    attestations: ['att-tuv-2026-001']
  }, authorityKey.privateKey);

  assert.strictEqual(certificate.certificateId, 'CERT-ISO-27001-OWASP-L3-2026', 'Cert ID mismatch');
  assert.strictEqual(typeof certificate.signature, 'string', 'Missing certificate signature');
  assert.strictEqual(typeof certificate.contentHash, 'string', 'Missing certificate content hash');

  const certVerifyResult = engine.verifyAuditCertificate(certificate, authorityKey.publicKey);
  assert.strictEqual(certVerifyResult.valid, true, `Certificate verification failed: ${certVerifyResult.reason}`);

  // Test certificate content tampering detection
  const tamperedCert = JSON.parse(JSON.stringify(certificate));
  tamperedCert.complianceScore = 80.0;
  const tamperedCertResult = engine.verifyAuditCertificate(tamperedCert, authorityKey.publicKey);
  assert.strictEqual(tamperedCertResult.valid, false, 'Tampered certificate should fail verification');

  // Test expired certificate handling
  const expiredCert = JSON.parse(JSON.stringify(certificate));
  expiredCert.validUntil = '2020-01-01T00:00:00.000Z'; // Past date
  // Re-hash to bypass content hash mismatch check and hit expiration check
  const { signature: sig, contentHash: ch, ...expContent } = expiredCert;
  expiredCert.contentHash = engine.hashData(expContent);
  expiredCert.signature = engine.signData(expContent, authorityKey.privateKey);

  const expiredResult = engine.verifyAuditCertificate(expiredCert, authorityKey.publicKey);
  assert.strictEqual(expiredResult.valid, false, 'Expired certificate should fail verification');
  assert.strictEqual(expiredResult.reason, 'Certificate has expired', 'Expiration reason mismatch');

  console.log('      ✓ ISO 27001 / OWASP ASVS certificate signing & verification passed.');

  // ---------------------------------------------------------------------------
  // 4. Tamper-Proof Hash Chain Validation
  // ---------------------------------------------------------------------------
  console.log('\n[4/5] Testing Tamper-Proof Hash Chain Validation...');

  // Append audit events
  engine.appendAuditRecord('POLICY_EVALUATION', { policyId: 'POL-ZERO-TRUST-01', status: 'COMPLIANT' });
  engine.appendAuditRecord('SECURITY_SCAN_COMPLETED', { scanner: 'OWASP_ZAP', vulnerabilityCount: 0 });
  engine.appendAuditRecord('INFRASTRUCTURE_ATTESTATION', { region: 'us-east-1', enclaveSecured: true });

  const chainValidation = engine.validateHashChain();
  assert.strictEqual(chainValidation.valid, true, `Hash chain validation failed: ${chainValidation.reason}`);
  assert.ok(chainValidation.length >= 6, `Expected at least 6 blocks in ledger, found ${chainValidation.length}`);

  // Test detection of modified block payload
  const clonedChain = JSON.parse(JSON.stringify(engine.hashChain));
  clonedChain[2].payload.status = 'NON_COMPLIANT'; // Modify historical record
  const tamperedChainResult = engine.validateHashChain(clonedChain);
  assert.strictEqual(tamperedChainResult.valid, false, 'Tampered hash chain block payload should fail');
  assert.strictEqual(tamperedChainResult.brokenIndex, 2, 'Should identify broken index at 2');

  // Test detection of broken link in prevHash
  const clonedChain2 = JSON.parse(JSON.stringify(engine.hashChain));
  clonedChain2[3].prevHash = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
  const brokenLinkResult = engine.validateHashChain(clonedChain2);
  assert.strictEqual(brokenLinkResult.valid, false, 'Broken link in hash chain should fail');

  console.log('      ✓ Tamper-proof hash chain ledger validation passed.');

  // ---------------------------------------------------------------------------
  // 5. Reproducible Audit Bundle Export & Independent Re-verification
  // ---------------------------------------------------------------------------
  console.log('\n[5/5] Testing Reproducible Audit Bundle Export & Verification...');

  const bundle = engine.exportAuditBundle({
    systemManifest: {
      product: 'EAORCS Platform',
      releaseVersion: '2026.1.0-LTS',
      buildId: 'BUILD-20260801-RELEASE',
      environment: 'PRODUCTION'
    }
  }, authorityKey.privateKey);

  assert.strictEqual(typeof bundle.bundleId, 'string', 'Missing bundleId');
  assert.strictEqual(typeof bundle.bundleHash, 'string', 'Missing bundleHash');
  assert.strictEqual(typeof bundle.signature, 'string', 'Missing bundle signature');
  assert.strictEqual(bundle.labs.length, 2, 'Expected 2 labs in bundle');
  assert.strictEqual(bundle.certificates.length, 1, 'Expected 1 certificate in bundle');

  // Verify audit bundle with authority public key
  const bundleVerifyResult = engine.verifyAuditBundle(bundle, authorityKey.publicKey);
  assert.strictEqual(bundleVerifyResult.valid, true, `Bundle verification failed: ${bundleVerifyResult.reason}`);

  // Verify tamper detection in bundle
  const tamperedBundle = JSON.parse(JSON.stringify(bundle));
  tamperedBundle.systemManifest.releaseVersion = '2026.2.0-HACKED';
  const tamperedBundleResult = engine.verifyAuditBundle(tamperedBundle, authorityKey.publicKey);
  assert.strictEqual(tamperedBundleResult.valid, false, 'Tampered audit bundle should fail verification');

  console.log('      ✓ Reproducible audit bundle export & independent verification passed.');

  console.log('\n================================================================================');
  console.log('  🎉 PHASE 11 STREAM 1 SUITE: ALL INDEPENDENT VALIDATION TESTS PASSED 100%');
  console.log('================================================================================\n');
}

runStream1ValidationSuite();
