/******************************************************************************
 * Project        : Air Roofers Platform Ecosystem
 * Module         : Authoritative Workspace Registry Engine (11 Asset Types)
 * File           : engine/governance/WorkspaceRegistryEngine.js
 * Version        : 2026.3.0-LTS
 * Author         : Enterprise Architecture & Security Governance Board
 * Organization   : Air Roofers Governance Directorate
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE
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
 * - AR-STD-REP-001
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Air Roofers Governance Directorate
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

class WorkspaceRegistryEngine {
  static get assetTypes() {
    return {
      PRODUCT: { id: 'Product', assetClass: 'CLASS_A', profile: 'COMMERCIAL_PRODUCT_PROFILE' },
      CAPABILITY: { id: 'Capability', assetClass: 'CLASS_A', profile: 'CAPABILITY_PROFILE' },
      SHARED_SERVICE: { id: 'Shared Service', assetClass: 'CLASS_C', profile: 'PLATFORM_SERVICE_PROFILE' },
      SDK: { id: 'SDK', assetClass: 'CLASS_E', profile: 'REUSABLE_COMPONENT_PROFILE' },
      TEMPLATE: { id: 'Template', assetClass: 'CLASS_E', profile: 'TEMPLATE_PROFILE' },
      BLUEPRINT: { id: 'Blueprint', assetClass: 'CLASS_F', profile: 'KNOWLEDGE_ASSET_PROFILE' },
      CUSTOMER_PROJECT: { id: 'Customer Project', assetClass: 'CLASS_D', profile: 'CUSTOMER_PROJECT_PROFILE' },
      INFRASTRUCTURE: { id: 'Infrastructure', assetClass: 'CLASS_B', profile: 'PLATFORM_SUBSYSTEM_PROFILE' },
      WEBSITE: { id: 'Website', assetClass: 'CLASS_C', profile: 'PLATFORM_SERVICE_PROFILE' },
      PLATFORM: { id: 'Platform', assetClass: 'CLASS_B', profile: 'PLATFORM_SUBSYSTEM_PROFILE' },
      TOOLING: { id: 'Tooling', assetClass: 'CLASS_E', profile: 'REUSABLE_COMPONENT_PROFILE' }
    };
  }

  /**
   * Discover and resolve authoritative workspace entry for any target.
   * @param {string} target 
   * @returns {Object} Workspace registry record
   */
  static resolveEntry(target = '') {
    const norm = target.toLowerCase().replace(/\\/g, '/');

    if (norm.includes('projects/') || norm.startsWith('projects')) {
      return {
        type: this.assetTypes.CUSTOMER_PROJECT,
        target,
        id: target.replace(/^projects\//, ''),
        registered: true
      };
    }
    if (norm.includes('sdk')) {
      return {
        type: this.assetTypes.SDK,
        target,
        id: target,
        registered: true
      };
    }
    if (norm.includes('blueprints/')) {
      return {
        type: this.assetTypes.BLUEPRINT,
        target,
        id: target,
        registered: true
      };
    }
    if (norm.includes('platform/')) {
      return {
        type: this.assetTypes.PLATFORM,
        target,
        id: target,
        registered: true
      };
    }

    return {
      type: this.assetTypes.PRODUCT,
      target,
      id: target,
      registered: true
    };
  }
}

module.exports = WorkspaceRegistryEngine;
