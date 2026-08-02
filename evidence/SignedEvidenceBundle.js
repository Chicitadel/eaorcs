/******************************************************************************
 * Project        : EAORCS
 * Module         : Evidence / Reproducibility
 * File           : SignedEvidenceBundle.js
 * Version        : 2026.1.0-LTS
 * Author         : Enterprise Architecture Authority
 * Organization   : Ujomor Platform
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE
 *
 * Governance:
 * - Policy Governed
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
 * Copyright (c) 2026 Ujomor Platform
 * All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Builds canonical JSON string for an object with signature excluded and keys sorted alphabetically.
 *
 * @param {Object} bundleObj
 * @returns {string} Canonical JSON representation
 */
function getCanonicalJson(bundleObj) {
  const { signature, ...unsignedObj } = bundleObj;
  const sortedKeys = Object.keys(unsignedObj).sort();
  const canonicalObj = {};
  for (const key of sortedKeys) {
    canonicalObj[key] = unsignedObj[key];
  }
  return JSON.stringify(canonicalObj);
}

/**
 * Generates an Ed25519 keypair, constructs an evidence bundle from the manifest,
 * signs the canonical bundle JSON, verifies the signature, and saves evidence/signed_evidence_bundle.json.
 *
 * @param {string} manifestPath
 * @returns {{ bundle: Object, verified: boolean }}
 */
function generate(manifestPath = 'evidence/hash_manifest.json') {
  const fullManifestPath = path.resolve(process.cwd(), manifestPath);
  if (!fs.existsSync(fullManifestPath)) {
    throw new Error(`Manifest file not found at ${fullManifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(fullManifestPath, 'utf8'));

  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  const uuid = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  const bundle = {
    bundleId: `BUNDLE-EAORCS-2026.1.0-LTS-${uuid}`,
    product: 'EAORCS',
    version: '2026.1.0-lts',
    generatedAt: new Date().toISOString(),
    merkleRoot: manifest.merkleRoot,
    fileCount: manifest.fileCount,
    publicKey: publicKey,
    signature: null
  };

  const canonicalJson = getCanonicalJson(bundle);
  const sig = crypto.sign(null, Buffer.from(canonicalJson), privateKey);
  bundle.signature = sig.toString('hex');

  const verified = crypto.verify(
    null,
    Buffer.from(canonicalJson),
    publicKey,
    Buffer.from(bundle.signature, 'hex')
  );

  const bundlePath = path.resolve(process.cwd(), 'evidence/signed_evidence_bundle.json');
  fs.mkdirSync(path.dirname(bundlePath), { recursive: true });
  fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, 2), 'utf8');

  return { bundle, verified };
}

/**
 * Loads a signed evidence bundle and verifies its Ed25519 signature against its public key.
 *
 * @param {string} bundlePath
 * @returns {{ valid: boolean, bundleId: string, merkleRoot: string }}
 */
function verify(bundlePath = 'evidence/signed_evidence_bundle.json') {
  const fullBundlePath = path.resolve(process.cwd(), bundlePath);
  if (!fs.existsSync(fullBundlePath)) {
    throw new Error(`Bundle file not found at ${fullBundlePath}`);
  }

  const bundle = JSON.parse(fs.readFileSync(fullBundlePath, 'utf8'));
  const canonicalJson = getCanonicalJson(bundle);

  const valid = crypto.verify(
    null,
    Buffer.from(canonicalJson),
    bundle.publicKey,
    Buffer.from(bundle.signature, 'hex')
  );

  return {
    valid,
    bundleId: bundle.bundleId,
    merkleRoot: bundle.merkleRoot
  };
}

module.exports = {
  generate,
  verify
};
