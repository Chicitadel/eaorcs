/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 26 Master Test Suite
 * File           : tests/phase26/run_phase26_master_suite.js
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
'use strict';

const GoToMarketReadinessEngine = require('../../engine/operations/GoToMarketReadinessEngine.js');
const CommercialLaunchGateVerifier = require('../../engine/operations/CommercialLaunchGateVerifier.js');
const Phase26CommercialLaunchOrchestrator = require('../../engine/audit/Phase26CommercialLaunchOrchestrator.js');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('--- Executing Phase 26 Master Test Suite ---');
  
  await test('GoToMarketReadinessEngine Validation', async () => {
    const engine = new GoToMarketReadinessEngine();
    const result = await engine.run();
    if (result.engineType !== 'GO_TO_MARKET_READINESS_ENGINE') throw new Error('Invalid engineType');
    if (result.commitSha !== 'd9e5201a9f23c51085920312') throw new Error('Invalid commitSha');
    if (result.launchGatesVerifiedCount !== 11) throw new Error('Invalid gates count');
    if (result.commercialLaunchVerdict !== 'READY_FOR_COMMERCIAL_LAUNCH') throw new Error('Invalid verdict');
    if (result.status !== 'LAUNCH_READY') throw new Error('Invalid status');
  });

  await test('CommercialLaunchGateVerifier Validation', async () => {
    const verifier = new CommercialLaunchGateVerifier();
    const result = await verifier.run();
    if (result.verifierType !== 'COMMERCIAL_LAUNCH_GATE_VERIFIER') throw new Error('Invalid verifierType');
    if (result.gatesAuditedCount !== 11) throw new Error('Invalid audited count');
    if (result.passedGatesCount !== 11) throw new Error('Invalid passed count');
    if (result.verifierVerdict !== '100% COMMERCIAL_GATES_PASSED') throw new Error('Invalid verdict');
    if (result.status !== 'PASSED') throw new Error('Invalid status');
  });

  await test('Phase26CommercialLaunchOrchestrator Validation', async () => {
    const orchestrator = new Phase26CommercialLaunchOrchestrator();
    const result = await orchestrator.run();
    if (result.phase !== 'PHASE_26') throw new Error('Invalid phase');
    if (result.totalStreams !== 8) throw new Error('Invalid totalStreams');
    if (result.passedStreams !== 8) throw new Error('Invalid passedStreams');
    if (result.commercialLaunchScorePercent !== 100) throw new Error('Invalid score percent');
    if (result.overallStatus !== 'COMMERCIAL_LAUNCH_READINESS_COMPLETE') throw new Error('Invalid overallStatus');
    if (result.phase26Verdict !== 'PHASE_26_COMMERCIAL_LAUNCH_READINESS_COMPLETE') throw new Error('Invalid phase26Verdict');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}
runTests().catch(e => { console.error(e); process.exit(1); });
