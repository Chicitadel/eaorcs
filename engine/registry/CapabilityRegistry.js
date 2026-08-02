/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Capability Registry Controller
 * File           : engine/registry/CapabilityRegistry.js
 * Version        : 2026.1.0-LTS
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Ujomor Systems Ecosystem
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * CapabilityRegistry
 * Controller for managing machine-readable product capability definitions,
 * supporting impact analysis across the full traceability chain:
 * Capability -> Blueprint Requirement -> Implementation Modules -> Tests -> Evidence -> Documentation -> API -> Commercial Edition -> Support Article -> Telemetry Signals
 */
class CapabilityRegistry {
  constructor(registryPath = null) {
    this.registryPath = registryPath || path.resolve(__dirname, '../../config/airroofers-capability-registry.json');
    this.capabilitiesMap = new Map();
    this.loadCapabilities();
  }

  /**
   * Loads capabilities from JSON configuration into indexed map.
   */
  loadCapabilities() {
    if (!fs.existsSync(this.registryPath)) {
      throw new Error(`Capability Registry configuration not found at path: ${this.registryPath}`);
    }

    const raw = fs.readFileSync(this.registryPath, 'utf8');
    const parsed = JSON.parse(raw);
    const list = parsed.capabilities || [];

    this.capabilitiesMap.clear();
    for (const cap of list) {
      if (cap.id) {
        this.capabilitiesMap.set(cap.id, cap);
      }
    }
  }

  /**
   * Returns list of all registered capabilities.
   * @returns {Array<Object>} List of capabilities
   */
  getAllCapabilities() {
    return Array.from(this.capabilitiesMap.values());
  }

  /**
   * Retrieves specific capability by ID.
   * @param {string} capabilityId Capability ID (e.g., CAP-BLUEPRINT-INTEGRITY)
   * @returns {Object|null}
   */
  getCapability(capabilityId) {
    return this.capabilitiesMap.get(capabilityId) || null;
  }

  /**
   * Conducts full impact analysis for a given capability.
   * @param {string} capabilityId Capability ID
   * @returns {Object} Impact analysis report
   */
  analyzeImpact(capabilityId) {
    const cap = this.getCapability(capabilityId);
    if (!cap) {
      throw new Error(`Capability '${capabilityId}' not found in registry.`);
    }

    return {
      capabilityId: cap.id,
      name: cap.name,
      stream: cap.stream,
      traceabilityChain: {
        blueprintRequirements: cap.blueprintRequirements || [],
        implementationModules: cap.implementationModules || [],
        testSuites: cap.testSuites || [],
        evidenceArtifacts: cap.evidenceArtifacts || [],
        documentation: cap.documentation || [],
        apiEndpoints: cap.apiEndpoints || [],
        commercialEditions: cap.commercialEditions || [],
        supportArticle: cap.supportArticle || '',
        telemetrySignals: cap.telemetrySignals || []
      },
      impactedComponentsCount: (cap.implementationModules || []).length + (cap.testSuites || []).length,
      analyzedAt: new Date().toISOString()
    };
  }

  /**
   * Audits capability coverage across all 8 Capability Streams.
   * @returns {Object} Audit summary
   */
  auditCapabilityCoverage() {
    const all = this.getAllCapabilities();
    const streams = new Set(all.map(c => c.stream));

    return {
      totalCapabilities: all.length,
      totalStreamsCovered: streams.size,
      isFullyCovered: all.length >= 8 && streams.size >= 8,
      capabilities: all.map(c => ({ id: c.id, name: c.name, stream: c.stream })),
      auditedAt: new Date().toISOString()
    };
  }
}

module.exports = CapabilityRegistry;
