/******************************************************************************
 * Project        : Air Roofers Platform Ecosystem
 * Module         : Repository Intelligence & Automated Asset Classification Engine
 * File           : engine/governance/RepositoryIntelligenceEngine.js
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

const path = require('path');

class RepositoryIntelligenceEngine {
  /**
   * Infer asset class and governance profile from a path or target identifier.
   * @param {string} targetPath Relative or absolute target path (e.g. 'products/eaorcs', 'projects/nigeriafrance')
   * @returns {Object} Asset classification profile
   */
  static classifyTarget(targetPath) {
    const normalizedPath = (targetPath || '').replace(/\\/g, '/').toLowerCase();

    if (normalizedPath.includes('projects/') || normalizedPath.startsWith('projects')) {
      return {
        assetClass: 'CLASS_D',
        className: 'Customer Project',
        profile: 'CUSTOMER_PROJECT_PROFILE',
        governanceType: 'CONTRACT_DELIVERY_EVIDENCE',
        requiresLicensing: false,
        requiresMarketplace: false,
        requiresContractMetadata: true,
        requiresAcceptancePassport: true
      };
    }

    if (normalizedPath.includes('products/') || normalizedPath.startsWith('products') || normalizedPath.includes('eaorcs')) {
      return {
        assetClass: 'CLASS_A',
        className: 'Commercial Product',
        profile: 'COMMERCIAL_PRODUCT_PROFILE',
        governanceType: 'EDITION_COMMERCIAL_TIERS',
        requiresLicensing: true,
        requiresMarketplace: true,
        requiresContractMetadata: false,
        requiresAcceptancePassport: false
      };
    }

    if (normalizedPath.includes('platform/')) {
      return {
        assetClass: 'CLASS_B',
        className: 'Platform Subsystem',
        profile: 'PLATFORM_SUBSYSTEM_PROFILE',
        governanceType: 'SUBSYSTEM_PROVENANCE',
        requiresLicensing: false,
        requiresMarketplace: false
      };
    }

    if (normalizedPath.includes('services/')) {
      return {
        assetClass: 'CLASS_C',
        className: 'Platform Service',
        profile: 'PLATFORM_SERVICE_PROFILE',
        governanceType: 'SERVICE_SLA_GATING',
        requiresLicensing: false,
        requiresMarketplace: false
      };
    }

    if (normalizedPath.includes('shared/') || normalizedPath.includes('packages/') || normalizedPath.includes('sdk/')) {
      return {
        assetClass: 'CLASS_E',
        className: 'Reusable Component',
        profile: 'REUSABLE_COMPONENT_PROFILE',
        governanceType: 'SDK_VERSIONING_BOUNDARY',
        requiresLicensing: false,
        requiresMarketplace: false
      };
    }

    if (normalizedPath.includes('blueprints/') || normalizedPath.includes('policies/')) {
      return {
        assetClass: 'CLASS_F',
        className: 'Knowledge Asset',
        profile: 'KNOWLEDGE_ASSET_PROFILE',
        governanceType: 'CRYPTOGRAPHIC_BLUEPRINT_IMMUTABILITY',
        requiresLicensing: false,
        requiresMarketplace: false
      };
    }

    // Default Fallback
    return {
      assetClass: 'CLASS_A',
      className: 'Commercial Product (Default)',
      profile: 'COMMERCIAL_PRODUCT_PROFILE',
      governanceType: 'EDITION_COMMERCIAL_TIERS',
      requiresLicensing: true,
      requiresMarketplace: true
    };
  }
}

module.exports = RepositoryIntelligenceEngine;
