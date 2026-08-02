/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 21 Stream S8 Tests
 * File           : tests/phase21/stream_s8_independent_assurance.test.js
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

const IndependentAssuranceIntegrator = require('../../engine/operations/IndependentAssuranceIntegrator');
const Rfc3161TsaReceiptEngine = require('../../engine/operations/Rfc3161TsaReceiptEngine');
const ExternalAuditorTokenBridge = require('../../engine/operations/ExternalAuditorTokenBridge');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('Running Phase 21 Stream S8 Tests...');

  await test('IndependentAssuranceIntegrator executes successfully', async () => {
    const integrator = new IndependentAssuranceIntegrator();
    const result = await integrator.run();
    if (result.status !== 'INTEGRATED') throw new Error('Invalid status');
    if (result.integratorType !== 'INDEPENDENT_ASSURANCE_INTEGRATOR') throw new Error('Invalid integrator type');
  });

  await test('Rfc3161TsaReceiptEngine executes successfully', async () => {
    const engine = new Rfc3161TsaReceiptEngine();
    const result = await engine.run();
    if (result.status !== 'VERIFIED') throw new Error('Invalid status');
    if (result.engineType !== 'RFC3161_TSA_RECEIPT_ENGINE') throw new Error('Invalid engine type');
  });

  await test('ExternalAuditorTokenBridge executes successfully', async () => {
    const bridge = new ExternalAuditorTokenBridge();
    const result = await bridge.run();
    if (result.status !== 'ACTIVE') throw new Error('Invalid status');
    if (result.bridgeType !== 'EXTERNAL_AUDITOR_TOKEN_BRIDGE') throw new Error('Invalid bridge type');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
