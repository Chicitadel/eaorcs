/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Air Roofers Ecosystem Domain Registry
 * File           : EcosystemDomainRegistry.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Platform Domain & Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Air Roofers Federated Ecosystem Subdomain Topology (*.airroofers.eu)
 * - 33 Governed DNS Subdomains mapped across 4 functional tiers
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const ECOSYSTEM_DOMAINS = Object.freeze({
  // Tier 1: Corporate & OS Portals
  CORPORATE:    { domain: 'airroofers.eu',            type: 'CORPORATE',            name: 'Air Roofers SASU Corporate Portal',      isCommercialProduct: false },
  HUB:          { domain: 'hub.airroofers.eu',        type: 'CUSTOMER_OS',          name: 'Customer Operating System (COS)',         isCommercialProduct: false },
  DEVELOPER:    { domain: 'developer.airroofers.eu',  type: 'DEVELOPER_PORTAL',     name: 'Developer Hub & Core SDK Documentation', isCommercialProduct: false },
  DEVELOPERS:   { domain: 'developers.airroofers.eu', type: 'EXTENSIBILITY_PLATFORM',name: 'Extensibility Platform & Plugin Sandbox',isCommercialProduct: false },

  // Tier 2: Shared Platform Services (Infrastructure - Non-Product)
  ADMIN:        { domain: 'admin.airroofers.eu',         type: 'PLATFORM_SERVICE', name: 'Central Administration Plane',         isCommercialProduct: false },
  GATEWAY:      { domain: 'api.airroofers.eu',           type: 'PLATFORM_SERVICE', name: 'Air Roofers Unified Gateway',          isCommercialProduct: false },
  AEROBILL:     { domain: 'billing.airroofers.eu',       type: 'PLATFORM_SERVICE', name: 'AeroBill Central Billing Engine',        isCommercialProduct: false },
  BOOTSTRAP:    { domain: 'bootstrap.airroofers.eu',     type: 'PLATFORM_SERVICE', name: 'Platform Boot Substrate',              isCommercialProduct: false },
  CERTIFY:      { domain: 'certify.airroofers.eu',       type: 'PLATFORM_SERVICE', name: 'Attestation & Certification Service',   isCommercialProduct: false },
  CONFIG:       { domain: 'configuration.airroofers.eu', type: 'PLATFORM_SERVICE', name: 'Central Configuration Service',         isCommercialProduct: false },
  CONSOLE:      { domain: 'console.airroofers.eu',       type: 'PLATFORM_SERVICE', name: 'System Telemetry Console',             isCommercialProduct: false },
  DISCOVERY:    { domain: 'discovery.airroofers.eu',     type: 'PLATFORM_SERVICE', name: 'Service Discovery Registry',           isCommercialProduct: false },
  DOWNLOADS:    { domain: 'downloads.airroofers.eu',     type: 'PLATFORM_SERVICE', name: 'Artifact & OCI Distribution Repository',isCommercialProduct: false },
  EDGE:         { domain: 'edge.airroofers.eu',          type: 'PLATFORM_SERVICE', name: 'Edge Content Proxy Substrate',         isCommercialProduct: false },
  GOVERNANCE:   { domain: 'governance.airroofers.eu',    type: 'PLATFORM_SERVICE', name: 'Central Policy Enforcement Hub',        isCommercialProduct: false },
  AIRAUTH:      { domain: 'identity.airroofers.eu',      type: 'PLATFORM_SERVICE', name: 'AirAuth Central Identity Provider',     isCommercialProduct: false },
  MANDATAG:     { domain: 'license.airroofers.eu',       type: 'PLATFORM_SERVICE', name: 'Mandatag Central Licensing Engine',      isCommercialProduct: false },
  AIRSTREAM:    { domain: 'telemetry.airroofers.eu',     type: 'PLATFORM_SERVICE', name: 'AirStream Central Telemetry Hub',        isCommercialProduct: false },

  // Tier 3: Commercial Capabilities (Ecosystem Products)
  EAORCS:       { domain: 'trust.airroofers.eu',         type: 'ECOSYSTEM_CAPABILITY', name: 'EAORCS Software Trust Capability', isCommercialProduct: true },
  CIVISCORE:    { domain: 'civiscore.airroofers.eu',     type: 'ECOSYSTEM_CAPABILITY', name: 'CiviScore Civic Scoring Capability', isCommercialProduct: true },
  AKPATI:       { domain: 'akpati.airroofers.eu',        type: 'ECOSYSTEM_CAPABILITY', name: 'Akpati AI Processing Capability',    isCommercialProduct: true },
  CONSUNEXIA:   { domain: 'consunexia.airroofers.eu',    type: 'ECOSYSTEM_CAPABILITY', name: 'ConsuNexia CRM Capability',          isCommercialProduct: true },
});

