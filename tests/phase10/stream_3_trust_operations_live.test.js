/******************************************************************************
 * Project        : EAORCS Platform
 * Module         : Phase 10 Stream 3 Test Suite - Live Trust Operations
 * File           : tests/phase10/stream_3_trust_operations_live.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Enterprise Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE
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
 * Copyright (c) 2026 Ujomor Enterprise Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const crypto = require('crypto');
const LiveTrustOperationsSuite = require('../../engine/trust/LiveTrustOperationsSuite');
const { CATransparencyLogEngine, CA_LOG_EVENT_TYPES } = require('../../engine/trust/CATransparencyLogEngine');
const { KeyCeremonyOrchestrator, CeremonyState, CustodianRole } = require('../../engine/trust/KeyCeremonyOrchestrator');
const TrustScoreCalculator = require('../../engine/trust/TrustScoreCalculator');

async function runStream3LiveTrustOperationsTests() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 10 - STREAM 3: LIVE TRUST OPERATIONS TEST SUITE');
  console.log('  Scope: Continuous Log Auditing, CRL Generation, Merkle Proofs & Key Rotation');
  console.log('================================================================================\n');

  // Generate test RSA Key Pair for digital signatures
  const signingKeyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  // Instantiate Live Trust Operations Suite
  const trustSuite = new LiveTrustOperationsSuite({
    suiteId: 'test-live-trust-suite-01',
    signingKeys: {
      privateKey: signingKeyPair.privateKey,
      publicKey: signingKeyPair.publicKey
    },
    issuerInfo: {
      commonName: 'EAORCS Primary Live Trust Authority',
      organization: 'Ujomor Enterprise Systems',
      country: 'US',
      caId: 'CA-EAORCS-STREAM3-TEST'
    }
  });

  // ---------------------------------------------------------------------------
  // TEST 1: Continuous Append-Only Transparency Log Auditing
  // ---------------------------------------------------------------------------
  console.log('[1/6] Testing Continuous Append-Only Transparency Log Auditing...');

  // Populate transparency log with initial operational events
  trustSuite.transparencyLog.appendEntry(CA_LOG_EVENT_TYPES.ROOT_CA_INITIALIZED, {
    caId: 'CA-EAORCS-STREAM3-TEST',
    algorithm: 'RSA-4096',
    keyId: 'KEY-ROOT-001'
  });

  trustSuite.transparencyLog.appendEntry(CA_LOG_EVENT_TYPES.CERTIFICATE_ISSUED, {
    serialNumber: 'CERT-SN-100001',
    subjectCN: 'api.eaorcs.enterprise.internal',
    validDays: 365
  });

  trustSuite.transparencyLog.appendEntry(CA_LOG_EVENT_TYPES.CERTIFICATE_ISSUED, {
    serialNumber: 'CERT-SN-100002',
    subjectCN: 'worker-node-01.eaorcs.internal',
    validDays: 180
  });

  const initialAudit = trustSuite.auditTransparencyLog(null, { sampleProofs: true });
  assert.strictEqual(initialAudit.passed, true, 'Initial transparency log audit should pass');
  assert.strictEqual(initialAudit.auditedEntries, 3, 'Pre-checkpoint log should contain 3 entries');
  assert.strictEqual(initialAudit.totalEntries, 4, 'Post-checkpoint log should contain 4 entries');
  assert.strictEqual(typeof initialAudit.merkleRoot, 'string', 'Audit must return hex Merkle root');
  assert.strictEqual(initialAudit.merkleRoot.length, 64, 'Merkle root must be SHA-256 64-char hex string');
  assert.strictEqual(initialAudit.proofResults.length, 3, 'Proof verification results should cover all preceding entries');
  assert.strictEqual(initialAudit.errors.length, 0, 'No integrity errors should be reported');

  console.log('      ✅ Log Auditing Passed: 4 Entries, Merkle Root Verified.');

  // ---------------------------------------------------------------------------
  // TEST 2: Real-Time Certificate Revocation List (CRL) Generation
  // ---------------------------------------------------------------------------
  console.log('[2/6] Testing Real-Time CRL Generation & Serial Verification...');

  // Revoke certificates
  const rev1 = trustSuite.revokeCertificate('CERT-SN-100001', 'KEY_COMPROMISE');
  assert.strictEqual(rev1.serialNumber, 'CERT-SN-100001', 'Serial number should match');
  assert.strictEqual(rev1.reason, 'KEY_COMPROMISE', 'Reason code should be KEY_COMPROMISE');

  const rev2 = trustSuite.revokeCertificate('CERT-SN-100003', 'SUPERSEDED');
  assert.strictEqual(rev2.reason, 'SUPERSEDED', 'Reason code should be SUPERSEDED');

  // Verify instant lookup
  assert.strictEqual(trustSuite.isCertificateRevoked('CERT-SN-100001'), true, 'CERT-SN-100001 must be revoked');
  assert.strictEqual(trustSuite.isCertificateRevoked('CERT-SN-100003'), true, 'CERT-SN-100003 must be revoked');
  assert.strictEqual(trustSuite.isCertificateRevoked('CERT-SN-100002'), false, 'CERT-SN-100002 must remain active');

  // Generate CRL
  const crl = trustSuite.generateRealTimeCRL(48);
  assert.strictEqual(crl.body.crlNumber, 1, 'First CRL sequence number should be 1');
  assert.strictEqual(crl.body.totalRevokedCount, 2, 'CRL should list 2 revoked certificates');
  assert.strictEqual(typeof crl.signature, 'string', 'CRL must contain RSA signature');
  assert.ok(crl.crlPem.includes('-----BEGIN X509 CRL-----'), 'CRL PEM representation must be formatted');

  const thisUpdateMs = new Date(crl.body.thisUpdate).getTime();
  const nextUpdateMs = new Date(crl.body.nextUpdate).getTime();
  assert.ok(nextUpdateMs > thisUpdateMs, 'nextUpdate timestamp must be in the future of thisUpdate');

  console.log('      ✅ CRL Generation Passed: 2 Revoked Serials, RSA Signed.');

  // ---------------------------------------------------------------------------
  // TEST 3: Merkle Tree Proof Calculations & Verification
  // ---------------------------------------------------------------------------
  console.log('[3/6] Testing Merkle Tree Inclusion Proof Checks...');

  const logEngine = trustSuite.transparencyLog;
  const entries = logEngine.getEntries();
  const targetIndex = 1;
  const targetEntry = entries[targetIndex];

  const merkleRoot = logEngine.getMerkleRoot();
  const inclusionProof = logEngine.getInclusionProof(targetIndex);
  assert.ok(Array.isArray(inclusionProof), 'Inclusion proof must be an array of proof steps');

  const isProofValid = CATransparencyLogEngine.verifyInclusionProof(
    targetEntry.hash,
    inclusionProof,
    merkleRoot
  );
  assert.strictEqual(isProofValid, true, 'Valid inclusion proof must return true');

  // Test tampered entry hash verification failure
  const corruptedHash = targetEntry.hash.substring(0, 63) + (targetEntry.hash.endsWith('0') ? '1' : '0');
  const isCorruptedValid = CATransparencyLogEngine.verifyInclusionProof(
    corruptedHash,
    inclusionProof,
    merkleRoot
  );
  assert.strictEqual(isCorruptedValid, false, 'Tampered entry hash must fail inclusion proof verification');

  console.log('      ✅ Merkle Proof Checks Passed: Inclusion Verified & Tampering Rejected.');

  // ---------------------------------------------------------------------------
  // TEST 4: Active Key Ceremony Verification & Rotation
  // ---------------------------------------------------------------------------
  console.log('[4/6] Testing Active Key Ceremony Verification & Rotation...');

  // Verify initial state of key ceremony orchestrator
  const initialVerify = trustSuite.verifyActiveKeyCeremony();
  assert.strictEqual(initialVerify.valid, false, 'Initial state without ceremony should return invalid verification');

  // Perform key ceremony rotation via trust suite
  const rotationResult = trustSuite.rotateKeyCeremony({
    thresholdM: 3,
    totalN: 5,
    keyType: 'RSA-4096'
  });

  assert.strictEqual(rotationResult.status, 'ROTATION_COMPLETED', 'Rotation status should be ROTATION_COMPLETED');
  assert.strictEqual(rotationResult.thresholdM, 3, 'Threshold M should be 3');
  assert.strictEqual(rotationResult.totalN, 5, 'Total N should be 5');
  assert.ok(rotationResult.newKeyId.startsWith('key-'), 'New key ID should follow key- prefix convention');

  // Verify key ceremony state post-rotation
  const postVerify = trustSuite.verifyActiveKeyCeremony();
  assert.strictEqual(postVerify.valid, true, 'Post-rotation ceremony verification should pass');
  assert.strictEqual(postVerify.isQuorumValid, true, 'Post-rotation quorum should be valid');

  // Check that KEY_ROTATED event was appended to transparency log
  const rotationLogEntries = trustSuite.transparencyLog.queryEntries({ eventType: CA_LOG_EVENT_TYPES.KEY_ROTATED });
  assert.ok(rotationLogEntries.length > 0, 'KEY_ROTATED event must be recorded in transparency log');

  console.log(`      ✅ Key Ceremony Rotation Passed: New Key ID ${rotationResult.newKeyId}.`);

  // ---------------------------------------------------------------------------
  // TEST 5: Trust Score Health Reporting
  // ---------------------------------------------------------------------------
  console.log('[5/6] Testing Trust Score Health Reporting & Penalty Calculation...');

  const healthReport = trustSuite.calculateTrustScoreHealth({
    readinessScore: 96.0,
    evidenceConfidence: 0.98,
    statisticalConfidence: 0.95,
    securityGaps: {
      critical: 0,
      high: 0,
      complianceViolations: 0,
      unresolvedVulnerabilities: 0
    }
  });

  assert.strictEqual(healthReport.healthStatus, 'EXCELLENT', 'Nominal score should yield EXCELLENT health status');
  assert.ok(healthReport.trustScore >= 90.0, 'Trust score should be >= 90.0 under nominal inputs');
  assert.strictEqual(healthReport.transparencyLogStatus.integrityValid, true, 'Log integrity should be valid');
  assert.strictEqual(healthReport.revocationStatus.totalRevoked, 2, 'Revocation count should reflect 2 revoked certs');

  // Test applying security gaps penalty
  const degradedReport = trustSuite.calculateTrustScoreHealth({
    readinessScore: 70.0,
    evidenceConfidence: 0.70,
    statisticalConfidence: 0.65,
    securityGaps: {
      critical: 1, // 25pt penalty
      high: 2,     // 20pt penalty
      complianceViolations: 1, // 15pt penalty
      unresolvedVulnerabilities: 0
    }
  });

  assert.ok(degradedReport.trustScore < 50.0, 'Critical security gaps must degrade score below 50.0');
  assert.strictEqual(degradedReport.healthStatus, 'CRITICAL', 'Score below 50.0 must yield CRITICAL status');

  console.log('      ✅ Trust Score Health Reporting Passed: Baseline & Penalty Scenarios Verified.');

  // ---------------------------------------------------------------------------
  // TEST 6: Consolidated Live Operations Check
  // ---------------------------------------------------------------------------
  console.log('[6/6] Testing Consolidated Live Operations Check...');

  const consolidatedCheck = trustSuite.runLiveTrustOperationsCheck();
  assert.strictEqual(typeof consolidatedCheck.timestamp, 'string', 'Consolidated check must include ISO timestamp');
  assert.strictEqual(consolidatedCheck.logAuditSummary.passed, true, 'Log audit summary must report passed=true');
  assert.strictEqual(consolidatedCheck.keyCeremonySummary.isQuorumValid, true, 'Key ceremony summary must confirm valid quorum');
  assert.strictEqual(typeof consolidatedCheck.healthReportSummary.trustScore, 'number', 'Health summary must contain numeric trust score');

  console.log('      ✅ Consolidated Live Operations Check Passed.');

  console.log('\n================================================================================');
  console.log('  ALL STREAM 3 LIVE TRUST OPERATIONS TESTS PASSED SUCCESSFULLY');
  console.log('================================================================================\n');
}

// Execute test suite when run directly
if (require.main === module) {
  runStream3LiveTrustOperationsTests().catch(err => {
    console.error('❌ Stream 3 Test Failure:', err);
    process.exit(1);
  });
}

module.exports = { runStream3LiveTrustOperationsTests };
