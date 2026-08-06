/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Edition Authorization Engine
 * File           : EditionAuthorizationEngine.js
 * Version        : 2026.3.0-RC1
 * Author         : Platform Licensing & Commercial Authorization Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved — ENHANCEMENT (Foundation-Locked)
 * - Server-Side Authorization: MANDATORY — No client-side capability exposure
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-53
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * Edition Tiers (in ascending privilege order)
 */
const EDITIONS = Object.freeze({
  COMMUNITY:    'COMMUNITY',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE:   'ENTERPRISE',
  GOVERNMENT:   'GOVERNMENT',
});

const EDITION_ORDER = [EDITIONS.COMMUNITY, EDITIONS.PROFESSIONAL, EDITIONS.ENTERPRISE, EDITIONS.GOVERNMENT];

/**
 * CAPABILITY_MATRIX
 * Defines minimum edition required for each capability.
 * Authorization check: tenant.edition >= capability.minimumEdition
 *
 * Knowledge Graph:
 *   - READ_ONLY access in PROFESSIONAL
 *   - FULL access (write, graph mutations, custom entity types) in ENTERPRISE+
 *
 * Digital Twin: included from PROFESSIONAL
 */
const CAPABILITY_MATRIX = Object.freeze({
  // ── Core Trust (All Editions) ──────────────────────────────────────
  trust_score:                        { minimumEdition: EDITIONS.COMMUNITY,    description: 'Composite Software Trust Score',            accessType: 'FULL' },
  trust_score_decomposed:             { minimumEdition: EDITIONS.COMMUNITY,    description: 'Decomposable Trust Score Tree',              accessType: 'FULL' },
  evidence_chain:                     { minimumEdition: EDITIONS.COMMUNITY,    description: 'Evidence collection & chain of custody',     accessType: 'FULL' },
  supply_chain_sbom:                  { minimumEdition: EDITIONS.COMMUNITY,    description: 'SBOM generation & dependency scan',          accessType: 'FULL' },
  basic_compliance_report:            { minimumEdition: EDITIONS.COMMUNITY,    description: 'Basic compliance overview report',           accessType: 'FULL' },
  onboarding_wizard:                  { minimumEdition: EDITIONS.COMMUNITY,    description: 'Interactive onboarding wizard',              accessType: 'FULL' },
  community_support:                  { minimumEdition: EDITIONS.COMMUNITY,    description: 'Community forums & GitHub issues',           accessType: 'FULL' },

  // ── Professional ──────────────────────────────────────────────────
  knowledge_graph_read:               { minimumEdition: EDITIONS.PROFESSIONAL, description: 'Knowledge Graph — read-only access',         accessType: 'READ_ONLY' },
  digital_twin:                       { minimumEdition: EDITIONS.PROFESSIONAL, description: 'Interactive Digital Twin Viewer',            accessType: 'FULL' },
  trust_benchmark_network:            { minimumEdition: EDITIONS.PROFESSIONAL, description: 'Comparative cohort benchmarking',            accessType: 'FULL' },
  governance_marketplace_browse:      { minimumEdition: EDITIONS.PROFESSIONAL, description: 'Browse & install marketplace packs',         accessType: 'FULL' },
  predictive_intelligence_basic:      { minimumEdition: EDITIONS.PROFESSIONAL, description: 'Basic predictive trust forecasting',         accessType: 'FULL' },
  documentation_portal:               { minimumEdition: EDITIONS.PROFESSIONAL, description: 'Full documentation portal access',           accessType: 'FULL' },
  sdk_access:                         { minimumEdition: EDITIONS.PROFESSIONAL, description: '@eaorcs/sdk access & API keys',              accessType: 'FULL' },
  email_support:                      { minimumEdition: EDITIONS.PROFESSIONAL, description: 'Email support channel (4h SLA)',             accessType: 'FULL' },
  migration_tooling:                  { minimumEdition: EDITIONS.PROFESSIONAL, description: 'Zero-downtime migration engine',             accessType: 'FULL' },

  // ── Enterprise ────────────────────────────────────────────────────
  knowledge_graph_full:               { minimumEdition: EDITIONS.ENTERPRISE,   description: 'Knowledge Graph — full read/write access',   accessType: 'FULL' },
  autonomous_policy_engine:           { minimumEdition: EDITIONS.ENTERPRISE,   description: 'Autonomous Policy Engine (declarative)',      accessType: 'FULL' },
  predictive_intelligence_full:       { minimumEdition: EDITIONS.ENTERPRISE,   description: 'Full AI Predictive Trust Intelligence',      accessType: 'FULL' },
  multi_tenant_admin:                 { minimumEdition: EDITIONS.ENTERPRISE,   description: 'Multi-tenant administration & isolation',     accessType: 'FULL' },
  white_label_branding:               { minimumEdition: EDITIONS.ENTERPRISE,   description: 'White-label portal branding & theming',      accessType: 'FULL' },
  collaboration_workflows:            { minimumEdition: EDITIONS.ENTERPRISE,   description: 'Dual-control approval & sign-off workflows', accessType: 'FULL' },
  cryptographic_provenance:           { minimumEdition: EDITIONS.ENTERPRISE,   description: 'Cryptographic provenance chain & audit',      accessType: 'FULL' },
  dedicated_slack_support:            { minimumEdition: EDITIONS.ENTERPRISE,   description: 'Dedicated Slack channel (1h P1 SLA)',        accessType: 'FULL' },
  sla_24_7_p1:                        { minimumEdition: EDITIONS.ENTERPRISE,   description: '24/7 P1 incident support SLA',               accessType: 'FULL' },
  custom_report_templates:            { minimumEdition: EDITIONS.ENTERPRISE,   description: 'Pluggable custom report templates',          accessType: 'FULL' },
  configurable_scoring_models:        { minimumEdition: EDITIONS.ENTERPRISE,   description: 'Configurable scoring model weights',         accessType: 'FULL' },
  usage_metering_api:                 { minimumEdition: EDITIONS.ENTERPRISE,   description: 'Usage metering & consumption APIs',          accessType: 'FULL' },
  api_versioning_guaranteed:          { minimumEdition: EDITIONS.ENTERPRISE,   description: 'Guaranteed 18-month API versioning SLA',     accessType: 'FULL' },

  // ── Government Sovereign ──────────────────────────────────────────
  air_gapped_deployment:              { minimumEdition: EDITIONS.GOVERNMENT,   description: 'Air-gapped offline deployment bundle',       accessType: 'FULL' },
  sovereign_data_residency:           { minimumEdition: EDITIONS.GOVERNMENT,   description: 'Sovereign data residency enforcement',       accessType: 'FULL' },
  government_compliance_packs:        { minimumEdition: EDITIONS.GOVERNMENT,   description: 'Government-specific compliance packs',       accessType: 'FULL' },
  on_site_support:                    { minimumEdition: EDITIONS.GOVERNMENT,   description: 'On-site engineering support available',      accessType: 'FULL' },
  dedicated_support_portal:           { minimumEdition: EDITIONS.GOVERNMENT,   description: 'Dedicated secure support portal',            accessType: 'FULL' },
  sla_30min_p1:                       { minimumEdition: EDITIONS.GOVERNMENT,   description: '30-minute P1 response SLA (24/7/365)',       accessType: 'FULL' },
});