/**
 * EcosystemDomainRegistry
 *
 * Registry enforcing the canonical domain topology (*.airroofers.eu) and distinguishing
 * shared platform infrastructure from commercial products.
 */
class EcosystemDomainRegistry {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Resolves ecosystem domain configuration by entity ID.
   */
  resolveDomain(entityId) {
    const key = entityId.toUpperCase();
    const match = ECOSYSTEM_DOMAINS[key];
    if (!match) throw new Error(`EcosystemDomainRegistry: Unknown entity '${entityId}'.`);
    return { ...match };
  }

  /**
   * Returns all shared platform infrastructure services.
   */
  getSharedPlatformServices() {
    return Object.values(ECOSYSTEM_DOMAINS)
      .filter(d => d.type === 'PLATFORM_SERVICE')
      .map(d => ({ ...d }));
  }

  /**
   * Returns all commercial capabilities (EAORCS, CiviScore, Akpati, ConsuNexia).
   */
  getEcosystemCapabilities() {
    return Object.values(ECOSYSTEM_DOMAINS)
      .filter(d => d.type === 'ECOSYSTEM_CAPABILITY')
      .map(d => ({ ...d }));
  }

  /**
   * Returns the corporate and developer portal endpoints.
   */
  getCorporateAndDeveloperPortals() {
    return Object.values(ECOSYSTEM_DOMAINS)
      .filter(d => ['CORPORATE', 'CUSTOMER_OS', 'DEVELOPER_PORTAL', 'EXTENSIBILITY_PLATFORM'].includes(d.type))
      .map(d => ({ ...d }));
  }

  /**
   * Verifies service classifications against ecosystem invariants.
   */
  verifyServiceClassifications() {
    const mandatag = this.resolveDomain('MANDATAG');
    const aerobill = this.resolveDomain('AEROBILL');
    const hub = this.resolveDomain('HUB');
    const dev = this.resolveDomain('DEVELOPER');
    const eaorcs = this.resolveDomain('EAORCS');

    const valid =
      mandatag.isCommercialProduct === false &&
      aerobill.isCommercialProduct === false &&
      hub.isCommercialProduct === false &&
      dev.isCommercialProduct === false &&
      eaorcs.isCommercialProduct === true &&
      hub.domain === 'hub.airroofers.eu' &&
      dev.domain === 'developer.airroofers.eu' &&
      eaorcs.domain === 'trust.airroofers.eu';

    return {
      valid,
      hubDomain: hub.domain,
      developerDomain: dev.domain,
      mandatagClassification: mandatag.type,
      aerobillClassification: aerobill.type,
      eaorcsClassification: eaorcs.type,
      status: valid ? 'CLASSIFICATION_VERIFIED' : 'CLASSIFICATION_INVALID',
    };
  }

  getEngineStatus() {
    return { initialized: true, totalDomainsTracked: Object.keys(ECOSYSTEM_DOMAINS).length };
  }
}

module.exports = EcosystemDomainRegistry;
module.exports.EcosystemDomainRegistry = EcosystemDomainRegistry;
module.exports.ECOSYSTEM_DOMAINS = ECOSYSTEM_DOMAINS;
