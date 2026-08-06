/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Kernel / Capability Registry & OEM Subsystem
 * File           : CapabilityRegistry.js
 * Version        : 2026.2-LTS (v1.2.0-FROZEN Master Specification)
 * Author         : Enterprise Engineering Governance Authority
 * Organization   : Ujomor Systems & Enterprise Operations
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE | GOVERNMENT
 *
 * Governance:
 * - Enterprise Governed
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST / SLSA Level 4
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

const CapabilityBrokerEngine = require('./CapabilityBrokerEngine');

const CORE_CAPABILITIES = {
  SUPPORTS_AI: {
    id: 'supports_ai',
    name: 'Supports AI',
    aliases: ['supports_ai', 'supportsai', 'ai', 'supports ai'],
    category: 'INTELLIGENCE',
    minTier: 'PROFESSIONAL',
    description: 'AI Council, predictive governance, and autonomous reasoning capabilities',
    enabled: true
  },
  SUPPORTS_DIGITAL_TWIN: {
    id: 'supports_digital_twin',
    name: 'Supports Digital Twin',
    aliases: ['supports_digital_twin', 'supportsdigitaltwin', 'digital_twin', 'digitaltwin', 'supports digital twin'],
    category: 'SIMULATION',
    minTier: 'ENTERPRISE',
    description: 'Digital Twin 2.0 simulation, time machine, and state drift engine',
    enabled: true
  },
  SUPPORTS_GOVERNANCE: {
    id: 'supports_governance',
    name: 'Supports Governance',
    aliases: ['supports_governance', 'supportsgovernance', 'governance', 'supports governance'],
    category: 'GOVERNANCE',
    minTier: 'PROFESSIONAL',
    description: 'Immutable ADR governance, rule registries, and constitutional enforcement',
    enabled: true
  },
  SUPPORTS_REPORTING: {
    id: 'supports_reporting',
    name: 'Supports Reporting',
    aliases: ['supports_reporting', 'supportsreporting', 'reporting', 'supports reporting'],
    category: 'OPERATIONS',
    minTier: 'COMMUNITY',
    description: 'Audit report generation, compliance certificates, and executive telemetry',
    enabled: true
  },
  SUPPORTS_MARKETPLACE: {
    id: 'supports_marketplace',
    name: 'Supports Marketplace',
    aliases: ['supports_marketplace', 'supportsmarketplace', 'marketplace', 'supports marketplace'],
    category: 'ECOSYSTEM',
    minTier: 'ENTERPRISE',
    description: 'Extension pack publication, licensing, and plugin ecosystem distribution',
    enabled: true
  },
  SUPPORTS_SUPPLY_CHAIN: {
    id: 'supports_supply_chain',
    name: 'Supports Supply Chain',
    aliases: ['supports_supply_chain', 'supportssupplychain', 'supply_chain', 'supplychain', 'supports supply chain'],
    category: 'SECURITY',
    minTier: 'ENTERPRISE',
    description: 'SLSA Level 4 provenance tracking, SBOM generation, and artifact signing',
    enabled: true
  },
  SUPPORTS_COMPLIANCE: {
    id: 'supports_compliance',
    name: 'Supports Compliance',
    aliases: ['supports_compliance', 'supportscompliance', 'compliance', 'supports compliance'],
    category: 'COMPLIANCE',
    minTier: 'STARTER',
    description: 'Automated ISO 27001, SOC 2, NIST, and regulatory audit qualification',
    enabled: true
  }
};

const LICENSE_TIER_RANKS = {
  COMMUNITY: 1,
  STARTER: 2,
  PROFESSIONAL: 3,
  ENTERPRISE: 4,
  GOVERNMENT_SOVEREIGN: 5
};

class CapabilityRegistry {
  constructor(hypervisor = null, options = {}) {
    this.capabilities = new Map();
    this.advertisedCapabilities = new Map();
    this.aliasMap = new Map();
    this.broker = new CapabilityBrokerEngine(hypervisor);
    this.oemProfile = {
      partnerId: options.oemPartnerId || 'DEFAULT_OEM',
      partnerName: options.oemPartnerName || 'Standard Enterprise Edition',
      licenseTier: options.licenseTier || 'ENTERPRISE',
      customBranding: options.customBranding || {},
      enabledFeatures: new Set()
    };
    this.oemFeatureGates = new Map();

    this._initializeDefaultCapabilities();
  }

