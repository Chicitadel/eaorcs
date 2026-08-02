/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 17 Stream S2 — Observability Stack Test Suite
 * File           : tests/phase17/stream_s2_observability.test.js
 * Version        : 2026.17.0
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const path = require('path');
const root = path.resolve(__dirname, '../..');

const { PrometheusMetricsExporter } = require(path.join(root, 'engine/telemetry/PrometheusMetricsExporter'));
const { GrafanaDashboardSpecEngine } = require(path.join(root, 'engine/telemetry/GrafanaDashboardSpecEngine'));
const { JaegerTraceRetentionEngine } = require(path.join(root, 'engine/telemetry/JaegerTraceRetentionEngine'));
const { AlertingRulesEngine } = require(path.join(root, 'engine/telemetry/AlertingRulesEngine'));

async function runTests() {
  console.log('\n================================================================================');
  console.log('  PHASE 17 — STREAM S2: FULL OBSERVABILITY STACK TEST SUITE');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${name} — ${e.message}`);
      failed++;
    }
  }

  // ─── Prometheus ──────────────────────────────────────────────────────────────
  console.log('  [PrometheusMetricsExporter]');
  const prom = new PrometheusMetricsExporter();
  const promResult = await prom.run();

  await test('PrometheusMetricsExporter returns result', async () => { if (!promResult) throw new Error('No result'); });
  await test('Status is ACTIVE', async () => { if (promResult.status !== 'ACTIVE') throw new Error(`Expected ACTIVE got ${promResult.status}`); });
  await test('At least 8 exported metrics', async () => { if (!Array.isArray(promResult.exportedMetrics) || promResult.exportedMetrics.length < 8) throw new Error(`Only ${promResult.exportedMetrics?.length} metrics`); });
  await test('Scrape interval <= 30s', async () => { if (promResult.scrapeIntervalSeconds > 30) throw new Error(`Scrape interval ${promResult.scrapeIntervalSeconds}s`); });
  await test('Remote write enabled', async () => { if (!promResult.remoteWriteEnabled) throw new Error('Remote write not enabled'); });

  // ─── Grafana ─────────────────────────────────────────────────────────────────
  console.log('\n  [GrafanaDashboardSpecEngine]');
  const grafana = new GrafanaDashboardSpecEngine();
  const grafanaResult = await grafana.run();

  await test('GrafanaDashboardSpecEngine returns result', async () => { if (!grafanaResult) throw new Error('No result'); });
  await test('Status is CONFIGURED', async () => { if (grafanaResult.status !== 'CONFIGURED') throw new Error(`Expected CONFIGURED got ${grafanaResult.status}`); });
  await test('At least 6 panels defined', async () => { if (!Array.isArray(grafanaResult.panels) || grafanaResult.panels.length < 6) throw new Error(`Only ${grafanaResult.panels?.length} panels`); });
  await test('At least 3 alert rules defined', async () => { if (!Array.isArray(grafanaResult.alertRules) || grafanaResult.alertRules.length < 3) throw new Error(`Only ${grafanaResult.alertRules?.length} rules`); });

  // ─── Jaeger ──────────────────────────────────────────────────────────────────
  console.log('\n  [JaegerTraceRetentionEngine]');
  const jaeger = new JaegerTraceRetentionEngine();
  const jaegerResult = await jaeger.run();

  await test('JaegerTraceRetentionEngine returns result', async () => { if (!jaegerResult) throw new Error('No result'); });
  await test('Status is ACTIVE', async () => { if (jaegerResult.status !== 'ACTIVE') throw new Error(`Expected ACTIVE got ${jaegerResult.status}`); });
  await test('Retention >= 30 days', async () => { if (jaegerResult.retentionDays < 30) throw new Error(`Only ${jaegerResult.retentionDays} days retention`); });
  await test('Trace export format is OTLP', async () => { if (jaegerResult.traceExportFormat !== 'OTLP') throw new Error(`Expected OTLP got ${jaegerResult.traceExportFormat}`); });
  await test('Active traces > 0', async () => { if (jaegerResult.activeTraces <= 0) throw new Error('No active traces'); });

  // ─── Alerting ────────────────────────────────────────────────────────────────
  console.log('\n  [AlertingRulesEngine]');
  const alerting = new AlertingRulesEngine();
  const alertingResult = await alerting.run();

  await test('AlertingRulesEngine returns result', async () => { if (!alertingResult) throw new Error('No result'); });
  await test('Status is OPERATIONAL', async () => { if (alertingResult.status !== 'OPERATIONAL') throw new Error(`Expected OPERATIONAL got ${alertingResult.status}`); });
  await test('At least 5 active alert rules', async () => { if (!Array.isArray(alertingResult.activeRules) || alertingResult.activeRules.length < 5) throw new Error(`Only ${alertingResult.activeRules?.length} rules`); });
  await test('At least 3 notification channels', async () => { if (!Array.isArray(alertingResult.notificationChannels) || alertingResult.notificationChannels.length < 3) throw new Error(`Only ${alertingResult.notificationChannels?.length} channels`); });
  await test('All rules are enabled', async () => { const disabled = alertingResult.activeRules.filter(r => !r.enabled); if (disabled.length > 0) throw new Error(`${disabled.length} rules disabled`); });

  console.log('\n================================================================================');
  console.log(`  Stream S2 Results: ${passed} PASSED / ${failed} FAILED`);
  if (failed === 0) {
    console.log('  🎉 STREAM S2 — OBSERVABILITY STACK: ALL TESTS PASSED');
    console.log('  Verdict: S2_OBSERVABILITY_VERIFIED');
  } else {
    console.log(`  ❌ STREAM S2 FAILED: ${failed} test(s) failed`);
  }
  console.log('================================================================================\n');

  return { passed, failed, stream: 'S2', verdict: failed === 0 ? 'VERIFIED' : 'FAILED' };
}

if (require.main === module) {
  runTests().then(r => process.exit(r.failed > 0 ? 1 : 0)).catch(e => { console.error(e); process.exit(1); });
}

module.exports = { runTests };
