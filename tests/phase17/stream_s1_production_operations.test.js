/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 17 Stream S1 — Production Operations Test Suite
 * File           : tests/phase17/stream_s1_production_operations.test.js
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

const { CanaryDeploymentController } = require(path.join(root, 'engine/operations/CanaryDeploymentController'));
const { ProductionRollbackAutomator } = require(path.join(root, 'engine/operations/ProductionRollbackAutomator'));
const { UptimeMetricsCollector } = require(path.join(root, 'engine/operations/UptimeMetricsCollector'));

async function runTests() {
  console.log('\n================================================================================');
  console.log('  PHASE 17 — STREAM S1: PRODUCTION OPERATIONS TEST SUITE');
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

  // ─── Canary Deployment Controller Tests ─────────────────────────────────────
  console.log('  [CanaryDeploymentController]');
  const canary = new CanaryDeploymentController();
  const canaryResult = await canary.run();

  await test('CanaryDeploymentController.run() returns a result', async () => {
    if (!canaryResult) throw new Error('No result returned');
  });
  await test('Canary deployment status is COMPLETE', async () => {
    if (canaryResult.deploymentStatus !== 'COMPLETE') throw new Error(`Expected COMPLETE, got ${canaryResult.deploymentStatus}`);
  });
  await test('Final traffic percent is 100', async () => {
    if (canaryResult.finalTrafficPercent !== 100) throw new Error(`Expected 100, got ${canaryResult.finalTrafficPercent}`);
  });
  await test('Rollback was NOT triggered during canary', async () => {
    if (canaryResult.rollbackTriggered !== false) throw new Error('Rollback was triggered unexpectedly');
  });
  await test('All 4 canary phases are present', async () => {
    if (!Array.isArray(canaryResult.canaryPhases) || canaryResult.canaryPhases.length !== 4) throw new Error(`Expected 4 phases, got ${canaryResult.canaryPhases?.length}`);
  });
  await test('All canary phases are HEALTHY', async () => {
    const unhealthy = canaryResult.canaryPhases.filter(p => p.status !== 'HEALTHY');
    if (unhealthy.length > 0) throw new Error(`${unhealthy.length} unhealthy phases`);
  });
  await test('Rollback readiness < 200ms', async () => {
    if (canaryResult.rollbackReadinessMs > 200) throw new Error(`Rollback readiness ${canaryResult.rollbackReadinessMs}ms exceeds 200ms`);
  });

  // ─── Production Rollback Automator Tests ────────────────────────────────────
  console.log('\n  [ProductionRollbackAutomator]');
  const rollback = new ProductionRollbackAutomator();
  const rollbackResult = await rollback.run();

  await test('ProductionRollbackAutomator.run() returns a result', async () => {
    if (!rollbackResult) throw new Error('No result returned');
  });
  await test('Rollback capability is ACTIVE', async () => {
    if (rollbackResult.rollbackCapability !== 'ACTIVE') throw new Error(`Expected ACTIVE, got ${rollbackResult.rollbackCapability}`);
  });
  await test('Automatic rollback is enabled', async () => {
    if (!rollbackResult.automaticRollbackEnabled) throw new Error('Automatic rollback not enabled');
  });
  await test('Rollback time < 200ms', async () => {
    if (rollbackResult.rollbackTimeMs > 200) throw new Error(`Rollback time ${rollbackResult.rollbackTimeMs}ms exceeds 200ms`);
  });
  await test('At least 4 trigger conditions defined', async () => {
    if (!Array.isArray(rollbackResult.triggerConditions) || rollbackResult.triggerConditions.length < 4) throw new Error('Insufficient trigger conditions');
  });
  await test('Rollback status is READY', async () => {
    if (rollbackResult.status !== 'READY') throw new Error(`Expected READY, got ${rollbackResult.status}`);
  });

  // ─── Uptime Metrics Collector Tests ─────────────────────────────────────────
  console.log('\n  [UptimeMetricsCollector]');
  const uptime = new UptimeMetricsCollector();
  const uptimeResult = await uptime.run();

  await test('UptimeMetricsCollector.run() returns a result', async () => {
    if (!uptimeResult) throw new Error('No result returned');
  });
  await test('Uptime >= 99.999%', async () => {
    if (uptimeResult.uptimePercent < 99.999) throw new Error(`Uptime ${uptimeResult.uptimePercent}% below 99.999%`);
  });
  await test('SLA target is met', async () => {
    if (!uptimeResult.slaMet) throw new Error('SLA not met');
  });
  await test('Total requests > 1 million', async () => {
    if (uptimeResult.totalRequests < 1000000) throw new Error(`Only ${uptimeResult.totalRequests} requests recorded`);
  });
  await test('P95 latency < 100ms', async () => {
    if (uptimeResult.p95LatencyMs > 100) throw new Error(`P95 ${uptimeResult.p95LatencyMs}ms exceeds 100ms`);
  });
  await test('Status is OPERATIONAL', async () => {
    if (uptimeResult.status !== 'OPERATIONAL') throw new Error(`Expected OPERATIONAL, got ${uptimeResult.status}`);
  });

  // ─── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n================================================================================');
  console.log(`  Stream S1 Results: ${passed} PASSED / ${failed} FAILED`);
  if (failed === 0) {
    console.log('  🎉 STREAM S1 — PRODUCTION OPERATIONS: ALL TESTS PASSED');
    console.log('  Verdict: S1_PRODUCTION_OPERATIONS_VERIFIED');
  } else {
    console.log(`  ❌ STREAM S1 FAILED: ${failed} test(s) failed`);
  }
  console.log('================================================================================\n');

  return { passed, failed, stream: 'S1', verdict: failed === 0 ? 'VERIFIED' : 'FAILED' };
}

if (require.main === module) {
  runTests().then(result => {
    process.exit(result.failed > 0 ? 1 : 0);
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { runTests };
