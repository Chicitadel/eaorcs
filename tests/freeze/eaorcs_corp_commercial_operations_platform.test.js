/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Commercial Platform Test Suite
 * File           : eaorcs_corp_commercial_operations_platform.test.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Stream D — Commercial Platform Verification
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

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const CommercialOperationsPlatformEngine = require('../../engine/commercial/CommercialOperationsPlatformEngine');

async function testCommercialOperationsPlatformSuite() {
  console.log('--- Running CommercialOperationsPlatformEngine Tests ---');
  const engine = new CommercialOperationsPlatformEngine();

  // 1. Get SKUs
  const skus = engine.getSkus();
  assert.ok(Array.isArray(skus));
  assert.ok(skus.length >= 4);
  assert.strictEqual(skus[0].id, 'SKU-STD-001');
  console.log('[PASS] 1. getSkus returned SKUs catalog');

  // 2. Subscription Lifecycle
  const subLifecycle = engine.getSubscriptionLifecycle('SUB-999');
  assert.strictEqual(subLifecycle.subscriptionId, 'SUB-999');
  assert.strictEqual(subLifecycle.status, 'Active');
  console.log('[PASS] 2. getSubscriptionLifecycle returned state info');

  // 3. Calculate Billing
  const bill = engine.calculateBilling('SKU-ENT-002', { nodes: 3, apiCalls: 500000 });
  assert.strictEqual(bill.skuId, 'SKU-ENT-002');
  assert.strictEqual(bill.tier, 'Enterprise');
  assert.ok(bill.subtotal > 0);
  assert.ok(bill.total > bill.subtotal);
  console.log('[PASS] 3. calculateBilling computed itemized billing details');

  // 4. Contract Terms
  const contract = engine.getContractTerms('MSA');
  assert.strictEqual(contract.contractType, 'MSA');
  assert.ok(contract.mandatoryClauses.length >= 3);
  console.log('[PASS] 4. getContractTerms returned mandatory clauses');

  // 5. SLA Policies
  const slas = engine.getSlaPolicies();
  assert.ok(Array.isArray(slas));
  assert.ok(slas.length >= 2);
  console.log('[PASS] 5. getSlaPolicies returned SLA targets');

  // 6. Export Commercial Platform Doc
  const testDocPath = path.resolve(__dirname, '../../../../COMMERCIAL_OPERATIONS_PLATFORM.md');
  const docResult = engine.exportCommercialPlatformDoc(testDocPath);
  assert.strictEqual(docResult.success, true);
  assert.ok(fs.existsSync(docResult.filePath));
  const fileContent = fs.readFileSync(docResult.filePath, 'utf8');
  assert.ok(fileContent.includes('Commercial Product SKUs & Pricing Matrix'));
  assert.ok(fileContent.includes('Subscription Lifecycle Management'));
  assert.ok(fileContent.includes('SKU-STD-001'));
  console.log('[PASS] 6. exportCommercialPlatformDoc exported COMMERCIAL_OPERATIONS_PLATFORM.md');

  // 7. Engine Run Execution
  const runResult = await engine.run();
  assert.strictEqual(runResult.status, 'PASS');
  assert.strictEqual(runResult.streamId, 'Stream D');
  console.log('[PASS] 7. engine.run executed successfully');

  console.log('All CommercialOperationsPlatformEngine tests passed.');
}

if (require.main === module) {
  testCommercialOperationsPlatformSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = testCommercialOperationsPlatformSuite;
