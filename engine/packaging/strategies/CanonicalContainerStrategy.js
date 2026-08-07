/******************************************************************************
 * Project        : Air Roofers Platform Ecosystem
 * Module         : AGPA Canonical .airpkg Container Strategy Engine
 * File           : engine/packaging/strategies/CanonicalContainerStrategy.js
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

const AirPackageEngine = require('../../security/AirPackageEngine');

class CanonicalContainerStrategy {
  constructor(secretKey = null) {
    this.airPackageEngine = new AirPackageEngine(secretKey);
  }

  /**
   * Encapsulate a policy, plugin, or solution pack into a canonical .airpkg container
   * @param {Object} manifest 
   * @param {Object} contents 
   * @returns {Object} Canonical .airpkg container
   */
  packageContainer(manifest, contents) {
    const defaultManifest = {
      capabilityId: manifest.capabilityId || 'cap.generic.container',
      version: manifest.version || '1.0.0',
      issuer: manifest.issuer || 'Air Roofers Governance Directorate',
      licenseTier: manifest.licenseTier || 'ENTERPRISE',
      compatibility: manifest.compatibility || '>=2026.1.0'
    };

    return this.airPackageEngine.createPackage(defaultManifest, contents);
  }
}

module.exports = CanonicalContainerStrategy;
