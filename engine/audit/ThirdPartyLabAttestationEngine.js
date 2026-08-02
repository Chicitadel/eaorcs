/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Third-Party Lab Attestation Engine
 * File           : engine/audit/ThirdPartyLabAttestationEngine.js
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

class ThirdPartyLabAttestationEngine {
  constructor() {
    this.labs = new Map();
    this.attestations = new Map();
  }

  registerAuditingLab(labId, labMetadata, pubKey) {
    if (!labId || !pubKey) throw new Error('labId and pubKey required');
    const lab = {
      labId,
      name: labMetadata.name || labId,
      accreditation: labMetadata.accreditation || 'ISO/IEC 17025 Accredited Lab',
      pubKey,
      registeredAt: new Date().toISOString()
    };
    this.labs.set(labId, lab);
    return lab;
  }

  submitAttestation(labId, attestationData, signature) {
    const lab = this.labs.get(labId);
    if (!lab) throw new Error(`Lab not registered: ${labId}`);

    const attestationId = `ATTEST-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const record = {
      attestationId,
      labId,
      attestationData,
      timestamp,
      signature
    };

    this.attestations.set(attestationId, record);
    return record;
  }

  verifyAttestationSignature(attestationId) {
    const record = this.attestations.get(attestationId);
    if (!record) return { valid: false, reason: 'ATTESTATION_NOT_FOUND' };

    const lab = this.labs.get(record.labId);
    if (!lab) return { valid: false, reason: 'LAB_NOT_FOUND' };

    try {
      const canonical = JSON.stringify(record.attestationData, Object.keys(record.attestationData).sort());
      const verifier = crypto.createVerify('SHA256');
      verifier.update(canonical);
      const valid = verifier.verify(lab.pubKey, record.signature, 'hex');
      return { valid, attestationId, labId: lab.labId, labName: lab.name };
    } catch (e) {
      return { valid: false, reason: e.message };
    }
  }

  getLabAttestations(artifactHash) {
    const list = Array.from(this.attestations.values()).filter(a => a.attestationData && a.attestationData.artifactHash === artifactHash);
    return list;
  }
}

module.exports = { ThirdPartyLabAttestationEngine };
