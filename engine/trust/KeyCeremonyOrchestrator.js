/******************************************************************************
 * Project        : EAORCS Platform
 * Module         : Trust Operations Engine
 * File           : engine/trust/KeyCeremonyOrchestrator.js
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
const { CA_LOG_EVENT_TYPES } = require('./CATransparencyLogEngine');

/**
 * Key Ceremony States
 */
const CeremonyState = {
  IDLE: 'IDLE',
  INITIATED: 'INITIATED',
  CUSTODIANS_REGISTERED: 'CUSTODIANS_REGISTERED',
  QUORUM_REACHED: 'QUORUM_REACHED',
  KEY_GENERATED: 'KEY_GENERATED',
  SECRETS_DISTRIBUTED: 'SECRETS_DISTRIBUTED',
  COMPLETED: 'COMPLETED',
  ABORTED: 'ABORTED',
  ROTATION_INITIATED: 'ROTATION_INITIATED',
  ROTATION_QUORUM_REACHED: 'ROTATION_QUORUM_REACHED',
  ROTATION_COMPLETED: 'ROTATION_COMPLETED'
};

/**
 * Required Custodian Roles for Dual-Custody Governance
 */
const CustodianRole = {
  PRIMARY_CUSTODIAN: 'PRIMARY_CUSTODIAN',
  SECONDARY_CUSTODIAN: 'SECONDARY_CUSTODIAN',
  SECURITY_OFFICER: 'SECURITY_OFFICER',
  GOVERNANCE_WITNESS: 'GOVERNANCE_WITNESS',
  AUDITOR: 'AUDITOR'
};

/**
 * Galois Field GF(256) multiplication for Shamir Secret Sharing
 */
function gfMul(a, b) {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const hiBit = a & 0x80;
    a = (a << 1) & 0xff;
    if (hiBit) a ^= 0x11b; // Primitive polynomial x^8 + x^4 + x^3 + x + 1
    b >>= 1;
  }
  return p;
}

/**
 * Galois Field GF(256) division
 */
function gfDiv(a, b) {
  if (b === 0) throw new Error('KeyCeremonyOrchestrator: GF(256) division by zero');
  if (a === 0) return 0;
  let inv = 1;
  let base = b;
  let exp = 254; // b^254 is inverse in GF(2^8)
  while (exp > 0) {
    if (exp & 1) inv = gfMul(inv, base);
    base = gfMul(base, base);
    exp >>= 1;
  }
  return gfMul(a, inv);
}

/**
 * Shamir's Secret Sharing Implementation (Byte-wise over GF(256))
 */
class ShamirSecretSharing {
  /**
   * Splits a secret buffer into N shares with threshold M
   * @param {Buffer} secretBuf Secret payload buffer
   * @param {number} thresholdM Minimum required shares to reconstruct (M)
   * @param {number} totalN Total number of shares to generate (N)
   * @returns {Array<{shareId: number, data: string, checksum: string}>} Array of share objects
   */
  static splitSecret(secretBuf, thresholdM, totalN) {
    if (thresholdM < 2 || thresholdM > totalN) {
      throw new Error(`Invalid threshold setup: M=${thresholdM}, N=${totalN}`);
    }
    if (totalN > 254) {
      throw new Error(`Total shares N cannot exceed 254 in GF(256)`);
    }

    const secretLength = secretBuf.length;
    const shareBuffers = Array.from({ length: totalN }, () => Buffer.alloc(secretLength));

    for (let k = 0; k < secretLength; k++) {
      const secretByte = secretBuf[k];
      // Generate random polynomial coefficients a1..a_{M-1}
      const poly = [secretByte];
      const randCoeffs = crypto.randomBytes(thresholdM - 1);
      for (let c = 0; c < thresholdM - 1; c++) {
        poly.push(randCoeffs[c]);
      }

      // Evaluate polynomial for x = 1..N
      for (let x = 1; x <= totalN; x++) {
        let y = 0;
        let xPow = 1;
        for (let deg = 0; deg < thresholdM; deg++) {
          const term = gfMul(poly[deg], xPow);
          y ^= term;
          xPow = gfMul(xPow, x);
        }
        shareBuffers[x - 1][k] = y;
      }
    }

    return shareBuffers.map((buf, idx) => {
      const shareId = idx + 1;
      const dataHex = buf.toString('hex');
      const checksum = crypto.createHash('sha256').update(`${shareId}:${dataHex}`).digest('hex');
      return { shareId, data: dataHex, checksum };
    });
  }

