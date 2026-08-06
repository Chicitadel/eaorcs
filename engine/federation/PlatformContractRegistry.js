/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Platform Contract Registry Engine
 * File           : PlatformContractRegistry.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Platform API & Schema Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Air Roofers Platform Contract Governance Standard
 * - Prevents breaking API changes, removed events, and schema drift across deployments
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * Contract Types supported by the central registry
 */
const CONTRACT_TYPES = Object.freeze({
  OPENAPI_SPEC:  'OPENAPI_SPEC',
  EVENT_PAYLOAD: 'EVENT_PAYLOAD',
  DTO_SCHEMA:    'DTO_SCHEMA',
  SDK_INTERFACE: 'SDK_INTERFACE',
});

/**
 * PlatformContractRegistry
 *
 * Central repository for all OpenAPI specs, DTO schemas, event payload contracts,
 * and SDK interface definitions across the Air Roofers platform.
 */
class PlatformContractRegistry {
  constructor(options = {}) {
    this.options = options;
    this._contracts = new Map(); // contractId -> Contract record
    this._history = [];
  }

  /**
   * Registers a new platform contract or updates an existing one with version lineage.
   * @param {object} contractDescriptor - Contract metadata & payload
   * @returns {object} Registration receipt
   */
  registerContract(contractDescriptor) {
    const required = ['name', 'type', 'version', 'payload'];
    for (const f of required) {
      if (!contractDescriptor[f]) throw new Error(`PlatformContractRegistry: '${f}' is required.`);
    }

    const type = contractDescriptor.type.toUpperCase();
    if (!CONTRACT_TYPES[type]) throw new Error(`Invalid contract type '${type}'.`);

    const contractId = contractDescriptor.contractId || `cnt-${crypto.createHash('sha256').update(`${contractDescriptor.name}:${type}`).digest('hex').slice(0, 12)}`;
    const payloadString = JSON.stringify(contractDescriptor.payload);
    const hash = crypto.createHash('sha256').update(payloadString).digest('hex');

    const existing = this._contracts.get(contractId);
    let previousVersion = null;
    let isBreakingChange = false;

    if (existing) {
      previousVersion = existing.version;
      // Simple breaking change heuristic: payload fields removed
      isBreakingChange = this._detectBreakingChange(existing.payload, contractDescriptor.payload);
    }

    const record = {
      contractId,
      name: contractDescriptor.name,
      type,
      version: contractDescriptor.version,
      previousVersion,
      hash,
      payload: contractDescriptor.payload,
      isBreakingChange,
      registeredAt: new Date().toISOString(),
    };

    this._contracts.set(contractId, record);
    this._history.push({ ...record });

    return {
      success: true,
      contractId,
      version: record.version,
      hash,
      isBreakingChange,
      status: isBreakingChange ? 'BREAKING_CHANGE_REGISTERED' : 'CONTRACT_REGISTERED',
    };
  }

  /**
   * Evaluates pre-deployment contract compatibility against expected schemas.
   */
  verifyCompatibility(contractId, currentPayload) {
    const existing = this._contracts.get(contractId);
    if (!existing) return { compatible: true, reason: 'NEW_CONTRACT' };

    const breaking = this._detectBreakingChange(existing.payload, currentPayload);

    return {
      compatible: !breaking,
      contractId,
      name: existing.name,
      registeredVersion: existing.version,
      isBreakingChange: breaking,
      status: breaking ? 'COMPATIBILITY_VIOLATION' : 'COMPATIBLE',
    };
  }

  /**
   * Returns contract audit summary.
   */
  getContractSummary() {
    return {
      generatedAt: new Date().toISOString(),
      totalContracts: this._contracts.size,
      contracts: [...this._contracts.values()].map(c => ({
        contractId: c.contractId,
        name: c.name,
        type: c.type,
        version: c.version,
        hash: c.hash,
        isBreakingChange: c.isBreakingChange,
      })),
    };
  }

  getEngineStatus() {
    return { initialized: true, contractCount: this._contracts.size, historyCount: this._history.length };
  }

  _detectBreakingChange(oldPayload, newPayload) {
    if (typeof oldPayload !== 'object' || typeof newPayload !== 'object' || !oldPayload || !newPayload) return false;
    const oldKeys = Object.keys(oldPayload);
    const newKeys = new Set(Object.keys(newPayload));

    // Breaking if any top-level key was removed
    for (const k of oldKeys) {
      if (!newKeys.has(k)) return true;
    }
    return false;
  }
}

module.exports = PlatformContractRegistry;
module.exports.PlatformContractRegistry = PlatformContractRegistry;
module.exports.CONTRACT_TYPES = CONTRACT_TYPES;
