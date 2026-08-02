/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Tests
 * File           : tests/phase22/run_phase22_master_suite.js
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

const ContinuousGovernanceScorecardV2 = require('../../engine/operations/ContinuousGovernanceScorecardV2');
const BlueprintArchitectureDriftAuditor = require('../../engine/operations/BlueprintArchitectureDriftAuditor');
const Phase22ContinuousOperationalProofsOrchestrator = require('../../engine/audit/Phase22ContinuousOperationalProofsOrchestrator');

async function runTests() {
  let passed = 0; let failed = 0;

  async function test(name, fn) {
    try { 
        await fn(); 
        console.log(`  ✅ PASS: ${name}`); 
        passed++; 
    } catch(e) { 
        console.error(`  ❌ FAIL: ${name} — ${e.message}`); 
        failed++; 
    }
  }

  console.log('===========================================================');
  console.log(' Phase 22 Master Test Suite (Streams R1-R9)');
  console.log('===========================================================');

  await test('ContinuousGovernanceScorecardV2 execution and validation', async () => {
      const engine = new ContinuousGovernanceScorecardV2();
      const res = await engine.run();
      if (res.scorecardType !== 'CONTINUOUS_GOVERNANCE_SCORECARD_V2') throw new Error('Invalid scorecardType');
      if (res.blueprintConformanceScorePercent !== 100) throw new Error('Invalid blueprintConformanceScorePercent');
      if (res.implementationIntegrityScorePercent !== 100) throw new Error('Invalid implementationIntegrityScorePercent');
      if (res.operationalEvidenceScorePercent !== 100) throw new Error('Invalid operationalEvidenceScorePercent');
      if (res.overallGovernanceScorePercent !== 100) throw new Error('Invalid overallGovernanceScorePercent');
      if (res.status !== 'EXCELLENT') throw new Error('Invalid status');
  });

  await test('BlueprintArchitectureDriftAuditor execution and validation', async () => {
      const engine = new BlueprintArchitectureDriftAuditor();
      const res = await engine.run();
      if (res.auditorType !== 'BLUEPRINT_ARCHITECTURE_DRIFT_AUDITOR') throw new Error('Invalid auditorType');
      if (res.auditedBoundedContextsCount !== 8) throw new Error('Invalid auditedBoundedContextsCount');
      if (res.architecturalViolationsCount !== 0) throw new Error('Invalid architecturalViolationsCount');
      if (res.conformanceVerdict !== 'FULLY_CONFORMANT') throw new Error('Invalid conformanceVerdict');
      if (res.status !== 'ALIGNED') throw new Error('Invalid status');
  });

  await test('Phase22ContinuousOperationalProofsOrchestrator validation', async () => {
      const engine = new Phase22ContinuousOperationalProofsOrchestrator();
      const res = await engine.run();
      if (res.phase !== 'PHASE_22') throw new Error('Invalid phase');
      if (res.totalStreams !== 8) throw new Error('Invalid totalStreams');
      if (res.passedStreams !== 8) throw new Error('Invalid passedStreams');
      if (res.continuousOperationalProofScorePercent !== 100) throw new Error('Invalid score percent');
      if (res.overallStatus !== 'CONTINUOUS_OPERATIONAL_PROOFS_COMPLETE') throw new Error('Invalid overallStatus');
      if (res.phase22Verdict !== 'PHASE_22_CONTINUOUS_OPERATIONAL_PROOFS_COMPLETE') throw new Error('Invalid verdict');
      
      console.log('\n--- Stream Verification Table ---');
      res.streams.forEach(s => {
          console.log(`[${s.id}] ${s.name.padEnd(50, '.')} ${s.status}`);
      });
      console.log('---------------------------------');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
