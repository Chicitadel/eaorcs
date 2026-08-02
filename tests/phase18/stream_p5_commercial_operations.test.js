/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : CommercialOperationsAuditTrail
 * File           : tests/phase18/stream_p5_commercial_operations.test.js
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

const LicenseTransactionLedger = require('../../engine/commercial/LicenseTransactionLedger');
const BillingAuditTrail = require('../../engine/commercial/BillingAuditTrail');
const OnboardingHistoryEngine = require('../../engine/commercial/OnboardingHistoryEngine');

async function runTests() {
  let passed = 0; let failed = 0;
  
  async function test(name, fn) {
    try { 
      await fn(); 
      console.log(`  ✅ PASS: ${name}`); 
      passed++; 
    } catch(e) { 
      console.error(`  ❌ FAIL: ${name} — ${e.message}`); 
      failed++; 
    }
  }

  console.log('Running Commercial Operations Audit Trail Tests...');

  await test('LicenseTransactionLedger validates append-only transactions', async () => {
    const engine = new LicenseTransactionLedger();
    const result = await engine.run();
    
    if (result.transactions.length < 15) throw new Error('Expected at least 15 transactions');
    if (result.failedTransactions !== 0) throw new Error('Expected 0 failed transactions');
    if (result.auditTrailIntegrity !== 'VERIFIED') throw new Error('Expected auditTrailIntegrity VERIFIED');
    
    for (const tx of result.transactions) {
      if (!tx.txHash || !tx.txHash.startsWith('sha256:')) {
        throw new Error('Transaction missing valid txHash');
      }
    }
  });

  await test('BillingAuditTrail validates billing events', async () => {
    const engine = new BillingAuditTrail();
    const result = await engine.run();
    
    if (result.billingEvents.length < 20) throw new Error('Expected at least 20 billing events');
    if (result.failedPayments !== 0) throw new Error('Expected 0 failed payments');
    if (result.disputedTransactions !== 0) throw new Error('Expected 0 disputed transactions');
    if (result.auditTrailSigned !== true) throw new Error('Expected auditTrailSigned to be true');
    
    for (const evt of result.billingEvents) {
      if (!evt.eventHash || !evt.eventHash.startsWith('sha256:')) {
        throw new Error('Billing event missing valid eventHash');
      }
    }
  });

  await test('OnboardingHistoryEngine validates customer onboardings', async () => {
    const engine = new OnboardingHistoryEngine();
    const result = await engine.run();
    
    if (result.onboardingRecords.length < 12) throw new Error('Expected at least 12 onboarding records');
    if (result.failedOnboardings !== 0) throw new Error('Expected 0 failed onboardings');
    
    for (const rec of result.onboardingRecords) {
      if (rec.outcome !== 'SUCCESS') {
        throw new Error('Expected all onboarding outcomes to be SUCCESS');
      }
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
