/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Phase 11 Stream 6 — Product Analytics & Operational Metrics Test Suite
 * File           : tests/phase11/stream_6_product_analytics.test.js
 * Version        : 2026.1-LTS
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
 * - Corporate Policy Governed
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 * - OSAP v1.1 / v2.0
 * - OpenAPI 3.0.3
 *
 * Signatures:
 * - Enterprise Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const { TenantAnalyticsEngine, MATURITY_LEVELS, calculateComplianceGrade } = require('../../engine/saas/TenantAnalyticsEngine');
const { TenantManager } = require('../../engine/saas/TenantManager');

async function runStream6TestSuite() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 11 STREAM 6: PRODUCT ANALYTICS & OPERATIONAL METRICS TEST SUITE');
  console.log('  Scope: Multi-Tenant Compliance Aggregation, Telemetry, Maturity 1-5, Dashboard');
  console.log('================================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function test(name, fn) {
    try {
      fn();
      passedCount++;
      console.log(`  ✓ [PASS] ${name}`);
    } catch (err) {
      failedCount++;
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}`);
      if (err.stack) console.error(`     Stack: ${err.stack.split('\n')[1]}`);
    }
  }

  // =========================================================================
  // 1. Instantiation & Setup
  // =========================================================================
  console.log('[Phase 1] Engine Instantiation & Profile Management');
  let engine;
  let tenantManager;

  test('TenantAnalyticsEngine Instantiation (Standalone & Integrated)', () => {
    tenantManager = new TenantManager();
    engine = new TenantAnalyticsEngine({ tenantManager });
    assert.ok(engine, 'TenantAnalyticsEngine should instantiate successfully');
    assert.strictEqual(engine.tenantManager, tenantManager, 'TenantManager instance should be linked');
    assert.ok(engine.telemetryStore instanceof Map, 'telemetryStore should be a Map');
    assert.ok(engine.complianceStore instanceof Map, 'complianceStore should be a Map');
  });

  test('Tenant Profile Registration & Retrieval', () => {
    const profile = engine.registerTenantProfile('tenant-alpha', {
      name: 'Alpha Defense Systems',
      tier: 'Enterprise Platinum',
      industry: 'Aerospace'
    });

    assert.strictEqual(profile.tenantId, 'tenant-alpha');
    assert.strictEqual(profile.name, 'Alpha Defense Systems');
    assert.strictEqual(profile.tier, 'Enterprise Platinum');
    assert.ok(profile.registeredAt, 'Profile must have registeredAt timestamp');
  });

  test('Compliance Grade Calculation Helper Verification', () => {
    assert.strictEqual(calculateComplianceGrade(98), 'A+');
    assert.strictEqual(calculateComplianceGrade(92), 'A');
    assert.strictEqual(calculateComplianceGrade(85), 'B');
    assert.strictEqual(calculateComplianceGrade(75), 'C');
    assert.strictEqual(calculateComplianceGrade(65), 'D');
    assert.strictEqual(calculateComplianceGrade(45), 'F');
  });

  // =========================================================================
  // 2. Telemetry Ingestion & Adoption Evaluation
  // =========================================================================
  console.log('\n[Phase 2] Telemetry Ingestion & Adoption Telemetrist');

  test('Telemetry Event Ingestion', () => {
    const evt1 = engine.ingestTelemetry('tenant-alpha', {
      eventType: 'SCAN_TRIGGERED',
      userId: 'usr_alice',
      featureId: 'compliance_scanner',
      durationMs: 1200,
      status: 'SUCCESS'
    });

    const evt2 = engine.ingestTelemetry('tenant-alpha', {
      eventType: 'POLICY_EVALUATION',
      userId: 'usr_bob',
      featureId: 'policy_editor',
      durationMs: 450,
      status: 'SUCCESS'
    });

    assert.ok(evt1.eventId.startsWith('evt-'));
    assert.strictEqual(evt1.eventType, 'SCAN_TRIGGERED');
    assert.strictEqual(engine.telemetryStore.get('tenant-alpha').length, 2);
  });

  test('Tenant Adoption Evaluation (DAU/MAU, Feature Velocity, Adoption Score)', () => {
    // Ingest extra telemetry events for tenant-alpha
    for (let i = 0; i < 10; i++) {
      engine.ingestTelemetry('tenant-alpha', {
        eventType: 'API_CALL',
        userId: `usr_${i % 4}`,
        featureId: `feature_${i % 5}`,
        durationMs: 100 + i * 20
      });
    }

    const adoption = engine.evaluateAdoption('tenant-alpha');
    assert.strictEqual(adoption.tenantId, 'tenant-alpha');
    assert.strictEqual(adoption.totalEvents, 12);
    assert.ok(adoption.uniqueUsersCount >= 4, 'Unique users count should be at least 4');
    assert.ok(adoption.featuresUsedCount >= 5, 'Distinct features used should be at least 5');
    assert.ok(adoption.adoptionScore >= 50, 'Adoption score should reflect active usage');
    assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(adoption.engagementTier));
  });

  // =========================================================================
  // 3. Multi-Tenant Compliance Metrics Aggregator
  // =========================================================================
  console.log('\n[Phase 3] Multi-Tenant Compliance Metrics Aggregation');

  test('Compliance Metrics Ingestion (Multiple Tenants)', () => {
    // Ingest for tenant-alpha (High compliance)
    engine.ingestComplianceMetrics('tenant-alpha', {
      scanId: 'scan-alpha-001',
      score: 96,
      controlsTotal: 120,
      controlsPassed: 115,
      controlsFailed: 5,
      frameworks: {
        ISO_27001: { passed: 30, total: 30 },
        SOC_2: { passed: 30, total: 30 },
        OWASP_ASVS: { passed: 28, total: 30 },
        NIST: { passed: 27, total: 30 }
      },
      vulnerabilities: { critical: 0, high: 1, medium: 3, low: 8 },
      evidenceCount: 45,
      automationRate: 92,
      mttrHours: 6
    });

    // Ingest for tenant-beta (Medium compliance)
    engine.ingestComplianceMetrics('tenant-beta', {
      scanId: 'scan-beta-001',
      score: 78,
      controlsTotal: 100,
      controlsPassed: 78,
      controlsFailed: 22,
      frameworks: {
        ISO_27001: { passed: 20, total: 25 },
        SOC_2: { passed: 20, total: 25 },
        OWASP_ASVS: { passed: 18, total: 25 },
        NIST: { passed: 20, total: 25 }
      },
      vulnerabilities: { critical: 1, high: 4, medium: 10, low: 15 },
      evidenceCount: 20,
      automationRate: 70,
      mttrHours: 36
    });

    // Ingest for tenant-gamma (Low compliance)
    engine.ingestComplianceMetrics('tenant-gamma', {
      scanId: 'scan-gamma-001',
      score: 52,
      controlsTotal: 100,
      controlsPassed: 52,
      controlsFailed: 48,
      frameworks: {
        ISO_27001: { passed: 15, total: 25 },
        SOC_2: { passed: 12, total: 25 },
        OWASP_ASVS: { passed: 10, total: 25 },
        NIST: { passed: 15, total: 25 }
      },
      vulnerabilities: { critical: 3, high: 8, medium: 15, low: 20 },
      evidenceCount: 5,
      automationRate: 35,
      mttrHours: 72
    });

    assert.strictEqual(engine.complianceStore.get('tenant-alpha').length, 1);
    assert.strictEqual(engine.complianceStore.get('tenant-beta').length, 1);
    assert.strictEqual(engine.complianceStore.get('tenant-gamma').length, 1);
  });

  test('Single Tenant Compliance Aggregation', () => {
    const aggAlpha = engine.aggregateComplianceMetrics('tenant-alpha');
    assert.strictEqual(aggAlpha.scope, 'tenant-alpha');
    assert.strictEqual(aggAlpha.averageComplianceScore, 96);
    assert.strictEqual(aggAlpha.complianceGrade, 'A+');
    assert.strictEqual(aggAlpha.controlsSummary.passed, 115);
    assert.strictEqual(aggAlpha.controlsSummary.failed, 5);
    assert.strictEqual(aggAlpha.frameworkBreakdown.ISO_27001.passRate, 100);
  });

  test('Global Multi-Tenant Compliance Aggregation', () => {
    const globalAgg = engine.aggregateComplianceMetrics('GLOBAL');
    assert.strictEqual(globalAgg.scope, 'GLOBAL');
    assert.strictEqual(globalAgg.tenantsCount, 3);
    assert.strictEqual(globalAgg.totalScansEvaluated, 3);
    assert.ok(globalAgg.averageComplianceScore > 70 && globalAgg.averageComplianceScore < 80, 'Global average score should be ~75.33');
    assert.strictEqual(globalAgg.complianceGrade, 'C');
    assert.strictEqual(globalAgg.vulnerabilitySummary.critical, 4);
    assert.strictEqual(globalAgg.vulnerabilitySummary.high, 13);
    assert.ok(globalAgg.frameworkBreakdown.ISO_27001, 'ISO_27001 framework must be present in breakdown');
    assert.strictEqual(globalAgg.tenantBreakdowns.length, 3);
  });

  // =========================================================================
  // 4. Adoption Velocity Forecasting & Churn Risk Assessment
  // =========================================================================
  console.log('\n[Phase 4] Adoption Velocity Forecasting & Retention Risk');

  test('Adoption Velocity Forecasting for High Engagement Tenant', () => {
    const forecastAlpha = engine.forecastAdoptionVelocity('tenant-alpha');
    assert.strictEqual(forecastAlpha.tenantId, 'tenant-alpha');
    assert.ok(forecastAlpha.velocityScore >= 50);
    assert.ok(forecastAlpha.projections.users30Day >= forecastAlpha.projections.users60Day || forecastAlpha.projections.users30Day > 0);
    assert.strictEqual(forecastAlpha.retentionRisk.riskLevel, 'LOW');
    assert.ok(forecastAlpha.retentionRisk.churnProbability < 0.3);
  });

  test('Retention Risk & Churn Probability Assessment for Low Engagement Tenant', () => {
    const forecastGamma = engine.forecastAdoptionVelocity('tenant-gamma');
    assert.strictEqual(forecastGamma.tenantId, 'tenant-gamma');
    assert.ok(forecastGamma.retentionRisk.riskFactors.length >= 2, 'Should identify multiple risk factors for low engagement tenant');
    assert.ok(forecastGamma.retentionRisk.recommendations.length >= 1, 'Should provide actionable intervention recommendations');
  });

  // =========================================================================
  // 5. Operational Maturity Evaluator (Levels 1 to 5)
  // =========================================================================
  console.log('\n[Phase 5] Operational Maturity Evaluator (Levels 1 - 5)');

  test('Operational Maturity Evaluation — High Performer (Level 4 or 5)', () => {
    const matAlpha = engine.evaluateOperationalMaturity('tenant-alpha');
    assert.strictEqual(matAlpha.tenantId, 'tenant-alpha');
    assert.ok(matAlpha.maturityLevel >= 4, 'tenant-alpha should achieve Level 4 or 5 maturity');
    assert.ok(matAlpha.maturityScore >= 3.8, 'Maturity score must be >= 3.8');
    assert.ok(matAlpha.strengths.length > 0, 'Should report key operational strengths');
  });

  test('Operational Maturity Evaluation — Mid Tier (Level 2 or 3)', () => {
    const matBeta = engine.evaluateOperationalMaturity('tenant-beta');
    assert.strictEqual(matBeta.tenantId, 'tenant-beta');
    assert.ok(matBeta.maturityLevel >= 2 && matBeta.maturityLevel <= 3, 'tenant-beta should be Level 2 or 3');
  });

  test('Operational Maturity Evaluation — Initial / Reactive (Level 1)', () => {
    // Ingest a brand new reactive tenant
    engine.ingestComplianceMetrics('tenant-delta', {
      score: 30,
      controlsTotal: 100,
      controlsPassed: 30,
      controlsFailed: 70,
      automationRate: 10,
      mttrHours: 120,
      evidenceCount: 0
    });

    const matDelta = engine.evaluateOperationalMaturity('tenant-delta');
    assert.strictEqual(matDelta.tenantId, 'tenant-delta');
    assert.strictEqual(matDelta.maturityLevel, 1, 'tenant-delta must evaluate to Level 1 (Initial / Reactive)');
    assert.strictEqual(matDelta.levelKey, MATURITY_LEVELS.LEVEL_1.key);
    assert.ok(matDelta.gaps.length > 0, 'Level 1 tenant should highlight multiple operational gaps');
  });

  // =========================================================================
  // 6. Dashboard Generation & Metric Export
  // =========================================================================
  console.log('\n[Phase 6] Compliance Score Dashboard Reporter & Metric Exports');

  test('Compliance Score Dashboard Payload Generation', () => {
    const dashboard = engine.generateDashboard();
    assert.ok(dashboard, 'Dashboard payload should be generated');
    assert.strictEqual(dashboard.summary.totalTenants, 4);
    assert.ok(dashboard.summary.globalComplianceScore > 0);
    assert.ok(dashboard.summary.maturityDistribution.level1 >= 1);
    assert.ok(Array.isArray(dashboard.tenantMetrics));
    assert.strictEqual(dashboard.tenantMetrics.length, 4);
  });

  test('Export Dashboard to JSON', () => {
    const jsonOutput = engine.exportDashboardJSON();
    assert.ok(typeof jsonOutput === 'string', 'JSON export should return string');
    const parsed = JSON.parse(jsonOutput);
    assert.strictEqual(parsed.title, 'EAORCS Product Analytics & Operational Metrics Dashboard');
    assert.ok(parsed.summary.globalComplianceScore !== undefined);
  });

  test('Export Dashboard to Markdown Summary', () => {
    const summaryMd = engine.exportDashboardSummary();
    assert.ok(typeof summaryMd === 'string');
    assert.ok(summaryMd.includes('# EAORCS Product Analytics & Operational Metrics Report'));
    assert.ok(summaryMd.includes('## 1. Executive Summary'));
    assert.ok(summaryMd.includes('## 2. Operational Maturity Distribution'));
    assert.ok(summaryMd.includes('## 3. Regulatory Framework Matrix'));
    assert.ok(summaryMd.includes('tenant-alpha'));
  });

  test('Export OpenAPI 3.0.3 Specification for Analytics API', () => {
    const openapi = engine.exportOpenApiMetricsSpec();
    assert.strictEqual(openapi.openapi, '3.0.3');
    assert.strictEqual(openapi.info.title, 'EAORCS Product Analytics & Operational Metrics API');
    assert.ok(openapi.paths['/analytics/telemetry']);
    assert.ok(openapi.paths['/analytics/compliance']);
    assert.ok(openapi.paths['/analytics/maturity/{tenantId}']);
    assert.ok(openapi.paths['/analytics/dashboard']);
  });

  console.log('\n================================================================================');
  console.log(`  STREAM 6 VERIFICATION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================================\n');

  if (failedCount === 0) {
    console.log('✅ STREAM 6 PRODUCT ANALYTICS & OPERATIONAL METRICS: ALL CHECKS PASSED CLEANLY.\n');
    process.exit(0);
  } else {
    console.error('❌ STREAM 6 PRODUCT ANALYTICS & OPERATIONAL METRICS: VERIFICATION FAILED.\n');
    process.exit(1);
  }
}

runStream6TestSuite().catch(err => {
  console.error('Unhandled Exception in Stream 6 Test Suite:', err);
  process.exit(1);
});
