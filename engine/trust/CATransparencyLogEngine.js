/******************************************************************************
 * Project        : EAORCS Platform
 * Module         : Trust Operations Engine
 * File           : engine/trust/CATransparencyLogEngine.js
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

const crypto = require('crypto');
const EventEmitter = require('events');

/**
 * Event Types tracked in the Certificate Authority Transparency Log
 */
const CA_LOG_EVENT_TYPES = {
  ROOT_CA_INITIALIZED: 'ROOT_CA_INITIALIZED',
  INTERMEDIATE_CA_INITIALIZED: 'INTERMEDIATE_CA_INITIALIZED',
  KEY_GENERATED: 'KEY_GENERATED',
  KEY_CEREMONY_INITIATED: 'KEY_CEREMONY_INITIATED',
  KEY_CEREMONY_COMPLETED: 'KEY_CEREMONY_COMPLETED',
  CERTIFICATE_ISSUED: 'CERTIFICATE_ISSUED',
  CERTIFICATE_REVOKED: 'CERTIFICATE_REVOKED',
  KEY_ROTATED: 'KEY_ROTATED',
  AUDIT_CHECKPOINT: 'AUDIT_CHECKPOINT'
};

class CATransparencyLogEngine extends EventEmitter {
  /**
   * @param {Object} options Configuration options
   * @param {string} [options.logId] Unique ID for this transparency log instance
   * @param {string} [options.signingPrivateKey] Optional PEM key to sign log entries
   * @param {string} [options.signingPublicKey] Optional PEM key to verify entry signatures
   */
  constructor(options = {}) {
    super();
    this.logId = options.logId || `ca-log-${crypto.randomBytes(6).toString('hex')}`;
    this.signingPrivateKey = options.signingPrivateKey || null;
    this.signingPublicKey = options.signingPublicKey || null;

    /** @type {Array<Object>} Internal append-only ledger */
    this._entries = [];
    this._isFrozen = false;
  }

  /**
   * Computes deterministic SHA-256 hash for entry payload & metadata
   * @static
   */
  static computeEntryHash(index, timestamp, eventType, payload, prevHash) {
    const payloadStr = JSON.stringify(payload || {});
    const data = `${index}|${timestamp}|${eventType}|${prevHash}|${payloadStr}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Computes leaf hash for Merkle Tree (RFC 6962 prefix 0x00)
   * @static
   */
  static hashLeaf(entryHashHex) {
    const prefix = Buffer.from([0x00]);
    const hashBuf = Buffer.from(entryHashHex, 'hex');
    return crypto.createHash('sha256').update(Buffer.concat([prefix, hashBuf])).digest('hex');
  }

  /**
   * Computes node hash for Merkle Tree (RFC 6962 prefix 0x01)
   * @static
   */
  static hashNodes(leftHex, rightHex) {
    const prefix = Buffer.from([0x01]);
    const leftBuf = Buffer.from(leftHex, 'hex');
    const rightBuf = Buffer.from(rightHex, 'hex');
    return crypto.createHash('sha256').update(Buffer.concat([prefix, leftBuf, rightBuf])).digest('hex');
  }

  /**
   * Appends a new immutable entry to the transparency log
   * @param {string} eventType Type of CA operation
   * @param {Object} payload Metadata and details of the operation
   * @param {string} [customPrivateKey] Optional per-entry signing key override
   * @returns {Object} Deep copy of the appended entry
   */
  appendEntry(eventType, payload = {}, customPrivateKey = null) {
    if (this._isFrozen) {
      throw new Error('CATransparencyLogEngine: Log is frozen and cannot accept new entries.');
    }

    if (!CA_LOG_EVENT_TYPES[eventType] && !Object.values(CA_LOG_EVENT_TYPES).includes(eventType)) {
      throw new Error(`CATransparencyLogEngine: Invalid eventType '${eventType}'`);
    }

    const index = this._entries.length;
    const timestamp = new Date().toISOString();
    const prevHash = index === 0 ? '0'.repeat(64) : this._entries[index - 1].hash;
    const entryHash = CATransparencyLogEngine.computeEntryHash(index, timestamp, eventType, payload, prevHash);

    let signature = null;
    const privateKeyToUse = customPrivateKey || this.signingPrivateKey;
    if (privateKeyToUse) {
      try {
        const signer = crypto.createSign('sha256');
        signer.update(entryHash);
        signer.end();
        signature = signer.sign(privateKeyToUse, 'hex');
      } catch (err) {
        throw new Error(`CATransparencyLogEngine: Failed to sign entry - ${err.message}`);
      }
    }

    const entry = Object.freeze({
      index,
      timestamp,
      eventType,
      payload: JSON.parse(JSON.stringify(payload)),
      prevHash,
      hash: entryHash,
      signature
    });

    this._entries.push(entry);

    const eventData = JSON.parse(JSON.stringify(entry));
    this.emit('entry:appended', eventData);
    return eventData;
  }

  /**
   * Calculates current Merkle Root of all entries in the log
   * @returns {string} Hex string of the Merkle Root Hash
   */
  getMerkleRoot() {
    if (this._entries.length === 0) {
      return '0'.repeat(64);
    }

    let level = this._entries.map(e => CATransparencyLogEngine.hashLeaf(e.hash));

    while (level.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < level.length; i += 2) {
        if (i + 1 < level.length) {
          nextLevel.push(CATransparencyLogEngine.hashNodes(level[i], level[i + 1]));
        } else {
          // Duplicated node for odd level length
          nextLevel.push(CATransparencyLogEngine.hashNodes(level[i], level[i]));
        }
      }
      level = nextLevel;
    }

    return level[0];
  }

  /**
   * Generates a Merkle Inclusion Proof for an entry at a given index
   * @param {number} entryIndex Index of the target entry
   * @returns {Array<{position: string, hash: string}>} Array of proof steps
   */
  getInclusionProof(entryIndex) {
    if (entryIndex < 0 || entryIndex >= this._entries.length) {
      throw new Error(`CATransparencyLogEngine: Entry index ${entryIndex} out of bounds (0-${this._entries.length - 1})`);
    }

    const proof = [];
    let level = this._entries.map(e => CATransparencyLogEngine.hashLeaf(e.hash));
    let idx = entryIndex;

    while (level.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < level.length; i += 2) {
        const isLeft = (i === idx);
        const isRight = (i + 1 === idx);

        if (isLeft) {
          const siblingHash = (i + 1 < level.length) ? level[i + 1] : level[i];
          proof.push({ position: 'right', hash: siblingHash });
        } else if (isRight) {
          proof.push({ position: 'left', hash: level[i] });
        }

        if (i + 1 < level.length) {
          nextLevel.push(CATransparencyLogEngine.hashNodes(level[i], level[i + 1]));
        } else {
          nextLevel.push(CATransparencyLogEngine.hashNodes(level[i], level[i]));
        }
      }
      idx = Math.floor(idx / 2);
      level = nextLevel;
    }

    return proof;
  }

  /**
   * Cryptographically verifies a Merkle Inclusion Proof
   * @static
   * @param {string} entryHash Hex hash of entry
   * @param {Array<{position: string, hash: string}>} proof Proof steps
   * @param {string} expectedRoot Expected Merkle root hash
   * @returns {boolean} True if valid
   */
  static verifyInclusionProof(entryHash, proof, expectedRoot) {
    let currentHash = CATransparencyLogEngine.hashLeaf(entryHash);

    for (const step of proof) {
      if (step.position === 'left') {
        currentHash = CATransparencyLogEngine.hashNodes(step.hash, currentHash);
      } else {
        currentHash = CATransparencyLogEngine.hashNodes(currentHash, step.hash);
      }
    }

    return currentHash === expectedRoot;
  }

  /**
   * Audits full hash-chain integrity, signature validity, and Merkle root calculation
   * @param {string} [publicKeyOverride] Optional public key for verifying entry signatures
   * @returns {{valid: boolean, errors: Array<string>, totalEntries: number, merkleRoot: string}} Audit report
   */
  verifyLogIntegrity(publicKeyOverride = null) {
    const errors = [];
    const pubKey = publicKeyOverride || this.signingPublicKey;

    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i];

      // 1. Index sequence
      if (entry.index !== i) {
        errors.push(`Entry #${i}: Index mismatch (found ${entry.index})`);
      }

