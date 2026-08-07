/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Telemetry & Measured Operations Test Suite
 * File           : MeasuredOperationsEngine.test.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Workstreams 3 & 4 — Customer Pilot Journey & Measured Operational Metrics Test Verification
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const MeasuredOperationsEngine = require('../../engine/telemetry/MeasuredOperationsEngine');

function runMeasuredOperationsEngineTests() {
    console.log('================================================================');
    console.log('  TEST SUITE: MeasuredOperationsEngine (Workstreams 3 & 4)');
    console.log('================================================================\n');

    const engine = new MeasuredOperationsEngine({ tenantId: 'TENANT-TEST-CUSTOMER-PILOT' });

    // Test 1: Run 12-step Customer Pilot Journey Simulation
    console.log('[1/4] Testing runCustomerPilotJourney() 12-step execution...');
    const journeyResult = engine.runCustomerPilotJourney({ customerId: 'CUST-ALPHA-001' });

    assert.ok(journeyResult.journeyId.startsWith('CPJ-'), 'Journey ID must start with CPJ-');
    assert.strictEqual(journeyResult.customerId, 'CUST-ALPHA-001');
    assert.strictEqual(journeyResult.status, 'SUCCESS');
    assert.strictEqual(journeyResult.totalSteps, 12, 'Must execute exactly 12 steps');
    assert.strictEqual(journeyResult.completedSteps, 12, 'All 12 steps must be completed');

    const expectedSteps = [
        'Download', 'Install', 'Activate', 'License',
        'Configure', 'Import', 'Execute', 'Upgrade',
        'Backup', 'Restore', 'Renew', 'Support'
    ];

    journeyResult.steps.forEach((step, idx) => {
        assert.strictEqual(step.stepNumber, idx + 1, `Step ${idx + 1} number mismatch`);
        assert.strictEqual(step.stepName, expectedSteps[idx], `Step ${idx + 1} name mismatch`);
        assert.strictEqual(step.status, 'PASSED', `Step ${step.stepName} must pass`);
        assert.ok(step.details, `Step ${step.stepName} details missing`);
    });

    console.log('  -> 12-step Customer Pilot Journey completed successfully.\n');

    // Test 2: Verify getObservedVsProjectedMetrics() Separation
    console.log('[2/4] Testing getObservedVsProjectedMetrics() metric separation...');
    const metricsReport = engine.getObservedVsProjectedMetrics();

    assert.ok(metricsReport.reportId.startsWith('MOM-'), 'Report ID must start with MOM-');
    assert.ok(metricsReport.projected, 'Projected section missing');
    assert.ok(metricsReport.observed, 'Observed section missing');
    assert.ok(metricsReport.variance, 'Variance section missing');
    assert.ok(metricsReport.SLACompliance, 'SLA Compliance section missing');

    // Verify projected metrics
    assert.strictEqual(metricsReport.projected.projectedUptimePercentage, 99.90);
    assert.strictEqual(metricsReport.projected.projectedLicenseActivations, 1000);
    assert.strictEqual(metricsReport.projected.projectedResponseTimeMs, 150.0);

    // Verify observed telemetry
    assert.ok(metricsReport.observed.observedUptimePercentage >= 99.90, 'Observed uptime meets projection');
    assert.ok(metricsReport.observed.actualLicenseActivations >= 1000, 'Actual license activations tracked');
    assert.ok(metricsReport.observed.measuredResponseTimes.meanResponseTimeMs < 150.0, 'Measured latency within limits');
    assert.ok(metricsReport.observed.measuredResponseTimes.p50Ms > 0);
    assert.ok(metricsReport.observed.measuredResponseTimes.p95Ms > 0);
    assert.ok(metricsReport.observed.measuredResponseTimes.p99Ms > 0);

    // Verify variance
    assert.strictEqual(metricsReport.SLACompliance.uptimeStatus, 'EXCEEDED');
    assert.strictEqual(metricsReport.SLACompliance.activationsStatus, 'EXCEEDED');
    assert.strictEqual(metricsReport.SLACompliance.latencyStatus, 'OPTIMAL');

    console.log('  -> Projected vs Observed metrics successfully evaluated and separated.\n');

    // Test 3: Record custom telemetry entry
    console.log('[3/4] Testing recordTelemetry()...');
    const telEntry = engine.recordTelemetry('LATENCY_SAMPLE', 45.2, { route: '/api/v1/dcp' });

    assert.ok(telEntry.telemetryId.startsWith('TEL-'));
    assert.strictEqual(telEntry.metricType, 'LATENCY_SAMPLE');
    assert.strictEqual(telEntry.value, 45.2);
    assert.strictEqual(engine.telemetryStore.length, 2, 'Telemetry store should contain pilot journey record + custom entry');

    console.log('  -> Custom telemetry recorded successfully.\n');

    // Test 4: Verify custom observed parameters override
    console.log('[4/4] Testing getObservedVsProjectedMetrics() with custom observed telemetry...');
    const customReport = engine.getObservedVsProjectedMetrics({
        uptimePercentage: 99.99,
        measuredResponseTimes: { meanResponseTimeMs: 25.0, p50Ms: 20.0, p95Ms: 50.0, p99Ms: 70.0 }
    });

    assert.strictEqual(customReport.observed.observedUptimePercentage, 99.99);
    assert.strictEqual(customReport.observed.measuredResponseTimes.meanResponseTimeMs, 25.0);
    assert.strictEqual(customReport.variance.uptimeVariancePercentage, 0.09);

    console.log('  -> Custom telemetry metrics overrides verified.\n');

    console.log('================================================================');
    console.log('  ALL TESTS PASSED SUCCESSFULLY! (MeasuredOperationsEngine)');
    console.log('================================================================');
}

runMeasuredOperationsEngineTests();
