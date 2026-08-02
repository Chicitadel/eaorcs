/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : CommercialPlatformTests
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase26\stream_c_commercial_platform.test.js
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
'use strict';

const CommercialPlatformEntitlementEngine = require('../../engine/operations/CommercialPlatformEntitlementEngine');
const TenantBillingAndSubscriptionManager = require('../../engine/operations/TenantBillingAndSubscriptionManager');
const CustomerOnboardingWorkflowEngine = require('../../engine/operations/CustomerOnboardingWorkflowEngine');
const evidence = require('../../evidence/phase26_commercial_platform_evidence.json');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('Running Phase 26 Stream C Tests...');

  await test('CommercialPlatformEntitlementEngine run()', async () => {
    const engine = new CommercialPlatformEntitlementEngine();
    const result = await engine.run();
    if (result.engineType !== 'COMMERCIAL_PLATFORM_ENTITLEMENT_ENGINE') throw new Error('Invalid engineType');
    if (result.status !== 'OPERATIONAL') throw new Error('Invalid status');
  });

  await test('TenantBillingAndSubscriptionManager run()', async () => {
    const manager = new TenantBillingAndSubscriptionManager();
    const result = await manager.run();
    if (result.managerType !== 'TENANT_BILLING_AND_SUBSCRIPTION_MANAGER') throw new Error('Invalid managerType');
    if (result.status !== 'MANAGED') throw new Error('Invalid status');
  });

  await test('CustomerOnboardingWorkflowEngine run()', async () => {
    const engine = new CustomerOnboardingWorkflowEngine();
    const result = await engine.run();
    if (result.engineType !== 'CUSTOMER_ONBOARDING_WORKFLOW_ENGINE') throw new Error('Invalid engineType');
    if (result.status !== 'ACTIVE') throw new Error('Invalid status');
  });

  await test('Evidence JSON verifies', async () => {
    if (evidence.status !== 'VERIFIED') throw new Error('Evidence not VERIFIED');
    if (evidence.phase !== 26) throw new Error('Invalid phase');
    if (evidence.stream !== 'C') throw new Error('Invalid stream');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
