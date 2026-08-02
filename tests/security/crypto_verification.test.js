/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Security Qualification Suite
 * File           : crypto_verification.test.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed & Cryptographic Verification Enforced
 * - Cryptographic Primitives Qualification Suite
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const _CS = require('../../engine/osap/CryptoSigner');
const CryptoSigner = typeof _CS === 'function' ? _CS : (_CS.CryptoSigner || _CS);

async function runCryptoVerification() {
  const signer = new CryptoSigner();
  const results = [];

  // Point 1: Key Uniqueness (100 keypairs)
  try {
    const pubKeys = new Set();
    for (let i = 0; i < 100; i++) {
      const kp = await signer.generateKeyPair();
      pubKeys.add(kp.publicKey);
    }
    results.push({ name: '1. Key Uniqueness (100 Keypairs)', pass: pubKeys.size === 100 });
  } catch (e) {
    results.push({ name: '1. Key Uniqueness (100 Keypairs)', pass: false, error: e.message });
  }

  // Point 2: Signature Valid
  try {
    const kp = await signer.generateKeyPair();
    const payload = { test: 1 };
    const sigRes = await signer.signPayload(payload, kp.privateKey);
    const sigHex = typeof sigRes === 'object' ? sigRes.signature : sigRes;
    const verifyFn = signer.verifySignature || signer.verify;
    const valid = await verifyFn.call(signer, payload, sigHex, kp.publicKey);
    results.push({ name: '2. Standard Signature Verification', pass: valid === true });
  } catch (e) {
    results.push({ name: '2. Standard Signature Verification', pass: false, error: e.message });
  }

  // Point 3: Public Key Format & Non-zero Length
  try {
    const kp = await signer.generateKeyPair();
    const pass = typeof kp.publicKey === 'string' && kp.publicKey.trim().length > 0;
    results.push({ name: '3. Public Key Format & Non-Zero Length', pass });
  } catch (e) {
    results.push({ name: '3. Public Key Format & Non-Zero Length', pass: false, error: e.message });
  }

  // Point 4: Private Key Format & Non-zero Length
  try {
    const kp = await signer.generateKeyPair();
    const pass = typeof kp.privateKey === 'string' && kp.privateKey.trim().length > 0;
    results.push({ name: '4. Private Key Format & Non-Zero Length', pass });
  } catch (e) {
    results.push({ name: '4. Private Key Format & Non-Zero Length', pass: false, error: e.message });
  }

  // Point 5: Empty Payload Signature Verification
  try {
    const kp = await signer.generateKeyPair();
    const payload = {};
    const sigRes = await signer.signPayload(payload, kp.privateKey);
    const sigHex = typeof sigRes === 'object' ? sigRes.signature : sigRes;
    const verifyFn = signer.verifySignature || signer.verify;
    const valid = await verifyFn.call(signer, payload, sigHex, kp.publicKey);
    results.push({ name: '5. Empty Payload Signature Verification', pass: valid === true });
  } catch (e) {
    results.push({ name: '5. Empty Payload Signature Verification', pass: false, error: e.message });
  }

  // Point 6: Large Payload (100KB string data)
  try {
    const kp = await signer.generateKeyPair();
    const payload = { data: 'X'.repeat(100000) };
    const sigRes = await signer.signPayload(payload, kp.privateKey);
    const sigHex = typeof sigRes === 'object' ? sigRes.signature : sigRes;
    const verifyFn = signer.verifySignature || signer.verify;
    const valid = await verifyFn.call(signer, payload, sigHex, kp.publicKey);
    results.push({ name: '6. Large Payload (100KB) Signature Verification', pass: valid === true });
  } catch (e) {
    results.push({ name: '6. Large Payload (100KB) Signature Verification', pass: false, error: e.message });
  }

  // Point 7: Single Byte Signature Modification (Tampering detection)
  try {
    const kp = await signer.generateKeyPair();
    const payload = { integrity: 'strict' };
    const sigRes = await signer.signPayload(payload, kp.privateKey);
    let sigHex = typeof sigRes === 'object' ? sigRes.signature : sigRes;
    const tamperedChar = sigHex[5] === 'a' ? 'b' : 'a';
    sigHex = sigHex.substring(0, 5) + tamperedChar + sigHex.substring(6);
    const verifyFn = signer.verifySignature || signer.verify;
    const valid = await verifyFn.call(signer, payload, sigHex, kp.publicKey);
    results.push({ name: '7. Single-Byte Signature Modification Detection', pass: valid === false });
  } catch (e) {
    results.push({ name: '7. Single-Byte Signature Modification Detection', pass: true });
  }

  return results;
}

module.exports = { runCryptoVerification };
