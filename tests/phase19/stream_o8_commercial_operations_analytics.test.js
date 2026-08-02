/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : StreamO8CommercialOperationsAnalyticsTest
 * File           : tests/phase19/stream_o8_commercial_operations_analytics.test.js
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

const CommercialHealthAnalytics = require('../../engine/commercial/CommercialHealthAnalytics.js');
const RenewalRiskEngine = require('../../engine/commercial/RenewalRiskEngine.js');
const CustomerHealthConnector = require('../../engine/commercial/CustomerHealthConnector.js');

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

  console.log('Running Phase 19 Stream O8 Commercial Operations Analytics Tests...');

  await test('CommercialHealthAnalytics works correctly', async () => {
    const engine = new CommercialHealthAnalytics();
    const result = await engine.run();
    if (result.overallCommercialHealth !== 'EXCELLENT') throw new Error('Invalid overallCommercialHealth');
    if (result.compositeScore < 90) throw new Error('compositeScore must be >= 90');
    if (result.healthDimensions.length < 7) throw new Error('Not enough healthDimensions');
    if (!result.healthDimensions.every(d => d.status === 'HEALTHY')) throw new Error('Not all dimensions are HEALTHY');
  });

  await test('RenewalRiskEngine works correctly', async () => {
    const engine = new RenewalRiskEngine();
    const result = await engine.run();
    if (result.highRiskTenants !== 0) throw new Error('highRiskTenants must be 0');
    if (result.lowRiskTenants !== 12) throw new Error('lowRiskTenants must be 12');
    if (result.forecastedRenewalRate !== 100) throw new Error('forecastedRenewalRate must be 100');
    if (result.tenantRiskProfiles.length !== 12) throw new Error('Missing tenantRiskProfiles');
  });

  await test('CustomerHealthConnector works correctly', async () => {
    const engine = new CustomerHealthConnector();
    const result = await engine.run();
    if (result.disconnectedTenants !== 0) throw new Error('disconnectedTenants must be 0');
    if (result.healthSignals.length < 6) throw new Error('Not enough healthSignals');
    if (!result.healthSignals.every(s => s.connectedToLiveSystem === true)) throw new Error('Not all signals are connectedToLiveSystem');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
