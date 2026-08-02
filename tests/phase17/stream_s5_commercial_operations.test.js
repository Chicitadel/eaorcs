/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 17 Stream S5 — Commercial Operations Test Suite
 * File           : tests/phase17/stream_s5_commercial_operations.test.js
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

const { LicensingActivationEngine } = require(path.join(root, 'engine/commercial/LicensingActivationEngine'));
const { BillingWorkflowOrchestrator } = require(path.join(root, 'engine/commercial/BillingWorkflowOrchestrator'));
const { OnboardingE2EVerifier } = require(path.join(root, 'engine/commercial/OnboardingE2EVerifier'));

async function runTests() {
  console.log('\n================================================================================');
  console.log('  PHASE 17 — STREAM S5: COMMERCIAL PLATFORM OPERATIONS TEST SUITE');
  console.log('================================================================================\n');
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch (e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('  [LicensingActivationEngine]');
  const lic = new LicensingActivationEngine();
  const licResult = await lic.run();
  await test('LicensingActivationEngine returns result', async () => { if (!licResult) throw new Error('No result'); });
  await test('Status is OPERATIONAL', async () => { if (licResult.status !== 'OPERATIONAL') throw new Error(`Status: ${licResult.status}`); });
  await test('Active licenses >= 12', async () => { if (licResult.activeLicenses < 12) throw new Error(`Only ${licResult.activeLicenses} licenses`); });
  await test('Activation workflow is AUTOMATED', async () => { if (licResult.activationWorkflow !== 'AUTOMATED') throw new Error('Not automated'); });
  await test('At least 4 license types defined', async () => { if (licResult.licenseTypes.length < 4) throw new Error(`Only ${licResult.licenseTypes.length} types`); });

  console.log('\n  [BillingWorkflowOrchestrator]');
  const billing = new BillingWorkflowOrchestrator();
  const billingResult = await billing.run();
  await test('BillingWorkflowOrchestrator returns result', async () => { if (!billingResult) throw new Error('No result'); });
  await test('Status is OPERATIONAL', async () => { if (billingResult.status !== 'OPERATIONAL') throw new Error(`Status: ${billingResult.status}`); });
  await test('Payment success rate is 100%', async () => { if (billingResult.paymentSuccessRate < 100) throw new Error(`Rate: ${billingResult.paymentSuccessRate}%`); });
  await test('Invoices generated >= 12', async () => { if (billingResult.invoicesGenerated < 12) throw new Error(`Only ${billingResult.invoicesGenerated} invoices`); });
  await test('No failed invoices', async () => { if (billingResult.invoicesFailed > 0) throw new Error(`${billingResult.invoicesFailed} failed`); });

  console.log('\n  [OnboardingE2EVerifier]');
  const onboarding = new OnboardingE2EVerifier();
  const onboardingResult = await onboarding.run();
  await test('OnboardingE2EVerifier returns result', async () => { if (!onboardingResult) throw new Error('No result'); });
  await test('Status is VERIFIED', async () => { if (onboardingResult.status !== 'VERIFIED') throw new Error(`Status: ${onboardingResult.status}`); });
  await test('Onboarding success rate is 100%', async () => { if (onboardingResult.onboardingSuccessRate < 100) throw new Error(`Rate: ${onboardingResult.onboardingSuccessRate}%`); });
  await test('All steps passed', async () => { const bad = onboardingResult.onboardingSteps.filter(s => s.status !== 'PASS'); if (bad.length > 0) throw new Error(`${bad.length} steps failed`); });
  await test('Onboarding time < 30 minutes', async () => { if (onboardingResult.averageOnboardingTimeMinutes > 30) throw new Error(`${onboardingResult.averageOnboardingTimeMinutes} min`); });

  console.log('\n================================================================================');
  console.log(`  Stream S5 Results: ${passed} PASSED / ${failed} FAILED`);
  if (failed === 0) { console.log('  🎉 STREAM S5 — COMMERCIAL OPERATIONS: ALL TESTS PASSED\n  Verdict: S5_COMMERCIAL_OPERATIONS_VERIFIED'); }
  else { console.log(`  ❌ STREAM S5 FAILED: ${failed} test(s) failed`); }
  console.log('================================================================================\n');
  return { passed, failed, stream: 'S5', verdict: failed === 0 ? 'VERIFIED' : 'FAILED' };
}

if (require.main === module) { runTests().then(r => process.exit(r.failed > 0 ? 1 : 0)).catch(e => { console.error(e); process.exit(1); }); }
module.exports = { runTests };
