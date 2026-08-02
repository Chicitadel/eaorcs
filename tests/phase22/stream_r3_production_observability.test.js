/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Stream R3 Production Observability Tests
 * File           : tests/phase22/stream_r3_production_observability.test.js
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

const ContinuousTelemetryIngestionEngine = require('../../engine/operations/ContinuousTelemetryIngestionEngine.js');
const LiveOtlpSpanBundleArchive = require('../../engine/operations/LiveOtlpSpanBundleArchive.js');
const PrometheusTimeSeriesLedger = require('../../engine/operations/PrometheusTimeSeriesLedger.js');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('Running Phase 22 Stream R3 Tests...');

  await test('ContinuousTelemetryIngestionEngine execution', async () => {
    const engine = new ContinuousTelemetryIngestionEngine();
    const result = await engine.run();
    if (result.engineType !== 'CONTINUOUS_TELEMETRY_INGESTION_ENGINE') throw new Error('Invalid engineType');
    if (result.activeCollectorsCount !== 16) throw new Error('Invalid activeCollectorsCount');
    if (result.ingestedTraceSpansCount !== 12480920) throw new Error('Invalid ingestedTraceSpansCount');
    if (result.ingestionDataLossRatePercent !== 0.0) throw new Error('Invalid ingestionDataLossRatePercent');
    if (result.status !== 'INGESTING') throw new Error('Invalid status');
  });

  await test('LiveOtlpSpanBundleArchive execution', async () => {
    const archive = new LiveOtlpSpanBundleArchive();
    const result = await archive.run();
    if (result.archiveType !== 'LIVE_OTLP_SPAN_BUNDLE_ARCHIVE') throw new Error('Invalid archiveType');
    if (result.archivedTraceBundlesCount !== 360) throw new Error('Invalid archivedTraceBundlesCount');
    if (result.errorSpanRatioPercent !== 0.0) throw new Error('Invalid errorSpanRatioPercent');
    if (!result.bundleHash.startsWith('sha256:')) throw new Error('Invalid bundleHash');
    if (result.status !== 'ARCHIVED') throw new Error('Invalid status');
  });

  await test('PrometheusTimeSeriesLedger execution', async () => {
    const ledger = new PrometheusTimeSeriesLedger();
    const result = await ledger.run();
    if (result.ledgerType !== 'PROMETHEUS_TIME_SERIES_LEDGER') throw new Error('Invalid ledgerType');
    if (result.timeSeriesMetricsCount !== 240) throw new Error('Invalid timeSeriesMetricsCount');
    if (result.retentionWindowDays !== 365) throw new Error('Invalid retentionWindowDays');
    if (result.ledgerIntegrityStatus !== 'VERIFIED') throw new Error('Invalid ledgerIntegrityStatus');
    if (result.status !== 'OPERATIONAL') throw new Error('Invalid status');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
