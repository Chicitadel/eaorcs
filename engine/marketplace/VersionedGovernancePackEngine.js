/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Versioned Governance Pack & Compatibility Engine
 * File           : engine/marketplace/VersionedGovernancePackEngine.js
 * Version        : 2026.2.0-LTS
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE
 *
 * Governance:
 * - Enterprise Governance Enforced
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Valid Governance Pack Lifecycle Statuses
 */
const VALID_LIFECYCLE_STATUSES = new Set([
  'EXPERIMENTAL',
  'ACTIVE',
  'DEPRECATED',
  'RETIRED',
  'V1',
  'V2',
  'V3',
  'DRAFT'
]);

/**
 * Helper to clean and parse semver/version strings (e.g. '2026.2.0', 'v2.1.0', '1.0.0-LTS').
 * @param {string} vStr 
 * @returns {number[]} array of numeric components [major, minor, patch]
 */
function parseVersionComponents(vStr) {
  if (!vStr || typeof vStr !== 'string') return [0, 0, 0];
  const cleaned = vStr.replace(/^v/i, '').split('-')[0];
  const parts = cleaned.split('.').map(p => parseInt(p, 10) || 0);
  while (parts.length < 3) parts.push(0);
  return parts.slice(0, 3);
}

/**
 * Compares two version strings: returns 1 if v1 > v2, -1 if v1 < v2, 0 if v1 === v2.
 */
function compareVersions(v1, v2) {
  const c1 = parseVersionComponents(v1);
  const c2 = parseVersionComponents(v2);
  for (let i = 0; i < 3; i++) {
    if (c1[i] > c2[i]) return 1;
    if (c1[i] < c2[i]) return -1;
  }
  return 0;
}

class VersionedGovernancePackEngine {
  /**
   * Initializes the Governance Pack Lifecycle & Compatibility Engine.
   * @param {Object} options 
   */
  constructor(options = {}) {
    this.options = options;
    // Map of packKey (`${packId}:${version}`) -> packDefinition
    this.packCatalog = new Map();
    this._initializeDefaultCatalog();
  }

  /**
   * Pre-populates default governance packs across lifecycle stages.
   * @private
   */
  _initializeDefaultCatalog() {
    const defaults = [
      {
        packId: 'ISO_27001_PACK',
        version: 'v1.0.0',
        status: 'RETIRED',
        minEaorcsVersion: '2026.1.0',
        minSdkVersion: '1.0.0',
        minKernelVersion: '1.0.0',
        metadata: { title: 'ISO/IEC 27001:2013 Governance Pack (Legacy)', generation: 'v1' }
      },
      {
        packId: 'ISO_27001_PACK',
        version: 'v2.1.0',
        status: 'ACTIVE',
        minEaorcsVersion: '2026.2.0',
        minSdkVersion: '2.0.0',
        minKernelVersion: '1.0.0',
        metadata: { title: 'ISO/IEC 27001:2022 Enterprise Governance Pack', generation: 'v2' }
      },
      {
        packId: 'ISO_27001_PACK',
        version: 'v3.0.0-beta',
        status: 'EXPERIMENTAL',
        minEaorcsVersion: '2026.3.0',
        minSdkVersion: '3.0.0',
        minKernelVersion: '2.0.0',
        metadata: { title: 'ISO/IEC 27001 AI & Cloud Security Expansion', generation: 'v3' }
      },
      {
        packId: 'SOC2_TYPE2_PACK',
        version: 'v2.0.0',
        status: 'ACTIVE',
        minEaorcsVersion: '2026.2.0',
        minSdkVersion: '2.0.0',
        minKernelVersion: '1.0.0',
        metadata: { title: 'SOC 2 Type II Trust Services Criteria Pack', generation: 'v2' }
      },
      {
        packId: 'OWASP_ASVS_PACK',
        version: 'v4.0.3',
        status: 'ACTIVE',
        minEaorcsVersion: '2026.2.0',
        minSdkVersion: '2.0.0',
        minKernelVersion: '1.0.0',
        metadata: { title: 'OWASP ASVS Level 3 Verification Pack', generation: 'v2' }
      },
      {
        packId: 'NIST_SP800_161_PACK',
        version: 'v1.1.0',
        status: 'ACTIVE',
        minEaorcsVersion: '2026.2.0',
        minSdkVersion: '2.0.0',
        minKernelVersion: '1.0.0',
        metadata: { title: 'NIST SP 800-161 Supply Chain Risk Management Pack', generation: 'v1' }
      }
    ];

    defaults.forEach(pack => this.registerGovernancePackVersion(pack));
  }

  /**
   * Registers or updates a Governance Pack version definition.
   * @param {Object} packDef - Pack metadata and version requirements
   * @returns {Object} Registered pack definition record
   */
  registerGovernancePackVersion(packDef = {}) {
    if (!packDef.packId || !packDef.version) {
      throw new Error('packId and version are required parameters to register a governance pack.');
    }

    const rawStatus = (packDef.status || 'ACTIVE').toUpperCase();
    const status = VALID_LIFECYCLE_STATUSES.has(rawStatus) ? rawStatus : 'ACTIVE';

    const packRecord = {
      packId: packDef.packId,
      version: packDef.version,
      status,
      minEaorcsVersion: packDef.minEaorcsVersion || '2026.2.0',
      maxEaorcsVersion: packDef.maxEaorcsVersion || null,
      minSdkVersion: packDef.minSdkVersion || '2.0.0',
      minKernelVersion: packDef.minKernelVersion || '1.0.0',
      registeredAt: new Date().toISOString(),
      metadata: packDef.metadata || {}
    };

    const key = `${packDef.packId}:${packDef.version}`;
    this.packCatalog.set(key, packRecord);

    return packRecord;
  }

