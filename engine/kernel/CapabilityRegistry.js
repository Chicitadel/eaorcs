/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Kernel / Capability Registry & Contract Brokerage
 * File           : CapabilityRegistry.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering (Ujomor Engineering Governance Authority)
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-02
 * Classification : ENTERPRISE | GOVERNMENT
 *
 * Governance:
 * - AI Governed
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
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

const CapabilityBrokerEngine = require('./CapabilityBrokerEngine');

class CapabilityRegistry {
  constructor(hypervisor = null) {
    this.capabilities = new Map();
    this.broker = new CapabilityBrokerEngine(hypervisor);
  }

  setHypervisor(hypervisor) {
    this.broker.hypervisor = hypervisor;
  }

  registerCapability(key, value, metadata = {}) {
    if (!key || typeof key !== 'string') {
      throw new Error('[CapabilityRegistry] Capability key must be a non-empty string.');
    }

    this.capabilities.set(key, {
      value,
      metadata,
      updatedAt: new Date().toISOString()
    });
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
    if (!this.capabilities.has(key)) {
      return defaultValue;
    }
    return this.capabilities.get(key).value;
  }

  hasCapability(key) {
    return this.capabilities.has(key);
  }

  validateCapabilities(requiredList = []) {
    const missing = [];
    for (const req of requiredList) {
      if (!this.capabilities.has(req) || !this.capabilities.get(req).value) {
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
}

module.exports = CapabilityRegistry;
