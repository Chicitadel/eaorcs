'use strict';
/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : ObservabilityOperationsPipeline
 * File           : tests/phase18/stream_p2_observability_operations.test.js
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

const OpenTelemetryPipelineEngine = require('../../engine/telemetry/OpenTelemetryPipelineEngine');
const MetricsRetentionArchive = require('../../engine/telemetry/MetricsRetentionArchive');
const DashboardSnapshotEngine = require('../../engine/telemetry/DashboardSnapshotEngine');

async function runTests() {
    let passed = 0; let failed = 0;
    async function test(name, fn) {
        try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
        catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
    }

    const otelEngine = new OpenTelemetryPipelineEngine();
    const metricsEngine = new MetricsRetentionArchive();
    const dashboardEngine = new DashboardSnapshotEngine();

    console.log('Running Phase 18 Stream P2 Tests...');

    await test('OpenTelemetryPipelineEngine should run successfully and return operational data', async () => {
        const result = await otelEngine.run();
        if (result.status !== 'OPERATIONAL') throw new Error(`Expected status 'OPERATIONAL', got ${result.status}`);
        if (result.dropsInLast24h !== 0) throw new Error(`Expected dropsInLast24h to be 0, got ${result.dropsInLast24h}`);
        if (!result.collectors || result.collectors.length < 2) throw new Error(`Expected at least 2 collectors, got ${result.collectors ? result.collectors.length : 0}`);
    });

    await test('MetricsRetentionArchive should return hourly snapshots and correct retention', async () => {
        const result = await metricsEngine.run();
        if (result.archiveIntegrity !== 'VERIFIED') throw new Error(`Expected archiveIntegrity 'VERIFIED', got ${result.archiveIntegrity}`);
        if (result.retentionPeriodMonths < 13) throw new Error(`Expected retentionPeriodMonths >= 13, got ${result.retentionPeriodMonths}`);
        if (!result.metricSnapshots || result.metricSnapshots.length < 24) throw new Error(`Expected at least 24 metric snapshots, got ${result.metricSnapshots ? result.metricSnapshots.length : 0}`);
    });

    await test('DashboardSnapshotEngine should return weekly snapshots', async () => {
        const result = await dashboardEngine.run();
        if (result.automatedCapture !== true) throw new Error(`Expected automatedCapture to be true, got ${result.automatedCapture}`);
        if (!result.snapshots || result.snapshots.length < 7) throw new Error(`Expected at least 7 snapshots, got ${result.snapshots ? result.snapshots.length : 0}`);
    });

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
