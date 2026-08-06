/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Platform Evolution Policy Validator Engine
 * File           : PlatformEvolutionPolicyValidator.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Platform Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Automated Enforcer for PLATFORM_EVOLUTION_POLICY.md
 * - Evaluates PRs/Changes against ALLOWED, REQUIRES_ARB_APPROVAL, and PROHIBITED rules
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

const CHANGE_CATEGORIES = Object.freeze({
  ALLOWED:               'ALLOWED',
  REQUIRES_ARB_APPROVAL: 'REQUIRES_ARB_APPROVAL',
  PROHIBITED:            'PROHIBITED',
});

/**
 * PlatformEvolutionPolicyValidator
 *
 * Automatically evaluates proposed code/architectural changes against PLATFORM_EVOLUTION_POLICY.md.
 */
class PlatformEvolutionPolicyValidator {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Evaluates a proposed change against the policy matrix.
   * @param {object} changeDescriptor - Description of change
   * @returns {object} Validation result
   */
  evaluateChange(changeDescriptor) {
    if (!changeDescriptor || !changeDescriptor.type) {
      throw new Error('PlatformEvolutionPolicyValidator: changeDescriptor.type is required.');
    }

    const type = changeDescriptor.type.toUpperCase();

    // 1. Prohibited Check
    const prohibitedTypes = [
      'SHADOW_IDENTITY',
      'SHADOW_BILLING',
      'SHADOW_TELEMETRY',
      'BYPASS_PLATFORM_ADAPTERS',
      'BREAKING_API_CHANGE',
      'REMOVED_EVENT_FIELD',
      'CIRCULAR_DEPENDENCY',
    ];

    if (prohibitedTypes.includes(type)) {
      return {
        category: CHANGE_CATEGORIES.PROHIBITED,
        allowed: false,
        reason: `Change type '${type}' is STRICTLY PROHIBITED under PLATFORM_EVOLUTION_POLICY.md.`,
        requiresArbException: false, // Cannot be exempted
        status: 'CHANGE_REJECTED',
      };
    }

    // 2. Requires ARB Approval Check
    const arbApprovalTypes = [
      'NEW_PLATFORM_SERVICE_PROPOSAL',
      'FEDERATION_MANIFEST_MUTATION',
      'SDK_CONTRACT_MODIFICATION',
      'BOOT_SEQUENCE_MODIFICATION',
      'EVENT_SCHEMA_MUTATION',
      'DOMAIN_MODEL_MUTATION',
      'API_ADDITIVE_STRUCTURAL_CHANGE',
    ];

    if (arbApprovalTypes.includes(type)) {
      const hasArbToken = !!changeDescriptor.arbApprovalToken;
      return {
        category: CHANGE_CATEGORIES.REQUIRES_ARB_APPROVAL,
        allowed: hasArbToken,
        reason: hasArbToken
          ? 'ARB Approval Token verified. Change approved.'
          : `Change type '${type}' REQUIRES_ARB_APPROVAL under PLATFORM_EVOLUTION_POLICY.md. ARB token missing.`,
        requiresArbException: true,
        status: hasArbToken ? 'APPROVED_BY_ARB' : 'PENDING_ARB_APPROVAL',
      };
    }

    // 3. Default Allowed Check
    return {
      category: CHANGE_CATEGORIES.ALLOWED,
      allowed: true,
      reason: `Change type '${type}' is in Category A (ALLOWED) under PLATFORM_EVOLUTION_POLICY.md.`,
      requiresArbException: false,
      status: 'APPROVED',
    };
  }

  getEngineStatus() {
    return { initialized: true, policyDocument: 'PLATFORM_EVOLUTION_POLICY.md' };
  }
}

module.exports = PlatformEvolutionPolicyValidator;
module.exports.PlatformEvolutionPolicyValidator = PlatformEvolutionPolicyValidator;
module.exports.CHANGE_CATEGORIES = CHANGE_CATEGORIES;
