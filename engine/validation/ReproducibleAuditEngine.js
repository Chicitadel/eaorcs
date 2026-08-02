/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Independent Validation Engine (Phase 11 Stream 1)
 * File           : engine/validation/ReproducibleAuditEngine.js
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

const crypto = require('crypto');

class ReproducibleAuditEngine {
  constructor(options = {}) {
    this.engineVersion = options.engineVersion || '2026.1.0-LTS';
    this.organization = options.organization || 'Ujomor Systems Engineering & Governance Authority';
    this.registeredLabs = new Map();
    this.signedCertificates = new Map();
    this.hashChain = [];

    // Initialize Genesis Block in Hash Chain
    this._initializeGenesisBlock();
  }

  /**
   * Initializes the tamper-proof hash chain with an immutable Genesis Block.
   * @private
   */
  _initializeGenesisBlock() {
    const genesisData = {
      event: 'GENESIS_AUDIT_LEDGER',
      timestamp: '2026-08-01T00:00:00.000Z',
      version: this.engineVersion,
      authority: this.organization
    };
    const payloadHash = this.hashData(genesisData);
    const genesisBlock = {
      index: 0,
      timestamp: genesisData.timestamp,
      recordType: 'GENESIS',
      payload: genesisData,
      payloadHash,
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000'
    };
    genesisBlock.hash = this._computeBlockHash(genesisBlock);
    this.hashChain.push(genesisBlock);
  }

