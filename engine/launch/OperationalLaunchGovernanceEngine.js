/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : 5-Gate Operational Launch Readiness Governance Engine
 * File           : OperationalLaunchGovernanceEngine.js
 * Version        : 2026.2.0-LTS
 * Author         : Commercial Launch Authority & Enterprise Governance Council
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved & RATIFIED
 * - UAIGOS 3.0.0 Compliant — 5-Gate Launch Framework Enforced
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-53
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/* ============================================================
 * GATE DEFINITIONS
 * ============================================================ */

const GATE_DEFINITIONS = Object.freeze({
  GATE_1_TECHNICAL: {
    id: 'GATE_1_TECHNICAL',
    name: 'Technical Validation',
    description: 'Validates internal engineering completeness: regression tests, DRI score, API validation, integration suites, migration tests.',
    weight: 0.15,
    checkpoints: [
      'regression_tests_passing',
      'dri_score_100',
      'api_contract_validation',
      'integration_tests_passing',
      'migration_dry_run_verified',
      'architecture_freeze_ratified',
      'stk_control_plane_verified',
    ],
  },
  GATE_2_INDEPENDENT: {
    id: 'GATE_2_INDEPENDENT',
    name: 'Independent Validation',
    description: 'External third-party audits providing market credibility. Split into 8 measurable sub-gates.',
    weight: 0.30,
    // Sub-gate weights: Security(25%) + Architecture(20%) + Privacy(15%) + Supply Chain(10%) + Code Quality(10%) + Performance(10%) + Accessibility(5%) + Documentation(5%)
    subGates: {
      G2_SECURITY: {
        id: 'G2_SECURITY', label: 'Security Audit', weight: 0.25,
        checkpoints: ['pentest_completed', 'pentest_findings_remediated', 'pentest_retested'],
      },
      G2_ARCHITECTURE: {
        id: 'G2_ARCHITECTURE', label: 'Architecture Review', weight: 0.20,
        checkpoints: ['architecture_review_completed', 'adrs_independently_validated'],
      },
      G2_PRIVACY: {
        id: 'G2_PRIVACY', label: 'Privacy & Legal Review', weight: 0.15,
        checkpoints: ['gdpr_review_completed', 'data_map_approved', 'dpa_signed'],
      },
      G2_SUPPLY_CHAIN: {
        id: 'G2_SUPPLY_CHAIN', label: 'Supply Chain Verification', weight: 0.10,
        checkpoints: ['sbom_independently_verified', 'dependencies_cleared', 'zero_critical_cve'],
      },
      G2_CODE_QUALITY: {
        id: 'G2_CODE_QUALITY', label: 'Code Quality Assessment', weight: 0.10,
        checkpoints: ['sonarqube_gate_passed', 'technical_debt_ratio_below_5pct'],
      },
      G2_PERFORMANCE: {
        id: 'G2_PERFORMANCE', label: 'Independent Performance Benchmark', weight: 0.10,
        checkpoints: ['benchmark_10k_repositories_verified', 'sla_p99_independently_confirmed'],
      },
      G2_ACCESSIBILITY: {
        id: 'G2_ACCESSIBILITY', label: 'Accessibility Audit', weight: 0.05,
        checkpoints: ['wcag_aaa_audit_completed', 'screen_reader_tested'],
      },
      G2_DOCUMENTATION: {
        id: 'G2_DOCUMENTATION', label: 'Documentation Technical Review', weight: 0.05,
        checkpoints: ['docs_independently_reviewed', 'api_reference_complete_and_accurate'],
      },
    },
    // Flattened checkpoint list for backward-compatible evaluate()
    checkpoints: [
      'pentest_completed', 'pentest_findings_remediated', 'pentest_retested',
      'architecture_review_completed', 'adrs_independently_validated',
      'gdpr_review_completed', 'data_map_approved', 'dpa_signed',
      'sbom_independently_verified', 'dependencies_cleared', 'zero_critical_cve',
      'sonarqube_gate_passed', 'technical_debt_ratio_below_5pct',
      'benchmark_10k_repositories_verified', 'sla_p99_independently_confirmed',
      'wcag_aaa_audit_completed', 'screen_reader_tested',
      'docs_independently_reviewed', 'api_reference_complete_and_accurate',
    ],
  },
  GATE_3_CUSTOMER: {
    id: 'GATE_3_CUSTOMER',
    name: 'Customer Validation',
    description: 'Real-world pilot deployments producing structured evidence through an 8-stage pipeline per pilot.',
    weight: 0.25,
    // 8-stage evidence pipeline per pilot type
    pilotStages: [
      'REGISTERED',
      'DEPLOYMENT_SUCCESSFUL',
      'DAILY_USAGE_CONFIRMED',       // ≥5 consecutive days
      'ADMINISTRATOR_INTERVIEWED',   // Recorded session
      'EXECUTIVE_INTERVIEWED',       // Recorded session
      'USER_SATISFACTION_NPS_8',     // NPS ≥ 8
      'RENEWAL_INTENT_CONFIRMED',
      'REFERENCE_PERMISSION_GRANTED',
    ],
    checkpoints: [
      // SaaS Pilot evidence
      'saas_pilot_registered',
      'saas_deployment_successful',
      'saas_daily_usage_confirmed',
      'saas_administrator_interviewed',
      'saas_executive_interviewed',
      'saas_nps_above_8',
      'saas_renewal_intent_confirmed',
      'saas_reference_permission_granted',
      // Enterprise Pilot evidence
      'enterprise_pilot_registered',
      'enterprise_deployment_successful',
      'enterprise_daily_usage_confirmed',
      'enterprise_administrator_interviewed',
      'enterprise_executive_interviewed',
      'enterprise_nps_above_8',
      'enterprise_renewal_intent_confirmed',
      'enterprise_reference_permission_granted',
      // Government Pilot evidence
      'government_pilot_registered',
      'government_deployment_successful',
      'government_daily_usage_confirmed',
      'government_administrator_interviewed',
      'government_executive_interviewed',
      'government_nps_above_8',
      'government_renewal_intent_confirmed',
      'government_reference_permission_granted',
    ],
  },
  GATE_4_COMMERCIAL: {
    id: 'GATE_4_COMMERCIAL',
    name: 'Commercial Assets',
    description: 'All commercial launch assets must be production-ready.',
    weight: 0.15,
    checkpoints: [
      'product_website_live',
      'interactive_demo_available',
      'api_explorer_browsable',
      'documentation_searchable',
      'pricing_page_transparent',
      'marketplace_browsable',
      'sdk_examples_published',
      'training_materials_available',
    ],
  },
  GATE_5_OPERATIONAL: {
    id: 'GATE_5_OPERATIONAL',
    name: 'Operational Readiness',
    description: 'Support processes, incident response, release lifecycle, and DR playbooks in place.',
    weight: 0.15,
    checkpoints: [
      'support_process_defined',
      'incident_response_playbook',
      'release_management_process',
      'security_advisory_process',
      'version_lifecycle_policy',
      'deprecation_policy',
      'backup_policy',
      'disaster_recovery_playbook',
      'customer_communication_process',
      'public_roadmap_published',
    ],
  },
});

