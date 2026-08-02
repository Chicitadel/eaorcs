/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 10 Stream 2 - Enterprise Integration Test Suite
 * File           : tests/phase10/stream_2_enterprise_integration.test.js
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
 * - NIST
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const IdentityAdapter = require('../../adapters/IdentityAdapter');
const BillingAdapter = require('../../adapters/BillingAdapter');
const LicensingAdapter = require('../../adapters/LicensingAdapter');
const StorageAdapter = require('../../adapters/StorageAdapter');
const TelemetryAdapter = require('../../adapters/TelemetryAdapter');
const SupportAdapter = require('../../adapters/SupportAdapter');
const NotificationsAdapter = require('../../adapters/NotificationsAdapter');
const SearchAdapter = require('../../adapters/SearchAdapter');
const AirRoofersPlatformSuite = require('../../adapters/AirRoofersPlatformSuite');

async function runStream2Tests() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 10 - STREAM 2: ENTERPRISE INTEGRATION TEST SUITE');
  console.log('  Air Roofers Platform Adapters (Identity, Billing, Licensing, Storage, Telemetry,');
  console.log('  Support, Notifications, Search) & AirRoofersPlatformSuite');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  async function testStep(name, fn) {
    process.stdout.write(`[TEST] ${name.padEnd(65)} ... `);
    try {
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log(`❌ FAIL (${err.message})`);
      console.error(err.stack);
      failed++;
    }
  }

  // ---------------------------------------------------------
  // 1. NotificationsAdapter Tests
  // ---------------------------------------------------------
  await testStep('NotificationsAdapter - Webhook dispatch', async () => {
    const adapter = new NotificationsAdapter('https://notifications.test/api', true);
    const res = await adapter.sendWebhook('https://hooks.example.com/alert', { type: 'SECURITY_ALERT', level: 'HIGH' });
    assert.strictEqual(res.status, 'queued_local');
    assert.strictEqual(res.notification.url, 'https://hooks.example.com/alert');
  });

  await testStep('NotificationsAdapter - Email alert dispatch', async () => {
    const adapter = new NotificationsAdapter('https://notifications.test/api', true);
    const res = await adapter.sendEmailAlert('secops@ujomor.com', 'Audit Discrepancy Detected', 'Critical alert details');
    assert.strictEqual(res.status, 'queued_local');
    assert.strictEqual(res.notification.recipient, 'secops@ujomor.com');
  });

  await testStep('NotificationsAdapter - Streaming event publication', async () => {
    const adapter = new NotificationsAdapter('https://notifications.test/api', true);
    const res = await adapter.publishStreamEvent('telemetry_stream', { metric: 'cpu_usage', value: 87 });
    assert.strictEqual(res.status, 'queued_local');
    assert.strictEqual(res.notification.channel, 'telemetry_stream');
  });

  await testStep('NotificationsAdapter - History filtering & clearing', async () => {
    const adapter = new NotificationsAdapter('https://notifications.test/api', true);
    await adapter.sendWebhook('https://hooks.example.com/1', { item: 1 });
    await adapter.sendEmailAlert('user@example.com', 'Sub', 'Body');
    await adapter.publishStreamEvent('ch1', { msg: 'hi' });

    const allHistory = await adapter.getNotificationHistory();
    assert.strictEqual(allHistory.length, 3);

    const emailHistory = await adapter.getNotificationHistory({ type: 'email' });
    assert.strictEqual(emailHistory.length, 1);
    assert.strictEqual(emailHistory[0].recipient, 'user@example.com');

    adapter.clearHistory();
    const emptyHistory = await adapter.getNotificationHistory();
    assert.strictEqual(emptyHistory.length, 0);
  });

  // ---------------------------------------------------------
  // 2. SearchAdapter Tests
  // ---------------------------------------------------------
  await testStep('SearchAdapter - OSAP Passport indexing & query', async () => {
    const search = new SearchAdapter('https://search.test/api', true);
    const passport = { id: 'pass_9901', version: '2.0', score: 98, subject: 'AirRoofers Core' };
    const res = await search.indexOsapPassport(passport);
    assert.strictEqual(res.status, 'indexed_local');

    const matches = await search.searchCollection('osap_passports', 'AirRoofers');
    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].id, 'pass_9901');
  });

  await testStep('SearchAdapter - Audit log & Trust graph indexing', async () => {
    const search = new SearchAdapter('https://search.test/api', true);
    await search.indexAuditLog({ id: 'audit_500', action: 'CERTIFICATE_REVOCATION', actor: 'usr_admin' });
    await search.indexTrustGraphNode({ id: 'node_alpha', label: 'Identity Edge Service', trusted: true });

    const auditResults = await search.searchCollection('audit_logs', 'REVOCATION');
    assert.strictEqual(auditResults.length, 1);

    const nodeResults = await search.searchCollection('trust_graphs', 'Identity');
    assert.strictEqual(nodeResults.length, 1);
  });

  await testStep('SearchAdapter - Global cross-collection search', async () => {
    const search = new SearchAdapter('https://search.test/api', true);
    await search.indexOsapPassport({ id: 'pass_1', vendor: 'Ujomor Tech' });
    await search.indexAuditLog({ id: 'audit_1', vendor: 'Ujomor Tech' });
    await search.indexTrustGraphNode({ id: 'node_1', vendor: 'Ujomor Tech' });

    const globalMatches = await search.globalSearch('Ujomor Tech');
    assert.strictEqual(globalMatches.length, 3);
  });

  // ---------------------------------------------------------
  // 3. AirRoofersPlatformSuite Integration Tests
  // ---------------------------------------------------------
  await testStep('AirRoofersPlatformSuite - Instantiates all 8 adapters', async () => {
    const suite = new AirRoofersPlatformSuite({ offlineMode: true });
    const adapters = suite.getAdapters();
    const adapterKeys = Object.keys(adapters);

    assert.strictEqual(adapterKeys.length, 8);
    assert.ok(adapters.identity instanceof IdentityAdapter);
    assert.ok(adapters.billing instanceof BillingAdapter);
    assert.ok(adapters.licensing instanceof LicensingAdapter);
    assert.ok(adapters.storage instanceof StorageAdapter);
    assert.ok(adapters.telemetry instanceof TelemetryAdapter);
    assert.ok(adapters.support instanceof SupportAdapter);
    assert.ok(adapters.notifications instanceof NotificationsAdapter);
    assert.ok(adapters.search instanceof SearchAdapter);
  });

  await testStep('AirRoofersPlatformSuite - Health check across all 8 adapters', async () => {
    const suite = new AirRoofersPlatformSuite({ offlineMode: true });
    const health = await suite.checkHealth();

    assert.strictEqual(health.overall, true);
    assert.strictEqual(health.healthyCount, 8);
    assert.strictEqual(health.totalAdapters, 8);
  });

  await testStep('AirRoofersPlatformSuite - Offline mode toggle propagates to all adapters', async () => {
    const suite = new AirRoofersPlatformSuite({ offlineMode: false });
    assert.strictEqual(suite.identity.offlineMode, false);
    assert.strictEqual(suite.notifications.offlineMode, false);

    suite.setOfflineMode(true);
    assert.strictEqual(suite.identity.offlineMode, true);
    assert.strictEqual(suite.billing.offlineMode, true);
    assert.strictEqual(suite.licensing.offlineMode, true);
    assert.strictEqual(suite.storage.offlineMode, true);
    assert.strictEqual(suite.telemetry.offlineMode, true);
    assert.strictEqual(suite.support.offlineMode, true);
    assert.strictEqual(suite.notifications.offlineMode, true);
    assert.strictEqual(suite.search.offlineMode, true);
  });

  await testStep('AirRoofersPlatformSuite - End-to-end integration suite execution', async () => {
    const suite = new AirRoofersPlatformSuite({ offlineMode: true });
    const result = await suite.executeIntegrationSuiteTest();

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.healthyCount, 8);
    assert.strictEqual(result.adapterResults.identity.success, true);
    assert.strictEqual(result.adapterResults.billing.success, true);
    assert.strictEqual(result.adapterResults.licensing.success, true);
    assert.strictEqual(result.adapterResults.storage.success, true);
    assert.strictEqual(result.adapterResults.telemetry.success, true);
    assert.strictEqual(result.adapterResults.support.success, true);
    assert.strictEqual(result.adapterResults.notifications.success, true);
    assert.strictEqual(result.adapterResults.search.success, true);
  });

  console.log('\n================================================================================');
  console.log(` STREAM 2 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runStream2Tests().catch(err => {
  console.error('Unhandled exception in Stream 2 tests:', err);
  process.exit(1);
});
