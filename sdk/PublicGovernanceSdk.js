/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Public Governance SDK (@airroofers/governance-sdk)
 * File           : PublicGovernanceSdk.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Platform SDK & Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Air Roofers Public Governance SDK Standard (@airroofers/governance-sdk)
 * - Exposes Stable Public APIs for Enterprise Integrations & Industry Packs
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const GovernancePolicyEngine = require('../engine/governance/GovernancePolicyEngine');
const GovernanceQueryEngine = require('../engine/governance/GovernanceQueryEngine');
const ReleaseDigitalPassportGenerator = require('../engine/release/ReleaseDigitalPassportGenerator');
const GovernanceScorecardEngine = require('../engine/governance/GovernanceScorecardEngine');

/**
 * PublicGovernanceSdk
 *
 * Public developer SDK allowing third-party developers, partners, and enterprise integrators
 * to interact with the feature-frozen EAORCS Governance Kernel.
 */
class PublicGovernanceSdk {
  constructor(options = {}) {
    this.options = options;
    this.policyEngine = options.policyEngine || new GovernancePolicyEngine();
    this.queryEngine = options.queryEngine || new GovernanceQueryEngine();
    this.passportGen = options.passportGen || new ReleaseDigitalPassportGenerator();
    this.scorecardEngine = options.scorecardEngine || new GovernanceScorecardEngine();
    this.customPacks = new Map();
  }

  /**
   * Evaluates runtime context against declarative policies.
   */
  evaluatePolicy(context) {
    return this.policyEngine.evaluatePolicies(context);
  }

  /**
   * Queries capability provenance explanations.
   */
  queryProvenance(capabilityId) {
    return this.queryEngine.queryCapabilityProvenance(capabilityId);
  }

  /**
   * Generates a signed release digital passport.
   */
  generateReleasePassport(evidenceData) {
    return this.passportGen.generateDigitalPassport(evidenceData);
  }

  /**
   * Retrieves the 8-dimension executive governance scorecard.
   */
  getGovernanceScorecard() {
    return this.scorecardEngine.generateGovernanceScorecard();
  }

  /**
   * Registers an Industry Solution Pack (e.g. Fintech, Healthcare, Defense).
   */
  registerSolutionPack(packManifest) {
    if (!packManifest || !packManifest.id) {
      throw new Error('PublicGovernanceSdk: Invalid Solution Pack manifest.');
    }
    this.customPacks.set(packManifest.id, { ...packManifest, registeredAt: new Date().toISOString() });
    return { status: 'PACK_REGISTERED', packId: packManifest.id, totalPacks: this.customPacks.size };
  }

  getSdkStatus() {
    return {
      sdkName: '@airroofers/governance-sdk',
      version: '2026.3.0-LTS',
      kernelStatus: 'FEATURE_COMPLETE_AND_FROZEN',
      registeredCustomPacks: this.customPacks.size,
    };
  }
}

module.exports = PublicGovernanceSdk;
module.exports.PublicGovernanceSdk = PublicGovernanceSdk;
