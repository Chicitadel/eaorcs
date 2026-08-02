/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Independent Validation Engine (Stream A)
 * File           : ExternalAttestationHarness.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Enterprise Engineering / Chicitadel
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems Engineering & Governance Authority.
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

class ExternalAttestationHarness {
  constructor(options = {}) {
    this.harnessVersion = options.harnessVersion || '2026.1.0-LTS';
    this.registeredAuditors = new Map();
    this.attestations = new Map();
    this.validationLogs = [];
  }

  /**
   * Registers a third-party audit firm, testing laboratory, or academic partner.
   * @param {Object} auditorInfo
   * @returns {Object} Registered auditor profile
   */
  registerExternalAuditor(auditorInfo) {
    if (!auditorInfo || typeof auditorInfo !== 'object') {
      throw new Error('Invalid auditor registration payload: Must be an object.');
    }

    const { auditorId, name, type, publicKey, certifications = [], contactEmail } = auditorInfo;

    if (!auditorId || typeof auditorId !== 'string') {
      throw new Error('Auditor registration failed: Missing or invalid auditorId.');
    }
    if (!name || typeof name !== 'string') {
      throw new Error(`Auditor registration failed [${auditorId}]: Missing or invalid name.`);
    }

    const validTypes = ['THIRD_PARTY_LAB', 'SECURITY_AUDITOR', 'ACADEMIC_PARTNER', 'PENETRATION_TESTER', 'COMPLIANCE_FIRM'];
    const normalizedType = (type || '').toUpperCase();
    if (!validTypes.includes(normalizedType)) {
      throw new Error(`Auditor registration failed [${auditorId}]: Invalid auditor type '${type}'. Must be one of: ${validTypes.join(', ')}`);
    }

    if (!publicKey) {
      throw new Error(`Auditor registration failed [${auditorId}]: Public key is required for cryptographic verification.`);
    }

    const record = {
      auditorId,
      name,
      type: normalizedType,
      publicKey,
      certifications: Array.isArray(certifications) ? certifications : [certifications],
      contactEmail: contactEmail || null,
      status: 'ACTIVE',
      registeredAt: new Date().toISOString()
    };

    this.registeredAuditors.set(auditorId, record);
    this.validationLogs.push(`[REGISTRATION] Registered external auditor [${auditorId}] (${name}) as ${normalizedType}`);

    return { ...record };
  }

  /**
   * Ingests, parses, and validates an incoming attestation payload.
   * @param {Object} attestationPayload
   * @returns {Object} Ingested attestation record
   */
  ingestAttestation(attestationPayload) {
    if (!attestationPayload || typeof attestationPayload !== 'object') {
      throw new Error('Ingest attestation failed: Payload must be an object.');
    }

    const {
      attestationId,
      auditorId,
      type,
      title,
      scope,
      issuedAt,
      expiresAt,
      summary,
      findings = [],
      payloadContent,
      payloadHash,
      signature
    } = attestationPayload;

    if (!attestationId || typeof attestationId !== 'string') {
      throw new Error('Ingest attestation failed: Missing attestationId.');
    }
    if (!auditorId || typeof auditorId !== 'string') {
      throw new Error(`Ingest attestation failed [${attestationId}]: Missing auditorId.`);
    }

    const validAttestationTypes = [
      'PENETRATION_TEST_CERTIFICATE',
      'ACADEMIC_AUDIT_PROOF',
      'EXTERNAL_ATTESTATION_REPORT',
      'ISO_COMPLIANCE_CERTIFICATE',
      'SECURITY_ASSESSMENT'
    ];
    const normalizedType = (type || '').toUpperCase();
    if (!validAttestationTypes.includes(normalizedType)) {
      throw new Error(`Ingest attestation failed [${attestationId}]: Unsupported attestation type '${type}'.`);
    }

    // Check auditor registration
    const auditor = this.registeredAuditors.get(auditorId);
    let auditorStatus = 'TRUSTED';
    if (!auditor) {
      auditorStatus = 'UNTRUSTED_AUDITOR';
    } else if (auditor.status !== 'ACTIVE') {
      auditorStatus = 'REVOKED_AUDITOR';
    }

    // Standardize payload content & compute hash
    const rawContent = typeof payloadContent === 'object' 
      ? JSON.stringify(payloadContent) 
      : String(payloadContent || '');

    const computedHash = crypto.createHash('sha256').update(rawContent).digest('hex');

    // Check payload hash match if provided
    let tamperDetected = false;
    if (payloadHash && payloadHash.toLowerCase() !== computedHash.toLowerCase()) {
      tamperDetected = true;
    }

    const initialStatus = tamperDetected 
      ? 'TAMPERED' 
      : (auditorStatus !== 'TRUSTED' ? auditorStatus : 'PENDING_VERIFICATION');

    const attestationRecord = {
      attestationId,
      auditorId,
      type: normalizedType,
      title: title || 'External Attestation Report',
      scope: scope || 'EAORCS Platform & Subsystems',
      issuedAt: issuedAt || new Date().toISOString(),
      expiresAt: expiresAt || null,
      summary: summary || {},
      findings,
      payloadContent: rawContent,
      payloadHash: computedHash,
      suppliedHash: payloadHash || computedHash,
      signature: signature || null,
      verificationStatus: initialStatus,
      tamperDetected,
      ingestedAt: new Date().toISOString()
    };

    this.attestations.set(attestationId, attestationRecord);
    this.validationLogs.push(`[INGEST] Ingested attestation [${attestationId}] from [${auditorId}] with status ${initialStatus}`);

    return { ...attestationRecord };
  }

