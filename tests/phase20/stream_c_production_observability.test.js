/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 20 Stream C - Production Observability Ledger Ingestion
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase20\stream_c_production_observability.test.js
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

const ProductionTelemetryIngestionEngine = require('../../engine/validation/ProductionTelemetryIngestionEngine');
const PrometheusLiveMetricsBridge = require('../../engine/validation/PrometheusLiveMetricsBridge');
const ProductionDashboardEvidenceBridge = require('../../engine/validation/ProductionDashboardEvidenceBridge');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('ProductionTelemetryIngestionEngine should return correct state', async () => {
    const engine = new ProductionTelemetryIngestionEngine();
    const result = await engine.run();
    if (result.status !== 'INGESTING') throw new Error('Incorrect status');
    if (result.dataLossRate !== 0.0) throw new Error('Incorrect dataLossRate');
  });

  await test('PrometheusLiveMetricsBridge should return correct metrics data', async () => {
    const bridge = new PrometheusLiveMetricsBridge();
    const result = await bridge.run();
    if (result.bridgeStatus !== 'OPERATIONAL') throw new Error('Incorrect bridgeStatus');
    if (result.queriedMetrics.length !== 3) throw new Error('Incorrect queriedMetrics length');
  });

  await test('ProductionDashboardEvidenceBridge should return captured status', async () => {
    const bridge = new ProductionDashboardEvidenceBridge();
    const result = await bridge.run();
    if (result.status !== 'CAPTURED') throw new Error('Incorrect status');
    if (!result.evidenceHash.startsWith('sha256:')) throw new Error('Invalid evidenceHash');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
