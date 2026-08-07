/******************************************************************************
 * Project        : Air Roofers Platform Ecosystem
 * Module         : AGPA Edition Strategy Engine
 * File           : engine/packaging/strategies/EditionStrategy.js
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

class EditionStrategy {
  constructor(edition = 'Enterprise') {
    this.edition = edition;
    this.tiers = ['Community', 'Professional', 'Enterprise', 'Sovereign'];
  }

  /**
   * Filter features and capabilities based on product edition level.
   * @param {Array<string>} capabilities 
   * @returns {Object} Filtered capability set & manifest metadata
   */
  applyEditionFilter(capabilities = []) {
    const currentTierIndex = this.tiers.indexOf(this.edition);
    if (currentTierIndex === -1) {
      throw new Error(`EditionStrategy Error: Unknown edition tier '${this.edition}'`);
    }

    const enabledCapabilities = capabilities.filter(cap => {
      if (this.edition === 'Community') {
        return !cap.includes('sovereign') && !cap.includes('dual');
      }
      if (this.edition === 'Professional') {
        return !cap.includes('sovereign');
      }
      return true;
    });

    return {
      edition: this.edition,
      tierLevel: currentTierIndex + 1,
      maxAllowedUsers: this.edition === 'Community' ? 5 : this.edition === 'Professional' ? 50 : 'UNLIMITED',
      capabilities: enabledCapabilities,
      enforceStrictTelemetry: this.edition !== 'Sovereign'
    };
  }
}

module.exports = EditionStrategy;