/* ============================================================
 * Gate 1 — Technical Validation Evaluator
 * ============================================================ */
class Gate1TechnicalValidation {
  evaluate(attestations = {}) {
    const checks = GATE_DEFINITIONS.GATE_1_TECHNICAL.checkpoints;
    const results = {};
    let passedCount = 0;

    for (const check of checks) {
      const passed = attestations[check] === true;
      results[check] = { passed, status: passed ? 'PASS' : 'PENDING' };
      if (passed) passedCount++;
    }

    const score = Math.round((passedCount / checks.length) * 100);
    return { gateId: 'GATE_1_TECHNICAL', score, passedCount, totalChecks: checks.length, results, passed: score === 100 };
  }
}

/* ============================================================
 * Gate 2 — Independent Validation Evaluator
 * ============================================================ */
class Gate2IndependentValidation {
  constructor() {
    this.auditLedger = [];
  }

  recordAuditAttestation(attestation) {
    if (!attestation.auditType || !attestation.auditedBy || !attestation.outcome) {
      throw new Error('Gate2IndependentValidation: auditType, auditedBy, and outcome are required.');
    }
    const record = {
      attestationId: crypto.randomUUID(),
      auditType: attestation.auditType,
      auditedBy: attestation.auditedBy,
      outcome: attestation.outcome,
      reportReference: attestation.reportReference || null,
      attestedAt: new Date().toISOString(),
      signature: crypto.createHash('sha256')
        .update(`${attestation.auditType}:${attestation.auditedBy}:${attestation.outcome}:${Date.now()}`)
        .digest('hex'),
    };
    this.auditLedger.push(record);
    return record;
  }

  evaluate(attestations = {}) {
    const checks = GATE_DEFINITIONS.GATE_2_INDEPENDENT.checkpoints;
    const results = {};
    let passedCount = 0;

    for (const check of checks) {
      const passed = attestations[check] === true;
      results[check] = { passed, status: passed ? 'PASS' : 'PENDING', attestationRequired: true };
      if (passed) passedCount++;
    }

    const score = Math.round((passedCount / checks.length) * 100);
    return {
      gateId: 'GATE_2_INDEPENDENT',
      score,
      passedCount,
      totalChecks: checks.length,
      results,
      auditLedgerSize: this.auditLedger.length,
      passed: score === 100,
      note: 'External audit attestations are required for full Gate 2 passage.',
    };
  }
}

