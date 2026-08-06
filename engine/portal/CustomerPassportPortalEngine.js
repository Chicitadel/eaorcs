/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Customer Release Passport Portal Engine
 * File           : CustomerPassportPortalEngine.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Customer Success & Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Air Roofers Customer Release Digital Passport Portal Standard (trust.airroofers.eu/passport)
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const ReleaseDigitalPassportGenerator = require('../release/ReleaseDigitalPassportGenerator');

/**
 * CustomerPassportPortalEngine
 *
 * Renders the Release Digital Passport as an executive web view at `trust.airroofers.eu/passport`.
 */
class CustomerPassportPortalEngine {
  constructor(options = {}) {
    this.options = options;
    this.passportGen = options.passportGen || new ReleaseDigitalPassportGenerator();
  }

  /**
   * Renders the executive customer passport view object.
   */
  renderCustomerPassportPortalView() {
    const passport = this.passportGen.generateDigitalPassport();

    return {
      portalDomain: 'trust.airroofers.eu/passport',
      title: 'EAORCS Release Digital Passport Explorer',
      version: passport.version,
      signature: passport.signature,
      verificationSummary: passport.verification,
      externalAssuranceSummary: passport.externalAssurance,
      customerDownloadableArtifacts: [
        { name: 'Release Passport (JSON)', file: 'release.passport.json' },
        { name: 'Executive Launch Binder (PDF)', file: 'ExecutiveLaunchBinder.pdf' },
        { name: 'CycloneDX SBOM Inventory (XML)', file: 'sbom-cyclonedx.xml' },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  getEngineStatus() {
    return { initialized: true };
  }
}

module.exports = CustomerPassportPortalEngine;
module.exports.CustomerPassportPortalEngine = CustomerPassportPortalEngine;
