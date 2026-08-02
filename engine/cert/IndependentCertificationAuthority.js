/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Independent Certification Authority Engine
 * File           : engine/cert/IndependentCertificationAuthority.js
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

const crypto = require('crypto');

class IndependentCertificationAuthority {
  constructor(caName = 'EAORCS Independent Sovereign Root CA') {
    this.caName = caName;
    this.certificates = new Map();
    this.crl = new Map();
    this.rootKey = null;
  }

  initializeRootCa() {
    this.rootKey = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    return {
      caName: this.caName,
      publicKey: this.rootKey.publicKey,
      initializedAt: new Date().toISOString()
    };
  }

  issueSoftwareCertificate(applicantInfo, artifactHash) {
    if (!this.rootKey) this.initializeRootCa();
    if (!applicantInfo || !artifactHash) throw new Error('applicantInfo and artifactHash are required');

    const certId = `CERT-CA-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const certBody = {
      certId,
      issuer: this.caName,
      subject: applicantInfo.organization || 'Enterprise Subscriber',
      artifactHash,
      issuedAt,
      expiresAt,
      tier: 'SOVEREIGN_PLATINUM',
      status: 'VALID'
    };

    const canonical = JSON.stringify(certBody, Object.keys(certBody).sort());
    const signer = crypto.createSign('SHA256');
    signer.update(canonical);
    const signature = signer.sign(this.rootKey.privateKey, 'hex');

    const fullCert = {
      ...certBody,
      signature,
      caPublicKey: this.rootKey.publicKey
    };

    this.certificates.set(certId, fullCert);
    return fullCert;
  }

  revokeCertificate(certId, reason = 'SUPERSEDED') {
    const cert = this.certificates.get(certId);
    if (!cert) throw new Error(`Certificate not found: ${certId}`);
    cert.status = 'REVOKED';
    const revEntry = {
      certId,
      revokedAt: new Date().toISOString(),
      reason
    };
    this.crl.set(certId, revEntry);
    return revEntry;
  }

  verifyCertificateChain(certId) {
    const cert = this.certificates.get(certId);
    if (!cert) return { valid: false, reason: 'CERT_NOT_FOUND' };
    if (cert.status === 'REVOKED') return { valid: false, reason: 'CERT_REVOKED' };

    try {
      const body = { ...cert };
      delete body.signature;
      delete body.caPublicKey;

      const canonical = JSON.stringify(body, Object.keys(body).sort());
      const verifier = crypto.createVerify('SHA256');
      verifier.update(canonical);
      const valid = verifier.verify(cert.caPublicKey, cert.signature, 'hex');
      return { valid, certId: cert.certId, issuer: cert.issuer };
    } catch (e) {
      return { valid: false, reason: e.message };
    }
  }

  exportCrl() {
    const list = Array.from(this.crl.values());
    return {
      issuer: this.caName,
      crlNumber: 1,
      updatedAt: new Date().toISOString(),
      revokedCertificates: list
    };
  }
}

module.exports = { IndependentCertificationAuthority };
