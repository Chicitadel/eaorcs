'use strict';
/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : GovernanceAnalytics
 * File           : tests/phase19/stream_o7_governance_analytics.test.js
 * Version        : 2026.17.0
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const EvidenceDriftDetector = require('../../engine/governance/EvidenceDriftDetector');
const PolicyViolationMonitor = require('../../engine/governance/PolicyViolationMonitor');
const OperationalRegressionEngine = require('../../engine/governance/OperationalRegressionEngine');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('Running Phase 19 Stream O7 Governance Analytics Tests...\n');

  await test('EvidenceDriftDetector executes correctly', async () => {
    const detector = new EvidenceDriftDetector();
    const result = await detector.run();
    
    if (result.detectorType !== 'EVIDENCE_DRIFT_DETECTION') throw new Error('Invalid detectorType');
    if (result.driftingStreams !== 0) throw new Error('driftingStreams should be 0');
    if (result.staleStreams !== 0) throw new Error('staleStreams should be 0');
    if (result.automatedDriftScanning !== true) throw new Error('automatedDriftScanning should be true');
    if (result.totalStreams < 15) throw new Error('totalStreams should be at least 15');
    if (result.driftAnalysis.length < 15) throw new Error('driftAnalysis array should have at least 15 entries');
  });

  await test('PolicyViolationMonitor executes correctly', async () => {
    const monitor = new PolicyViolationMonitor();
    const result = await monitor.run();
    
    if (result.monitorType !== 'POLICY_VIOLATION_MONITORING') throw new Error('Invalid monitorType');
    if (result.violatingPolicies !== 0) throw new Error('violatingPolicies should be 0');
    if (result.totalPolicies < 10) throw new Error('totalPolicies should be at least 10');
    
    const compliantCount = result.policies.filter(p => p.status === 'COMPLIANT').length;
    if (compliantCount < 10) throw new Error('At least 10 policies should be COMPLIANT');
    
    if (result.violationHistory.length < 30) throw new Error('violationHistory should have at least 30 entries');
    const totalViolations = result.violationHistory.reduce((acc, v) => acc + v.violationsDetected, 0);
    if (totalViolations !== 0) throw new Error('Total violations in history should be 0');
  });

  await test('OperationalRegressionEngine executes correctly', async () => {
    const engine = new OperationalRegressionEngine();
    const result = await engine.run();
    
    if (result.engineType !== 'OPERATIONAL_REGRESSION_DETECTION') throw new Error('Invalid engineType');
    if (result.regressionsDetected !== 0) throw new Error('regressionsDetected should be 0');
    if (result.totalChecks < 8) throw new Error('totalChecks should be at least 8');
    
    const stableCount = result.regressionChecks.filter(c => c.trend === 'STABLE').length;
    if (stableCount < 8) throw new Error('At least 8 metric checks should be STABLE');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
