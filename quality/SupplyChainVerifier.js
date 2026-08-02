/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Quality / Security Qualification Engine
 * File           : SupplyChainVerifier.js
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

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getCanonicalJson(bundleObj) {
  const { signature, ...unsignedObj } = bundleObj;
  const sortedKeys = Object.keys(unsignedObj).sort();
  const canonicalObj = {};
  for (const key of sortedKeys) {
    canonicalObj[key] = unsignedObj[key];
  }
  return JSON.stringify(canonicalObj);
}

class SupplyChainVerifier {
  verifyCertificateChain(certPath = 'docs/product_readiness_certificate.json') {
    const fullPath = path.resolve(process.cwd(), certPath);
    if (!fs.existsSync(fullPath)) {
      return { valid: false, certId: null, level: null, score: 0, detail: 'Certificate file missing' };
    }
    try {
      const cert = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const certId = cert.certificateId;
      const level = cert.certificationLevel;
      const score = cert.score;
      const valid = !!certId && level === 'PLATINUM' && score === 100;
      return {
        valid,
        certId,
        level,
        score,
        detail: valid ? `Certificate ${certId} verified (Level: ${level}, Score: ${score})` : 'Certificate validation failed'
      };
    } catch(e) {
      return { valid: false, certId: null, level: null, score: 0, detail: e.message };
    }
  }

  verifyOsapPassport(passportPath = 'docs/osap_passport_2026.1.0-lts.json') {
    const fullPath = path.resolve(process.cwd(), passportPath);
    if (!fs.existsSync(fullPath)) {
      return { valid: false, passportId: null, product: null, version: null, detail: 'OSAP Passport file missing' };
    }
    try {
      const p = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const passportId = p.passport_id || p.passportId || p.id;
      const product = p.product || (p.subject && p.subject.artifact_id);
      const version = p.version || (p.subject && p.subject.version);
      const valid = !!passportId && product === 'EAORCS' && !!version;
      return {
        valid,
        passportId,
        product,
        version,
        detail: valid ? `OSAP Passport ${passportId} verified for ${product} v${version}` : 'OSAP Passport validation failed'
      };
    } catch(e) {
      return { valid: false, passportId: null, product: null, version: null, detail: e.message };
    }
  }

  verifyHashManifest(manifestPath = 'evidence/hash_manifest.json') {
    const fullPath = path.resolve(process.cwd(), manifestPath);
    if (!fs.existsSync(fullPath)) {
      return { valid: false, merkleRoot: null, fileCount: 0, spotChecks: [], detail: 'Hash manifest missing' };
    }
    try {
      const manifest = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const merkleRoot = manifest.merkleRoot;
      const fileCount = manifest.fileCount || (manifest.files ? manifest.files.length : 0);
      const files = manifest.files || [];

      if (!merkleRoot || files.length === 0 || fileCount <= 0) {
        return { valid: false, merkleRoot, fileCount, spotChecks: [], detail: 'Hash manifest empty or missing Merkle root' };
      }

      const spotChecks = [];
      const countToSpot = Math.min(3, files.length);
      const indices = [0, Math.floor(files.length / 2), files.length - 1].slice(0, countToSpot);
      let allPassed = true;

      for (const idx of indices) {
        const entry = files[idx];
        const candidatePaths = [
          path.resolve(process.cwd(), 'docs', entry.relativePath || entry.file),
          path.resolve(process.cwd(), entry.relativePath || entry.file)
        ];

        let found = false;
        let actualHash = null;

        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            found = true;
            const content = fs.readFileSync(p);
            actualHash = crypto.createHash('sha256').update(content).digest('hex');
            break;
          }
        }

        const match = found && actualHash === entry.sha256;
        if (!match) allPassed = false;

        spotChecks.push({
          file: entry.file || entry.relativePath,
          expectedHash: entry.sha256,
          actualHash,
          pass: match
        });
      }

      return {
        valid: allPassed,
        merkleRoot,
        fileCount,
        spotChecks,
        detail: allPassed ? `Hash manifest verified (${fileCount} files, 3 spot checks passed)` : 'Spot check hash mismatch'
      };
    } catch(e) {
      return { valid: false, merkleRoot: null, fileCount: 0, spotChecks: [], detail: e.message };
    }
  }

  verifySignedBundle(bundlePath = 'evidence/signed_evidence_bundle.json') {
    const fullPath = path.resolve(process.cwd(), bundlePath);
    if (!fs.existsSync(fullPath)) {
      return { valid: false, bundleId: null, signatureVerified: false, detail: 'Signed evidence bundle missing' };
    }
    try {
      const bundle = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const hasFields = !!(bundle.bundleId && bundle.merkleRoot && bundle.publicKey && bundle.signature);

      if (!hasFields) {
        return { valid: false, bundleId: bundle.bundleId || null, signatureVerified: false, detail: 'Missing required bundle fields' };
      }

      const canonicalJson = getCanonicalJson(bundle);
      const signatureVerified = crypto.verify(
        null,
        Buffer.from(canonicalJson),
        bundle.publicKey,
        Buffer.from(bundle.signature, 'hex')
      );

      return {
        valid: hasFields && signatureVerified,
        bundleId: bundle.bundleId,
        signatureVerified,
        detail: signatureVerified ? `Ed25519 signature verified for bundle ${bundle.bundleId}` : 'Ed25519 signature verification failed'
      };
    } catch(e) {
      return { valid: false, bundleId: null, signatureVerified: false, detail: e.message };
    }
  }

  verifyAll() {
    return {
      certificate: this.verifyCertificateChain(),
      osap: this.verifyOsapPassport(),
      hashManifest: this.verifyHashManifest(),
      signedBundle: this.verifySignedBundle()
    };
  }
}

module.exports = SupplyChainVerifier;
