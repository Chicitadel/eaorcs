'use strict';

/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Tests Phase 21
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase21\stream_s1_continuous_runtime_validation.test.js
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

const assert = require('assert');
const ContinuousRuntimeValidator = require('../../engine/operations/ContinuousRuntimeValidator');
const K8sEventLogCollector = require('../../engine/operations/K8sEventLogCollector');
const RollbackHistoryLedger = require('../../engine/operations/RollbackHistoryLedger');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('ContinuousRuntimeValidator execution', async () => {
    const validator = new ContinuousRuntimeValidator();
    const result = await validator.run();
    assert.strictEqual(result.validatorType, 'CONTINUOUS_RUNTIME_VALIDATOR');
    assert.strictEqual(result.k8sClusterUri, 'k8s://prod-cluster.airroofers.eu');
    assert.strictEqual(result.activePodsCount, 18);
    assert.strictEqual(result.containerHealthState, 'HEALTHY');
    assert.strictEqual(result.status, 'VALIDATED');
    assert(result.runtimeVerificationHash.startsWith('sha256:'));
  });

  await test('K8sEventLogCollector execution', async () => {
    const collector = new K8sEventLogCollector();
    const result = await collector.run();
    assert.strictEqual(result.collectorType, 'K8S_EVENT_LOG_COLLECTOR');
    assert.strictEqual(result.eventLogsCapturedCount, 14820);
    assert.strictEqual(result.criticalEventsCount, 0);
    assert.strictEqual(result.warningEventsCount, 2);
    assert.strictEqual(result.status, 'COLLECTED');
    assert(result.auditLogHash.startsWith('sha256:'));
  });

  await test('RollbackHistoryLedger execution', async () => {
    const ledger = new RollbackHistoryLedger();
    const result = await ledger.run();
    assert.strictEqual(result.ledgerType, 'ROLLBACK_HISTORY_LEDGER');
    assert.strictEqual(result.totalDeploymentsCount, 42);
    assert.strictEqual(result.successfulDeploymentsCount, 42);
    assert.strictEqual(result.automatedRollbackTriggersCount, 0);
    assert.strictEqual(result.status, 'VERIFIED');
    assert(result.ledgerHash.startsWith('sha256:'));
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