  /**
   * Cryptographically verifies the signature of an ingested attestation.
   * @param {string} attestationId
   * @returns {Object} Verification result
   */
  verifyAttestationSignature(attestationId) {
    const attestation = this.attestations.get(attestationId);
    if (!attestation) {
      throw new Error(`Signature verification failed: Attestation [${attestationId}] not found.`);
    }

    const auditor = this.registeredAuditors.get(attestation.auditorId);
    if (!auditor) {
      attestation.verificationStatus = 'UNTRUSTED_AUDITOR';
      this.validationLogs.push(`[VERIFY_FAIL] Attestation [${attestationId}] failed verification: Auditor [${attestation.auditorId}] not registered.`);
      return {
        verified: false,
        attestationId,
        auditorId: attestation.auditorId,
        status: 'UNTRUSTED_AUDITOR',
        reason: `Auditor [${attestation.auditorId}] is not registered in harness.`
      };
    }

    if (auditor.status !== 'ACTIVE') {
      attestation.verificationStatus = 'REVOKED_AUDITOR';
      this.validationLogs.push(`[VERIFY_FAIL] Attestation [${attestationId}] failed verification: Auditor [${attestation.auditorId}] key is revoked.`);
      return {
        verified: false,
        attestationId,
        auditorId: attestation.auditorId,
        status: 'REVOKED_AUDITOR',
        reason: `Auditor [${attestation.auditorId}] status is ${auditor.status}.`
      };
    }

    // Check payload checksum tamper detection
    const currentHash = crypto.createHash('sha256').update(attestation.payloadContent).digest('hex');
    if (currentHash.toLowerCase() !== attestation.payloadHash.toLowerCase()) {
      attestation.verificationStatus = 'TAMPERED';
      attestation.tamperDetected = true;
      this.validationLogs.push(`[TAMPER_ALERT] Attestation [${attestationId}] content hash mismatch! Original: ${attestation.payloadHash}, Current: ${currentHash}`);
      return {
        verified: false,
        attestationId,
        auditorId: attestation.auditorId,
        status: 'TAMPERED',
        reason: 'Payload content has been altered after ingestion/hashing (Tamper Detected).'
      };
    }

    if (!attestation.signature) {
      attestation.verificationStatus = 'MISSING_SIGNATURE';
      return {
        verified: false,
        attestationId,
        auditorId: attestation.auditorId,
        status: 'MISSING_SIGNATURE',
        reason: 'Attestation does not contain a signature.'
      };
    }

    // Cryptographic signature verification
    let isValidSignature = false;
    try {
      const dataToVerify = Buffer.from(attestation.payloadHash);
      const signatureBuf = Buffer.isBuffer(attestation.signature)
        ? attestation.signature
        : Buffer.from(attestation.signature, 'hex');

      if (typeof auditor.publicKey === 'string' || auditor.publicKey instanceof crypto.KeyObject) {
        isValidSignature = crypto.verify(null, dataToVerify, auditor.publicKey, signatureBuf);
      }
    } catch (err) {
      isValidSignature = false;
    }

    if (isValidSignature) {
      attestation.verificationStatus = 'VERIFIED';
      attestation.verifiedAt = new Date().toISOString();
      this.validationLogs.push(`[VERIFY_PASS] Cryptographically verified attestation [${attestationId}] signature for auditor [${attestation.auditorId}]`);
      return {
        verified: true,
        attestationId,
        auditorId: attestation.auditorId,
        status: 'VERIFIED',
        payloadHash: attestation.payloadHash,
        timestamp: attestation.verifiedAt
      };
    } else {
      attestation.verificationStatus = 'SIGNATURE_INVALID';
      this.validationLogs.push(`[VERIFY_FAIL] Cryptographic signature check failed for attestation [${attestationId}]`);
      return {
        verified: false,
        attestationId,
        auditorId: attestation.auditorId,
        status: 'SIGNATURE_INVALID',
        reason: 'Cryptographic signature verification failed against auditor public key.'
      };
    }
  }

