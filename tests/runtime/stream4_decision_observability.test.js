/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Stream 4 Decision Center & Observatory Unit Test Suite
 * File           : stream4_decision_observability.test.js
 * Version        : 2026.2.0-LTS
 * Author         : Quality Assurance & Engineering Governance
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
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

const assert = require('assert');
const ExecutiveDecisionCenterEngine = require('../../engine/decision/ExecutiveDecisionCenterEngine');
const PlatformHealthObservatoryEngine = require('../../engine/observability/PlatformHealthObservatoryEngine');

async function runStream4TestSuite() {
  console.log('================================================================');
  console.log('  STREAM 4: EXECUTIVE DECISION CENTER & OBSERVATORY UNIT TESTS  ');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: Executive Decision Center Action Types & Dual Control
  // --------------------------------------------------------------------------
  console.log('[1] Testing Executive Decision Center - 6 Action Types & Authorization...');
  const decisionEngine = new ExecutiveDecisionCenterEngine();

  const supportedActions = decisionEngine.getSupportedActions();
  assert.strictEqual(supportedActions.length, 6);
  assert.ok(supportedActions.includes('APPROVE'));
  assert.ok(supportedActions.includes('DEFER'));
  assert.ok(supportedActions.includes('ACCEPT_RISK'));
  assert.ok(supportedActions.includes('REJECT_DEPLOYMENT'));
  assert.ok(supportedActions.includes('ALLOCATE_BUDGET'));
  assert.ok(supportedActions.includes('ASSIGN_REMEDIATION'));

  for (const action of supportedActions) {
    const res = decisionEngine.authorizeExecutiveDecision({
      actionType: action,
      proposalId: `PROP-TEST-${action}`,
      executiveRole: 'CISO',
      evidenceRefs: [`EVID-${action}-001`]
    });
    assert.ok(res);
    assert.strictEqual(res.actionType, action);
    assert.strictEqual(res.dualControlValidated, true);
    assert.ok(res.digitalSignature);
    assert.ok(res.ledgerHash);
  }
  console.log('    ✓ All 6 action types authorized successfully.');

  // --------------------------------------------------------------------------
  // TEST 2: Evidence Linkage & Dual-Control Validation Rules
  // --------------------------------------------------------------------------
  console.log('[2] Testing Evidence Linkage & Dual-Control (4-eye) Validation...');
  const customDecision = decisionEngine.authorizeExecutiveDecision({
    decisionType: 'ACCEPT_RISK',
    proposalId: 'PROP-RISK-ACCEPTANCE-001',
    executiveRole: 'CHIEF_RISK_OFFICER',
    executiveId: 'CRO-001',
    evidenceRefs: [
      'EVID-RISK-ASSESSMENT-2026',
      { id: 'EVID-PEN-TEST', type: 'SECURITY_REPORT', uri: 'https://security.internal/reports/pen-test-q3.pdf' }
    ],
    secondarySigner: {
      userId: 'CISO-002',
      role: 'CHIEF_INFORMATION_SECURITY_OFFICER',
      notes: 'Secondary security review confirmed'
    },
    justification: 'Accepting low-impact legacy API risk for 30 days pending refactor'
  });

  assert.strictEqual(customDecision.evidenceRefsCount, 2);
  assert.strictEqual(customDecision.signOffCount, 2);
  assert.strictEqual(customDecision.signers[0].signerId, 'CRO-001');
  assert.strictEqual(customDecision.signers[1].signerId, 'CISO-002');
  console.log('    ✓ Evidence attachment linkage and dual-control sign-off validated.');

  // --------------------------------------------------------------------------
  // TEST 3: Cryptographic Audit Ledger Integrity Verification
  // --------------------------------------------------------------------------
  console.log('[3] Testing Audit Ledger Chain Integrity...');
  const integrityResult = decisionEngine.verifyLedgerIntegrity();
  assert.strictEqual(integrityResult.valid, true);
  assert.ok(integrityResult.totalBlocks >= 7); // Genesis + 6 actions + 1 custom
  console.log(`    ✓ Audit ledger integrity verified across ${integrityResult.totalBlocks} blocks.`);

  // --------------------------------------------------------------------------
  // TEST 4: Platform Health Observatory 7 Telemetry Pillars & Scorecard
  // --------------------------------------------------------------------------
  console.log('[4] Testing Platform Health Observatory - 7 Pillars Telemetry Scorecard...');
  const observatory = new PlatformHealthObservatoryEngine();

  const scorecard = observatory.generateHealthScorecard();
  assert.strictEqual(scorecard.status, 'HEALTHY');
  assert.ok(scorecard.overallHealthScore >= 95);
  assert.strictEqual(scorecard.evaluatedPillarsCount, 7);
  assert.ok(scorecard.pillars.stk_plugin_health);
  assert.ok(scorecard.pillars.event_propagation_latency);
  assert.ok(scorecard.pillars.graph_consistency);
  assert.ok(scorecard.pillars.scoring_integrity);
  assert.ok(scorecard.pillars.policy_execution_metrics);
  assert.ok(scorecard.pillars.api_health);
  assert.ok(scorecard.pillars.marketplace_integrity);
  console.log(`    ✓ Scorecard generated with Overall Score: ${scorecard.overallHealthScore} (${scorecard.status}).`);

  // --------------------------------------------------------------------------
  // TEST 5: Telemetry Updates & Incident Triggering
  // --------------------------------------------------------------------------
  console.log('[5] Testing Observatory Telemetry Ingestion & Real-Time Incident Triggers...');
  let incidentFired = null;
  observatory.registerIncidentListener(inc => {
    incidentFired = inc;
  });

  // Inject critical graph cycle telemetry
  observatory.recordTelemetry('graph_consistency', { cyclesDetected: 2 });
  const activeIncidents = observatory.getActiveIncidents();

  assert.ok(activeIncidents.length > 0);
  assert.strictEqual(activeIncidents[0].pillar, 'graph_consistency');
  assert.strictEqual(activeIncidents[0].severity, 'CRITICAL');
  assert.ok(incidentFired);
  assert.strictEqual(incidentFired.incidentId, activeIncidents[0].incidentId);

  // Resolve incident
  const resolved = observatory.resolveIncident(activeIncidents[0].incidentId, 'Graph cycle auto-repaired');
  assert.strictEqual(resolved, true);
  assert.strictEqual(observatory.getActiveIncidents().length, 0);
  console.log('    ✓ Real-time incident triggering, listener notification, and resolution PASSED.');

  console.log('\n================================================================');
  console.log('  STREAM 4 TESTS COMPLETED SUCCESSFULLY WITH 100% VERIFICATION  ');
  console.log('================================================================\n');
}

if (require.main === module) {
  runStream4TestSuite().catch(err => {
    console.error('❌ Stream 4 Test Suite Failed:', err);
    process.exit(1);
  });
}

module.exports = { runStream4TestSuite };
