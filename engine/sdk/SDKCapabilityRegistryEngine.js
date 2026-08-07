/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS SDK Capability Registry
 * File           : SDKCapabilityRegistryEngine.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Stream S12
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const CATEGORIES = ['Analysis', 'Planning', 'Execution', 'Governance', 'Qualification', 'Evidence', 'Release', 'Packaging', 'CLI', 'SDK', 'Dashboard', 'Plugin'];

class SDKCapabilityRegistryEngine {
  constructor() {
    this.capabilities = new Map();
    this.usageRecords = [];
    
    // Pre-register some mock capabilities across categories
    CATEGORIES.forEach((cat, idx) => {
      this.registerCapability(`cap-${idx}`, {
        id: `cap-${idx}`,
        name: `Capability ${cat}`,
        version: '1.0.0',
        category: cat,
        stable: true,
        deprecated: false
      });
    });
  }

  registerCapability(capabilityId, descriptor) {
    this.capabilities.set(capabilityId, descriptor);
  }

  discoverCapabilities(filter = {}) {
    return Array.from(this.capabilities.values()).filter(cap => {
      if (filter.category && cap.category !== filter.category) return false;
      if (filter.stableOnly && !cap.stable) return false;
      return true;
    });
  }

  getCapability(capabilityId) {
    return this.capabilities.get(capabilityId);
  }

  checkCompatibility(capabilityId, clientVersion) {
    const cap = this.getCapability(capabilityId);
    if (!cap) return { compatible: false, reason: 'Capability not found' };
    
    // Simple semver mock check
    if (clientVersion.startsWith(cap.version.split('.')[0])) {
        return { compatible: true, reason: 'Versions match on major' };
    }
    return { compatible: false, reason: 'Version mismatch' };
  }

  listDeprecated() {
    return Array.from(this.capabilities.values()).filter(cap => cap.deprecated);
  }

  generateCompatibilityMatrix() {
    const matrix = {};
    for (const cap of this.capabilities.values()) {
      matrix[cap.id] = cap.stable ? 'Stable' : 'Unstable';
    }
    return matrix;
  }

  recordAPIUsage(capabilityId, caller) {
    this.usageRecords.push({
      capabilityId,
      caller,
      timestamp: Date.now()
    });
  }

  getCapabilityMaturityReport() {
    const tiers = { Experimental: 0, Beta: 0, Stable: 0, Deprecated: 0, Retired: 0 };
    for (const cap of (this.capabilities || new Map()).values()) {
      const m = cap.maturity || 'Stable';
      if (tiers[m] !== undefined) tiers[m]++;
    }
    return { reportedAt: new Date().toISOString(), byMaturity: tiers, total: (this.capabilities || new Map()).size };
  }

  checkBreakingChange(capabilityId, fromVersion, toVersion) {
    const fromMajor = parseInt((fromVersion || '1.0.0').split('.')[0], 10);
    const toMajor = parseInt((toVersion || '1.0.0').split('.')[0], 10);
    const isBreaking = toMajor > fromMajor;
    return {
      capabilityId,
      fromVersion,
      toVersion,
      isBreaking,
      changes: isBreaking ? [`Major version bump: ${fromMajor} -> ${toMajor}`] : []
    };
  }
}

module.exports = SDKCapabilityRegistryEngine;
