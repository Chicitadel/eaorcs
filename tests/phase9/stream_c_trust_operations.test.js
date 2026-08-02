/******************************************************************************
 * Project        : EAORCS Platform
 * Module         : Phase 9 Stream C Test Suite - Trust Operations
 * File           : tests/phase9/stream_c_trust_operations.test.js
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
const { CATransparencyLogEngine, CA_LOG_EVENT_TYPES } = require('../../engine/trust/CATransparencyLogEngine');
const { KeyCeremonyOrchestrator, CeremonyState, CustodianRole, ShamirSecretSharing } = require('../../engine/trust/KeyCeremonyOrchestrator');

async function runStreamCTrustOperationsTests() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 9 - STREAM C: TRUST OPERATIONS SUITE');
  console.log('  Scope: Transparency Log Immutability, Merkle Proofs, Key Ceremony & Quorum');
  console.log('================================================================================\n');

  // Generate test keypair for signing log entries
  const keyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  // ---------------------------------------------------------------------------
  // TEST 1: Transparency Log Immutability & Hash Chain Verification
  // ---------------------------------------------------------------------------
  console.log('[1/6] Testing CATransparencyLogEngine (Immutability & Hash Chain)...');
  const logEngine = new CATransparencyLogEngine({
    logId: 'test-ca-transparency-log-01',
    signingPrivateKey: keyPair.privateKey,
    signingPublicKey: keyPair.publicKey
  });

  const entry1 = logEngine.appendEntry(CA_LOG_EVENT_TYPES.ROOT_CA_INITIALIZED, {
    caId: 'ROOT-CA-2026',
    commonName: 'Ujomor Root CA 2026',
    algorithm: 'RSA-4096'
  });

  const entry2 = logEngine.appendEntry(CA_LOG_EVENT_TYPES.CERTIFICATE_ISSUED, {
    serialNumber: 'SN-2026-9901',
    subject: 'CN=EAORCS Intermediate Operations CA',
    issuer: 'CN=Ujomor Root CA 2026'
  });

  const entry3 = logEngine.appendEntry(CA_LOG_EVENT_TYPES.CERTIFICATE_REVOKED, {
    serialNumber: 'SN-2026-9901',
    reason: 'KEY_COMPROMISE',
    revokedAt: new Date().toISOString()
  });

  assert.strictEqual(logEngine.getEntries().length, 3, 'Log should contain 3 entries');
  assert.strictEqual(entry1.index, 0, 'Entry 1 index should be 0');
  assert.strictEqual(entry1.prevHash, '0'.repeat(64), 'Genesis prevHash should be 64 zeros');
  assert.strictEqual(entry2.prevHash, entry1.hash, 'Entry 2 prevHash should match Entry 1 hash');
  assert.strictEqual(entry3.prevHash, entry2.hash, 'Entry 3 prevHash should match Entry 2 hash');

  const auditReport = logEngine.verifyLogIntegrity();
  assert.strictEqual(auditReport.valid, true, 'Log integrity audit should pass 100%');
  assert.strictEqual(auditReport.errors.length, 0, 'Audit errors list should be empty');
  assert.ok(auditReport.merkleRoot.length === 64, 'Merkle root should be 64 hex characters');

  console.log('      ✓ Immutability & Hash Chain Verified cleanly.');

  // ---------------------------------------------------------------------------
  // TEST 2: Merkle Tree Proof Generation & Inclusion Verification
  // ---------------------------------------------------------------------------
  console.log('[2/6] Testing Merkle Tree Inclusion Proofs (RFC 6962 Standard)...');

  const rootHash = logEngine.getMerkleRoot();
  for (let i = 0; i < 3; i++) {
    const targetEntry = logEngine.getEntry(i);
    const proof = logEngine.getInclusionProof(i);
    const isProofValid = CATransparencyLogEngine.verifyInclusionProof(targetEntry.hash, proof, rootHash);
    assert.strictEqual(isProofValid, true, `Merkle inclusion proof for entry #${i} should be valid`);
  }

  // Verify false proof fails
  const bogusHash = crypto.randomBytes(32).toString('hex');
  const bogusProofValid = CATransparencyLogEngine.verifyInclusionProof(bogusHash, logEngine.getInclusionProof(0), rootHash);
  assert.strictEqual(bogusProofValid, false, 'Invalid leaf hash must fail Merkle proof verification');

  console.log('      ✓ Merkle Tree Proof Generation & Verification Passed.');

  // ---------------------------------------------------------------------------
  // TEST 3: Shamir Secret Sharing (M-of-N Threshold Secret Splitting & Reconstruction)
  // ---------------------------------------------------------------------------
  console.log('[3/6] Testing Shamir Secret Sharing (GF(256) M-of-N Threshold Cryptography)...');

  const masterSecret = Buffer.from('EAORCS-ROOT-CA-MASTER-SEED-KEY-SECRET-2026-CONFIDENTIAL');
  const thresholdM = 3;
  const totalN = 5;

  const shares = ShamirSecretSharing.splitSecret(masterSecret, thresholdM, totalN);
  assert.strictEqual(shares.length, 5, '5 shares should be generated');

  // Test reconstruction with exact M shares (shares 1, 2, 4)
  const subsetShares3 = [shares[0], shares[1], shares[3]];
  const reconstructed3 = ShamirSecretSharing.combineShares(subsetShares3, thresholdM);
  assert.strictEqual(reconstructed3.toString(), masterSecret.toString(), 'Reconstructed secret must match master secret exactly with M=3 shares');

  // Test reconstruction with all N shares
  const reconstructedAll = ShamirSecretSharing.combineShares(shares, thresholdM);
  assert.strictEqual(reconstructedAll.toString(), masterSecret.toString(), 'Reconstructed secret must match master secret with all 5 shares');

  // Test failure with < M shares (2 shares)
  assert.throws(() => {
    ShamirSecretSharing.combineShares([shares[0], shares[1]], thresholdM);
  }, /Insufficient shares/, 'Combining with less than threshold M must throw error');

  // Test failure with tampered share checksum
  const corruptedShares = JSON.parse(JSON.stringify(subsetShares3));
  corruptedShares[0].data = 'ff' + corruptedShares[0].data.substring(2);
  assert.throws(() => {
    ShamirSecretSharing.combineShares(corruptedShares, thresholdM);
  }, /checksum verification failed/, 'Corrupted share data must fail checksum check');

  console.log('      ✓ Shamir Secret Sharing (M-of-N split & combine) Passed.');

  // ---------------------------------------------------------------------------
  // TEST 4: Key Ceremony Orchestrator & Dual-Custody Quorum Governance
  // ---------------------------------------------------------------------------
  console.log('[4/6] Testing KeyCeremonyOrchestrator Dual-Custody & Quorum Enforcement...');

  const orchestrator = new KeyCeremonyOrchestrator({ transparencyLog: logEngine });
  orchestrator.initiateCeremony('CEREMONY-ROOT-2026-001', {
    thresholdM: 3,
    totalN: 5,
    keyType: 'RSA-4096',
    caType: 'ROOT',
    caName: 'Ujomor Primary Root CA'
  });

  // Register 5 custodians with specific governance roles
  orchestrator.registerCustodian('cust-1', 'Alice Security', CustodianRole.SECURITY_OFFICER);
  orchestrator.registerCustodian('cust-2', 'Bob Primary', CustodianRole.PRIMARY_CUSTODIAN);
  orchestrator.registerCustodian('cust-3', 'Charlie Secondary', CustodianRole.SECONDARY_CUSTODIAN);
  orchestrator.registerCustodian('cust-4', 'Diana Witness', CustodianRole.GOVERNANCE_WITNESS);
  orchestrator.registerCustodian('cust-5', 'Eve Auditor', CustodianRole.AUDITOR);

  assert.strictEqual(orchestrator.state, CeremonyState.CUSTODIANS_REGISTERED, 'State should be CUSTODIANS_REGISTERED');

  // Test Quorum Failure without required roles (e.g. check-in secondary, witness, auditor -> 3 custodians, but no Primary/Security)
  orchestrator.checkInCustodian('cust-3', 'auth-charlie');
  orchestrator.checkInCustodian('cust-4', 'auth-diana');
  orchestrator.checkInCustodian('cust-5', 'auth-eve');

  let quorumCheck = orchestrator.verifyQuorum();
  assert.strictEqual(quorumCheck.count, 3, 'Count should be 3');
  assert.strictEqual(quorumCheck.isQuorumMet, false, 'Quorum must fail without SECURITY_OFFICER and PRIMARY_CUSTODIAN');

  // Now check-in Primary Custodian and Security Officer
  orchestrator.checkInCustodian('cust-1', 'auth-alice');
  orchestrator.checkInCustodian('cust-2', 'auth-bob');

  quorumCheck = orchestrator.verifyQuorum();
  assert.strictEqual(quorumCheck.isQuorumMet, true, 'Quorum must pass with 5 custodians including required roles');
  assert.strictEqual(orchestrator.state, CeremonyState.QUORUM_REACHED, 'State should transition to QUORUM_REACHED');

  console.log('      ✓ Dual-Custody Quorum Governance Passed.');

  // ---------------------------------------------------------------------------
  // TEST 5: Key Generation Execution, Secret Distribution & Ceremony Completion
  // ---------------------------------------------------------------------------
  console.log('[5/6] Testing Key Generation, Split Secret Distribution & Finalization...');

  const keyGenResult = orchestrator.executeKeyGeneration();
  assert.ok(keyGenResult.keyId.startsWith('key-'), 'Generated key ID expected');
  assert.ok(keyGenResult.publicKey.includes('BEGIN PUBLIC KEY'), 'PEM Public Key expected');
  assert.strictEqual(keyGenResult.distributedSharesCount, 5, '5 distributed shares expected');

  const completionResult = orchestrator.completeCeremony();
  assert.strictEqual(completionResult.status, 'COMPLETED', 'Ceremony completion status expected');
  assert.strictEqual(orchestrator.state, CeremonyState.COMPLETED, 'Orchestrator state should be COMPLETED');

  // Verify key generation logged to transparency log
  const keyGenLogs = logEngine.queryEntries({ eventType: CA_LOG_EVENT_TYPES.KEY_GENERATED });
  assert.strictEqual(keyGenLogs.length, 1, 'Key generation must be logged in transparency ledger');
  assert.strictEqual(keyGenLogs[0].payload.keyId, keyGenResult.keyId, 'Logged keyId must match generated keyId');

  console.log('      ✓ Key Generation & Ceremony Finalization Passed.');

  // ---------------------------------------------------------------------------
  // TEST 6: Key Rotation Workflow & Certificate Lifecycle Control
  // ---------------------------------------------------------------------------
  console.log('[6/6] Testing Key Rotation State Machine & Lifecycle Audits...');

  orchestrator.initiateKeyRotation('SCHEDULED_ANNUAL_KEY_ROTATION');
  assert.strictEqual(orchestrator.state, CeremonyState.ROTATION_INITIATED, 'State should be ROTATION_INITIATED');

  // Re-check-in custodians for rotation approval
  orchestrator.checkInCustodian('cust-1', 'auth-alice-rotation');
  orchestrator.checkInCustodian('cust-2', 'auth-bob-rotation');
  orchestrator.checkInCustodian('cust-3', 'auth-charlie-rotation');

  const rotationResult = orchestrator.executeKeyRotation({ keyType: 'RSA-4096' });
  assert.strictEqual(rotationResult.status, 'ROTATION_COMPLETED', 'Rotation completion expected');
  assert.notStrictEqual(rotationResult.previousKeyId, rotationResult.newKeyId, 'New Key ID must differ from Previous Key ID');

  const rotationLogs = logEngine.queryEntries({ eventType: CA_LOG_EVENT_TYPES.KEY_ROTATED });
  assert.strictEqual(rotationLogs.length, 1, 'Key rotation must be logged in transparency ledger');
  assert.strictEqual(rotationLogs[0].payload.previousKeyId, rotationResult.previousKeyId, 'Log previous key ID match');
  assert.strictEqual(rotationLogs[0].payload.newKeyId, rotationResult.newKeyId, 'Log new key ID match');

  // Final Transparency Log Overall Audit Verification
  const finalAudit = logEngine.verifyLogIntegrity();
  assert.strictEqual(finalAudit.valid, true, 'Overall transparency log integrity must be 100% valid');

  console.log('      ✓ Key Rotation Workflow & Lifecycle Control Passed.');

  console.log('\n================================================================================');
  console.log('  STREAM C (TRUST OPERATIONS): ALL 6 SUITES PASSED CLEANLY');
  console.log('================================================================================\n');
}

runStreamCTrustOperationsTests().catch(err => {
  console.error('FATAL: Stream C Test Suite Failed -', err.stack || err.message);
  process.exit(1);
});