  /**
   * Extension Compatibility Matrix: Validates compatibility against EAORCS core version,
   * SDK version, and STK kernel version.
   * @param {Object} query - { packId, version, eaorcsVersion, sdkVersion, kernelVersion }
   * @returns {Object} Detailed compatibility result object.
   */
  checkCompatibility(query = {}) {
    const { packId, version, eaorcsVersion, sdkVersion, kernelVersion } = query;

    let pack = null;
    if (packId && version) {
      const key = `${packId}:${version}`;
      pack = this.packCatalog.get(key);
    }

    // Fallback requirement bounds if pack isn't explicitly pre-registered
    const minEaorcs = pack ? pack.minEaorcsVersion : (query.minEaorcsVersion || '2026.2.0');
    const minSdk = pack ? pack.minSdkVersion : (query.minSdkVersion || '2.0.0');
    const minKernel = pack ? pack.minKernelVersion : (query.minKernelVersion || '1.0.0');
    const packStatus = pack ? pack.status : 'ACTIVE';

    const reasons = [];

    // Rule 1: RETIRED packs are non-compatible
    if (packStatus === 'RETIRED') {
      reasons.push(`Governance Pack [${packId} ${version}] has status RETIRED and cannot be loaded.`);
    }

    // Rule 2: EAORCS Core Version Compatibility Check
    const eaorcsSatisfied = compareVersions(eaorcsVersion || '0.0.0', minEaorcs) >= 0;
    if (!eaorcsSatisfied) {
      reasons.push(`EAORCS core version '${eaorcsVersion}' does not meet required minimum version '${minEaorcs}'.`);
    }

    // Rule 3: SDK Version Compatibility Check
    const sdkSatisfied = compareVersions(sdkVersion || '0.0.0', minSdk) >= 0;
    if (!sdkSatisfied) {
      reasons.push(`SDK version '${sdkVersion}' does not meet required minimum version '${minSdk}'.`);
    }

    // Rule 4: STK Kernel Version Compatibility Check
    const kernelSatisfied = compareVersions(kernelVersion || '0.0.0', minKernel) >= 0;
    if (!kernelSatisfied) {
      reasons.push(`STK kernel version '${kernelVersion}' does not meet required minimum version '${minKernel}'.`);
    }

    const compatible = (packStatus !== 'RETIRED') && eaorcsSatisfied && sdkSatisfied && kernelSatisfied;

    return {
      compatible,
      packId: packId || 'CUSTOM_PACK',
      version: version || 'v1.0.0',
      status: packStatus,
      matrix: {
        eaorcs: {
          current: eaorcsVersion,
          required: minEaorcs,
          satisfied: eaorcsSatisfied
        },
        sdk: {
          current: sdkVersion,
          required: minSdk,
          satisfied: sdkSatisfied
        },
        kernel: {
          current: kernelVersion,
          required: minKernel,
          satisfied: kernelSatisfied
        }
      },
      reasons
    };
  }

  /**
   * Governance Pack Lifecycle Manager: Transitions lifecycle status of a pack version.
   * @param {string} packId 
   * @param {string} version 
   * @param {string} newStatus - 'EXPERIMENTAL' | 'ACTIVE' | 'DEPRECATED' | 'RETIRED'
   * @returns {Object} Updated pack record
   */
  updatePackLifecycleStatus(packId, version, newStatus) {
    const key = `${packId}:${version}`;
    const pack = this.packCatalog.get(key);
    if (!pack) {
      throw new Error(`Governance pack version not found: ${key}`);
    }

    const upperStatus = (newStatus || '').toUpperCase();
    if (!VALID_LIFECYCLE_STATUSES.has(upperStatus)) {
      throw new Error(`Invalid lifecycle status '${newStatus}'. Valid statuses: ${Array.from(VALID_LIFECYCLE_STATUSES).join(', ')}`);
    }

    pack.status = upperStatus;
    pack.updatedAt = new Date().toISOString();
    this.packCatalog.set(key, pack);
    return pack;
  }

  /**
   * Retrieves a specific pack version record.
   * @param {string} packId 
   * @param {string} version 
   * @returns {Object|null}
   */
  getPackVersion(packId, version) {
    return this.packCatalog.get(`${packId}:${version}`) || null;
  }

  /**
   * Lists all versions registered for a given packId.
   * @param {string} packId 
   * @returns {Array<Object>}
   */
  listPackVersions(packId) {
    const results = [];
    for (const [key, pack] of this.packCatalog.entries()) {
      if (pack.packId === packId) {
        results.push(pack);
      }
    }
    return results;
  }

  /**
   * Lists all governance packs in catalog with optional status filter.
   * @param {Object} filter - { status, minEaorcsVersion }
   * @returns {Array<Object>}
   */
  listAllGovernancePacks(filter = {}) {
    let packs = Array.from(this.packCatalog.values());
    if (filter.status) {
      const s = filter.status.toUpperCase();
      packs = packs.filter(p => p.status === s);
    }
    return packs;
  }
}

module.exports = VersionedGovernancePackEngine;
