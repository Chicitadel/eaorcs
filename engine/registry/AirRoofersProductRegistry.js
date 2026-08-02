/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Air Roofers Platform Product Registry & Descriptor Controller
 * File           : engine/registry/AirRoofersProductRegistry.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
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
const crypto = require('crypto');

const CapabilityRegistry = require('./CapabilityRegistry');

/**
 * AirRoofersProductRegistry
 * Core Platform Registry Controller for managing machine-readable product identity,
 * lifecycle stages, edition entitlements, support routing, telemetry, and platform adapter contracts.
 */
class AirRoofersProductRegistry {
  constructor(descriptorPath = null, capabilityRegistryPath = null) {
    this.descriptorPath = descriptorPath || path.resolve(__dirname, '../../config/airroofers-product-descriptor.json');
    this.descriptor = this.loadProductDescriptor();
    this.registeredSubsystems = new Map();
    this.subsystemHealth = new Map();
    this.capabilityRegistry = new CapabilityRegistry(capabilityRegistryPath);
  }

  /**
   * Returns the attached CapabilityRegistry instance.
   * @returns {CapabilityRegistry}
   */
  getCapabilityRegistry() {
    return this.capabilityRegistry;
  }

  /**
   * Loads and validates the master machine-readable product descriptor.
   * @returns {Object} Product descriptor JSON object
   */
  loadProductDescriptor() {
    if (!fs.existsSync(this.descriptorPath)) {
      throw new Error(`Air Roofers Product Descriptor not found at path: ${this.descriptorPath}`);
    }

    const raw = fs.readFileSync(this.descriptorPath, 'utf8');
    const parsed = JSON.parse(raw);

    if (!parsed.productId || !parsed.platformDomain || !parsed.boundedContext) {
      throw new Error('Invalid product descriptor: Missing mandatory fields (productId, platformDomain, boundedContext)');
    }

    return parsed;
  }

  /**
   * Retrieves product descriptor metadata or specific sub-keys.
   * @param {string} [key] Optional key to query
   * @returns {*} Full descriptor or specific property
   */
  getDescriptor(key = null) {
    if (!key) return this.descriptor;
    return this.descriptor[key] !== undefined ? this.descriptor[key] : null;
  }

  /**
   * Verifies edition entitlement and feature flag configuration.
   * @param {string} edition Target edition (COMMUNITY, COMMERCIAL, ENTERPRISE, GOV_CLOUD)
   * @param {string} featureFlag Feature flag key to evaluate
   * @returns {boolean} Whether feature is enabled
   */
  isFeatureEntitled(edition, featureFlag) {
    const validEditions = this.descriptor.editions || [];
    if (!validEditions.includes(edition)) {
      return false;
    }

    const flags = this.descriptor.featureFlags || {};
    return Boolean(flags[featureFlag]);
  }

  /**
   * Resolves support and documentation routing endpoints for a given edition.
   * @param {string} [edition='ENTERPRISE']
   * @returns {Object} Support routing object
   */
  resolveSupportRouting(edition = 'ENTERPRISE') {
    const routing = this.descriptor.supportRouting || {};
    const sla = (routing.slaGuarantees && routing.slaGuarantees[edition]) || '99.9%';

    return {
      portalUrl: routing.portalUrl || 'https://support.airroofers.eu/products/eaorcs',
      kbUrl: routing.kbUrl || 'https://docs.airroofers.eu/eaorcs',
      edition,
      slaGuarantee: sla,
      routedAt: new Date().toISOString()
    };
  }

  /**
   * Registers a platform subsystem module under the master product descriptor.
   * @param {string} subsystemId Subsystem identifier
   * @param {Object} metadata Subsystem metadata
   * @returns {Object} Registration payload
   */
  registerSubsystem(subsystemId, metadata = {}) {
    if (!subsystemId) {
      throw new Error('Subsystem ID is required for registry registration.');
    }

    const payload = {
      subsystemId,
      productId: this.descriptor.productId,
      registeredAt: new Date().toISOString(),
      metadata: Object.assign({
        status: 'ACTIVE',
        health: 'HEALTHY'
      }, metadata)
    };

    this.registeredSubsystems.set(subsystemId, payload);
    this.subsystemHealth.set(subsystemId, 'HEALTHY');

    return payload;
  }

  /**
   * Conducts a platform-wide product registry audit.
   * @returns {Object} Audit report
   */
  runRegistryAudit() {
    const registeredCount = this.registeredSubsystems.size;
    const isHealthy = Array.from(this.subsystemHealth.values()).every(h => h === 'HEALTHY');
    const capAudit = this.capabilityRegistry.auditCapabilityCoverage();

    return {
      productId: this.descriptor.productId,
      name: this.descriptor.name,
      platformDomain: this.descriptor.platformDomain,
      version: this.descriptor.version,
      lifecycleStage: this.descriptor.lifecycleStage,
      registeredSubsystemsCount: registeredCount,
      subsystems: Array.from(this.registeredSubsystems.values()),
      capabilityCoverage: capAudit,
      isHealthy,
      auditedAt: new Date().toISOString()
    };
  }
}

module.exports = AirRoofersProductRegistry;
