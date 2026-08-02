/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 8 DID & Sovereign Release Test Suite
 * File           : tests/phase8/did_sovereign_release.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Systems Engineering & Governance Authority
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const crypto = require('crypto');
const { DecentralizedIdentityBridge } = require('../../engine/trust/DecentralizedIdentityBridge');

async function runTest() {
  console.log('================================================================');
  console.log('  EAORCS PHASE 8: DID & SOVEREIGN RELEASE SUITE');
  console.log('================================================================\n');

  console.log('[1/1] Testing DecentralizedIdentityBridge...');
  const keyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  const bridge = new DecentralizedIdentityBridge();
  const issuerDidDoc = bridge.createDidDocument('governance-authority', keyPair.publicKey);
  assert(issuerDidDoc.id === 'did:eaorcs:governance-authority', 'DID mismatch');

  const subjectDidDoc = bridge.createDidDocument('enterprise-subscriber-01', keyPair.publicKey);
  assert(subjectDidDoc.id === 'did:eaorcs:enterprise-subscriber-01', 'Subject DID mismatch');

  const vc = bridge.issueVerifiableCredential(
    issuerDidDoc.id,
    subjectDidDoc.id,
    { trustTier: 'SOVEREIGN_PLATINUM', auditScore: 100 },
    keyPair.privateKey
  );
  assert(vc.type.includes('VerifiableCredential'), 'VC type mismatch');
  assert(typeof vc.proof.jws === 'string', 'VC proof JWS expected');

  const ver = bridge.verifyVerifiableCredential(vc);
  assert(ver.valid === true, 'W3C Verifiable Credential signature should be valid');

  const resolved = bridge.resolveDid(issuerDidDoc.id);
  assert(resolved !== null, 'DID resolution should succeed');
  console.log('      ✓ DecentralizedIdentityBridge Passed (W3C DID & VC verification clean)');

  console.log('\n================================================================');
  console.log('  DID & SOVEREIGN RELEASE SUITE: ALL CHECKS PASSED');
  console.log('================================================================\n');
}

runTest().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
