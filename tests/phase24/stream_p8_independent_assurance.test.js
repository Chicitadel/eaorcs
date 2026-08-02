/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 24 Stream P8 Tests
 * File           : tests/phase24/stream_p8_independent_assurance.test.js
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

const IndependentAssuranceTokenBridge = require('../../engine/operations/IndependentAssuranceTokenBridge.js');
const Rfc3161TsaReceiptGraphV2 = require('../../engine/operations/Rfc3161TsaReceiptGraphV2.js');
const ExternalAuditorPortalBridgeV2 = require('../../engine/operations/ExternalAuditorPortalBridgeV2.js');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('IndependentAssuranceTokenBridge run', async () => {
    const engine = new IndependentAssuranceTokenBridge();
    const result = await engine.run();
    if (result.bridgeType !== 'INDEPENDENT_ASSURANCE_TOKEN_BRIDGE') throw new Error('Invalid bridgeType');
    if (result.status !== 'VERIFIED') throw new Error('Invalid status');
  });

  await test('Rfc3161TsaReceiptGraphV2 run', async () => {
    const engine = new Rfc3161TsaReceiptGraphV2();
    const result = await engine.run();
    if (result.graphType !== 'RFC3161_TSA_RECEIPT_GRAPH_V2') throw new Error('Invalid graphType');
    if (result.status !== 'GRAPHED') throw new Error('Invalid status');
  });

  await test('ExternalAuditorPortalBridgeV2 run', async () => {
    const engine = new ExternalAuditorPortalBridgeV2();
    const result = await engine.run();
    if (result.bridgeType !== 'EXTERNAL_AUDITOR_PORTAL_BRIDGE_V2') throw new Error('Invalid bridgeType');
    if (result.status !== 'ACTIVE') throw new Error('Invalid status');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
