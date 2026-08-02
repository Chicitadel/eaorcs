/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : tests/phase20/stream_b_contract_interoperability.test
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase20\stream_b_contract_interoperability.test.js
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

const LiveContractInteroperabilityEngine = require('../../engine/validation/LiveContractInteroperabilityEngine.js');
const LiveEndpointContractRunner = require('../../engine/validation/LiveEndpointContractRunner.js');
const ContractDriftBlocker = require('../../engine/validation/ContractDriftBlocker.js');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  const interoperabilityEngine = new LiveContractInteroperabilityEngine();
  const endpointRunner = new LiveEndpointContractRunner();
  const driftBlocker = new ContractDriftBlocker();

  console.log('Running Phase 20 Stream B Contract Interoperability Tests...');

  await test('LiveContractInteroperabilityEngine should run and return 100% compliance', async () => {
    const result = await interoperabilityEngine.run();
    if (result.engineType !== 'LIVE_CONTRACT_INTEROPERABILITY') throw new Error('Invalid engine type');
    if (result.testedContracts.length !== 4) throw new Error('Should test 4 contract types');
    if (result.liveEndpointUrl !== 'https://api.airroofers.eu/v1') throw new Error('Invalid liveEndpointUrl');
    if (result.interoperabilityVerdict !== '100% COMPATIBLE') throw new Error('Invalid verdict');
    if (result.status !== 'PASSED') throw new Error('Invalid status');
  });

  await test('LiveEndpointContractRunner should execute successfully with 100% conformance', async () => {
    const result = await endpointRunner.run();
    if (result.runnerType !== 'LIVE_ENDPOINT_CONTRACT_RUNNER') throw new Error('Invalid runner type');
    if (result.totalEndpointsTested !== 24) throw new Error('Invalid total endpoints');
    if (result.passedEndpoints !== 24) throw new Error('Invalid passed endpoints');
    if (result.failedEndpoints !== 0) throw new Error('Invalid failed endpoints');
    if (result.schemaConformanceRate !== 100) throw new Error('Invalid schema conformance rate');
    if (result.status !== 'VERIFIED') throw new Error('Invalid status');
  });

  await test('ContractDriftBlocker should execute and enforce zero drift tolerance', async () => {
    const result = await driftBlocker.run();
    if (result.blockerType !== 'CONTRACT_DRIFT_BLOCKER') throw new Error('Invalid blocker type');
    if (result.activeGates.length !== 3) throw new Error('Should have 3 active gates');
    if (result.driftEventsDetected !== 0) throw new Error('Invalid drift events detected');
    if (result.promotionBlocked !== false) throw new Error('Promotion should not be blocked');
    if (result.policyEnforced !== 'ZERO_DRIFT_TOLERANCE') throw new Error('Invalid policy enforced');
    if (result.status !== 'ENFORCED') throw new Error('Invalid status');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
