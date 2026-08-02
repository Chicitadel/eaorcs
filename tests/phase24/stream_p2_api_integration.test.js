/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : API Integration Contract Verification
 * File           : tests/phase24/stream_p2_api_integration.test.js
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

const ContinuousApiContractExecutionEngine = require('../../engine/operations/ContinuousApiContractExecutionEngine');
const LiveEndpointCompatibilityMatrix = require('../../engine/operations/LiveEndpointCompatibilityMatrix');
const ContractDriftPreventionGraph = require('../../engine/operations/ContractDriftPreventionGraph');
const evidence = require('../../evidence/phase24_api_integration_evidence.json');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('ContinuousApiContractExecutionEngine executes successfully', async () => {
    const engine = new ContinuousApiContractExecutionEngine();
    const result = await engine.run();
    if (result.status !== 'EXECUTED') throw new Error('Status should be EXECUTED');
    if (result.schemaConformanceRatePercent !== 100) throw new Error('Conformance rate should be 100');
  });

  await test('LiveEndpointCompatibilityMatrix executes successfully', async () => {
    const matrix = new LiveEndpointCompatibilityMatrix();
    const result = await matrix.run();
    if (result.status !== 'COMPATIBLE') throw new Error('Status should be COMPATIBLE');
    if (result.backwardCompatibilityScorePercent !== 100) throw new Error('Score should be 100');
  });

  await test('ContractDriftPreventionGraph executes successfully', async () => {
    const graph = new ContractDriftPreventionGraph();
    const result = await graph.run();
    if (result.status !== 'ZERO_DRIFT') throw new Error('Status should be ZERO_DRIFT');
    if (result.monitoredSchemasCount !== 16) throw new Error('Count should be 16');
  });

  await test('Evidence is verified', async () => {
    if (evidence.status !== 'VERIFIED') throw new Error('Evidence status should be VERIFIED');
    if (evidence.phase !== '24') throw new Error('Evidence phase should be 24');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
