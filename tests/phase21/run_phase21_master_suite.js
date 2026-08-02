'use strict';

/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Tests
 * File           : tests/phase21/run_phase21_master_suite.js
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

const ContinuousGovernanceScorecard = require('../../engine/operations/ContinuousGovernanceScorecard');
const BlueprintConformanceAuditor = require('../../engine/operations/BlueprintConformanceAuditor');
const Phase21SustainedValidationOrchestrator = require('../../engine/audit/Phase21SustainedValidationOrchestrator');

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${name} — ${e.message}`);
      failed++;
    }
  }

  console.log('===========================================================');
  console.log(' Phase 21 MASTER TEST SUITE - Continuous Governance');
  console.log('===========================================================');

  await test('Continuous Governance Scorecard execution', async () => {
    const engine = new ContinuousGovernanceScorecard();
    const result = await engine.run();
    if (result.scorecardType !== 'CONTINUOUS_GOVERNANCE_SCORECARD') throw new Error('Invalid scorecardType');
    if (result.overallGovernanceScorePercent !== 100) throw new Error('Overall score not 100');
    if (result.status !== 'EXCELLENT') throw new Error('Status not EXCELLENT');
  });

  await test('Blueprint Conformance Auditor execution', async () => {
    const engine = new BlueprintConformanceAuditor();
    const result = await engine.run();
    if (result.auditorType !== 'BLUEPRINT_CONFORMANCE_AUDITOR') throw new Error('Invalid auditorType');
    if (result.auditedBoundedContextsCount !== 8) throw new Error('Invalid contexts count');
    if (result.conformanceVerdict !== 'FULLY_CONFORMANT') throw new Error('Verdict not FULLY_CONFORMANT');
  });

  await test('Phase21 Sustained Validation Orchestrator execution', async () => {
    const engine = new Phase21SustainedValidationOrchestrator();
    const result = await engine.run();
    if (result.phase21Verdict !== 'PHASE_21_SUSTAINED_OPERATIONAL_VALIDATION_COMPLETE') throw new Error('Verdict mismatch');
    if (result.passedStreams !== 8) throw new Error('Streams passed not 8');
    if (result.overallStatus !== 'SUSTAINED_OPERATIONAL_VALIDATION_COMPLETE') throw new Error('Status mismatch');
  });

  console.log('===========================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('===========================================================');
  if (failed > 0) process.exit(1);
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
