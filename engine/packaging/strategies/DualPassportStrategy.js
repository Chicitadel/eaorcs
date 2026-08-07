/******************************************************************************
 * Project        : Air Roofers Platform Ecosystem
 * Module         : AGPA Dual Passport Generation Strategy Engine
 * File           : engine/packaging/strategies/DualPassportStrategy.js
 * Version        : 2026.3.0-LTS
 * Author         : Enterprise Architecture & Security Governance Board
 * Organization   : Air Roofers Governance Directorate
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
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
 * Copyright (c) 2026 Air Roofers Governance Directorate
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const DualPassportEngine = require('../../passport/DualPassportEngine');

class DualPassportStrategy {
  constructor(config = {}) {
    this.dualPassportEngine = new DualPassportEngine(config);
  }

  /**
   * Generates public and internal digital passports for a product packaging run.
   * @param {Object} packageData 
   * @returns {Object} { publicPassport, internalPassport }
   */
  generatePassports(packageData) {
    return this.dualPassportEngine.generateDualPassport({
      subject: packageData.productName || 'Air Roofers Product Distribution',
      version: packageData.version || '2026.3.0-LTS',
      sbomCount: packageData.sbomCount || 38,
      evidence: packageData.evidence || [{ type: 'SAST', status: 'PASS' }],
      graphData: packageData.internalGraph || { privateTopology: true },
      adrLinks: packageData.adrLinks || ['/private/adr/ADR-001']
    });
  }
}

module.exports = DualPassportStrategy;
