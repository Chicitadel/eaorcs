/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Pilot & Customer Success / Test Suite
 * File           : tests/phase18/stream_p6_pilot_customer_success.test.js
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

const SlaComplianceHistory = require('../../engine/operations/SlaComplianceHistory');
const CustomerSuccessScorecard = require('../../engine/operations/CustomerSuccessScorecard');
const SupportResolutionArchive = require('../../engine/operations/SupportResolutionArchive');
const assert = require('assert');

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

  console.log('Running Phase 18 Stream P6 Pilot Customer Success Tests...');

  await test('SLA Compliance History generation', async () => {
    const engine = new SlaComplianceHistory();
    const result = await engine.run();
    assert.strictEqual(result.historyType, 'TIME_SERIES_SLA_HISTORY');
    assert.ok(result.slaRecords.length >= 30, 'Should have >= 30 SLA daily records');
    assert.strictEqual(result.totalSlaBreaches, 0);
    assert.ok(result.averageSlaCompliance >= 99.9);
  });

  await test('Customer Success Scorecard validation', async () => {
    const engine = new CustomerSuccessScorecard();
    const result = await engine.run();
    assert.strictEqual(result.scorecardType, 'VERIFIED_CUSTOMER_OUTCOMES');
    assert.strictEqual(result.customerScores.length, 12, 'Should have 12 tenant scores');
    assert.ok(result.aggregateNps >= 85);
    assert.strictEqual(result.tenantsAtRisk, 0);
  });

  await test('Support Resolution Archive verification', async () => {
    const engine = new SupportResolutionArchive();
    const result = await engine.run();
    assert.strictEqual(result.archiveType, 'SUPPORT_RESOLUTION_ARCHIVE');
    assert.ok(result.resolvedCases.length >= 50, 'Should have >= 50 resolved cases');
    assert.strictEqual(result.p1Cases, 0);
    assert.ok(result.avgResolutionHours < 8);
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { 
  console.error(e); 
  process.exit(1); 
});
