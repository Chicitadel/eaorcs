/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : ProductionObservabilityLake Tests
 * File           : tests/phase23/stream_l3_production_observability.test.js
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

const ProductionObservabilityLakeEngine = require('../../engine/operations/ProductionObservabilityLakeEngine');
const LongTermOtlpTraceSpanCollector = require('../../engine/operations/LongTermOtlpTraceSpanCollector');
const PrometheusMetricArchive365 = require('../../engine/operations/PrometheusMetricArchive365');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }
  
  await test('ProductionObservabilityLakeEngine run', async () => {
    const engine = new ProductionObservabilityLakeEngine();
    const result = await engine.run();
    if (result.engineType !== 'PRODUCTION_OBSERVABILITY_LAKE_ENGINE') throw new Error('Invalid engineType');
    if (result.lakeStatus !== 'HEALTHY') throw new Error('Invalid lakeStatus');
  });

  await test('LongTermOtlpTraceSpanCollector run', async () => {
    const collector = new LongTermOtlpTraceSpanCollector();
    const result = await collector.run();
    if (result.collectorType !== 'LONG_TERM_OTLP_TRACE_SPAN_COLLECTOR') throw new Error('Invalid collectorType');
    if (result.status !== 'COLLECTED') throw new Error('Invalid status');
  });

  await test('PrometheusMetricArchive365 run', async () => {
    const archive = new PrometheusMetricArchive365();
    const result = await archive.run();
    if (result.archiveType !== 'PROMETHEUS_METRIC_ARCHIVE_365') throw new Error('Invalid archiveType');
    if (result.status !== 'ARCHIVED') throw new Error('Invalid status');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
