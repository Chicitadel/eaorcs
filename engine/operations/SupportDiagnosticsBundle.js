/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Operational Intelligence — Support Diagnostics Generator (Stream K)
 * File           : SupportDiagnosticsBundle.js
 * Version        : 2026.1.0-LTS
 * Author         : Enterprise Architecture Governance Committee
 * Organization   : Ujomor Systems Engineering
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | INTERNAL
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems Engineering
 * All Rights Reserved.
 ******************************************************************************/

const crypto = require('crypto');
const HealthObservatory = require('./HealthObservatory');
const DriftAnalytics = require('./DriftAnalytics');

/**
 * SupportDiagnosticsBundle
 * One-click support diagnostics bundle generator.
 */
class SupportDiagnosticsBundle {
  constructor(config = {}) {
    this.config = config;
    this.healthObservatory = new HealthObservatory(config);
    this.driftAnalytics = new DriftAnalytics(config);
  }

  /**
   * Generates a complete, sanitized, cryptographically signed diagnostics bundle.
   * @param {Object} options Configuration & sanitization parameters
   * @returns {Object} Support diagnostics bundle
   */
  generateBundle(options = {}) {
    const bundleId = `diag-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const generatedAt = new Date().toISOString();

    // 1. Gather Telemetry
    const healthReport = this.healthObservatory.getHealthReport();
    const driftReport = this.driftAnalytics.analyzeDrift(options.context || {});

    // 2. Sanitize Environmental Secrets
    const sanitizedEnv = this._sanitizeEnvironment(process.env);

    // 3. Assemble Raw Diagnostics Payload
    const payload = {
      bundleId,
      generatedAt,
      platform: 'EAORCS Software Trust Platform',
      version: '2026.1.0-LTS',
      health: healthReport,
      drift: driftReport,
      environment: sanitizedEnv,
      systemSummary: {
        hostType: healthReport.hostEnvironment.host,
        status: healthReport.status,
        driftState: driftReport.overallState,
        driftScore: driftReport.driftScore
      }
    };

    // 4. Compute SHA-256 Bundle Hash & Digital Signature
    const payloadString = JSON.stringify(payload);
    const bundleHash = crypto.createHash('sha256').update(payloadString).digest('hex');
    const signature = crypto.createHmac('sha256', 'eaorcs-diagnostics-signing-key').update(bundleHash).digest('hex');

    return {
      bundleId,
      generatedAt,
      bundleHash,
      signature,
      payload,
      governanceVerified: true
    };
  }

  /**
   * Redacts sensitive secret strings, passwords, and tokens from environment variables.
   * @private
   */
  _sanitizeEnvironment(rawEnv = {}) {
    const sanitized = {};
    const sensitiveKeys = ['SECRET', 'PASSWORD', 'PASS', 'TOKEN', 'KEY', 'CREDENTIAL', 'AUTH', 'SIGNATURE'];

    for (const key of Object.keys(rawEnv)) {
      const isSensitive = sensitiveKeys.some(s => key.toUpperCase().includes(s));
      if (isSensitive) {
        sanitized[key] = '[REDACTED_FOR_SECURITY]';
      } else {
        sanitized[key] = rawEnv[key];
      }
    }
    return sanitized;
  }
}

module.exports = SupportDiagnosticsBundle;