  _normalizeKey(key) {
    if (!key || typeof key !== 'string') return '';
    return key.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  _initializeDefaultCapabilities() {
    for (const capDef of Object.values(CORE_CAPABILITIES)) {
      this.registerCapability(capDef.name, capDef.enabled, capDef);
      this.advertiseCapability(capDef.name, capDef.enabled, capDef);

      // Bind aliases
      const normName = this._normalizeKey(capDef.name);
      this.aliasMap.set(normName, capDef.name);
      for (const alias of capDef.aliases) {
        this.aliasMap.set(this._normalizeKey(alias), capDef.name);
      }
    }
  }

  setHypervisor(hypervisor) {
    this.broker.hypervisor = hypervisor;
  }

  registerCapability(key, value, metadata = {}) {
    if (!key || typeof key !== 'string') {
      throw new Error('[CapabilityRegistry] Capability key must be a non-empty string.');
    }

    const normKey = this._normalizeKey(key);
    const canonicalKey = this.aliasMap.get(normKey) || key;

    this.capabilities.set(canonicalKey, {
      key: canonicalKey,
      value,
      metadata,
      updatedAt: new Date().toISOString()
    });
    this.aliasMap.set(normKey, canonicalKey);

    return this;
  }

  registerContract(contractPayload) {
    const registered = this.broker.registerContract(contractPayload);
    this.registerCapability(registered.capability_id, true, { contract: registered });
    return registered;
  }

  requestToken(capabilityId, tenantId) {
    return this.broker.requestExecutionToken(capabilityId, tenantId);
  }

  setCapabilities(capabilitiesObj = {}) {
    for (const [key, value] of Object.entries(capabilitiesObj)) {
      this.registerCapability(key, value);
    }
    return this;
  }

  getCapability(key, defaultValue = undefined) {
    const normKey = this._normalizeKey(key);
    const canonicalKey = this.aliasMap.get(normKey) || key;

    if (!this.capabilities.has(canonicalKey)) {
      if (this.capabilities.has(key)) {
        return this.capabilities.get(key).value;
      }
      return defaultValue;
    }
    return this.capabilities.get(canonicalKey).value;
  }

  hasCapability(key) {
    const normKey = this._normalizeKey(key);
    const canonicalKey = this.aliasMap.get(normKey) || key;

    if (this.capabilities.has(canonicalKey)) {
      return Boolean(this.capabilities.get(canonicalKey).value);
    }
    if (this.capabilities.has(key)) {
      return Boolean(this.capabilities.get(key).value);
    }
    return false;
  }

  validateCapabilities(requiredList = []) {
    const missing = [];
    for (const req of requiredList) {
      if (!this.hasCapability(req)) {
        missing.push(req);
      }
    }

    return {
      satisfied: missing.length === 0,
      missing
    };
  }

  getAllCapabilities() {
    const result = {};
    for (const [key, entry] of this.capabilities.entries()) {
      result[key] = entry.value;
    }
    return result;
  }

  listCapabilities() {
    const list = [];
    const seen = new Set();

    for (const entry of this.capabilities.values()) {
      if (!seen.has(entry.key)) {
        seen.add(entry.key);
        list.push({
          key: entry.key,
          name: entry.key,
          value: entry.value,
          metadata: entry.metadata,
          enabled: Boolean(entry.value),
          updatedAt: entry.updatedAt
        });
      }
    }
    return list;
  }

  // --- Dynamic Capability Advertising ---

  advertiseCapability(key, isEnabled = true, metadata = {}) {
    const normKey = this._normalizeKey(key);
    const canonicalKey = this.aliasMap.get(normKey) || key;

    this.advertisedCapabilities.set(canonicalKey, {
      id: canonicalKey,
      name: canonicalKey,
      enabled: isEnabled,
      advertisedAt: new Date().toISOString(),
      metadata
    });

    if (this.capabilities.has(canonicalKey)) {
      this.capabilities.get(canonicalKey).value = isEnabled;
    } else {
      this.registerCapability(canonicalKey, isEnabled, metadata);
    }

    return this;
  }

  unadvertiseCapability(key) {
    const normKey = this._normalizeKey(key);
    const canonicalKey = this.aliasMap.get(normKey) || key;
    this.advertisedCapabilities.delete(canonicalKey);
    if (this.capabilities.has(canonicalKey)) {
      this.capabilities.get(canonicalKey).value = false;
    }
    return this;
  }

  updateAdvertisement(key, enabledState, metadata = {}) {
    return this.advertiseCapability(key, enabledState, metadata);
  }

  isCapabilityAdvertised(key) {
    const normKey = this._normalizeKey(key);
    const canonicalKey = this.aliasMap.get(normKey) || key;
    if (!this.advertisedCapabilities.has(canonicalKey)) return false;
    return Boolean(this.advertisedCapabilities.get(canonicalKey).enabled);
  }

  getAdvertisedCapabilities(filter = {}) {
    const result = [];
    for (const adv of this.advertisedCapabilities.values()) {
      if (filter.enabledOnly && !adv.enabled) continue;
      if (filter.category && adv.metadata && adv.metadata.category !== filter.category) continue;
      result.push(adv);
    }
    return result;
  }

  getAdvertisedSummary() {
    return {
      supports_ai: this.hasCapability('Supports AI'),
      supports_digital_twin: this.hasCapability('Supports Digital Twin'),
      supports_governance: this.hasCapability('Supports Governance'),
      supports_reporting: this.hasCapability('Supports Reporting'),
      supports_marketplace: this.hasCapability('Supports Marketplace'),
      supports_supply_chain: this.hasCapability('Supports Supply Chain'),
      supports_compliance: this.hasCapability('Supports Compliance')
    };
  }

  // --- OEM Subsystem & Feature Gating ---

  setOEMProfile(profile = {}) {
    this.oemProfile = {
      ...this.oemProfile,
      ...profile,
      updatedAt: new Date().toISOString()
    };
    return this;
  }

  getOEMProfile() {
    return { ...this.oemProfile };
  }

  registerOEMFeatureGate(featureKey, rule) {
    this.oemFeatureGates.set(featureKey, rule);
    return this;
  }

  evaluateOEMFeatureGate(featureKey, oemContext = null) {
    if (!this.oemFeatureGates.has(featureKey)) {
      return true; // Unrestricted by default
    }

    const rule = this.oemFeatureGates.get(featureKey);
    const ctx = oemContext || this.oemProfile;

    if (typeof rule === 'boolean') return rule;
    if (typeof rule === 'function') return Boolean(rule(ctx));
    if (typeof rule === 'object' && rule.minTier) {
      const currentRank = LICENSE_TIER_RANKS[ctx.licenseTier || 'COMMUNITY'] || 1;
      const requiredRank = LICENSE_TIER_RANKS[rule.minTier] || 1;
      return currentRank >= requiredRank;
    }
    return true;
  }

  isFeatureGated(featureKey, oemContext = null) {
    return !this.evaluateOEMFeatureGate(featureKey, oemContext);
  }

  // --- Capability Discovery ---

  discoverCapabilities(query = {}) {
    const list = this.listCapabilities();
    return list.filter((cap) => {
      if (query.search) {
        const q = query.search.toLowerCase();
        const matchesName = cap.name.toLowerCase().includes(q);
        const matchesDesc = cap.metadata && cap.metadata.description && cap.metadata.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      if (query.category && cap.metadata && cap.metadata.category !== query.category) {
        return false;
      }
      if (query.enabledOnly && !cap.enabled) {
        return false;
      }
      if (query.minTier && cap.metadata && cap.metadata.minTier) {
        const curRank = LICENSE_TIER_RANKS[query.minTier] || 1;
        const capRank = LICENSE_TIER_RANKS[cap.metadata.minTier] || 1;
        if (curRank < capRank) return false;
      }
      return true;
    });
  }

  // --- License Tier Enforcement ---

  getTierCapabilities(tier = 'ENTERPRISE') {
    const targetRank = LICENSE_TIER_RANKS[tier] || 1;
    const allowed = [];

    for (const capDef of Object.values(CORE_CAPABILITIES)) {
      const reqRank = LICENSE_TIER_RANKS[capDef.minTier] || 1;
      if (targetRank >= reqRank) {
        allowed.push(capDef.name);
      }
    }
    return allowed;
  }

  enforceLicenseTier(capabilityKey, currentTier = 'COMMUNITY') {
    const normKey = this._normalizeKey(capabilityKey);
    const canonicalKey = this.aliasMap.get(normKey) || capabilityKey;
    const capEntry = this.capabilities.get(canonicalKey);

    const minTier = capEntry && capEntry.metadata && capEntry.metadata.minTier ? capEntry.metadata.minTier : 'COMMUNITY';
    const currentRank = LICENSE_TIER_RANKS[currentTier] || 1;
    const requiredRank = LICENSE_TIER_RANKS[minTier] || 1;

    const allowed = currentRank >= requiredRank;
    return {
      allowed,
      capabilityKey: canonicalKey,
      currentTier,
      requiredTier: minTier,
      reason: allowed
        ? `Capability [${canonicalKey}] granted for tier [${currentTier}].`
        : `Capability [${canonicalKey}] requires minimum tier [${minTier}], but current tier is [${currentTier}].`
    };
  }

  checkCapabilityAccess(capabilityKey, context = {}) {
    const tier = context.tier || this.oemProfile.licenseTier || 'ENTERPRISE';
    const oemCtx = context.oemContext || this.oemProfile;

    const exists = this.hasCapability(capabilityKey);
    if (!exists) {
      return { granted: false, reason: `Capability [${capabilityKey}] is not registered.` };
    }

    const tierCheck = this.enforceLicenseTier(capabilityKey, tier);
    if (!tierCheck.allowed) {
      return { granted: false, reason: tierCheck.reason, details: tierCheck };
    }

    const oemGateAllowed = this.evaluateOEMFeatureGate(capabilityKey, oemCtx);
    if (!oemGateAllowed) {
      return { granted: false, reason: `Feature [${capabilityKey}] is gated by OEM policy.` };
    }

    return { granted: true, reason: `Access granted for [${capabilityKey}].`, details: tierCheck };
  }
}

module.exports = CapabilityRegistry;