  /**
   * Recursively canonicalizes an object or value to ensure deterministic JSON serialization.
   * @param {*} obj 
   * @returns {string} Canonical JSON string
   */
  canonicalize(obj) {
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
      return '[' + obj.map(item => this.canonicalize(item)).join(',') + ']';
    }
    const keys = Object.keys(obj).sort();
    return '{' + keys.map(k => JSON.stringify(k) + ':' + this.canonicalize(obj[k])).join(',') + '}';
  }

  /**
   * Computes SHA-256 hash of canonicalized data.
   * @param {*} data 
   * @returns {string} Hex-encoded SHA-256 digest
   */
  hashData(data) {
    const canonicalString = typeof data === 'string' ? data : this.canonicalize(data);
    return crypto.createHash('sha256').update(canonicalString).digest('hex');
  }

  /**
   * Internal helper to compute a block's cryptographic hash.
   * @private
   */
  _computeBlockHash(block) {
    const content = `${block.index}|${block.timestamp}|${block.recordType}|${block.payloadHash}|${block.prevHash}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Registers an independent testing laboratory or security audit firm.
   * @param {Object} labInfo 
   * @returns {Object} Registered lab record
   */
  registerLab(labInfo) {
    if (!labInfo || typeof labInfo !== 'object') {
      throw new Error('Invalid lab registration payload: Must be an object.');
    }

    const { labId, name, type, publicKey, standards = [], status = 'ACTIVE' } = labInfo;

    if (!labId || typeof labId !== 'string') {
      throw new Error('Lab registration failed: Missing or invalid labId.');
    }
    if (!publicKey) {
      throw new Error(`Lab registration failed for '${labId}': Missing publicKey.`);
    }

    const record = {
      labId,
      name: name || labId,
      type: type || 'THIRD_PARTY_LAB',
      publicKey,
      standards: Array.isArray(standards) ? standards : [standards],
      status,
      registeredAt: new Date().toISOString()
    };

    this.registeredLabs.set(labId, record);
    this.appendAuditRecord('LAB_REGISTERED', {
      labId,
      name: record.name,
      type: record.type,
      standards: record.standards,
      status: record.status
    });

    return { ...record };
  }

  /**
   * Cryptographically verifies a third-party laboratory proof/attestation payload.
   * @param {Object} proofPayload 
   * @param {KeyObject|string} [publicKeyOverride] 
   * @returns {Object} Verification result object
   */
  verifyLabProof(proofPayload, publicKeyOverride = null) {
    if (!proofPayload || typeof proofPayload !== 'object') {
      return { valid: false, reason: 'Invalid proof payload format' };
    }

    const { labId, attestationId, signature, payload, timestamp } = proofPayload;
    if (!labId || !signature || !payload) {
      return { valid: false, reason: 'Missing required proof fields (labId, signature, payload)' };
    }

    let publicKey = publicKeyOverride;
    if (!publicKey) {
      const lab = this.registeredLabs.get(labId);
      if (!lab) {
        return { valid: false, reason: `Unrecognized labId '${labId}' and no publicKey provided` };
      }
      if (lab.status !== 'ACTIVE') {
        return { valid: false, reason: `Lab '${labId}' is not ACTIVE (status: ${lab.status})` };
      }
      publicKey = lab.publicKey;
    }

    const dataToVerify = { labId, attestationId, payload, timestamp };
    const isValid = this.verifySignature(dataToVerify, signature, publicKey);

    this.appendAuditRecord('LAB_PROOF_VERIFIED', {
      labId,
      attestationId,
      valid: isValid,
      verifiedAt: new Date().toISOString()
    });

    return {
      valid: isValid,
      labId,
      attestationId,
      reason: isValid ? 'Signature valid and verified' : 'Cryptographic signature verification failed'
    };
  }

  /**
   * Issues and signs an ISO 27001 / OWASP ASVS audit certificate.
   * @param {Object} certParams 
   * @param {KeyObject|string} signingKey Private key for signing certificate
   * @returns {Object} Signed audit certificate
   */
  signAuditCertificate(certParams, signingKey) {
    if (!certParams || typeof certParams !== 'object') {
      throw new Error('Certificate parameters must be an object.');
    }
    if (!signingKey) {
      throw new Error('Signing private key is required for certificate generation.');
    }

    const {
      certificateId = `CERT-ISO-OWASP-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      subject = 'EAORCS Platform Kernel & Governance Subsystems',
      standards = ['ISO_27001', 'OWASP_ASVS_LEVEL_3'],
      scope = 'Full System Scope (Runtime, Governance, Security, Infrastructure)',
      validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      complianceScore = 100.0,
      attestations = []
    } = certParams;

    const issuedAt = new Date().toISOString();

    const certificateContent = {
      certificateId,
      subject,
      issuer: this.organization,
      standards,
      scope,
      complianceScore,
      attestations,
      issuedAt,
      validUntil
    };

    const contentHash = this.hashData(certificateContent);
    const signature = this.signData(certificateContent, signingKey);

    const signedCertificate = {
      ...certificateContent,
      contentHash,
      signature
    };

    this.signedCertificates.set(certificateId, signedCertificate);
    this.appendAuditRecord('CERTIFICATE_SIGNED', {
      certificateId,
      standards,
      subject,
      complianceScore,
      contentHash
    });

    return signedCertificate;
  }

  /**
   * Verifies an ISO 27001 / OWASP ASVS audit certificate signature and content integrity.
   * @param {Object} certificate 
   * @param {KeyObject|string} publicKey 
   * @returns {Object} Verification result
   */
  verifyAuditCertificate(certificate, publicKey) {
    if (!certificate || typeof certificate !== 'object') {
      return { valid: false, reason: 'Invalid certificate format' };
    }

    const { signature, contentHash, ...certificateContent } = certificate;
    if (!signature) {
      return { valid: false, reason: 'Missing signature on certificate' };
    }
    if (!contentHash) {
      return { valid: false, reason: 'Missing content hash on certificate' };
    }

    const computedHash = this.hashData(certificateContent);
    if (computedHash !== contentHash) {
      return { valid: false, reason: 'Certificate content hash mismatch (tamper detected)' };
    }

    const isSigValid = this.verifySignature(certificateContent, signature, publicKey);
    if (!isSigValid) {
      return { valid: false, reason: 'Certificate cryptographic signature invalid' };
    }

    if (certificate.validUntil && new Date(certificate.validUntil) < new Date()) {
      return { valid: false, reason: 'Certificate has expired' };
    }

    return {
      valid: true,
      certificateId: certificate.certificateId,
      reason: 'Certificate valid and intact'
    };
  }

  /**
   * Appends an audit event payload to the engine's internal tamper-proof hash chain.
   * @param {string} recordType 
   * @param {*} payload 
   * @returns {Object} Appended block
   */
  appendAuditRecord(recordType, payload) {
    const prevBlock = this.hashChain[this.hashChain.length - 1];
    const index = this.hashChain.length;
    const timestamp = new Date().toISOString();
    const payloadHash = this.hashData(payload);

    const block = {
      index,
      timestamp,
      recordType,
      payload,
      payloadHash,
      prevHash: prevBlock ? prevBlock.hash : '0000000000000000000000000000000000000000000000000000000000000000'
    };

    block.hash = this._computeBlockHash(block);
    this.hashChain.push(block);
    return block;
  }

  /**
   * Validates a hash chain array for continuity, record integrity, and link tampering.
   * @param {Array} [chain=this.hashChain] 
   * @returns {Object} Validation result
   */
  validateHashChain(chain = this.hashChain) {
    if (!Array.isArray(chain) || chain.length === 0) {
      return { valid: false, brokenIndex: 0, reason: 'Hash chain is empty or invalid array' };
    }

    for (let i = 0; i < chain.length; i++) {
      const block = chain[i];

      if (block.index !== i) {
        return { valid: false, brokenIndex: i, reason: `Block index mismatch at position ${i}` };
      }

      // Check payload hash
      const recomputedPayloadHash = this.hashData(block.payload);
      if (recomputedPayloadHash !== block.payloadHash) {
        return { valid: false, brokenIndex: i, reason: `Payload hash mismatch in block ${i} (tamper detected)` };
      }

      // Check prevHash
      if (i === 0) {
        if (block.prevHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
          return { valid: false, brokenIndex: 0, reason: 'Genesis block prevHash corrupt' };
        }
      } else {
        const prevBlock = chain[i - 1];
        if (block.prevHash !== prevBlock.hash) {
          return { valid: false, brokenIndex: i, reason: `Broken link between block ${i - 1} and ${i}` };
        }
      }

      // Check block hash
      const recomputedBlockHash = this._computeBlockHash(block);
      if (recomputedBlockHash !== block.hash) {
        return { valid: false, brokenIndex: i, reason: `Block hash recalculation mismatch in block ${i}` };
      }
    }

    return {
      valid: true,
      brokenIndex: -1,
      length: chain.length,
      headHash: chain[chain.length - 1].hash,
      reason: 'Hash chain is cryptographically continuous and untampered'
    };
  }

  /**
   * Exports a reproducible audit bundle for third-party verification.
   * @param {Object} [options] 
   * @param {KeyObject|string} [signingKey] Optional private key to sign the audit bundle export
   * @returns {Object} Reproducible audit bundle
   */
  exportAuditBundle(options = {}, signingKey = null) {
    const bundleId = `AUDIT-BUNDLE-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const exportedAt = new Date().toISOString();

    const labsArray = Array.from(this.registeredLabs.values());
    const certsArray = Array.from(this.signedCertificates.values());

    const bundleData = {
      bundleId,
      version: this.engineVersion,
      organization: this.organization,
      exportedAt,
      systemManifest: options.systemManifest || {
        target: 'EAORCS Platform',
        environment: 'Production / Audit Verification'
      },
      labs: labsArray,
      certificates: certsArray,
      hashChain: JSON.parse(JSON.stringify(this.hashChain)),
      hashChainHead: this.hashChain[this.hashChain.length - 1].hash
    };

    const bundleHash = this.hashData(bundleData);
    let signature = null;

    if (signingKey) {
      signature = this.signData(bundleData, signingKey);
    }

    const bundle = {
      ...bundleData,
      bundleHash,
      signature
    };

    this.appendAuditRecord('BUNDLE_EXPORTED', {
      bundleId,
      bundleHash,
      exportedAt
    });

    return bundle;
  }

  /**
   * Verifies an exported reproducible audit bundle.
   * @param {Object} bundle 
   * @param {KeyObject|string} [publicKey] Optional public key to verify bundle signature
   * @returns {Object} Verification result
   */
  verifyAuditBundle(bundle, publicKey = null) {
    if (!bundle || typeof bundle !== 'object') {
      return { valid: false, reason: 'Invalid audit bundle format' };
    }

    const { bundleHash, signature, ...bundleData } = bundle;
    if (!bundleHash) {
      return { valid: false, reason: 'Missing bundle hash digest' };
    }

    const computedHash = this.hashData(bundleData);
    if (computedHash !== bundleHash) {
      return { valid: false, reason: 'Audit bundle hash mismatch (tamper detected in bundle content)' };
    }

    if (signature && publicKey) {
      const isSigValid = this.verifySignature(bundleData, signature, publicKey);
      if (!isSigValid) {
        return { valid: false, reason: 'Audit bundle signature verification failed' };
      }
    }

    const chainResult = this.validateHashChain(bundle.hashChain);
    if (!chainResult.valid) {
      return { valid: false, reason: `Embedded hash chain invalid: ${chainResult.reason}` };
    }

    const actualHead = bundle.hashChain[bundle.hashChain.length - 1].hash;
    if (actualHead !== bundle.hashChainHead) {
      return { valid: false, reason: 'Hash chain head mismatch' };
    }

    return {
      valid: true,
      bundleId: bundle.bundleId,
      chainLength: bundle.hashChain.length,
      headHash: actualHead,
      reason: 'Audit bundle fully verified and reproducible'
    };
  }

  /**
   * Helper utility to create a signed lab proof structure.
   * @static
   */
  static createSignedLabProof(privateKey, proofData) {
    const { labId, attestationId, payload, timestamp = new Date().toISOString() } = proofData;
    const dataToSign = { labId, attestationId, payload, timestamp };

    const engine = new ReproducibleAuditEngine();
    const signature = engine.signData(dataToSign, privateKey);

    return {
      labId,
      attestationId,
      payload,
      timestamp,
      signature
    };
  }

  /**
   * Helper method for signing data.
   */
  signData(data, privateKey) {
    const canonicalString = typeof data === 'string' ? data : this.canonicalize(data);
    const buffer = Buffer.from(canonicalString);
    try {
      return crypto.sign(null, buffer, privateKey).toString('hex');
    } catch (e) {
      return crypto.sign('SHA256', buffer, privateKey).toString('hex');
    }
  }

  /**
   * Helper method for verifying data signature.
   */
  verifySignature(data, signatureHex, publicKey) {
    const canonicalString = typeof data === 'string' ? data : this.canonicalize(data);
    const buffer = Buffer.from(canonicalString);
    const sigBuffer = Buffer.from(signatureHex, 'hex');

    try {
      if (crypto.verify(null, buffer, publicKey, sigBuffer)) {
        return true;
      }
    } catch (e) {}

    try {
      return crypto.verify('SHA256', buffer, publicKey, sigBuffer);
    } catch (e) {
      return false;
    }
  }
}

module.exports = ReproducibleAuditEngine;
