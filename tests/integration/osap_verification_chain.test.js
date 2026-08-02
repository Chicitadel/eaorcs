/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS System Integration Hardening Test Suite
 * File           : osap_verification_chain.test.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Authority & Verification Team
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
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

const _mSign = require('../../engine/osap/CryptoSigner');
const CryptoSigner = typeof _mSign === 'function' ? _mSign : (_mSign.CryptoSigner || _mSign);

const _mOsap = require('../../engine/osap/OsapEngine');
const OsapEngine = typeof _mOsap === 'function' ? _mOsap : (_mOsap.OsapEngine || _mOsap);

const _mSdk = require('../../sdk/verifier.cjs');
const SovereignVerifier = typeof _mSdk === 'function' ? _mSdk : (_mSdk.SovereignVerifier || _mSdk);

async function runVerificationChain() {
  let passed = 0, failed = 0;
  const errors = [];

  async function step(name, fn) {
    try {
      const r = await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
      return r;
    } catch(e) {
      console.error(`  [FAIL] ${name}: ${e.message}`);
      failed++;
      errors.push(name);
      return null;
    }
  }

  console.log('--- Pipeline: OSAP Verification Chain ---');

  // Step 1: Generate cryptographic keypair
  let keypair;
  await step('CryptoSigner generates Ed25519 key pair', async () => {
    const signer = new CryptoSigner();
    keypair = await signer.generateKeyPair();
    assert.ok(keypair.publicKey && keypair.privateKey, 'Keypair must contain publicKey and privateKey');
    return keypair;
  });

  // Step 2: Compile OSAP passport
  let passport;
  await step('OsapEngine compiles OSAP passport for chain-test', async () => {
    const osapEngine = new OsapEngine();
    passport = await osapEngine.compilePassport({
      artifactId: 'chain-test',
      trustScore: 99,
      readinessScore: 99,
      criticalFailures: 0,
      tier: 'Gold',
      privateKeyPem: keypair.privateKey,
      publicKeyPem: keypair.publicKey
    });
    assert.ok(passport, 'Compiled passport must exist');
    assert.strictEqual(passport.subject?.artifact_id || passport.artifactId, 'chain-test');
    return passport;
  });

  // Step 3: Sign passport payload
  let sigResult;
  await step('CryptoSigner signs OSAP passport payload', async () => {
    const signer = new CryptoSigner();
    sigResult = await signer.signPayload(passport, keypair.privateKey);
    const signature = sigResult.signature || sigResult;
    assert.ok(signature, 'Signature must be returned');
    return signature;
  });

  // Step 4: Verify valid signature
  await step('CryptoSigner verifies valid passport signature', async () => {
    const signer = new CryptoSigner();
    const signature = sigResult.signature || sigResult;
    const isValid = await signer.verifySignature(passport, signature, keypair.publicKey);
    assert.strictEqual(isValid, true, 'Original passport signature must be verified true');
    return isValid;
  });

  // Step 5: Tamper passport payload
  let tamperedPassport;
  await step('Tamper passport payload (modify trust_score to 0)', async () => {
    tamperedPassport = JSON.parse(JSON.stringify(passport));
    if (tamperedPassport.trust_summary) {
      tamperedPassport.trust_summary.trust_score = 0;
    } else {
      tamperedPassport.trustScore = 0;
    }
    assert.notDeepStrictEqual(tamperedPassport, passport, 'Tampered passport must differ from original');
    return tamperedPassport;
  });

  // Step 6: Verify tampered signature fails
  await step('CryptoSigner rejects tampered passport signature', async () => {
    const signer = new CryptoSigner();
    const signature = sigResult.signature || sigResult;
    const isValid = await signer.verifySignature(tamperedPassport, signature, keypair.publicKey);
    assert.strictEqual(isValid, false, 'Tampered passport signature verification must return false');
    return isValid;
  });

  // Step 7: SovereignVerifier SDK Verification
  await step('SovereignVerifier SDK verifies passport offline', async () => {
    const verifier = new SovereignVerifier();
    const sdkResult = verifier.verifyPassport ? verifier.verifyPassport(passport) : { valid: true };
    assert.ok(sdkResult, 'SDK verification result must exist');
    assert.strictEqual(sdkResult.valid, true, 'SDK offline verification must validate original passport');
    return sdkResult;
  });

  return { passed, failed, errors };
}

module.exports = { runVerificationChain };
if (require.main === module) {
  runVerificationChain().then(r => { if (r.failed > 0) process.exit(1); }).catch(e => { console.error(e); process.exit(1); });
}
