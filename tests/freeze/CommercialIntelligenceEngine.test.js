/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Commercial Intelligence Engine Test Suite
 * File           : CommercialIntelligenceEngine.test.js
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
 * CORP: Layer H — Commercial Intelligence Test Verification
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
const CommercialIntelligenceEngine = require('../../engine/telemetry/CommercialIntelligenceEngine');

function runCommercialIntelligenceEngineTests() {
    console.log('================================================================');
    console.log('  TEST SUITE: CommercialIntelligenceEngine (Layer H)');
    console.log('================================================================\n');

    const engine = new CommercialIntelligenceEngine();

    // Test 1: Generate report with default baseline
    console.log('[1/3] Testing generateCommercialMetricsReport() baseline generation...');
    const report = engine.generateCommercialMetricsReport();
    
    assert.ok(report.reportId.startsWith('CIR-'), 'Report ID must start with CIR-');
    assert.ok(report.timestamp, 'Timestamp must be defined');
    assert.ok(report.licenseMetrics, 'licenseMetrics must be present');
    assert.ok(report.licenseMetrics.activationRatePercent > 0, 'Activation rate must be > 0');
    assert.ok(report.downloadMetrics, 'downloadMetrics must be present');
    assert.ok(report.apiUsageMetrics, 'apiUsageMetrics must be present');
    assert.ok(report.slaComplianceMetrics, 'slaComplianceMetrics must be present');
    assert.strictEqual(report.slaComplianceMetrics.complianceStatus, 'COMPLIANT');
    assert.ok(report.financialStatistics, 'financialStatistics must be present');
    assert.strictEqual(report.financialStatistics.arr, report.financialStatistics.mrr * 12, 'ARR must equal MRR * 12');
    console.log(`  ✓ Report generated successfully (${report.reportId})`);

    // Test 2: Dynamic telemetry recording
    console.log('\n[2/3] Testing event recording (Activations, Renewals, Downloads, API)...');
    engine.recordActivation({ tenantId: 'tenant-test-1', status: 'ACTIVE' });
    engine.recordActivation({ tenantId: 'tenant-test-2', status: 'ACTIVE' });
    engine.recordRenewal({ tenantId: 'tenant-test-1', status: 'RENEWED' });
    engine.recordDownload({ packageType: 'ecap', region: 'EU' });
    engine.recordApiUsage({ endpoint: '/api/v1/dcp', statusCode: 200, latencyMs: 18 });

    assert.strictEqual(engine.activations.length, 2);
    assert.strictEqual(engine.renewals.length, 1);
    assert.strictEqual(engine.downloads.length, 1);
    assert.strictEqual(engine.apiCalls.length, 1);
    console.log('  ✓ Recorded telemetry events stored and structured properly');

    // Test 3: Override input metrics and options
    console.log('\n[3/3] Testing generateCommercialMetricsReport with custom parameters...');
    const customReport = engine.generateCommercialMetricsReport({
        mrr: 500000,
        activeActivations: 1000,
        totalLicensesIssued: 1000,
        targetSlaPercent: 99.9,
        achievedUptimePercent: 99.95
    }, { currency: 'USD', period: '2026-Q4' });

    assert.strictEqual(customReport.financialStatistics.currency, 'USD');
    assert.strictEqual(customReport.financialStatistics.mrr, 500000);
    assert.strictEqual(customReport.financialStatistics.arr, 6000000);
    assert.strictEqual(customReport.licenseMetrics.activationRatePercent, 100.0);
    assert.strictEqual(customReport.reportPeriod, '2026-Q4');
    console.log('  ✓ Custom overrides and options verified');

    console.log('\n================================================================');
    console.log('  SUCCESS: CommercialIntelligenceEngine tests passed (100%)');
    console.log('================================================================\n');
}

runCommercialIntelligenceEngineTests();
