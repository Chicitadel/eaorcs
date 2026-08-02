/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Production Observability Tests
 * File           : tests/phase21/stream_s3_production_observability.test.js
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

const assert = require('assert');
const ProductionTelemetryIngester = require('../../engine/operations/ProductionTelemetryIngester');
const OtlpTraceBundleCollector = require('../../engine/operations/OtlpTraceBundleCollector');
const PrometheusTimeSeriesExporter = require('../../engine/operations/PrometheusTimeSeriesExporter');
const fs = require('fs');
const path = require('path');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('ProductionTelemetryIngester returns correct telemetry ingestion data', async () => {
    const ingester = new ProductionTelemetryIngester();
    const result = await ingester.run();
    assert.strictEqual(result.ingesterType, 'PRODUCTION_TELEMETRY_INGESTER');
    assert.strictEqual(result.activeMetricsEndpointsCount, 12);
    assert.strictEqual(result.telemetryRecordsIngestedCount, 4892010);
    assert.strictEqual(result.ingestionDataLossRatePercent, 0.0);
    assert.strictEqual(result.status, 'INGESTING');
  });

  await test('OtlpTraceBundleCollector returns correct trace collection data', async () => {
    const collector = new OtlpTraceBundleCollector();
    const result = await collector.run();
    assert.strictEqual(result.collectorType, 'OTLP_TRACE_BUNDLE_COLLECTOR');
    assert.strictEqual(result.collectedSpansCount, 948201);
    assert.strictEqual(result.errorSpansCount, 0);
    assert.strictEqual(result.otlpExporterEndpoint, 'otlp.airroofers.eu:4317');
    assert.ok(result.traceBundleHash.startsWith('sha256:'));
    assert.strictEqual(result.status, 'COLLECTED');
  });

  await test('PrometheusTimeSeriesExporter returns correct metrics export data', async () => {
    const exporter = new PrometheusTimeSeriesExporter();
    const result = await exporter.run();
    assert.strictEqual(result.exporterType, 'PROMETHEUS_TIME_SERIES_EXPORTER');
    assert.strictEqual(result.exportedTimeSeriesCount, 184);
    assert.strictEqual(result.retentionWindowDays, 365);
    assert.strictEqual(result.exportFormat, 'PROMETHEUS_OPEN_METRICS');
    assert.strictEqual(result.status, 'EXPORTED');
  });

  await test('Evidence JSON is properly formatted', async () => {
    const evidencePath = path.join(__dirname, '../../evidence/phase21_production_observability_evidence.json');
    const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
    assert.strictEqual(evidence.phase, 21);
    assert.strictEqual(evidence.stream, 'S3');
    assert.strictEqual(evidence.status, 'VERIFIED');
    assert.ok(evidence.evidence);
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
