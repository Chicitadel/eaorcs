/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Stream L5 Tests
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase23\stream_l5_commercial_transaction.test.js
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

const LiveCommercialTransactionAuditor = require('../../engine/operations/LiveCommercialTransactionAuditor');
const BillingGatewayReceiptProvenanceEngine = require('../../engine/operations/BillingGatewayReceiptProvenanceEngine');
const SubscriptionRetentionArchive365 = require('../../engine/operations/SubscriptionRetentionArchive365');
const fs = require('fs');
const path = require('path');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('Running Phase 23 Stream L5 Tests...');

  await test('LiveCommercialTransactionAuditor executes correctly', async () => {
    const engine = new LiveCommercialTransactionAuditor();
    const result = await engine.run();
    if (result.auditorType !== 'LIVE_COMMERCIAL_TRANSACTION_AUDITOR') throw new Error('Invalid auditorType');
    if (result.commitSha !== 'a4f8e2d9c3b17f2e1a498801') throw new Error('Invalid commitSha');
    if (result.auditedTransactionsCount !== 480) throw new Error('Invalid auditedTransactionsCount');
    if (result.transactionSuccessRatePercent !== 100) throw new Error('Invalid transactionSuccessRatePercent');
    if (result.status !== 'AUDITED') throw new Error('Invalid status');
  });

  await test('BillingGatewayReceiptProvenanceEngine executes correctly', async () => {
    const engine = new BillingGatewayReceiptProvenanceEngine();
    const result = await engine.run();
    if (result.engineType !== 'BILLING_GATEWAY_RECEIPT_PROVENANCE_ENGINE') throw new Error('Invalid engineType');
    if (result.receiptsCount !== 480) throw new Error('Invalid receiptsCount');
    if (result.gatewayResponse !== '200_SUCCESS') throw new Error('Invalid gatewayResponse');
    if (typeof result.receiptProvenanceHash !== 'string' || !result.receiptProvenanceHash.startsWith('sha256:')) throw new Error('Invalid receiptProvenanceHash');
    if (result.status !== 'VERIFIED') throw new Error('Invalid status');
  });

  await test('SubscriptionRetentionArchive365 executes correctly', async () => {
    const engine = new SubscriptionRetentionArchive365();
    const result = await engine.run();
    if (result.archiveType !== 'SUBSCRIPTION_RETENTION_ARCHIVE_365') throw new Error('Invalid archiveType');
    if (result.activeSubscriptionsCount !== 12) throw new Error('Invalid activeSubscriptionsCount');
    if (result.grossRetentionRatePercent !== 100) throw new Error('Invalid grossRetentionRatePercent');
    if (result.netRetentionRatePercent !== 130) throw new Error('Invalid netRetentionRatePercent');
    if (result.status !== 'ARCHIVED') throw new Error('Invalid status');
  });

  await test('Evidence JSON is well-formed', async () => {
    const evidencePath = path.join(__dirname, '../../evidence/phase23_commercial_transaction_evidence.json');
    const content = fs.readFileSync(evidencePath, 'utf8');
    const parsed = JSON.parse(content);
    if (parsed.status !== 'VERIFIED') throw new Error('Evidence status must be VERIFIED');
    if (parsed.phase !== 23) throw new Error('Evidence phase must be 23');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
