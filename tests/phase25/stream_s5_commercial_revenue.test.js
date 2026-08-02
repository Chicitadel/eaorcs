/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Commercial Revenue Stream Tests
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase25\stream_s5_commercial_revenue.test.js
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

const LiveCommercialRevenueTelemetryEngine = require('../../engine/operations/LiveCommercialRevenueTelemetryEngine');
const PaymentGatewayReceiptProvenanceLedger = require('../../engine/operations/PaymentGatewayReceiptProvenanceLedger');
const SubscriptionRetentionAnalytics365V2 = require('../../engine/operations/SubscriptionRetentionAnalytics365V2');
const evidence = require('../../evidence/phase25_commercial_revenue_evidence.json');

async function runTests() {
  let passed = 0; let failed = 0;
  
  async function test(name, fn) {
    try { 
      await fn(); 
      console.log(`  ✅ PASS: ${name}`); 
      passed++; 
    }
    catch(e) { 
      console.error(`  ❌ FAIL: ${name} — ${e.message}`); 
      failed++; 
    }
  }

  console.log('Running Phase 25 Stream S5 Tests...\n');

  await test('LiveCommercialRevenueTelemetryEngine returns correct data', async () => {
    const engine = new LiveCommercialRevenueTelemetryEngine();
    const result = await engine.run();
    if (result.engineType !== 'LIVE_COMMERCIAL_REVENUE_TELEMETRY_ENGINE') throw new Error('Invalid engineType');
    if (result.commitSha !== 'c8d4190f8e12b40974819201') throw new Error('Invalid commitSha');
    if (result.auditedTransactionsCount !== 840) throw new Error('Invalid auditedTransactionsCount');
    if (result.status !== 'AUDITED') throw new Error('Invalid status');
  });

  await test('PaymentGatewayReceiptProvenanceLedger returns correct data', async () => {
    const ledger = new PaymentGatewayReceiptProvenanceLedger();
    const result = await ledger.run();
    if (result.ledgerType !== 'PAYMENT_GATEWAY_RECEIPT_PROVENANCE_LEDGER') throw new Error('Invalid ledgerType');
    if (result.receiptsCount !== 840) throw new Error('Invalid receiptsCount');
    if (result.gatewayResponseCode !== '200_OK') throw new Error('Invalid gatewayResponseCode');
    if (result.status !== 'RECORDED') throw new Error('Invalid status');
  });

  await test('SubscriptionRetentionAnalytics365V2 returns correct data', async () => {
    const analytics = new SubscriptionRetentionAnalytics365V2();
    const result = await analytics.run();
    if (result.analyticsType !== 'SUBSCRIPTION_RETENTION_ANALYTICS_365_V2') throw new Error('Invalid analyticsType');
    if (result.activeTenantSubscriptionsCount !== 12) throw new Error('Invalid activeTenantSubscriptionsCount');
    if (result.grossRetentionRatePercent !== 100) throw new Error('Invalid grossRetentionRatePercent');
    if (result.status !== 'ANALYZED') throw new Error('Invalid status');
  });

  await test('Evidence file has correct verified status', async () => {
    if (evidence.status !== 'VERIFIED') throw new Error('Invalid evidence status');
    if (evidence.phase !== 25) throw new Error('Invalid evidence phase');
    if (evidence.stream !== 'S5') throw new Error('Invalid evidence stream');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
