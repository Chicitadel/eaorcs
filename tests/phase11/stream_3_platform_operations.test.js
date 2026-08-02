/******************************************************************************
 * Project        : EAORCS Platform
 * Module         : Phase 11 Stream 3 Test Suite - Platform Operations & Live Trust Infrastructure
 * File           : tests/phase11/stream_3_platform_operations.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
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
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const crypto = require('crypto');
const OperationalTrustController = require('../../engine/trust/OperationalTrustController');
const { CA_LOG_EVENT_TYPES } = require('../../engine/trust/CATransparencyLogEngine');
const { CustodianRole } = require('../../engine/trust/KeyCeremonyOrchestrator');

async function runStream3PlatformOperationsTests() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 11 - STREAM 3: PLATFORM OPERATIONS & LIVE TRUST INFRASTRUCTURE');
  console.log('  Scope: Transparency Audits, Merkle Proof Export, CRL Publishing & Key Rotation');
  console.log('================================================================================\n');

  // Generate test RSA key pair for operational controller digital signatures
  const testKeyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  // Instantiate Operational Trust Controller
  const controller = new OperationalTrustController({
    controllerId: 'p11-stream3-op-controller-01',
    signingKeys: {
      privateKey: testKeyPair.privateKey,
      publicKey: testKeyPair.publicKey
    },
    issuerInfo: {
      commonName: 'EAORCS Phase 11 Operational Trust CA',
      organization: 'Ujomor Systems',
      country: 'US',
      caId: 'CA-EAORCS-P11-STREAM3'
    }
  });

  // ---------------------------------------------------------------------------
  // TEST 1: Live Transparency Log Auditing
  // ---------------------------------------------------------------------------
  console.log('[1/5] Testing Live Append-Only Transparency Log Auditing...');

  controller.transparencyLog.appendEntry(CA_LOG_EVENT_TYPES.ROOT_CA_INITIALIZED, {
    caId: 'CA-EAORCS-P11-STREAM3',
    keyType: 'RSA-4096'
  });

  controller.transparencyLog.appendEntry(CA_LOG_EVENT_TYPES.CERTIFICATE_ISSUED, {
    serialNumber: 'CERT-P11-1001',
    subjectCN: 'gateway.eaorcs.enterprise.internal',
    validDays: 365
  });

  controller.transparencyLog.appendEntry(CA_LOG_EVENT_TYPES.CERTIFICATE_ISSUED, {
    serialNumber: 'CERT-P11-1002',
    subjectCN: 'cluster-node-01.eaorcs.internal',
    validDays: 180
  });

  const auditSummary = controller.auditTransparencyLog(null, { sampleProofs: true });
  assert.strictEqual(auditSummary.passed, true, 'Transparency log audit should pass integrity check');
  assert.strictEqual(auditSummary.auditedEntries, 3, 'Audited entries before checkpoint should be 3');
  assert.strictEqual(typeof auditSummary.merkleRoot, 'string', 'Audit must return hex Merkle root');
  assert.strictEqual(auditSummary.merkleRoot.length, 64, 'Merkle root must be SHA-256 64-char hex string');
  assert.strictEqual(auditSummary.errors.length, 0, 'Audit errors array must be empty');

  console.log('      ✅ Live Transparency Log Auditing Passed.');

  // ---------------------------------------------------------------------------
  // TEST 2: Merkle Tree Inclusion Proof Export (`exportMerkleProofs`)
  // ---------------------------------------------------------------------------
  console.log('[2/5] Testing Merkle Tree Inclusion Proof Export (`exportMerkleProofs`)...');

  const exportAll = controller.exportMerkleProofs('all', { verifyExportedProofs: true });
  assert.strictEqual(exportAll.controllerId, controller.controllerId, 'Export bundle should match controller ID');
  assert.strictEqual(exportAll.merkleRoot, controller.transparencyLog.getMerkleRoot(), 'Export Merkle root should match current transparency log root');
  assert.strictEqual(exportAll.allProofsVerified, true, 'All exported Merkle proofs must be verified');
  assert.ok(exportAll.proofs.length >= 4, 'Proof export must contain all log entries including checkpoint');

  // Verify single entry proof export and verification helper
  const singleExport = controller.exportMerkleProofs(1);
  assert.strictEqual(singleExport.proofCount, 1, 'Single index export should return 1 proof');
  const targetProof = singleExport.proofs[0];
  assert.strictEqual(targetProof.index, 1, 'Target proof index should be 1');

  const isValidManualProof = controller.verifyMerkleProof(targetProof.entryHash, targetProof.proof, singleExport.merkleRoot);
  assert.strictEqual(isValidManualProof, true, 'verifyMerkleProof helper should return true for valid proof');

  console.log('      ✅ Merkle Tree Inclusion Proof Export Passed.');

  // ---------------------------------------------------------------------------
  // TEST 3: Certificate Revocation List (CRL) Revocation & Publishing
  // ---------------------------------------------------------------------------
  console.log('[3/5] Testing CRL Revocation & Publishing...');

  const rev1 = controller.revokeCertificate('CERT-P11-1002', 'KEY_COMPROMISE');
  assert.strictEqual(rev1.serialNumber, 'CERT-P11-1002', 'Revoked serial number should match');
  assert.strictEqual(controller.isCertificateRevoked('CERT-P11-1002'), true, 'Certificate should be marked as revoked');
  assert.strictEqual(controller.isCertificateRevoked('CERT-P11-1001'), false, 'Non-revoked cert should return false');

  const publishedCRL = controller.publishCRL({ distributionPoint: 'https://crl.eaorcs.enterprise/live/stream3.crl' });
  assert.strictEqual(publishedCRL.totalRevokedCount, 1, 'Published CRL should contain 1 revoked certificate');
  assert.strictEqual(publishedCRL.distributionPoint, 'https://crl.eaorcs.enterprise/live/stream3.crl', 'Distribution point URI should match');
  assert.strictEqual(typeof publishedCRL.signature, 'string', 'Published CRL must contain signature');
  assert.ok(publishedCRL.crlPem.includes('-----BEGIN X509 CRL-----'), 'CRL output must include X.509 PEM headers');

  console.log('      ✅ CRL Revocation & Publishing Passed.');

  // ---------------------------------------------------------------------------
  // TEST 4: Active Key Ceremony Rotation Monitoring
  // ---------------------------------------------------------------------------
  console.log('[4/5] Testing Active Key Ceremony Rotation Monitoring...');

  // Perform initial key ceremony rotation
  const custodians = [
    { id: 'custodian-01', name: 'Alice Enterprise Security', role: CustodianRole.PRIMARY_CUSTODIAN, authSecret: 'secret-alice-123' },
    { id: 'custodian-02', name: 'Bob Systems Infrastructure', role: CustodianRole.SECONDARY_CUSTODIAN, authSecret: 'secret-bob-456' },
    { id: 'custodian-03', name: 'Charlie Compliance Witness', role: CustodianRole.SECURITY_OFFICER, authSecret: 'secret-charlie-789' }
  ];

  const rotationReport = controller.rotateKeyCeremony({
    thresholdM: 2,
    totalN: 3,
    custodians,
    keyType: 'RSA-4096'
  });

  assert.strictEqual(rotationReport.status, 'ROTATION_COMPLETED', 'Rotation status should be ROTATION_COMPLETED');
  assert.strictEqual(typeof rotationReport.newKeyId, 'string', 'Rotation must return new Key ID');

  const monitoredStatus = controller.monitorKeyCeremonyStatus();
  assert.strictEqual(monitoredStatus.isQuorumMet, true, 'Monitored ceremony should report valid quorum');
  assert.strictEqual(monitoredStatus.health, 'HEALTHY', 'Monitored ceremony health should be HEALTHY');
  assert.strictEqual(monitoredStatus.activeKeyInfo.keyId, rotationReport.newKeyId, 'Active key ID should reflect rotated key');

  console.log('      ✅ Active Key Ceremony Rotation Monitoring Passed.');

  // ---------------------------------------------------------------------------
  // TEST 5: Trust Health Score Calculation & Consolidated Operational Check
  // ---------------------------------------------------------------------------
  console.log('[5/5] Testing Trust Score Health Calculation & Consolidated Operational Check...');

  const healthReport = controller.calculateTrustHealthScore({
    readinessScore: 98.0,
    evidenceConfidence: 0.99,
    statisticalConfidence: 0.96
  });

  assert.strictEqual(healthReport.healthStatus, 'EXCELLENT', 'Health score under nominal inputs should be EXCELLENT');
  assert.ok(healthReport.trustScore >= 90.0, 'Trust score should be >= 90.0');

  // Verify operational trust check
  const consolidatedCheck = controller.runOperationalTrustCheck();
  assert.strictEqual(consolidatedCheck.overallPassed, true, 'Consolidated operational check should pass');
  assert.strictEqual(consolidatedCheck.operationalState, 'OPERATIONAL', 'Operational state should be OPERATIONAL');
  assert.strictEqual(consolidatedCheck.proofExportSummary.allProofsVerified, true, 'Proof export in consolidated check should be verified');
  assert.strictEqual(consolidatedCheck.keyCeremonySummary.isQuorumMet, true, 'Consolidated check key ceremony quorum should be met');

  console.log('      ✅ Trust Score Health Calculation & Consolidated Operational Check Passed.');

  console.log('\n================================================================================');
  console.log('  ALL PHASE 11 STREAM 3 PLATFORM OPERATIONS TESTS PASSED SUCCESSFULLY (100%)');
  console.log('================================================================================\n');
}

// Execute test suite when run directly
if (require.main === module) {
  runStream3PlatformOperationsTests().catch(err => {
    console.error('❌ Stream 3 Platform Operations Test Failure:', err);
    process.exit(1);
  });
}

module.exports = { runStream3PlatformOperationsTests };
