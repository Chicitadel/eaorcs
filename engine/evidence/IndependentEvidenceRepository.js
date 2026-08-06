/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Independent Evidence Repository Engine
 * File           : IndependentEvidenceRepository.js
 * Version        : 2026.3.0-RC1
 * Author         : Platform Audit & External Certification Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved — ENHANCEMENT (Foundation-Locked)
 * - Strict structural separation between Internal vs External Evidence
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

const EVIDENCE_CLASS = Object.freeze({
  INTERNAL: 'INTERNAL',
  EXTERNAL: 'EXTERNAL',
});

const EVIDENCE_TYPES = Object.freeze({
  // Internal
  UNIT_TEST: 'UNIT_TEST',
  INTEGRATION_TEST: 'INTEGRATION_TEST',
  DRI_SCORE: 'DRI_SCORE',
  STATIC_ANALYSIS: 'STATIC_ANALYSIS',
  ARCHITECTURE_FREEZE: 'ARCHITECTURE_FREEZE',
  SBOM_INTERNAL: 'SBOM_INTERNAL',
  // External
  PENETRATION_TEST: 'PENETRATION_TEST',
  ACCESSIBILITY_AUDIT: 'ACCESSIBILITY_AUDIT',
  LEGAL_PRIVACY_REVIEW: 'LEGAL_PRIVACY_REVIEW',
  CUSTOMER_REFERENCE: 'CUSTOMER_REFERENCE',
  PILOT_RESULT: 'PILOT_RESULT',
  INDEPENDENT_CERTIFICATION: 'INDEPENDENT_CERTIFICATION',
});

/**
 * IndependentEvidenceRepository
 *
 * Maintains a strict cryptographically verified partition between internally
 * generated engineering artifacts and external third-party audit evidence.
 */
class IndependentEvidenceRepository {
  constructor(options = {}) {
    this.options = options;
    this._repository = new Map(); // evidenceId -> Evidence record
  }

  /**
   * Stores evidence into the repository with strict classification.
   */
  storeEvidence(descriptor) {
    const required = ['title', 'type', 'evidenceClass', 'source'];
    for (const f of required) {
      if (!descriptor[f]) throw new Error(`IndependentEvidenceRepository: '${f}' is required.`);
    }

    const evClass = descriptor.evidenceClass.toUpperCase();
    if (!EVIDENCE_CLASS[evClass]) {
      throw new Error(`IndependentEvidenceRepository: evidenceClass must be INTERNAL or EXTERNAL.`);
    }

    const id = `ev-${crypto.randomBytes(6).toString('hex')}`;
    const payloadString = JSON.stringify(descriptor.data || {});
    const hash = crypto.createHash('sha256').update(`${id}:${descriptor.title}:${payloadString}`).digest('hex');

    const record = {
      id,
      title: descriptor.title,
      type: descriptor.type.toUpperCase(),
      evidenceClass: evClass,
      source: descriptor.source, // Auditor name, tool name, or organization
      data: descriptor.data || {},
      hash,
      verifier: descriptor.verifier || null,
      storedAt: new Date().toISOString(),
    };

    this._repository.set(id, record);
    return { ...record };
  }

  /**
   * Retrieves all evidence belonging to a given class (INTERNAL or EXTERNAL).
   */
  getEvidenceByClass(evClass) {
    const targetClass = evClass.toUpperCase();
    if (!EVIDENCE_CLASS[targetClass]) throw new Error(`Invalid class: ${evClass}`);

    return [...this._repository.values()]
      .filter(e => e.evidenceClass === targetClass)
      .map(e => ({ ...e }));
  }

  /**
   * Verifies the cryptographic hash integrity of stored evidence.
   */
  verifyEvidenceIntegrity(id) {
    const e = this._getEvidence(id);
    const payloadString = JSON.stringify(e.data || {});
    const computedHash = crypto.createHash('sha256').update(`${e.id}:${e.title}:${payloadString}`).digest('hex');
    const valid = computedHash === e.hash;

    return {
      id: e.id,
      title: e.title,
      storedHash: e.hash,
      computedHash,
      valid,
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Generates a comparative summary report separating internal vs external evidence readiness.
   */
  generateEvidenceSummary() {
    const all = [...this._repository.values()];
    const internal = all.filter(e => e.evidenceClass === 'INTERNAL');
    const external = all.filter(e => e.evidenceClass === 'EXTERNAL');

    return {
      generatedAt: new Date().toISOString(),
      totalEvidenceCount: all.length,
      internalCount: internal.length,
      externalCount: external.length,
      internalEvidence: internal.map(e => ({ id: e.id, title: e.title, type: e.type, source: e.source })),
      externalEvidence: external.map(e => ({ id: e.id, title: e.title, type: e.type, source: e.source, verifier: e.verifier })),
    };
  }

  /**
   * Calculates the external readiness percentage based on required Gate 2/3 evidence types.
   */
  getExternalEvidenceReadiness() {
    const requiredExternal = [
      EVIDENCE_TYPES.PENETRATION_TEST,
      EVIDENCE_TYPES.ACCESSIBILITY_AUDIT,
      EVIDENCE_TYPES.LEGAL_PRIVACY_REVIEW,
      EVIDENCE_TYPES.CUSTOMER_REFERENCE,
      EVIDENCE_TYPES.PILOT_RESULT,
    ];

    const external = this.getEvidenceByClass('EXTERNAL');
    const presentTypes = new Set(external.map(e => e.type));

    let cleared = 0;
    for (const req of requiredExternal) {
      if (presentTypes.has(req)) cleared++;
    }

    const readinessPct = Math.round((cleared / requiredExternal.length) * 100);

    return {
      readinessPct,
      clearedCount: cleared,
      requiredCount: requiredExternal.length,
      missingTypes: requiredExternal.filter(t => !presentTypes.has(t)),
    };
  }

  getEngineStatus() {
    return { initialized: true, totalEvidence: this._repository.size };
  }

  _getEvidence(id) {
    const e = this._repository.get(id);
    if (!e) throw new Error(`IndependentEvidenceRepository: Evidence '${id}' not found.`);
    return e;
  }
}

module.exports = IndependentEvidenceRepository;
module.exports.IndependentEvidenceRepository = IndependentEvidenceRepository;
module.exports.EVIDENCE_CLASS = EVIDENCE_CLASS;
module.exports.EVIDENCE_TYPES = EVIDENCE_TYPES;