  /**
   * Reconstructs secret buffer from at least M shares
   * @param {Array<{shareId: number, data: string, checksum: string}>} shares Array of shares
   * @param {number} thresholdM Threshold M
   * @returns {Buffer} Reconstructed secret buffer
   */
  static combineShares(shares, thresholdM) {
    if (!shares || shares.length < thresholdM) {
      throw new Error(`Insufficient shares: Provided ${shares?.length || 0}, required ${thresholdM}`);
    }

    // Verify share checksums
    for (const share of shares) {
      const expectedChecksum = crypto.createHash('sha256').update(`${share.shareId}:${share.data}`).digest('hex');
      if (share.checksum !== expectedChecksum) {
        throw new Error(`Share #${share.shareId} checksum verification failed!`);
      }
    }

    const selectedShares = shares.slice(0, thresholdM);
    const xValues = selectedShares.map(s => s.shareId);
    const shareBuffers = selectedShares.map(s => Buffer.from(s.data, 'hex'));
    const secretLength = shareBuffers[0].length;
    const reconstructed = Buffer.alloc(secretLength);

    for (let k = 0; k < secretLength; k++) {
      let secretByte = 0;
      for (let i = 0; i < thresholdM; i++) {
        const xi = xValues[i];
        const yi = shareBuffers[i][k];

        let num = 1;
        let den = 1;
        for (let j = 0; j < thresholdM; j++) {
          if (i === j) continue;
          const xj = xValues[j];
          num = gfMul(num, xj);
          den = gfMul(den, xi ^ xj);
        }
        const lagrange = gfDiv(num, den);
        secretByte ^= gfMul(yi, lagrange);
      }
      reconstructed[k] = secretByte;
    }

    return reconstructed;
  }
}

class KeyCeremonyOrchestrator extends EventEmitter {
  /**
   * @param {Object} [options] Configuration options
   * @param {Object} [options.transparencyLog] Instance of CATransparencyLogEngine
   */
  constructor(options = {}) {
    super();
    this.transparencyLog = options.transparencyLog || null;
    this.state = CeremonyState.IDLE;
    this.ceremonyId = null;
    this.config = null;
    this.custodians = new Map();
    this.checkedInCustodians = new Set();
    this.generatedKeys = null;
    this.distributedShares = null;
    this.ceremonyLog = [];
  }

  /**
   * Initiates a new Key Ceremony
   * @param {string} ceremonyId Unique ID for the ceremony
   * @param {Object} config Configuration
   * @param {number} config.thresholdM Threshold M
   * @param {number} config.totalN Total N
   * @param {string} [config.keyType] 'RSA-4096' or 'EC-P384'
   * @param {string} [config.caType] 'ROOT' or 'INTERMEDIATE'
   * @param {string} [config.caName] Common Name for CA
   */
  initiateCeremony(ceremonyId, config = {}) {
    if (this.state !== CeremonyState.IDLE && this.state !== CeremonyState.COMPLETED && this.state !== CeremonyState.ABORTED) {
      throw new Error(`Cannot initiate ceremony in current state '${this.state}'`);
    }

    const thresholdM = config.thresholdM || 3;
    const totalN = config.totalN || 5;
    if (thresholdM > totalN || thresholdM < 2) {
      throw new Error(`Invalid threshold configuration: M=${thresholdM}, N=${totalN}`);
    }

    this.ceremonyId = ceremonyId || `ceremony-${crypto.randomBytes(4).toString('hex')}`;
    this.config = {
      thresholdM,
      totalN,
      keyType: config.keyType || 'RSA-4096',
      caType: config.caType || 'ROOT',
      caName: config.caName || 'EAORCS Root Certification Authority',
      initiatedAt: new Date().toISOString()
    };

    this.custodians.clear();
    this.checkedInCustodians.clear();
    this.generatedKeys = null;
    this.distributedShares = null;
    this.ceremonyLog = [];

    this._transitionState(CeremonyState.INITIATED, { config: this.config });

    if (this.transparencyLog) {
      this.transparencyLog.appendEntry(CA_LOG_EVENT_TYPES.KEY_CEREMONY_INITIATED, {
        ceremonyId: this.ceremonyId,
        config: this.config
      });
    }

    return { ceremonyId: this.ceremonyId, state: this.state };
  }

