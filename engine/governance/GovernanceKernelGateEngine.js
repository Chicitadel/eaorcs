/******************************************************************************
 * Project        : Air Roofers Platform Ecosystem
 * Module         : Default-Deny Governance Kernel Gate & Exception Engine
 * File           : engine/governance/GovernanceKernelGateEngine.js
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
 * - AR-STD-PKG-017
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

const crypto = require('crypto');

class GovernanceKernelGateEngine {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Evaluates governance clearance under default-deny model.
   * @param {Object} invocationContext 
   * @returns {Object} Evaluation verdict
   */
  evaluateClearance(invocationContext = {}) {
    const isAgpaKernel = invocationContext.invokedViaKernel === true;
    const hasException = Boolean(invocationContext.exceptionToken);

    if (isAgpaKernel) {
      return {
        verdict: 'APPROVED',
        mode: 'AGPA_KERNEL_INVARIANT',
        clearanceId: `gov_clr_${crypto.randomBytes(6).toString('hex')}`,
        timestamp: new Date().toISOString()
      };
    }

    if (hasException) {
      return this.validateException(invocationContext.exceptionToken);
    }

    // Default-Deny Block
    throw new Error(
      `[AR-STD-PKG-017 GOVERNANCE BLOCK] Direct packaging or distribution invocation outside AGPA Kernel is prohibited by default-deny architectural invariant.`
    );
  }

  /**
   * Validates a controlled governance exception token.
   * @param {Object} token 
   * @returns {Object} Exception clearance & certificate
   */
  validateException(token) {
    if (!token.approver || !token.justification || !token.expiresAt) {
      throw new Error('Invalid Governance Exception Token: Missing approver, justification, or expiration date.');
    }

    const expiresTime = new Date(token.expiresAt).getTime();
    if (Date.now() > expiresTime) {
      throw new Error(`Governance Exception Expired: Token expired at ${token.expiresAt}`);
    }

    const certificateId = `cert_exc_${crypto.randomBytes(8).toString('hex')}`;
    const certHash = crypto
      .createHash('sha256')
      .update(`${certificateId}:${token.approver}:${token.justification}`)
      .digest('hex');

    return {
      verdict: 'APPROVED_EXCEPTION',
      mode: 'AUDITED_OPERATIONAL_EXCEPTION',
      certificate: {
        certificateId,
        approver: token.approver,
        justification: token.justification,
        issuedAt: new Date().toISOString(),
        expiresAt: token.expiresAt,
        signature: certHash
      }
    };
  }
}

module.exports = GovernanceKernelGateEngine;
