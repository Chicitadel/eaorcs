/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 9 Stream F — Operational Intelligence & SaaS Observability Test Suite
 * File           : tests/phase9/stream_f_operational_intelligence.test.js
 * Version        : 2026.1.0-LTS
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
 * - NIST SP 800-53
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const SaaSOperationalIntelligenceEngine = require('../../engine/saas/SaaSOperationalIntelligenceEngine');

async function runStreamFTestSuite() {
    console.log('================================================================================');
    console.log('  EAORCS PHASE 9 STREAM F: OPERATIONAL INTELLIGENCE & SAAS OBSERVABILITY SUITE');
    console.log('  Target Module: engine/saas/SaaSOperationalIntelligenceEngine.js');
    console.log('================================================================================\n');

    const engine = new SaaSOperationalIntelligenceEngine({
        hmacSecret: 'test-stream-f-secret-key-2026'
    });

    // -------------------------------------------------------------------------
    // TEST 1: Tenant Telemetry Ingestion & HMAC Verification
    // -------------------------------------------------------------------------
    console.log('[1/6] Testing Tenant Telemetry Ingestion & Cryptographic Signing...');
    
    const tenant1 = engine.registerTenant('tenant-alpha-fintech', {
        name: 'Alpha Global Financial Technologies',
        industry: 'FINTECH',
        region: 'us-east-1',
        tier: 'ENTERPRISE'
    });
    assert.strictEqual(tenant1.tenantId, 'tenant-alpha-fintech');
    assert.strictEqual(tenant1.metadata.industry, 'FINTECH');

    const telemetry1 = engine.ingestTenantTelemetry('tenant-alpha-fintech', {
        cpuUtilizationPercent: 32,
        memoryUtilizationPercent: 44,
        requestCount: 25000,
        latencyMsP95: 38,
        errorRate: 0.0002,
        passedComplianceChecks: 120,
        totalComplianceChecks: 120,
        encryptionEnabled: true,
        zeroTrustEnforced: true,
        auditLogIntegrity: true,
        backupSuccess: true,
        securityIncidentCount: 0
    });

    assert(telemetry1.recordId.startsWith('TELEMETRY-'), 'Record ID must match TELEMETRY- format');
    assert(telemetry1.signature && telemetry1.signature.length === 64, 'Telemetry must possess valid 64-char HMAC signature');
    
    const history1 = engine.getTenantTelemetryHistory('tenant-alpha-fintech');
    assert.strictEqual(history1.length, 1, 'Telemetry history count should be 1');
    console.log('      ✓ Telemetry Ingestion Passed (HMAC signature & schema verified)');

    // -------------------------------------------------------------------------
    // TEST 2: Continuous Operational Maturity Tracking & Dimension Scoring
    // -------------------------------------------------------------------------
    console.log('\n[2/6] Testing Continuous Operational Maturity Tracking & Evaluation...');

    // Ingest additional telemetry to test windowing
    for (let i = 0; i < 4; i++) {
        engine.ingestTenantTelemetry('tenant-alpha-fintech', {
            cpuUtilizationPercent: 30 + i,
            latencyMsP95: 35 + i,
            errorRate: 0.0001,
            passedComplianceChecks: 120,
            totalComplianceChecks: 120,
            encryptionEnabled: true,
            zeroTrustEnforced: true,
            auditLogIntegrity: true,
            backupSuccess: true,
            securityIncidentCount: 0
        });
    }

    const maturityAlpha = engine.calculateOperationalMaturity('tenant-alpha-fintech');
    assert(maturityAlpha.maturityScore >= 90, `Alpha tenant maturity score should be >= 90, got ${maturityAlpha.maturityScore}`);
    assert.strictEqual(maturityAlpha.maturityLevel.level, 5, 'Alpha tenant should achieve Level 5 Optimizing & Autonomous');
    assert.strictEqual(maturityAlpha.dimensions.resilienceSla, 100, 'Resilience SLA dimension should be 100');

    // Register a secondary tenant with degraded metrics
    engine.registerTenant('tenant-beta-legacy', {
        name: 'Beta Legacy Enterprise Services',
        industry: 'RETAIL',
        region: 'eu-west-1',
        tier: 'STANDARD'
    });

    engine.ingestTenantTelemetry('tenant-beta-legacy', {
        latencyMsP95: 650,
        errorRate: 0.06,
        passedComplianceChecks: 50,
        totalComplianceChecks: 100,
        encryptionEnabled: false,
        zeroTrustEnforced: false,
        auditLogIntegrity: true,
        backupSuccess: false,
        securityIncidentCount: 2
    });

    const maturityBeta = engine.calculateOperationalMaturity('tenant-beta-legacy');
    assert(maturityBeta.maturityScore < 60, `Beta tenant maturity score should be degraded (<60), got ${maturityBeta.maturityScore}`);
    assert(maturityBeta.maturityLevel.level <= 2, `Beta tenant should be mapped to Level 1 or Level 2, got level ${maturityBeta.maturityLevel.level}`);
    console.log('      ✓ Operational Maturity Tracking Passed (Level 5 Sovereign vs Level 1/2 Managed differentiated)');

    // -------------------------------------------------------------------------
    // TEST 3: Trust Metric Telemetry & Attestation Profiling
    // -------------------------------------------------------------------------
    console.log('\n[3/6] Testing Trust Metric Telemetry & Rating Tiers...');

    const trustAlpha = engine.recordTrustTelemetry('tenant-alpha-fintech', {
        attestationStatus: 'VERIFIED',
        proofIntegrityScore: 100,
        verificationLatencyMs: 12,
        keyRotationAgeDays: 14,
        zeroTrustPolicyEnforcementRate: 100
    });

    assert.strictEqual(trustAlpha.trustRating, 'AAA', 'Alpha trust rating should be AAA');
    assert.strictEqual(trustAlpha.trustStatus, 'EXEMPLARY_TRUST', 'Alpha trust status should be EXEMPLARY_TRUST');
    assert.strictEqual(trustAlpha.trustScore, 100, 'Alpha trust score should be 100');

    const trustBeta = engine.recordTrustTelemetry('tenant-beta-legacy', {
        attestationStatus: 'EXPIRED',
        proofIntegrityScore: 60,
        verificationLatencyMs: 250,
        keyRotationAgeDays: 120,
        zeroTrustPolicyEnforcementRate: 40
    });

    assert(trustBeta.trustScore < 50, `Beta trust score should be < 50, got ${trustBeta.trustScore}`);
    assert(['BB', 'B', 'CCC'].includes(trustBeta.trustRating), `Beta rating should be high risk tier, got ${trustBeta.trustRating}`);
    console.log('      ✓ Trust Metric Telemetry Passed (AAA Exemplary vs High Risk Tiers validated)');

    // -------------------------------------------------------------------------
    // TEST 4: Tenant Compliance Metrics Aggregation
    // -------------------------------------------------------------------------
    console.log('\n[4/6] Testing Tenant Compliance Metrics Aggregator...');

    engine.registerTenant('tenant-gamma-gov', {
        name: 'Gamma Federal Defense Agency',
        industry: 'FINTECH',
        region: 'us-east-1',
        tier: 'ENTERPRISE'
    });

    engine.ingestTenantTelemetry('tenant-gamma-gov', {
        passedComplianceChecks: 99,
        totalComplianceChecks: 100,
        encryptionEnabled: true,
        zeroTrustEnforced: true,
        auditLogIntegrity: true,
        backupSuccess: true
    });

    // Aggregate platform wide
    const globalCompliance = engine.aggregateTenantComplianceMetrics();
    assert.strictEqual(globalCompliance.totalTenants, 3, 'Total registered tenants should be 3');
    assert(globalCompliance.platformComplianceIndex > 0, 'Platform compliance index must be positive');
    assert.strictEqual(globalCompliance.compliantTenantsCount, 2, 'Should have 2 compliant tenants (Alpha, Gamma)');
    assert.strictEqual(globalCompliance.atRiskTenantsCount, 1, 'Should have 1 at-risk tenant (Beta)');
    assert(globalCompliance.frameworkCoverage.ISO_27001 > 0, 'ISO 27001 coverage must be populated');
    assert(globalCompliance.frameworkCoverage.OSAP_TRUST_FRAMEWORK > 0, 'OSAP framework coverage must be populated');

    // Aggregate filtered by FINTECH industry
    const fintechCompliance = engine.aggregateTenantComplianceMetrics({ industry: 'FINTECH' });
    assert.strictEqual(fintechCompliance.totalTenants, 2, 'Fintech filtered count should be 2');
    assert.strictEqual(fintechCompliance.platformComplianceIndex, 100, 'Fintech compliance index should be 100%');
    console.log('      ✓ Compliance Metrics Aggregator Passed (Global & Filtered aggregation verified)');

    // -------------------------------------------------------------------------
    // TEST 5: Certification Trend Forecaster & Audit Readiness
    // -------------------------------------------------------------------------
    console.log('\n[5/6] Testing Certification Trend Forecasting & Predictive Audit Readiness...');

    const forecastAlpha = engine.forecastCertificationTrends('tenant-alpha-fintech', 6);
    assert.strictEqual(forecastAlpha.tenantId, 'tenant-alpha-fintech');
    assert.strictEqual(forecastAlpha.readinessProbability, 100, 'Alpha readiness probability should be 100%');
    assert.strictEqual(forecastAlpha.certificationRisk, 'LOW_RISK', 'Alpha certification risk should be LOW_RISK');
    assert(forecastAlpha.projectedScores.month_6 >= 90, 'Month 6 projected score should remain >= 90');

    const forecastBeta = engine.forecastCertificationTrends('tenant-beta-legacy', 6);
    assert(forecastBeta.readinessProbability < 75, `Beta readiness probability should be < 75%, got ${forecastBeta.readinessProbability}%`);
    assert(forecastBeta.remediationRecommendations.length > 0, 'Beta forecast must include remediation recommendations');
    console.log('      ✓ Certification Trend Forecaster Passed (Predictive 6-month readiness & risk flags verified)');

    // -------------------------------------------------------------------------
    // TEST 6: Operational Dashboard Reporting & HMAC Verification
    // -------------------------------------------------------------------------
    console.log('\n[6/6] Testing Operational Dashboard Report Generation & HMAC Verification...');

    const dashboardRpt = engine.generateOperationalDashboardReport();
    assert(dashboardRpt.reportId.startsWith('DASHBOARD-RPT-'), 'Report ID format mismatch');
    assert.strictEqual(dashboardRpt.tenantCount, 3, 'Dashboard report tenant count mismatch');
    assert(dashboardRpt.hmacSignature, 'Dashboard report must possess HMAC signature');
    assert(dashboardRpt.highRiskAlerts.length > 0, 'High risk alerts should contain tenant-beta-legacy');
    assert.strictEqual(dashboardRpt.highRiskAlerts[0].tenantId, 'tenant-beta-legacy');

    const isValidSignature = engine.verifyDashboardReportSignature(dashboardRpt);
    assert.strictEqual(isValidSignature, true, 'Dashboard report HMAC signature verification must return true');

    // Test tampered report verification
    const tamperedRpt = JSON.parse(JSON.stringify(dashboardRpt));
    tamperedRpt.platformMaturity.meanScore = 100;
    const isTamperedValid = engine.verifyDashboardReportSignature(tamperedRpt);
    assert.strictEqual(isTamperedValid, false, 'Tampered dashboard report signature must fail validation');

    console.log('      ✓ Operational Dashboard Report Passed (Tamper-proof HMAC signature validated)');

    console.log('\n================================================================================');
    console.log('  STREAM F (OPERATIONAL INTELLIGENCE & OBSERVABILITY): ALL 6 CHECKS PASSED 100%');
    console.log('================================================================================\n');
}

runStreamFTestSuite().catch(err => {
    console.error('FATAL: Stream F test suite failed with error:', err);
    process.exit(1);
});