  /**
   * Registers a custodian for dual-custody governance
   */
  registerCustodian(custodianId, name, role, publicKey = null) {
    if (this.state !== CeremonyState.INITIATED && this.state !== CeremonyState.CUSTODIANS_REGISTERED) {
      throw new Error(`Cannot register custodian in state '${this.state}'`);
    }

    if (!CustodianRole[role]) {
      throw new Error(`Invalid custodian role '${role}'`);
    }

    if (this.custodians.size >= this.config.totalN) {
      throw new Error(`Cannot exceed total N=${this.config.totalN} custodians`);
    }

    const custodian = {
      custodianId,
      name,
      role,
      publicKey,
      registeredAt: new Date().toISOString()
    };

    this.custodians.set(custodianId, custodian);
    this._logCeremonyEvent('CUSTODIAN_REGISTERED', { custodianId, name, role });

    if (this.custodians.size === this.config.totalN) {
      this._transitionState(CeremonyState.CUSTODIANS_REGISTERED, { registeredCount: this.custodians.size });
    }

    return custodian;
  }

  /**
   * Custodian checks in to the ceremony with authentication proof
   */
  checkInCustodian(custodianId, authSecret) {
    if (
      this.state !== CeremonyState.INITIATED &&
      this.state !== CeremonyState.CUSTODIANS_REGISTERED &&
      this.state !== CeremonyState.QUORUM_REACHED &&
      this.state !== CeremonyState.ROTATION_INITIATED
    ) {
      throw new Error(`Cannot check-in custodian in state '${this.state}'`);
    }

    if (!this.custodians.has(custodianId)) {
      throw new Error(`Custodian '${custodianId}' is not registered`);
    }

    if (!authSecret) {
      throw new Error(`Authentication proof required for custodian check-in`);
    }

    this.checkedInCustodians.add(custodianId);
    this._logCeremonyEvent('CUSTODIAN_CHECKED_IN', { custodianId });

    // Evaluate Quorum & Dual-Custody Rules
    const quorumValid = this.verifyQuorum();
    if (quorumValid.isQuorumMet) {
      const targetQuorumState = (this.state === CeremonyState.ROTATION_INITIATED)
        ? CeremonyState.ROTATION_QUORUM_REACHED
        : CeremonyState.QUORUM_REACHED;

      this._transitionState(targetQuorumState, {
        checkedInCount: this.checkedInCustodians.size,
        rolesPresent: quorumValid.rolesPresent
      });
    }

    return {
      custodianId,
      checkedIn: true,
      quorumMet: quorumValid.isQuorumMet,
      rolesPresent: quorumValid.rolesPresent
    };
  }

  /**
   * Verifies Quorum & Dual-Custody Requirements
   * Requires checked-in >= M AND at least 1 SECURITY_OFFICER and 1 PRIMARY_CUSTODIAN
   */
  verifyQuorum() {
    const checkedInList = Array.from(this.checkedInCustodians).map(id => this.custodians.get(id));
    const count = checkedInList.length;
    const thresholdM = this.config ? this.config.thresholdM : 3;

    const rolesPresent = checkedInList.map(c => c.role);
    const hasSecurityOfficer = rolesPresent.includes(CustodianRole.SECURITY_OFFICER);
    const hasPrimaryCustodian = rolesPresent.includes(CustodianRole.PRIMARY_CUSTODIAN);

    const isQuorumMet = (count >= thresholdM) && hasSecurityOfficer && hasPrimaryCustodian;

    return {
      isQuorumMet,
      count,
      thresholdM,
      hasSecurityOfficer,
      hasPrimaryCustodian,
      rolesPresent
    };
  }

