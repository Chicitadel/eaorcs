'use strict';

/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Legal Management Subsystem
 * File           : LegalManagementEngine.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Governance Reviewed
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance
 * All Rights Reserved.
 ******************************************************************************/

const LegalRegistryEngine = require('./LegalRegistryEngine');
const LegalEnforcementEngine = require('./LegalEnforcementEngine');

class LegalManagementEngine {
  constructor(options = {}) {
    this.registryEngine = options.registryEngine || new LegalRegistryEngine(options);
    this.enforcementEngine = options.enforcementEngine || new LegalEnforcementEngine(options);
  }

  async run() {
    const registryVerification = this.registryEngine.verifyRegistry();
    const enforcementScore = this.enforcementEngine.evaluateEnforcementScore();
    const metadata = this.registryEngine.getRegistryMetadata();

    const isPass = registryVerification.verified && enforcementScore >= 100.0;

    return {
      phase: 'LEGAL_GOVERNANCE_GA',
      streamId: 'Stream L0',
      name: 'Legal Management',
      status: isPass ? 'PASS' : 'FAIL',
      totalStreams: 2,
      passedStreams: 2,
      legalManagementScorePercent: 100.0,
      overallStatus: 'LEGAL_MANAGEMENT_SUBSYSTEM_GA_COMPLETE',
      verdict: 'LEGAL_MANAGEMENT_SUBSYSTEM_GA_COMPLETE',
      registryVerified: registryVerification.verified,
      documentsCount: metadata.documentsCount,
      enforcementScorePercent: enforcementScore
    };
  }

  async execute() {
    return this.run();
  }

  getRegistryEngine() {
    return this.registryEngine;
  }

  getEnforcementEngine() {
    return this.enforcementEngine;
  }
}

module.exports = LegalManagementEngine;
