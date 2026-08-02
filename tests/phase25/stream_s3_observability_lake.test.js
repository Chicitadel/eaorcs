/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 25 Stream S3 - Live Observability Lake
 * File           : tests/phase25/stream_s3_observability_lake.test.js
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

const QueryableObservabilityLakeEngine = require('../../engine/operations/QueryableObservabilityLakeEngine.js');
const LiveOtlpTraceSpanIngestionArchive = require('../../engine/operations/LiveOtlpTraceSpanIngestionArchive.js');
const PrometheusMetricRetentionEngine365 = require('../../engine/operations/PrometheusMetricRetentionEngine365.js');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('Running tests for Phase 25 Stream S3 - Live Observability Lake...\n');

  await test('QueryableObservabilityLakeEngine executes successfully', async () => {
    const engine = new QueryableObservabilityLakeEngine();
    const result = await engine.run();
    if (result.engineType !== 'QUERYABLE_OBSERVABILITY_LAKE_ENGINE') throw new Error('Invalid engineType');
    if (result.lakeStatus !== 'QUERYABLE') throw new Error('Invalid lakeStatus');
    if (result.totalSpansIngestedCount !== 32892000) throw new Error('Invalid span count');
  });

  await test('LiveOtlpTraceSpanIngestionArchive executes successfully', async () => {
    const archive = new LiveOtlpTraceSpanIngestionArchive();
    const result = await archive.run();
    if (result.archiveType !== 'LIVE_OTLP_TRACE_SPAN_INGESTION_ARCHIVE') throw new Error('Invalid archiveType');
    if (result.status !== 'ARCHIVED') throw new Error('Invalid status');
    if (result.collectedTraceBundlesCount !== 780) throw new Error('Invalid collected bundles count');
  });

  await test('PrometheusMetricRetentionEngine365 executes successfully', async () => {
    const retention = new PrometheusMetricRetentionEngine365();
    const result = await retention.run();
    if (result.engineType !== 'PROMETHEUS_METRIC_RETENTION_ENGINE_365') throw new Error('Invalid engineType');
    if (result.retentionWindowDays !== 365) throw new Error('Invalid retentionWindowDays');
    if (result.status !== 'RETAINED') throw new Error('Invalid status');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
