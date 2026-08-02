/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 23 Master Test Suite
 * File           : tests/phase23/run_phase23_master_suite.js
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

const EvidenceGraphCorrelationEngine = require('../../engine/operations/EvidenceGraphCorrelationEngine');
const BlueprintImplementationCorrelationGraph = require('../../engine/operations/BlueprintImplementationCorrelationGraph');
const Phase23EvidenceLakeOrchestrator = require('../../engine/audit/Phase23EvidenceLakeOrchestrator');

async function runTests() {
  let passed = 0;
  let failed = 0;
  
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

  console.log('--- Phase 23 Stream L9 & Master Orchestrator Validation ---');
  
  await test('EvidenceGraphCorrelationEngine Validation', async () => {
    const engine = new EvidenceGraphCorrelationEngine();
    const result = await engine.run();
    if (result.engineType !== 'EVIDENCE_GRAPH_CORRELATION_ENGINE') throw new Error('Invalid engineType');
    if (result.correlatedGraphNodesCount !== 12480) throw new Error('Invalid nodes count');
    if (result.status !== 'CORRELATED') throw new Error('Invalid status');
  });

  await test('BlueprintImplementationCorrelationGraph Validation', async () => {
    const graph = new BlueprintImplementationCorrelationGraph();
    const result = await graph.run();
    if (result.graphType !== 'BLUEPRINT_IMPLEMENTATION_CORRELATION_GRAPH') throw new Error('Invalid graphType');
    if (result.correlationVerdict !== 'FULLY_TRACEABLE') throw new Error('Invalid verdict');
    if (result.status !== 'ALIGNED') throw new Error('Invalid status');
  });

  await test('Phase23EvidenceLakeOrchestrator Validation', async () => {
    const orchestrator = new Phase23EvidenceLakeOrchestrator();
    const result = await orchestrator.run();
    if (result.phase23Verdict !== 'PHASE_23_EVIDENCE_LAKE_AND_PROVENANCE_BINDING_COMPLETE') throw new Error('Invalid phase23Verdict');
    if (result.overallStatus !== 'EVIDENCE_LAKE_AND_PROVENANCE_BINDING_COMPLETE') throw new Error('Invalid overallStatus');
    if (result.totalStreams !== 8 || result.passedStreams !== 8) throw new Error('Invalid stream counts');
    if (result.evidenceLakeIntegrityScorePercent !== 100) throw new Error('Invalid integrity score');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { 
  console.error(e); 
  process.exit(1); 
});
