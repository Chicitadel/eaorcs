'use strict';

/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Master Suite Runner
 * File           : tests/phase25/run_phase25_master_suite.js
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

const BlueprintToRuntimeGovernanceGraphEngine = require('../../engine/operations/BlueprintToRuntimeGovernanceGraphEngine');
const UnifiedTraceabilityCorrelationGraphV2 = require('../../engine/operations/UnifiedTraceabilityCorrelationGraphV2');
const Phase25LiveSignalSubstantiationOrchestrator = require('../../engine/audit/Phase25LiveSignalSubstantiationOrchestrator');

async function runTests() {
  let passed = 0; let failed = 0;
  
  async function test(name, fn) {
    try { 
      await fn(); 
      console.log(`  ✅ PASS: ${name}`); 
      passed++; 
    }
    catch(e) { 
      console.error(`  ❌ FAIL: ${name} — ${e.message}`); 
      failed++; 
    }
  }
  
  console.log('--- Executing Phase 25 Master Test Suite ---\n');

  await test('BlueprintToRuntimeGovernanceGraphEngine produces correct results', async () => {
    const engine = new BlueprintToRuntimeGovernanceGraphEngine();
    const result = await engine.run();
    if (result.engineType !== 'BLUEPRINT_TO_RUNTIME_GOVERNANCE_GRAPH_ENGINE') throw new Error('Invalid engineType');
    if (result.commitSha !== 'c8d4190f8e12b40974819201') throw new Error('Invalid commitSha');
    if (result.correlatedGraphNodesCount !== 24820) throw new Error('Invalid correlatedGraphNodesCount');
    if (result.correlatedGraphEdgesCount !== 88920) throw new Error('Invalid correlatedGraphEdgesCount');
    if (result.blueprintToRuntimeTraceabilityScorePercent !== 100) throw new Error('Invalid traceability score');
    if (result.status !== 'INTELLIGENT') throw new Error('Invalid status');
  });

  await test('UnifiedTraceabilityCorrelationGraphV2 produces correct results', async () => {
    const engine = new UnifiedTraceabilityCorrelationGraphV2();
    const result = await engine.run();
    if (result.graphType !== 'UNIFIED_TRACEABILITY_CORRELATION_GRAPH_V2') throw new Error('Invalid graphType');
    if (result.mappedBoundedContextsCount !== 8) throw new Error('Invalid mappedBoundedContextsCount');
    if (result.architecturalViolationsCount !== 0) throw new Error('Invalid architecturalViolationsCount');
    if (result.traceabilityVerdict !== 'FULLY_TRACEABLE_BLUEPRINT_TO_RUNTIME') throw new Error('Invalid traceabilityVerdict');
    if (result.status !== 'ALIGNED') throw new Error('Invalid status');
  });

  await test('Phase25LiveSignalSubstantiationOrchestrator asserts final verdict', async () => {
    const engine = new Phase25LiveSignalSubstantiationOrchestrator();
    const result = await engine.run();
    if (result.phase !== 'PHASE_25') throw new Error('Invalid phase');
    if (result.totalStreams !== 8) throw new Error('Invalid totalStreams');
    if (result.passedStreams !== 8) throw new Error('Invalid passedStreams');
    if (result.liveSignalSubstantiationScorePercent !== 100) throw new Error('Invalid score');
    if (result.overallStatus !== 'LIVE_SIGNAL_SUBSTANTIATION_COMPLETE') throw new Error('Invalid overallStatus');
    if (result.phase25Verdict !== 'PHASE_25_LIVE_SIGNAL_SUBSTANTIATION_COMPLETE') throw new Error('Assertion failed: Invalid phase25Verdict');
    if (!Array.isArray(result.streams) || result.streams.length !== 8) throw new Error('Invalid streams array');
    
    result.streams.forEach(s => {
      if (s.status !== 'VERIFIED') throw new Error(`Stream ${s.id} not VERIFIED`);
    });
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
