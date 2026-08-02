/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 23 Stream L2 Tests
 * File           : tests/phase23/stream_l2_live_api_contract.test.js
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

const LiveApiEndpointContractRunner = require('../../engine/operations/LiveApiEndpointContractRunner');
const ContinuousContractDriftGraph = require('../../engine/operations/ContinuousContractDriftGraph');
const ApiEndpointComplianceArchive = require('../../engine/operations/ApiEndpointComplianceArchive');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('Running Phase 23 Stream L2 Tests...');

  await test('LiveApiEndpointContractRunner returns correct EXECUTED state', async () => {
    const runner = new LiveApiEndpointContractRunner();
    const result = await runner.run();
    if (result.runnerType !== 'LIVE_API_ENDPOINT_CONTRACT_RUNNER') throw new Error('Invalid runnerType');
    if (result.testedEndpointsCount !== 36) throw new Error('Invalid testedEndpointsCount');
    if (result.schemaConformanceRatePercent !== 100) throw new Error('Invalid schemaConformanceRatePercent');
    if (result.status !== 'EXECUTED') throw new Error('Invalid status');
  });

  await test('ContinuousContractDriftGraph returns correct ZERO_DRIFT state', async () => {
    const graph = new ContinuousContractDriftGraph();
    const result = await graph.run();
    if (result.graphType !== 'CONTINUOUS_CONTRACT_DRIFT_GRAPH') throw new Error('Invalid graphType');
    if (result.driftEventsDetectedCount !== 0) throw new Error('Invalid driftEventsDetectedCount');
    if (result.status !== 'ZERO_DRIFT') throw new Error('Invalid status');
  });

  await test('ApiEndpointComplianceArchive returns correct ARCHIVED state', async () => {
    const archive = new ApiEndpointComplianceArchive();
    const result = await archive.run();
    if (result.archiveType !== 'API_ENDPOINT_COMPLIANCE_ARCHIVE') throw new Error('Invalid archiveType');
    if (result.archivedCallsCount !== 148900) throw new Error('Invalid archivedCallsCount');
    if (result.status !== 'ARCHIVED') throw new Error('Invalid status');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
