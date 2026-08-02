/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Kernel / Capability Broker Engine v1.1.0-FROZEN
 * File           : CapabilityBrokerEngine.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering (Ujomor Engineering Governance Authority)
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - AI Governed
 * - Architecture Authority Approved & FROZEN (v1.1.0-FROZEN)
 * - Security Reviewed (ISO 27001, SOC 2, OWASP ASVS, NIST SP 800-161, DORA, NIS2, EU Data Act)
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - EAORCS Blueprint v1.0
 * - DPA/PDA v1.1.0-FROZEN
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161 / SLSA Level 4
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

const crypto = require('crypto');
const CapabilityContractValidator = require('./CapabilityContractValidator');

class CapabilityBrokerEngine {
  /**
   * Initializes the Capability Broker Engine.
   * @param {Object|null} hypervisor - Optional hypervisor engine reference.
   * @param {Object} options - Configuration options (e.g. secretKey).
   */
  constructor(hypervisor = null, options = {}) {
    this.hypervisor = hypervisor;
    this.contracts = new Map();
    this.activeBrokerTokens = new Map();
    this.revokedTokens = new Set();
    this.delegations = new Map(); // childTokenId -> parentTokenId
    this.secretKey = options.secretKey || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Registers a capability contract after schema validation.
   * @param {Object} contractPayload
   * @returns {Object} Validated capability contract.
   */
  registerContract(contractPayload) {
    const validation = CapabilityContractValidator.validate(contractPayload);
    if (!validation.valid) {
      throw new Error(`[CapabilityBroker] Invalid capability contract: ${validation.errors.join(', ')}`);
    }
    const cc = contractPayload.capability_contract || contractPayload;
    const registeredContract = {
      ...cc,
      registeredAt: new Date().toISOString()
    };
    this.contracts.set(cc.capability_id, registeredContract);
    return registeredContract;
  }

  /**
   * Requests a capability execution token.
   * Delegates to hypervisor if configured, otherwise issues token directly.
   * @param {string} capabilityId
   * @param {string} tenantId
   * @param {Object} options
   * @returns {Object} Issued capability execution token.
   */
  requestExecutionToken(capabilityId, tenantId, options = {}) {
    if (!this.contracts.has(capabilityId) && !options.allowUnregistered) {
      throw new Error(`[CapabilityBroker] Capability '${capabilityId}' is not registered.`);
    }

    if (this.hypervisor && typeof this.hypervisor.issueCapabilityToken === 'function') {
      return this.hypervisor.issueCapabilityToken(capabilityId, tenantId, options);
    }

    return this.issueCapabilityToken(capabilityId, tenantId, options);
  }

  /**
   * Issues a cryptographically signed capability token.
   * @param {string} capabilityId
   * @param {string} tenantId
   * @param {Object} options
   * @returns {Object} Capability token object.
   */
  issueCapabilityToken(capabilityId, tenantId, options = {}) {
    const contract = this.contracts.get(capabilityId) || {};
    const tokenId = options.tokenId || `broker-token-${crypto.randomBytes(16).toString('hex')}`;
    const ttlSeconds = options.ttlSeconds || 3600;
    const now = Date.now();
    const issuedAt = new Date(now).toISOString();
    const expiresAt = options.expiresAt || new Date(now + ttlSeconds * 1000).toISOString();

    const scope = Array.isArray(options.scope)
      ? options.scope
      : (contract.scopes || ['read', 'execute']);

    const securityLevel = options.securityLevel || contract.security_level || 'CLASS_C_PROTECTED';

    const token = {
      tokenId,
      capabilityId,
      tenantId,
      scope,
      securityLevel,
      issuedAt,
      expiresAt,
      singleUse: Boolean(options.singleUse),
      delegable: options.delegable !== undefined ? Boolean(options.delegable) : true,
      maxDelegationDepth: options.maxDelegationDepth !== undefined ? options.maxDelegationDepth : 3,
      delegationDepth: options.delegationDepth || 0,
      parentTokenId: options.parentTokenId || null,
      delegationChain: options.delegationChain || [],
      used: false
    };

    token.signature = this._generateSignature(token);
    this.activeBrokerTokens.set(tokenId, token);
    return token;
  }

  /**
   * Enforces entitlement checks on a token against requested capability, tenant, scope, and security level.
   * Consumes single-use tokens upon successful validation.
   * @param {string|Object} tokenOrId
   * @param {string} requiredCapability
   * @param {string} requiredTenant
   * @param {Object} options
   * @returns {{granted: boolean, reason?: string, tokenPayload?: Object, consumed?: boolean}}
   */
  enforceEntitlement(tokenOrId, requiredCapability, requiredTenant, options = {}) {
    const verification = this.verifyToken(tokenOrId);
    if (!verification.valid) {
      return { granted: false, reason: verification.reason, consumed: false };
    }

    const token = verification.token;

    // Single-use token check
    if (token.singleUse && token.used) {
      return { granted: false, reason: 'TOKEN_ALREADY_USED', consumed: true };
    }

    // Capability ID match check
    if (token.capabilityId !== requiredCapability && requiredCapability !== '*') {
      return { granted: false, reason: `CAPABILITY_MISMATCH: expected '${requiredCapability}', got '${token.capabilityId}'`, consumed: false };
    }

    // Tenant ID match check
    if (token.tenantId !== requiredTenant && requiredTenant !== '*') {
      return { granted: false, reason: `TENANT_MISMATCH: expected '${requiredTenant}', got '${token.tenantId}'`, consumed: false };
    }

    // Scope check if required
    if (options.requiredScope) {
      const hasScope = Array.isArray(options.requiredScope)
        ? options.requiredScope.every(s => token.scope.includes(s))
        : token.scope.includes(options.requiredScope);

      if (!hasScope) {
        return { granted: false, reason: `SCOPE_INSUFFICIENT: missing scope '${options.requiredScope}'`, consumed: false };
      }
    }

    // Security level check if required
    if (options.minSecurityLevel) {
      const securityLevels = ['CLASS_A_PUBLIC', 'CLASS_B_INTERNAL', 'CLASS_C_PROTECTED', 'CLASS_D_RESTRICTED', 'CLASS_S_SOVEREIGN'];
      const tokenIdx = securityLevels.indexOf(token.securityLevel);
      const reqIdx = securityLevels.indexOf(options.minSecurityLevel);
      if (tokenIdx !== -1 && reqIdx !== -1 && tokenIdx < reqIdx) {
        return { granted: false, reason: `SECURITY_LEVEL_INSUFFICIENT: token has '${token.securityLevel}', required '${options.minSecurityLevel}'`, consumed: false };
      }
    }

    // Mark single-use token as used
    if (token.singleUse) {
      token.used = true;
      this.activeBrokerTokens.set(token.tokenId, token);
    }

    return {
      granted: true,
      tokenPayload: token,
      consumed: Boolean(token.singleUse)
    };
  }

  /**
   * Delegates capability entitlements from a parent token to a child token bound to a target tenant.
   * @param {string|Object} parentTokenOrId
   * @param {string} targetTenantId
   * @param {Object} options
   * @returns {Object} Delegated child capability token.
   */
  delegateCapability(parentTokenOrId, targetTenantId, options = {}) {
    const parentVerify = this.verifyToken(parentTokenOrId);
    if (!parentVerify.valid) {
      throw new Error(`[CapabilityBroker] Cannot delegate invalid parent token: ${parentVerify.reason}`);
    }

    const parentToken = parentVerify.token;

    if (!parentToken.delegable) {
      throw new Error(`[CapabilityBroker] Parent token '${parentToken.tokenId}' is marked as non-delegable.`);
    }

    if (parentToken.delegationDepth >= parentToken.maxDelegationDepth) {
      throw new Error(`[CapabilityBroker] Delegation depth limit exceeded (max: ${parentToken.maxDelegationDepth}).`);
    }

    // Enforce sub-scoping (child scope must be subset of parent scope)
    const requestedScope = options.scope || parentToken.scope;
    const isSubset = requestedScope.every(s => parentToken.scope.includes(s));
    if (!isSubset) {
      throw new Error(`[CapabilityBroker] Delegated scope [${requestedScope.join(', ')}] exceeds parent scope [${parentToken.scope.join(', ')}].`);
    }

    // Expiry cannot exceed parent expiration
    const parentExpiresMs = new Date(parentToken.expiresAt).getTime();
    const requestedExpiresMs = options.expiresAt ? new Date(options.expiresAt).getTime() : parentExpiresMs;
    const finalExpiresMs = Math.min(parentExpiresMs, requestedExpiresMs);

    const childChain = [...(parentToken.delegationChain || []), parentToken.tokenId];

    const childToken = this.issueCapabilityToken(parentToken.capabilityId, targetTenantId, {
      ...options,
      scope: requestedScope,
      securityLevel: options.securityLevel || parentToken.securityLevel,
      expiresAt: new Date(finalExpiresMs).toISOString(),
      parentTokenId: parentToken.tokenId,
      delegationDepth: parentToken.delegationDepth + 1,
      maxDelegationDepth: parentToken.maxDelegationDepth,
      delegationChain: childChain
    });

    this.delegations.set(childToken.tokenId, parentToken.tokenId);
    return childToken;
  }

  /**
   * Revokes a capability token and recursively revokes all tokens delegated from it.
   * @param {string} tokenId
   * @param {string} reason
   * @returns {{revoked: boolean, revokedCount: number, reason: string}}
   */
  revokeToken(tokenId, reason = 'EXPLICIT_REVOCATION') {
    let count = 0;
    if (!this.revokedTokens.has(tokenId)) {
      this.revokedTokens.add(tokenId);
      count++;
    }

    // Find and revoke all child tokens recursively
    for (const [childId, parentId] of this.delegations.entries()) {
      if (parentId === tokenId && !this.revokedTokens.has(childId)) {
        const childRes = this.revokeToken(childId, `PARENT_REVOKED: ${reason}`);
        count += childRes.revokedCount;
      }
    }

    return { revoked: true, revokedCount: count, reason };
  }

  /**
   * Verifies token authenticity, expiration, and revocation status without mutating state.
   * @param {string|Object} tokenOrId
   * @returns {{valid: boolean, reason?: string, token?: Object}}
   */
  verifyToken(tokenOrId) {
    let token = null;

    if (typeof tokenOrId === 'string') {
      token = this.activeBrokerTokens.get(tokenOrId);
    } else if (tokenOrId && typeof tokenOrId === 'object') {
      token = tokenOrId.tokenId ? this.activeBrokerTokens.get(tokenOrId.tokenId) || tokenOrId : tokenOrId;
    }

    if (!token || !token.tokenId) {
      return { valid: false, reason: 'TOKEN_NOT_FOUND' };
    }

    if (this.revokedTokens.has(token.tokenId)) {
      return { valid: false, reason: 'TOKEN_REVOKED' };
    }

    if (new Date(token.expiresAt).getTime() < Date.now()) {
      return { valid: false, reason: 'TOKEN_EXPIRED' };
    }

    if (token.signature && !this._verifySignature(token)) {
      return { valid: false, reason: 'INVALID_SIGNATURE' };
    }

    return { valid: true, token };
  }

  /**
   * Traces delegation chain back to root parent token.
   * @param {string} tokenId
   * @returns {Array<Object>} Lineage array of tokens.
   */
  getDelegationChain(tokenId) {
    const chain = [];
    let currentId = tokenId;

    while (currentId) {
      const token = this.activeBrokerTokens.get(currentId);
      if (token) {
        chain.unshift(token);
        currentId = token.parentTokenId;
      } else {
        break;
      }
    }

    return chain;
  }

  /**
   * Checks if capability is registered.
   * @param {string} capabilityId
   * @returns {boolean}
   */
  hasCapability(capabilityId) {
    return this.contracts.has(capabilityId);
  }

  /**
   * Retrieves registered contract for capability.
   * @param {string} capabilityId
   * @returns {Object|null}
   */
  getContract(capabilityId) {
    return this.contracts.get(capabilityId) || null;
  }

  /**
   * Generates HMAC-SHA256 signature for token payload.
   * @private
   */
  _generateSignature(token) {
    const payload = `${token.tokenId}:${token.capabilityId}:${token.tenantId}:${token.expiresAt}:${token.securityLevel}`;
    return crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');
  }

  /**
   * Verifies HMAC-SHA256 signature of token payload.
   * @private
   */
  _verifySignature(token) {
    const expected = this._generateSignature(token);
    return token.signature === expected;
  }
}

module.exports = CapabilityBrokerEngine;