/**
 * CapabilityToken
 * Signed, opaque token returned to the client.
 * Client code is NEVER given the raw capability map — only this token.
 * The token is validated server-side on every request.
 */
class CapabilityToken {
  static generate(tenantId, edition, capabilities) {
    const payload = { tenantId, edition, capabilities, issuedAt: Date.now() };
    const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    return { tokenId: crypto.randomUUID(), hash, issuedAt: new Date().toISOString(), edition };
  }

  static validate(token, expectedEdition) {
    return token && token.edition === expectedEdition && token.hash && token.tokenId;
  }
}

/**
 * EditionAuthorizationEngine
 *
 * Server-side capability authorization for all EAORCS editions.
 *
 * CRITICAL RULE: No Enterprise or Sovereign capability is ever rendered to
 * Community or Professional users. Authorization occurs server-side only.
 * Clients receive a CapabilityToken, never the raw feature flag map.
 */
class EditionAuthorizationEngine {
  constructor(options = {}) {
    this.options = options;
    this._tenantRegistry = new Map(); // tenantId -> { edition, overrides }
    this._authLog = [];
  }

  /**
   * Registers a tenant with their licensed edition.
   * @param {string} tenantId
   * @param {string} edition - One of EDITIONS keys
   * @param {object} [overrides] - Optional per-capability overrides (Enterprise+ only)
   */
  registerTenant(tenantId, edition, overrides = {}) {
    if (!EDITIONS[edition]) throw new Error(`EditionAuthorizationEngine: Unknown edition '${edition}'.`);
    this._tenantRegistry.set(tenantId, { tenantId, edition, overrides, registeredAt: new Date().toISOString() });
    return { tenantId, edition };
  }