/* ============================================================
 * Gate 3 — Customer Validation Pilot Manager
 * ============================================================ */
class Gate3CustomerValidation {
  constructor() {
    this.pilotRegistry = new Map();
  }

  registerPilot(pilot) {
    const pilotTypes = ['SAAS', 'ENTERPRISE', 'GOVERNMENT'];
    if (!pilot.pilotType || !pilotTypes.includes(pilot.pilotType.toUpperCase())) {
      throw new Error(`Gate3CustomerValidation: pilotType must be one of: ${pilotTypes.join(', ')}`);
    }

    const record = {
      pilotId: crypto.randomUUID(),
      pilotType: pilot.pilotType.toUpperCase(),
      organizationAlias: pilot.organizationAlias || `Pilot-${pilot.pilotType}`,
      startDate: pilot.startDate || new Date().toISOString().slice(0, 10),
      status: 'ACTIVE',
      metrics: {
        onboardingTimeMinutes: null,
        completionRatePercent: null,
        confusionPointsIdentified: [],
        deploymentSuccess: null,
        reportUsefulnessScore: null,
        executiveComprehensionScore: null,
      },
    };

    this.pilotRegistry.set(record.pilotId, record);
    return record;
  }

  recordPilotOutcome(pilotId, metrics) {
    const pilot = this.pilotRegistry.get(pilotId);
    if (!pilot) throw new Error(`Gate3CustomerValidation: Pilot ${pilotId} not found.`);

    Object.assign(pilot.metrics, metrics);
    pilot.status = 'COMPLETED';
    pilot.completedAt = new Date().toISOString();
    return pilot;
  }

  evaluate(attestations = {}) {
    const checks = GATE_DEFINITIONS.GATE_3_CUSTOMER.checkpoints;
    const results = {};
    let passedCount = 0;

    for (const check of checks) {
      const passed = attestations[check] === true;
      results[check] = { passed, status: passed ? 'PASS' : 'PENDING' };
      if (passed) passedCount++;
    }

    const score = Math.round((passedCount / checks.length) * 100);
    const activePilots = [...this.pilotRegistry.values()].filter(p => p.status === 'ACTIVE').length;
    const completedPilots = [...this.pilotRegistry.values()].filter(p => p.status === 'COMPLETED').length;

    return {
      gateId: 'GATE_3_CUSTOMER',
      score,
      passedCount,
      totalChecks: checks.length,
      results,
      pilotSummary: { activePilots, completedPilots, totalPilots: this.pilotRegistry.size },
      passed: score === 100,
    };
  }
}

/* ============================================================
 * Gate 4 — Commercial Assets Validator
 * ============================================================ */
class Gate4CommercialAssets {
  evaluate(attestations = {}) {
    const checks = GATE_DEFINITIONS.GATE_4_COMMERCIAL.checkpoints;
    const results = {};
    let passedCount = 0;

    const assetMetadata = {
      product_website_live:        { priority: 'CRITICAL', description: 'Professional positioning website live' },
      interactive_demo_available:  { priority: 'CRITICAL', description: 'No-install interactive demo environment' },
      api_explorer_browsable:      { priority: 'CRITICAL', description: 'Browsable OpenAPI 3.1 explorer' },
      documentation_searchable:    { priority: 'CRITICAL', description: 'Full-text searchable documentation portal' },
      pricing_page_transparent:    { priority: 'HIGH',     description: 'Transparent pricing and edition comparison' },
      marketplace_browsable:       { priority: 'HIGH',     description: 'Publicly browsable governance pack marketplace' },
      sdk_examples_published:      { priority: 'HIGH',     description: 'SDK with working code examples published' },
      training_materials_available:{ priority: 'MEDIUM',   description: 'Video tutorials and training guides available' },
    };

    for (const check of checks) {
      const passed = attestations[check] === true;
      results[check] = {
        passed,
        status: passed ? 'PASS' : 'PENDING',
        ...assetMetadata[check],
      };
      if (passed) passedCount++;
    }

    const score = Math.round((passedCount / checks.length) * 100);
    return {
      gateId: 'GATE_4_COMMERCIAL',
      score,
      passedCount,
      totalChecks: checks.length,
      results,
      criticalAssetsPending: Object.entries(results).filter(([, v]) => !v.passed && v.priority === 'CRITICAL').map(([k]) => k),
      passed: score === 100,
    };
  }
}