  /**
   * Generates a complete Stream A Independent Validation Report.
   * @returns {Object} Comprehensive validation report
   */
  generateValidationReport() {
    const totalAuditors = this.registeredAuditors.size;
    const activeAuditors = Array.from(this.registeredAuditors.values()).filter(a => a.status === 'ACTIVE').length;

    const attestationsList = Array.from(this.attestations.values());
    const totalAttestations = attestationsList.length;

    let verifiedCount = 0;
    let tamperedCount = 0;
    let untrustedCount = 0;
    let failedCount = 0;

    const breakdownByType = {
      PENETRATION_TEST_CERTIFICATE: 0,
      ACADEMIC_AUDIT_PROOF: 0,
      EXTERNAL_ATTESTATION_REPORT: 0,
      ISO_COMPLIANCE_CERTIFICATE: 0,
      SECURITY_ASSESSMENT: 0
    };

    const details = attestationsList.map(att => {
      if (att.type in breakdownByType) {
        breakdownByType[att.type]++;
      }
      if (att.verificationStatus === 'VERIFIED') verifiedCount++;
      else if (att.verificationStatus === 'TAMPERED') tamperedCount++;
      else if (att.verificationStatus === 'UNTRUSTED_AUDITOR' || att.verificationStatus === 'REVOKED_AUDITOR') untrustedCount++;
      else failedCount++;

      return {
        attestationId: att.attestationId,
        auditorId: att.auditorId,
        type: att.type,
        title: att.title,
        status: att.verificationStatus,
        payloadHash: att.payloadHash,
        issuedAt: att.issuedAt,
        tamperDetected: att.tamperDetected
      };
    });

    const isGlobalPass = totalAttestations > 0 && tamperedCount === 0 && untrustedCount === 0 && failedCount === 0 && verifiedCount === totalAttestations;

    const reportContent = {
      stream: 'Stream A — Independent Validation',
      version: this.harnessVersion,
      generatedAt: new Date().toISOString(),
      governanceAuthority: 'Ujomor Systems Engineering & Governance Authority',
      standardsCompliance: ['ISO 27001', 'SOC 2', 'OWASP ASVS', 'NIST SP 800-53'],
      summary: {
        totalAuditors,
        activeAuditors,
        totalAttestations,
        verifiedCount,
        tamperedCount,
        untrustedCount,
        failedCount,
        globalValidationStatus: isGlobalPass ? 'PASS' : (tamperedCount > 0 ? 'CRITICAL_FAIL' : 'WARN'),
        attestationBreakdown: breakdownByType
      },
      auditors: Array.from(this.registeredAuditors.values()).map(a => ({
        auditorId: a.auditorId,
        name: a.name,
        type: a.type,
        status: a.status,
        certifications: a.certifications
      })),
      attestations: details,
      auditLogs: [...this.validationLogs]
    };

    // Calculate report signature/digest
    const reportJson = JSON.stringify(reportContent.summary);
    const reportHash = crypto.createHash('sha256').update(reportJson).digest('hex');

    reportContent.reportHash = reportHash;

    return reportContent;
  }

  /**
   * Helper utility to create a cryptographically signed attestation object.
   * @param {crypto.KeyObject|string} privateKey
   * @param {Object} payload
   * @returns {Object} Signed attestation payload ready for ingestion
   */
  static createSignedAttestation(privateKey, payload) {
    const rawContent = typeof payload.payloadContent === 'object'
      ? JSON.stringify(payload.payloadContent)
      : String(payload.payloadContent || '');

    const payloadHash = crypto.createHash('sha256').update(rawContent).digest('hex');
    const dataToSign = Buffer.from(payloadHash);

    const signature = crypto.sign(null, dataToSign, privateKey).toString('hex');

    return {
      ...payload,
      payloadContent: rawContent,
      payloadHash,
      signature
    };
  }

  /**
   * Revokes a registered auditor key.
   * @param {string} auditorId
   * @param {string} reason
   */
  revokeAuditor(auditorId, reason = 'Administrative revocation') {
    const auditor = this.registeredAuditors.get(auditorId);
    if (!auditor) {
      throw new Error(`Revocation failed: Auditor [${auditorId}] not found.`);
    }
    auditor.status = 'REVOKED';
    auditor.revokedAt = new Date().toISOString();
    auditor.revocationReason = reason;
    this.validationLogs.push(`[REVOKE] Auditor [${auditorId}] has been REVOKED. Reason: ${reason}`);
    return { ...auditor };
  }
}

module.exports = ExternalAttestationHarness;