      // 2. Hash chain continuity
      const expectedPrevHash = (i === 0) ? '0'.repeat(64) : this._entries[i - 1].hash;
      if (entry.prevHash !== expectedPrevHash) {
        errors.push(`Entry #${i}: PrevHash broken. Expected ${expectedPrevHash}, found ${entry.prevHash}`);
      }

      // 3. Hash recalculation
      const expectedHash = CATransparencyLogEngine.computeEntryHash(
        entry.index,
        entry.timestamp,
        entry.eventType,
        entry.payload,
        entry.prevHash
      );
      if (entry.hash !== expectedHash) {
        errors.push(`Entry #${i}: Hash corruption detected. Recalculated ${expectedHash}, found ${entry.hash}`);
      }

      // 4. Signature verification
      if (entry.signature) {
        if (!pubKey) {
          // Warning: signature present but no public key supplied
        } else {
          try {
            const verifier = crypto.createVerify('sha256');
            verifier.update(entry.hash);
            verifier.end();
            const isSigValid = verifier.verify(pubKey, entry.signature, 'hex');
            if (!isSigValid) {
              errors.push(`Entry #${i}: Signature verification failed.`);
            }
          } catch (err) {
            errors.push(`Entry #${i}: Signature check error - ${err.message}`);
          }
        }
      }
    }

    const merkleRoot = this.getMerkleRoot();

    return {
      valid: errors.length === 0,
      errors,
      totalEntries: this._entries.length,
      merkleRoot
    };
  }

  /**
   * Retrieves copy of entry by index
   */
  getEntry(index) {
    if (index < 0 || index >= this._entries.length) return null;
    return JSON.parse(JSON.stringify(this._entries[index]));
  }

  /**
   * Returns deep copy of all entries
   */
  getEntries() {
    return JSON.parse(JSON.stringify(this._entries));
  }

  /**
   * Queries log entries matching criteria
   */
  queryEntries(filter = {}) {
    return this.getEntries().filter(entry => {
      if (filter.eventType && entry.eventType !== filter.eventType) return false;
      if (filter.serialNumber && entry.payload?.serialNumber !== filter.serialNumber) return false;
      if (filter.caId && entry.payload?.caId !== filter.caId) return false;
      if (filter.keyId && entry.payload?.keyId !== filter.keyId) return false;
      return true;
    });
  }

  /**
   * Exports comprehensive audit package
   */
  exportAuditBundle() {
    const integrity = this.verifyLogIntegrity();
    return {
      logId: this.logId,
      exportedAt: new Date().toISOString(),
      totalEntries: this._entries.length,
      merkleRoot: integrity.merkleRoot,
      integrityValid: integrity.valid,
      errors: integrity.errors,
      entries: this.getEntries()
    };
  }

  /**
   * Freezes log against further modifications
   */
  freeze() {
    this._isFrozen = true;
  }
}

module.exports = {
  CATransparencyLogEngine,
  CA_LOG_EVENT_TYPES
};
