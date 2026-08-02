/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 9 Stream A — Independent Validation Test Suite
 * File           : tests/phase9/stream_a_independent_validation.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const crypto = require('crypto');
const ExternalAttestationHarness = require('../../engine/validation/ExternalAttestationHarness');

async function runStreamATest() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 9: STREAM A — INDEPENDENT VALIDATION SUITE');
  console.log('================================================================================\n');

  const harness = new ExternalAttestationHarness();

  // Generate cryptographic keys for test auditors
  const ed25519Key = crypto.generateKeyPairSync('ed25519');
  const rsaKey = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

  // ---------------------------------------------------------------------------
  // 1. Third-Party Audit Firm Registration
  // ---------------------------------------------------------------------------
  console.log('[1/5] Testing Registration of Third-Party Audit Firms...');
  
  const auditor1 = harness.registerExternalAuditor({
    auditorId: 'aud-cure53-sec',
    name: 'Cure53 Cybersecurity Laboratory',
    type: 'SECURITY_AUDITOR',
    publicKey: ed25519Key.publicKey,
    certifications: ['ISO27001', 'CREST', 'SOC2_TYPE2'],
    contactEmail: 'audits@cure53.de'
  });
  assert.strictEqual(auditor1.auditorId, 'aud-cure53-sec', 'Auditor ID mismatch');
  assert.strictEqual(auditor1.status, 'ACTIVE', 'Auditor status should be ACTIVE');

  const auditor2 = harness.registerExternalAuditor({
    auditorId: 'aud-mit-lab',
    name: 'MIT Computer Science & AI Laboratory',
    type: 'ACADEMIC_PARTNER',
    publicKey: rsaKey.publicKey,
    certifications: ['IEEE_AUDIT_STATION', 'ACM_VERIFICATION'],
    contactEmail: 'trust-lab@mit.edu'
  });
  assert.strictEqual(auditor2.auditorId, 'aud-mit-lab', 'Auditor ID mismatch');

  const auditor3 = harness.registerExternalAuditor({
    auditorId: 'aud-tuv-rheinland',
    name: 'TÜV Rheinland Cyber Security Lab',
    type: 'THIRD_PARTY_LAB',
    publicKey: ed25519Key.publicKey,
    certifications: ['ISO_IEC_17025', 'ENISA_CERTIFIED'],
    contactEmail: 'cyber@tuv.com'
  });
  assert.strictEqual(auditor3.auditorId, 'aud-tuv-rheinland', 'Auditor ID mismatch');

  assert.strictEqual(harness.registeredAuditors.size, 3, 'Expected 3 registered auditors');
  console.log('      ✓ Third-party audit firm registration passed cleanly.');

  // ---------------------------------------------------------------------------
  // 2. Cryptographic Signature Verification of Audit Reports
  // ---------------------------------------------------------------------------
  console.log('\n[2/5] Testing Cryptographic Signature Verification of Audit Reports...');

  // Create & sign Penetration Test Certificate from Cure53
  const penTestPayload = ExternalAttestationHarness.createSignedAttestation(
    ed25519Key.privateKey,
    {
      attestationId: 'att-pen-2026-001',
      auditorId: 'aud-cure53-sec',
      type: 'PENETRATION_TEST_CERTIFICATE',
      title: 'EAORCS Phase 9 Core Kernel Penetration Test',
      scope: 'Runtime Engine & Governance Subsystems',
      issuedAt: new Date().toISOString(),
      expiresAt: '2027-08-01T00:00:00Z',
      summary: { criticalFindings: 0, highFindings: 0, overallRating: 'PASSED_CLEAN' },
      payloadContent: { criticalFindings: 0, highFindings: 0, overallRating: 'PASSED_CLEAN' }
    }
  );

  const ingestedPenTest = harness.ingestAttestation(penTestPayload);
  assert.strictEqual(ingestedPenTest.attestationId, 'att-pen-2026-001', 'Attestation ID mismatch');

  const verifyPenTest = harness.verifyAttestationSignature('att-pen-2026-001');
  assert.strictEqual(verifyPenTest.verified, true, 'Penetration test signature should be verified');
  assert.strictEqual(verifyPenTest.status, 'VERIFIED', 'Status should be VERIFIED');

  // Create & sign Academic Audit Proof from MIT
  const academicPayload = ExternalAttestationHarness.createSignedAttestation(
    rsaKey.privateKey,
    {
      attestationId: 'att-acad-2026-002',
      auditorId: 'aud-mit-lab',
      type: 'ACADEMIC_AUDIT_PROOF',
      title: 'Formal Verification of Formal Verification State Machine',
      scope: 'UAIGOS Autonomous Execution Core',
      issuedAt: new Date().toISOString(),
      summary: { mathematicalProofValid: true, soundnessScore: 1.0 },
      payloadContent: { mathematicalProofValid: true, soundnessScore: 1.0 }
    }
  );

  harness.ingestAttestation(academicPayload);
  const verifyAcademic = harness.verifyAttestationSignature('att-acad-2026-002');
  assert.strictEqual(verifyAcademic.verified, true, 'Academic audit proof signature should be verified');
  assert.strictEqual(verifyAcademic.status, 'VERIFIED', 'Academic proof status should be VERIFIED');

  console.log('      ✓ Cryptographic signature verification passed cleanly for Ed25519 & RSA.');

  // ---------------------------------------------------------------------------
  // 3. Tamper Detection Engine
  // ---------------------------------------------------------------------------
  console.log('\n[3/5] Testing Tamper Detection Engine...');

  const validPayloadData = ExternalAttestationHarness.createSignedAttestation(
    ed25519Key.privateKey,
    {
      attestationId: 'att-iso-2026-003',
      auditorId: 'aud-tuv-rheinland',
      type: 'ISO_COMPLIANCE_CERTIFICATE',
      title: 'ISO/IEC 27001 Security Standard Audit Certificate',
      scope: 'Enterprise Infrastructure & Data Isolation',
      issuedAt: new Date().toISOString(),
      summary: { iso27001Compliant: true },
      payloadContent: { iso27001Compliant: true }
    }
  );

  harness.ingestAttestation(validPayloadData);

  // Directly tamper with stored payload content to simulate memory/disk corruption
  const storedAttestation = harness.attestations.get('att-iso-2026-003');
  storedAttestation.payloadContent = JSON.stringify({ iso27001Compliant: false, tampered: true });

  const verifyTampered = harness.verifyAttestationSignature('att-iso-2026-003');
  assert.strictEqual(verifyTampered.verified, false, 'Tampered attestation must fail verification');
  assert.strictEqual(verifyTampered.status, 'TAMPERED', 'Verification status should be TAMPERED');
  assert.strictEqual(storedAttestation.tamperDetected, true, 'Tamper detected flag should be set');

  console.log('      ✓ Tamper detection engine passed cleanly.');

  // ---------------------------------------------------------------------------
  // 4. Untrusted & Revoked Auditor Handling
  // ---------------------------------------------------------------------------
  console.log('\n[4/5] Testing Untrusted & Revoked Auditor Handling...');

  // Ingest attestation from unregistered auditor
  const fakeAttestationPayload = {
    attestationId: 'att-rogue-004',
    auditorId: 'aud-unregistered-hacker',
    type: 'SECURITY_ASSESSMENT',
    title: 'Self-Signed Untrusted Assessment',
    payloadContent: { valid: false },
    signature: 'deadbeef12345678'
  };

  harness.ingestAttestation(fakeAttestationPayload);
  const verifyFake = harness.verifyAttestationSignature('att-rogue-004');
  assert.strictEqual(verifyFake.verified, false, 'Unregistered auditor attestation must fail');
  assert.strictEqual(verifyFake.status, 'UNTRUSTED_AUDITOR', 'Status should be UNTRUSTED_AUDITOR');

  // Revoke TÜV Rheinland
  harness.revokeAuditor('aud-tuv-rheinland', 'Key rollover schedule');
  const revokedAuditor = harness.registeredAuditors.get('aud-tuv-rheinland');
  assert.strictEqual(revokedAuditor.status, 'REVOKED', 'Auditor status should be REVOKED');

  console.log('      ✓ Untrusted & revoked auditor handling passed cleanly.');

  // ---------------------------------------------------------------------------
  // 5. Validation Report Generation
  // ---------------------------------------------------------------------------
  console.log('\n[5/5] Testing Validation Report Generation...');

  const report = harness.generateValidationReport();
  assert.strictEqual(report.stream, 'Stream A — Independent Validation', 'Stream title mismatch');
  assert.strictEqual(report.governanceAuthority, 'Ujomor Systems Engineering & Governance Authority', 'Governance authority mismatch');
  assert.strictEqual(report.summary.totalAuditors, 3, 'Total auditors count mismatch');
  assert.strictEqual(report.summary.totalAttestations, 4, 'Total attestations count mismatch');
  assert.strictEqual(report.summary.verifiedCount, 2, 'Verified attestations count mismatch');
  assert.strictEqual(report.summary.tamperedCount, 1, 'Tampered attestations count mismatch');
  assert.strictEqual(report.summary.untrustedCount, 1, 'Untrusted attestations count mismatch');
  assert.strictEqual(report.summary.globalValidationStatus, 'CRITICAL_FAIL', 'Global status should reflect tamper detection');
  assert(report.reportHash.length === 64, 'Report hash should be 64-char SHA-256 hex string');
  assert(Array.isArray(report.standardsCompliance), 'Standards compliance array required');

  console.log('      ✓ Validation report generation passed cleanly.');

  console.log('\n================================================================================');
  console.log('  STREAM A: INDEPENDENT VALIDATION SUITE: ALL CHECKS PASSED');
  console.log('================================================================================\n');
}

runStreamATest().catch(err => {
  console.error('FATAL TEST FAILURE:', err);
  process.exit(1);
});
