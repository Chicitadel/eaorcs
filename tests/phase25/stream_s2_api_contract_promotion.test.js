/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 25 Stream S2
 * File           : tests/phase25/stream_s2_api_contract_promotion.test.js
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

const AutomatedApiContractPromotionEngine = require('../../engine/operations/AutomatedApiContractPromotionEngine');
const LiveEndpointCompatibilityMatrixV2 = require('../../engine/operations/LiveEndpointCompatibilityMatrixV2');
const ZeroDriftContractGatePolicy = require('../../engine/operations/ZeroDriftContractGatePolicy');

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

  console.log('Running Phase 25 Stream S2 Tests...');

  await test('AutomatedApiContractPromotionEngine execution', async () => {
    const engine = new AutomatedApiContractPromotionEngine();
    const result = await engine.run();
    if (result.engineType !== 'AUTOMATED_API_CONTRACT_PROMOTION_ENGINE') throw new Error('Incorrect engine type');
    if (result.status !== 'PROMOTED') throw new Error('Incorrect status');
    if (result.schemaConformanceRatePercent !== 100) throw new Error('Incorrect schema conformance rate');
  });

  await test('LiveEndpointCompatibilityMatrixV2 execution', async () => {
    const engine = new LiveEndpointCompatibilityMatrixV2();
    const result = await engine.run();
    if (result.matrixType !== 'LIVE_ENDPOINT_COMPATIBILITY_MATRIX_V2') throw new Error('Incorrect matrix type');
    if (result.status !== 'COMPATIBLE') throw new Error('Incorrect status');
    if (result.backwardCompatibilityScorePercent !== 100) throw new Error('Incorrect backward compatibility score');
  });

  await test('ZeroDriftContractGatePolicy execution', async () => {
    const engine = new ZeroDriftContractGatePolicy();
    const result = await engine.run();
    if (result.policyType !== 'ZERO_DRIFT_CONTRACT_GATE_POLICY') throw new Error('Incorrect policy type');
    if (result.status !== 'ENFORCED') throw new Error('Incorrect status');
    if (result.promotionGatePolicy !== 'ZERO_BREAKING_CHANGES_STRICT') throw new Error('Incorrect promotion gate policy');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