/* ============================================================
 * Gate 5 — Operational Readiness Manager
 * ============================================================ */
class Gate5OperationalReadiness {
  constructor() {
    this.playbooks = new Map();
  }

  registerPlaybook(playbook) {
    if (!playbook.type || !playbook.name) {
      throw new Error('Gate5OperationalReadiness: type and name are required.');
    }
    const record = {
      playbookId: crypto.randomUUID(),
      type: playbook.type,
      name: playbook.name,
      version: playbook.version || '1.0.0',
      owner: playbook.owner || 'Platform Operations',
      lastReviewed: playbook.lastReviewed || new Date().toISOString().slice(0, 10),
      status: 'ACTIVE',
    };
    this.playbooks.set(record.playbookId, record);
    return record;
  }

  evaluate(attestations = {}) {
    const checks = GATE_DEFINITIONS.GATE_5_OPERATIONAL.checkpoints;
    const results = {};
    let passedCount = 0;

    for (const check of checks) {
      const passed = attestations[check] === true;
      results[check] = { passed, status: passed ? 'PASS' : 'PENDING' };
      if (passed) passedCount++;
    }

    const score = Math.round((passedCount / checks.length) * 100);
    return {
      gateId: 'GATE_5_OPERATIONAL',
      score,
      passedCount,
      totalChecks: checks.length,
      results,
      registeredPlaybooks: this.playbooks.size,
      passed: score === 100,
    };
  }
}

/* ============================================================
 * OperationalLaunchGovernanceEngine — Master Engine
 * ============================================================ */
class OperationalLaunchGovernanceEngine {
  constructor(options = {}) {
    this.options = options;
    this.gate1 = new Gate1TechnicalValidation();
    this.gate2 = new Gate2IndependentValidation();
    this.gate3 = new Gate3CustomerValidation();
    this.gate4 = new Gate4CommercialAssets();
    this.gate5 = new Gate5OperationalReadiness();
  }

  /**
   * Evaluates all 5 launch gates against provided attestations.
   *
   * @param {object} attestations - Map of checkpoint keys to boolean values
   * @returns {object} Comprehensive 5-gate launch readiness report
   */
  evaluateAllGates(attestations = {}) {
    const g1 = this.gate1.evaluate(attestations);
    const g2 = this.gate2.evaluate(attestations);
    const g3 = this.gate3.evaluate(attestations);
    const g4 = this.gate4.evaluate(attestations);
    const g5 = this.gate5.evaluate(attestations);

    const gates = [g1, g2, g3, g4, g5];
    const weights = [0.15, 0.30, 0.25, 0.15, 0.15];
    const compositeScore = Math.round(
      gates.reduce((sum, g, i) => sum + (g.score * weights[i]), 0)
    );

    const allGatesPassed = gates.every(g => g.passed);
    const launchStatus = allGatesPassed ? 'LAUNCH_READY' :
      compositeScore >= 80 ? 'NEAR_LAUNCH_READY' :
      compositeScore >= 60 ? 'IN_PROGRESS' : 'GATES_BLOCKED';

    return {
      reportId: crypto.randomUUID(),
      evaluatedAt: new Date().toISOString(),
      compositeScore,
      launchStatus,
      allGatesPassed,
      gates: { GATE_1: g1, GATE_2: g2, GATE_3: g3, GATE_4: g4, GATE_5: g5 },
      blockers: gates.filter(g => !g.passed).map(g => ({ gateId: g.gateId, score: g.score })),
      recommendation: allGatesPassed
        ? 'All 5 gates cleared. Platform is cleared for commercial launch.'
        : `${gates.filter(g => !g.passed).length} gate(s) require attention before general availability.`,
    };
  }

  recordAuditAttestation(attestation) { return this.gate2.recordAuditAttestation(attestation); }
  registerCustomerPilot(pilot) { return this.gate3.registerPilot(pilot); }
  recordPilotOutcome(pilotId, metrics) { return this.gate3.recordPilotOutcome(pilotId, metrics); }
  registerOperationalPlaybook(playbook) { return this.gate5.registerPlaybook(playbook); }

  getEngineStatus() {
    return {
      initialized: true,
      gatesConfigured: 5,
      auditAttestations: this.gate2.auditLedger.length,
      customerPilots: this.gate3.pilotRegistry.size,
      operationalPlaybooks: this.gate5.playbooks.size,
    };
  }
}

module.exports = OperationalLaunchGovernanceEngine;
module.exports.OperationalLaunchGovernanceEngine = OperationalLaunchGovernanceEngine;
module.exports.GATE_DEFINITIONS = GATE_DEFINITIONS;