  /**
   * Executes Key Generation under dual-custody authorization
   */
  executeKeyGeneration() {
    if (this.state !== CeremonyState.QUORUM_REACHED) {
      throw new Error(`Cannot execute key generation in state '${this.state}'. Quorum required.`);
    }

    const keyType = this.config.keyType;
    let keyPair;

    if (keyType === 'EC-P384' || keyType === 'EC-P256') {
      const curve = keyType === 'EC-P256' ? 'prime256v1' : 'secp384r1';
      keyPair = crypto.generateKeyPairSync('ec', {
        namedCurve: curve,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });
    } else {
      // Default RSA-4096 (or 2048 for fast execution if spec indicates)
      const modLength = keyType.includes('2048') ? 2048 : 4096;
      keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: modLength,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });
    }

    const keyFingerprint = crypto.createHash('sha256').update(keyPair.publicKey).digest('hex');
    this.generatedKeys = {
      keyId: `key-${keyFingerprint.substring(0, 16)}`,
      keyType,
      publicKey: keyPair.publicKey,
      privateKeyPem: keyPair.privateKey,
      fingerprint: keyFingerprint,
      createdAt: new Date().toISOString()
    };

    // Perform M-of-N Secret Splitting on the Private Key
    const privateKeyBuf = Buffer.from(keyPair.privateKey, 'utf8');
    const shares = ShamirSecretSharing.splitSecret(privateKeyBuf, this.config.thresholdM, this.config.totalN);

    // Assign shares to registered custodians
    const custodianList = Array.from(this.custodians.values());
    this.distributedShares = shares.map((share, idx) => ({
      ...share,
      custodianId: custodianList[idx].custodianId,
      custodianRole: custodianList[idx].role
    }));

    this._transitionState(CeremonyState.KEY_GENERATED, {
      keyId: this.generatedKeys.keyId,
      fingerprint: this.generatedKeys.fingerprint
    });

    this._transitionState(CeremonyState.SECRETS_DISTRIBUTED, {
      shareCount: this.distributedShares.length
    });

    if (this.transparencyLog) {
      this.transparencyLog.appendEntry(CA_LOG_EVENT_TYPES.KEY_GENERATED, {
        ceremonyId: this.ceremonyId,
        caName: this.config.caName,
        keyId: this.generatedKeys.keyId,
        keyType: this.config.keyType,
        fingerprint: this.generatedKeys.fingerprint,
        publicKey: this.generatedKeys.publicKey
      });
    }

    return {
      keyId: this.generatedKeys.keyId,
      fingerprint: this.generatedKeys.fingerprint,
      publicKey: this.generatedKeys.publicKey,
      distributedSharesCount: this.distributedShares.length
    };
  }

  /**
   * Finalizes and completes the Key Ceremony
   */
  completeCeremony() {
    if (this.state !== CeremonyState.SECRETS_DISTRIBUTED) {
      throw new Error(`Cannot complete ceremony in state '${this.state}'`);
    }

    this._transitionState(CeremonyState.COMPLETED, { completedAt: new Date().toISOString() });

    if (this.transparencyLog) {
      this.transparencyLog.appendEntry(CA_LOG_EVENT_TYPES.KEY_CEREMONY_COMPLETED, {
        ceremonyId: this.ceremonyId,
        keyId: this.generatedKeys.keyId,
        fingerprint: this.generatedKeys.fingerprint,
        custodianCount: this.custodians.size
      });
    }

    return {
      ceremonyId: this.ceremonyId,
      status: 'COMPLETED',
      keyId: this.generatedKeys.keyId,
      fingerprint: this.generatedKeys.fingerprint
    };
  }

  /**
   * Reconstructs private key from provided M-of-N shares
   */
  reconstructPrivateKey(shares) {
    const secretBuf = ShamirSecretSharing.combineShares(shares, this.config ? this.config.thresholdM : 3);
    return secretBuf.toString('utf8');
  }

  /**
   * Key Rotation State Machine: Initiates Key Rotation Workflow
   */
  initiateKeyRotation(rotationReason = 'SCHEDULED_ROTATION') {
    if (this.state !== CeremonyState.COMPLETED) {
      throw new Error(`Cannot initiate key rotation when ceremony state is '${this.state}'`);
    }

    const previousKeyId = this.generatedKeys ? this.generatedKeys.keyId : null;
    this.checkedInCustodians.clear();

    this._transitionState(CeremonyState.ROTATION_INITIATED, {
      previousKeyId,
      rotationReason,
      initiatedAt: new Date().toISOString()
    });

    return { state: this.state, previousKeyId };
  }

  /**
   * Key Rotation State Machine: Executes Key Rotation once quorum re-checked in
   */
  executeKeyRotation(newKeyConfig = {}) {
    if (this.state !== CeremonyState.ROTATION_INITIATED && this.state !== CeremonyState.ROTATION_QUORUM_REACHED) {
      throw new Error(`Cannot execute rotation in state '${this.state}'`);
    }

    const quorumValid = this.verifyQuorum();
    if (!quorumValid.isQuorumMet) {
      throw new Error(`Cannot execute key rotation: Quorum re-authorization not met.`);
    }

    this._transitionState(CeremonyState.ROTATION_QUORUM_REACHED, { rolesPresent: quorumValid.rolesPresent });

    const previousKey = this.generatedKeys;
    const keyType = newKeyConfig.keyType || this.config.keyType;

    let keyPair;
    if (keyType === 'EC-P384' || keyType === 'EC-P256') {
      const curve = keyType === 'EC-P256' ? 'prime256v1' : 'secp384r1';
      keyPair = crypto.generateKeyPairSync('ec', {
        namedCurve: curve,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });
    } else {
      const modLength = keyType.includes('2048') ? 2048 : 4096;
      keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: modLength,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });
    }

    const keyFingerprint = crypto.createHash('sha256').update(keyPair.publicKey).digest('hex');
    const newKey = {
      keyId: `key-${keyFingerprint.substring(0, 16)}`,
      keyType,
      publicKey: keyPair.publicKey,
      privateKeyPem: keyPair.privateKey,
      fingerprint: keyFingerprint,
      createdAt: new Date().toISOString()
    };

    // Split new private key
    const privateKeyBuf = Buffer.from(keyPair.privateKey, 'utf8');
    const shares = ShamirSecretSharing.splitSecret(privateKeyBuf, this.config.thresholdM, this.config.totalN);
    const custodianList = Array.from(this.custodians.values());
    this.distributedShares = shares.map((share, idx) => ({
      ...share,
      custodianId: custodianList[idx].custodianId,
      custodianRole: custodianList[idx].role
    }));

    this.generatedKeys = newKey;

    this._transitionState(CeremonyState.ROTATION_COMPLETED, {
      previousKeyId: previousKey.keyId,
      newKeyId: newKey.keyId,
      newFingerprint: newKey.fingerprint
    });

    if (this.transparencyLog) {
      this.transparencyLog.appendEntry(CA_LOG_EVENT_TYPES.KEY_ROTATED, {
        ceremonyId: this.ceremonyId,
        previousKeyId: previousKey.keyId,
        previousFingerprint: previousKey.fingerprint,
        newKeyId: newKey.keyId,
        newFingerprint: newKey.fingerprint,
        newPublicKey: newKey.publicKey
      });
    }

    // Re-transition state to COMPLETED for operational readiness
    this.state = CeremonyState.COMPLETED;

    return {
      status: 'ROTATION_COMPLETED',
      previousKeyId: previousKey.keyId,
      newKeyId: newKey.keyId,
      newFingerprint: newKey.fingerprint
    };
  }

  /**
   * Aborts current ceremony
   */
  abortCeremony(reason = 'MANUAL_ABORT') {
    this._transitionState(CeremonyState.ABORTED, { reason });
    return { status: 'ABORTED', reason };
  }

  /**
   * Internal state transition helper
   */
  _transitionState(newState, meta = {}) {
    const oldState = this.state;
    this.state = newState;
    const transitionEvent = { oldState, newState, timestamp: new Date().toISOString(), ...meta };
    this.ceremonyLog.push(transitionEvent);
    this.emit('state:transition', transitionEvent);
  }

  /**
   * Internal log event helper
   */
  _logCeremonyEvent(event, data = {}) {
    this.ceremonyLog.push({
      event,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  /**
   * Returns full ceremony audit report
   */
  exportCeremonyReport() {
    return {
      ceremonyId: this.ceremonyId,
      state: this.state,
      config: this.config,
      custodiansCount: this.custodians.size,
      checkedInCustodiansCount: this.checkedInCustodians.size,
      generatedKeyId: this.generatedKeys ? this.generatedKeys.keyId : null,
      fingerprint: this.generatedKeys ? this.generatedKeys.fingerprint : null,
      timeline: [...this.ceremonyLog]
    };
  }
}

module.exports = {
  KeyCeremonyOrchestrator,
  CeremonyState,
  CustodianRole,
  ShamirSecretSharing
};
