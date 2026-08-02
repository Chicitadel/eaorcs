/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : API Governance
 * File           : tests/phase22/stream_r2_api_governance.test.js
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

const ContinuousApiVerificationEngine = require('../../engine/operations/ContinuousApiVerificationEngine');
const LiveContractDriftPreventer = require('../../engine/operations/LiveContractDriftPreventer');
const ApiEndpointComplianceLedger = require('../../engine/operations/ApiEndpointComplianceLedger');
const fs = require('fs');
const path = require('path');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('Running API Governance tests...\n');

  await test('ContinuousApiVerificationEngine should return correct properties', async () => {
    const engine = new ContinuousApiVerificationEngine();
    const result = await engine.run();
    if (result.engineType !== 'CONTINUOUS_API_VERIFICATION_ENGINE') throw new Error('Incorrect engineType');
    if (result.activeEndpointsMonitoredCount !== 36) throw new Error('Incorrect activeEndpointsMonitoredCount');
    if (result.contractConformanceScorePercent !== 100) throw new Error('Incorrect contractConformanceScorePercent');
    if (result.unresolvedDriftEventsCount !== 0) throw new Error('Incorrect unresolvedDriftEventsCount');
    if (result.status !== 'VERIFIED') throw new Error('Incorrect status');
  });

  await test('LiveContractDriftPreventer should return correct properties', async () => {
    const preventer = new LiveContractDriftPreventer();
    const result = await preventer.run();
    if (result.preventerType !== 'LIVE_CONTRACT_DRIFT_PREVENTER') throw new Error('Incorrect preventerType');
    if (result.monitoredSchemasCount !== 12) throw new Error('Incorrect monitoredSchemasCount');
    if (result.blockedBreakingChangesCount !== 0) throw new Error('Incorrect blockedBreakingChangesCount');
    if (result.gateEnforcementPolicy !== 'ZERO_BREAKING_CHANGES_STRICT') throw new Error('Incorrect gateEnforcementPolicy');
    if (result.status !== 'ENFORCED') throw new Error('Incorrect status');
  });

  await test('ApiEndpointComplianceLedger should return correct properties', async () => {
    const ledger = new ApiEndpointComplianceLedger();
    const result = await ledger.run();
    if (result.ledgerType !== 'API_ENDPOINT_COMPLIANCE_LEDGER') throw new Error('Incorrect ledgerType');
    if (result.complianceHistoryDays !== 180) throw new Error('Incorrect complianceHistoryDays');
    if (result.p99LatencyMs !== 84.2) throw new Error('Incorrect p99LatencyMs');
    if (result.http200RatePercent !== 99.999) throw new Error('Incorrect http200RatePercent');
    if (result.status !== 'ARCHIVED') throw new Error('Incorrect status');
  });

  await test('Evidence file should contain correct phase and stream', async () => {
    const evidencePath = path.join(__dirname, '../../evidence/phase22_api_governance_evidence.json');
    const content = JSON.parse(fs.readFileSync(evidencePath, 'utf-8'));
    if (content.phase !== 22) throw new Error('Incorrect phase');
    if (content.stream !== 'R2') throw new Error('Incorrect stream');
    if (content.status !== 'VERIFIED') throw new Error('Incorrect status');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