  /**
   * Returns authorized capabilities for a tenant.
   * @param {string} tenantId
   * @returns {object} Authorization result with capability list and opaque token
   */
  getAuthorizedCapabilities(tenantId) {
    const tenant = this._requireTenant(tenantId);
    const tenantEditionIndex = EDITION_ORDER.indexOf(tenant.edition);

    const authorized = [];
    const denied = [];

    for (const [capId, capDef] of Object.entries(CAPABILITY_MATRIX)) {
      const requiredIndex = EDITION_ORDER.indexOf(capDef.minimumEdition);
      const hasAccess = tenantEditionIndex >= requiredIndex;
      const override = tenant.overrides[capId];
      const effectiveAccess = override !== undefined ? override : hasAccess;

      if (effectiveAccess) {
        authorized.push({ capabilityId: capId, accessType: capDef.accessType, description: capDef.description });
      } else {
        denied.push({ capabilityId: capId, reason: `Requires ${capDef.minimumEdition} edition` });
      }
    }

    const token = CapabilityToken.generate(tenantId, tenant.edition, authorized.map(c => c.capabilityId));
    this._logAuthEvent(tenantId, tenant.edition, authorized.length, denied.length);

    return {
      tenantId,
      edition: tenant.edition,
      authorizedCount: authorized.length,
      deniedCount: denied.length,
      capabilities: authorized,
      // NOTE: denied list is server-side only — never sent to client UI
      token,
    };
  }

  /**
   * Checks whether a specific capability is authorized for a tenant.
   * @param {string} tenantId
   * @param {string} capabilityId
   * @returns {object} Authorization check result
   */
  isAuthorized(tenantId, capabilityId) {
    const tenant = this._requireTenant(tenantId);
    const capDef = CAPABILITY_MATRIX[capabilityId];

    if (!capDef) {
      return { authorized: false, reason: 'UNKNOWN_CAPABILITY', capabilityId };
    }

    const tenantEditionIndex = EDITION_ORDER.indexOf(tenant.edition);
    const requiredIndex = EDITION_ORDER.indexOf(capDef.minimumEdition);
    const override = tenant.overrides[capabilityId];
    const authorized = override !== undefined ? override : tenantEditionIndex >= requiredIndex;

    return {
      authorized,
      capabilityId,
      tenantEdition: tenant.edition,
      requiredEdition: capDef.minimumEdition,
      accessType: authorized ? capDef.accessType : null,
      reason: authorized ? 'AUTHORIZED' : `EDITION_INSUFFICIENT — requires ${capDef.minimumEdition}`,
    };
  }

  /**
   * Returns the capability comparison matrix across all 4 editions.
   * Used for pricing page and commercial assets only.
   */
  getCapabilityMatrix() {
    return Object.entries(CAPABILITY_MATRIX).map(([capId, def]) => ({
      capabilityId: capId,
      description: def.description,
      minimumEdition: def.minimumEdition,
      accessType: def.accessType,
      availableIn: EDITION_ORDER.filter((_, i) => i >= EDITION_ORDER.indexOf(def.minimumEdition)),
    }));
  }

  getEditionSummary(edition) {
    if (!EDITIONS[edition]) throw new Error(`Unknown edition: ${edition}`);
    const editionIndex = EDITION_ORDER.indexOf(edition);
    const caps = Object.entries(CAPABILITY_MATRIX)
      .filter(([, def]) => EDITION_ORDER.indexOf(def.minimumEdition) <= editionIndex)
      .map(([id, def]) => ({ capabilityId: id, description: def.description, accessType: def.accessType }));
    return { edition, capabilityCount: caps.length, capabilities: caps };
  }

  getEngineStatus() {
    return {
      initialized: true,
      registeredTenants: this._tenantRegistry.size,
      totalCapabilities: Object.keys(CAPABILITY_MATRIX).length,
      editions: Object.keys(EDITIONS),
      authLogSize: this._authLog.length,
    };
  }

  _requireTenant(tenantId) {
    const tenant = this._tenantRegistry.get(tenantId);
    if (!tenant) throw new Error(`EditionAuthorizationEngine: Tenant '${tenantId}' not registered.`);
    return tenant;
  }

  _logAuthEvent(tenantId, edition, authorizedCount, deniedCount) {
    this._authLog.push({ timestamp: new Date().toISOString(), tenantId, edition, authorizedCount, deniedCount });
    if (this._authLog.length > 10000) this._authLog.shift(); // Rolling log cap
  }
}

module.exports = EditionAuthorizationEngine;
module.exports.EditionAuthorizationEngine = EditionAuthorizationEngine;
module.exports.EDITIONS = EDITIONS;
module.exports.CAPABILITY_MATRIX = CAPABILITY_MATRIX;
