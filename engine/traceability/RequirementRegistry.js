/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Requirement Registry Controller
 * File           : engine/traceability/RequirementRegistry.js
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
 * RequirementRegistry
 * Machine-readable Requirement Registry controller for managing 100% blueprint requirement parity.
 */
class RequirementRegistry {
  constructor(registryPath = null) {
    this.registryPath = registryPath || path.resolve(__dirname, '../../config/airroofers-requirement-registry.json');
    this.requirementsMap = new Map();
    this.loadRequirements();
  }

  /**
   * Loads requirement definitions from JSON into map.
   */
  loadRequirements() {
    if (!fs.existsSync(this.registryPath)) {
      throw new Error(`Requirement Registry file not found at path: ${this.registryPath}`);
    }

    const raw = fs.readFileSync(this.registryPath, 'utf8');
    const parsed = JSON.parse(raw);
    const list = parsed.requirements || [];

    this.requirementsMap.clear();
    for (const req of list) {
      if (req.id) {
        this.requirementsMap.set(req.id, req);
      }
    }
  }

  /**
   * Returns all requirements in registry.
   * @returns {Array<Object>}
   */
  getAllRequirements() {
    return Array.from(this.requirementsMap.values());
  }

  /**
   * Retrieves specific requirement by ID.
   * @param {string} reqId
   * @returns {Object|null}
   */
  getRequirement(reqId) {
    return this.requirementsMap.get(reqId) || null;
  }

  /**
   * Audits requirement coverage.
   * @returns {Object} Coverage report
   */
  auditRequirementCoverage() {
    const all = this.getAllRequirements();
    const verifiedCount = all.filter(r => r.status === 'VERIFIED').length;

    return {
      totalRequirements: all.length,
      verifiedRequirements: verifiedCount,
      coveragePercentage: Math.round((verifiedCount / (all.length || 1)) * 100),
      is100PercentCovered: verifiedCount === all.length,
      auditedAt: new Date().toISOString()
    };
  }
}

module.exports = RequirementRegistry;
