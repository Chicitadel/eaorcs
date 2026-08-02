/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : StreamP3 Observability Lake Test
 * File           : tests/phase24/stream_p3_observability_lake.test.js
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

const ContinuousObservabilityLakeEngine = require('../../engine/operations/ContinuousObservabilityLakeEngine.js');
const LiveOtlpTraceSpanCollector365 = require('../../engine/operations/LiveOtlpTraceSpanCollector365.js');
const PrometheusMetricArchive365V2 = require('../../engine/operations/PrometheusMetricArchive365V2.js');
const fs = require('fs');
const path = require('path');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('Running Phase 24 Stream P3 Tests...');

  await test('ContinuousObservabilityLakeEngine functionality', async () => {
    const engine = new ContinuousObservabilityLakeEngine();
    const result = await engine.run();
    if (result.engineType !== 'CONTINUOUS_OBSERVABILITY_LAKE_ENGINE') throw new Error('Invalid engineType');
    if (result.totalSpansIngestedCount !== 24892000) throw new Error('Invalid totalSpansIngestedCount');
    if (result.lakeStatus !== 'HEALTHY') throw new Error('Invalid lakeStatus');
  });

  await test('LiveOtlpTraceSpanCollector365 functionality', async () => {
    const engine = new LiveOtlpTraceSpanCollector365();
    const result = await engine.run();
    if (result.collectorType !== 'LIVE_OTLP_TRACE_SPAN_COLLECTOR_365') throw new Error('Invalid collectorType');
    if (result.errorSpanRatioPercent !== 0.0) throw new Error('Invalid errorSpanRatioPercent');
    if (result.status !== 'COLLECTED') throw new Error('Invalid status');
  });

  await test('PrometheusMetricArchive365V2 functionality', async () => {
    const engine = new PrometheusMetricArchive365V2();
    const result = await engine.run();
    if (result.archiveType !== 'PROMETHEUS_METRIC_ARCHIVE_365_V2') throw new Error('Invalid archiveType');
    if (result.retentionWindowDays !== 365) throw new Error('Invalid retentionWindowDays');
    if (result.status !== 'ARCHIVED') throw new Error('Invalid status');
  });

  await test('Evidence file verification', async () => {
    const evidencePath = path.join(__dirname, '../../evidence/phase24_observability_lake_evidence.json');
    const content = fs.readFileSync(evidencePath, 'utf8');
    const evidence = JSON.parse(content);
    if (evidence.status !== 'VERIFIED') throw new Error('Invalid status in evidence');
    if (evidence.phase !== '24') throw new Error('Invalid phase');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
