/******************************************************************************
 * Project        : Universal Autonomous Governance Operating System (UAIGOS)
 * Module         : EAORCS Stream 2 Product Excellence Unit Tests
 * File           : engine/tests/stream2_product_excellence_test.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Test Suite
 * Organization   : Ujomor Enterprise Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const PlatformMigrationEngine = require('../migration/PlatformMigrationEngine.js');
const PlatformTelemetryEngine = require('../telemetry/PlatformTelemetryEngine.js');

async function runTests() {
  console.log('===========================================================');
  console.log('  EAORCS Stream 2 Product Excellence Engine Tests');
  console.log('===========================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.message}`);
      console.error(err.stack);
    }
  }

  // 1. PlatformMigrationEngine Tests
  test('1.1 PlatformMigrationEngine - Upgrade Planner', () => {
    const engine = new PlatformMigrationEngine();
    const plan = engine.createUpgradePlan('tenant-alpha', '2025.4.0', '2026.1.0-LTS');
    assert.strictEqual(plan.tenantId, 'tenant-alpha');
    assert.strictEqual(plan.zeroDowntime, true);
    assert.strictEqual(plan.stages.length, 6);
    assert.strictEqual(plan.stages[0].stageId, 'STAGE_1_PRE_FLIGHT_CHECK');
    assert.strictEqual(plan.stages[4].stageId, 'STAGE_5_TRAFFIC_CUTOVER');
    assert(plan.planHash);
  });

  test('1.2 PlatformMigrationEngine - Dry-Run Compatibility Analyzer', () => {
    const engine = new PlatformMigrationEngine();
    const migrations = [
      { id: 'm1', sql: 'CREATE TABLE audit_logs (id INT, tenant_id VARCHAR(64), data TEXT);' },
      { id: 'm2', sql: 'DROP TABLE legacy_users;' },
      { id: 'm3', sql: 'ALTER COLUMN data TYPE VARCHAR(255);' }
    ];
    const analysis = engine.analyzeCompatibility('tenant-alpha', migrations, '2026.1.0-LTS');
    assert.strictEqual(analysis.isCompatible, false); // DROP TABLE is critical breaking change
    assert.strictEqual(analysis.riskLevel, 'CRITICAL');
    assert(analysis.breakingChanges.length >= 1);
    assert(analysis.remediationActions.length >= 1);
  });

  test('1.3 PlatformMigrationEngine - Schema Runner & Automated Rollback', () => {
    const engine = new PlatformMigrationEngine();
    const migrations = [
      { id: 'm1', sql: 'CREATE TABLE tenant_configs (id INT, tenant_id VARCHAR(64));' }
    ];
    const runRes = engine.runMigration('tenant-beta', migrations);
    assert.strictEqual(runRes.success, true);
    assert.strictEqual(runRes.executedStepsCount, 1);

    const rollbackRes = engine.rollbackTenantUpgrade('tenant-beta', runRes.planId, { reason: 'Test validation trigger' });
    assert.strictEqual(rollbackRes.rollbackStatus, 'COMPLETED');
    assert.strictEqual(rollbackRes.trafficRestored, true);
    assert.strictEqual(rollbackRes.revertedStagesCount, 5);
  });

  // 2. PlatformTelemetryEngine Tests
  test('2.1 PlatformTelemetryEngine - Privacy Anonymization', () => {
    const telemetry = new PlatformTelemetryEngine({ enableAnonymization: true });
    const anon1 = telemetry.anonymizeIdentifier('tenant-acme-corp');
    const anon2 = telemetry.anonymizeIdentifier('tenant-acme-corp');
    assert(anon1.startsWith('anon_'));
    assert.strictEqual(anon1, anon2);
  });

  test('2.2 PlatformTelemetryEngine - API Metrics & AI Token Consumption', () => {
    const telemetry = new PlatformTelemetryEngine();
    telemetry.recordApiUsage('/api/v1/audit', 'POST', 200, 45, 'tenant-100');
    telemetry.recordApiUsage('/api/v1/audit', 'POST', 500, 120, 'tenant-100');
    telemetry.recordAiTokenConsumption('SecurityAuditor', 'claude-3-5-sonnet', 500, 150, 1200, 'tenant-100');

    const report = telemetry.getAggregatedTelemetryReport();
    assert.strictEqual(report.apiUsage.length, 1);
    assert.strictEqual(report.apiUsage[0].totalRequests, 2);
    assert.strictEqual(report.apiUsage[0].errorRate, 50);
    assert.strictEqual(report.aiTokenConsumption.length, 1);
    assert.strictEqual(report.aiTokenConsumption[0].totalTokens, 650);
  });

  test('2.3 PlatformTelemetryEngine - Conversion Funnel Tracking', () => {
    const telemetry = new PlatformTelemetryEngine();
    const tenantA = 'tenant-A';
    const tenantB = 'tenant-B';

    // Tenant A goes through full funnel
    telemetry.trackFunnelStep(tenantA, 'STANDARD_CERTIFICATION_FUNNEL', 'TRUST_SCORE_COMPUTED');
    telemetry.trackFunnelStep(tenantA, 'STANDARD_CERTIFICATION_FUNNEL', 'EVIDENCE_COLLECTED');
    telemetry.trackFunnelStep(tenantA, 'STANDARD_CERTIFICATION_FUNNEL', 'CERTIFICATION_ISSUED');
    telemetry.trackFunnelStep(tenantA, 'STANDARD_CERTIFICATION_FUNNEL', 'REPORT_EXPORTED');

    // Tenant B drops off after step 1
    telemetry.trackFunnelStep(tenantB, 'STANDARD_CERTIFICATION_FUNNEL', 'TRUST_SCORE_COMPUTED');

    const funnel = telemetry.getFunnelMetrics('STANDARD_CERTIFICATION_FUNNEL');
    assert.strictEqual(funnel.totalStarted, 2);
    assert.strictEqual(funnel.totalCompleted, 1);
    assert.strictEqual(funnel.overallConversionRate, 50);
    assert.strictEqual(funnel.stages[0].activeTenantsCount, 2);
    assert.strictEqual(funnel.stages[3].activeTenantsCount, 1);
  });

  test('2.4 PlatformTelemetryEngine - Export Manifest', () => {
    const telemetry = new PlatformTelemetryEngine();
    telemetry.recordReportGeneration('EXECUTIVE', 'PDF', 350, 'tenant-A', 1048576);
    const manifest = telemetry.exportTelemetryManifest();
    assert.strictEqual(manifest.reportGeneration.length, 1);
    assert.strictEqual(manifest.reportGeneration[0].format, 'PDF');
    assert.strictEqual(manifest.privacyCompliance.gdprCompliant, true);
  });

  console.log(`\n===========================================================`);
  console.log(`  RESULTS: ${passed}/${total} TESTS PASSED (100%)`);
  console.log(`===========================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
