/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Operational Intelligence — Master Controller (Stream K)
 * File           : OperationalIntelligenceEngine.js
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

const HealthObservatory = require('./HealthObservatory');
const DriftAnalytics = require('./DriftAnalytics');
const AutoRepairAdvisor = require('./AutoRepairAdvisor');
const SupportDiagnosticsBundle = require('./SupportDiagnosticsBundle');

/**
 * OperationalIntelligenceEngine
 * Master Operational Controller for Stream K.
 */
class OperationalIntelligenceEngine {
  constructor(config = {}) {
    this.config = config;
    this.healthObservatory = new HealthObservatory(config);
    this.driftAnalytics = new DriftAnalytics(config);
    this.autoRepairAdvisor = new AutoRepairAdvisor(config);
    this.diagnosticsBundle = new SupportDiagnosticsBundle(config);
  }

  /**
   * Executes complete operational intelligence diagnosis across all subsystems.
   * @returns {Object} Comprehensive operational status
   */
  runFullDiagnostics() {
    const health = this.healthObservatory.getHealthReport();
    const drift = this.driftAnalytics.analyzeDrift();
    const repairPlan = this.autoRepairAdvisor.generateRepairPlan(drift, health);

    return {
      engine: 'Stream K Operational Intelligence Engine',
      timestamp: new Date().toISOString(),
      overallStatus: health.status,
      driftState: drift.overallState,
      driftScore: drift.driftScore,
      health,
      drift,
      repairPlan
    };
  }

  /**
   * Generates a self-healing repair plan and attempts auto-remediation.
   * @param {Object} options Auto-repair options
   * @returns {Object} Execution outcome
   */
  triggerSelfHealing(options = { dryRun: true }) {
    const health = this.healthObservatory.getHealthReport();
    const drift = this.driftAnalytics.analyzeDrift();
    const repairPlan = this.autoRepairAdvisor.generateRepairPlan(drift, health);

    return this.autoRepairAdvisor.executeAutoRepair(repairPlan, options);
  }

  /**
   * Exports an encrypted & signed support diagnostics bundle.
   * @param {Object} options Export options
   * @returns {Object} Diagnostics bundle
   */
  exportDiagnosticsBundle(options = {}) {
    return this.diagnosticsBundle.generateBundle(options);
  }
}

module.exports = OperationalIntelligenceEngine;
