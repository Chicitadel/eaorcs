/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Stream S6 Tests
 * File           : tests/phase21/stream_s6_customer_pilot_telemetry.test.js
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

const RealTenantMetricsCollector = require('../../engine/operations/RealTenantMetricsCollector');
const SlaProofAggregator = require('../../engine/operations/SlaProofAggregator');
const CustomerOutcomeLedger = require('../../engine/operations/CustomerOutcomeLedger');
const evidence = require('../../evidence/phase21_customer_pilot_telemetry_evidence.json');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('RealTenantMetricsCollector works', async () => {
    const collector = new RealTenantMetricsCollector();
    const res = await collector.run();
    if (res.status !== 'COLLECTED') throw new Error('Expected status COLLECTED');
    if (res.monitoredPilotTenantsCount !== 12) throw new Error('Expected monitoredPilotTenantsCount 12');
  });

  await test('SlaProofAggregator works', async () => {
    const aggregator = new SlaProofAggregator();
    const res = await aggregator.run();
    if (res.status !== 'PROVED') throw new Error('Expected status PROVED');
    if (res.deliveredSlaPercent !== 99.999) throw new Error('Expected deliveredSlaPercent 99.999');
    if (!res.slaProofHash.startsWith('sha256:')) throw new Error('Expected slaProofHash');
  });

  await test('CustomerOutcomeLedger works', async () => {
    const ledger = new CustomerOutcomeLedger();
    const res = await ledger.run();
    if (res.status !== 'RECORDED') throw new Error('Expected status RECORDED');
    if (res.verifiedCustomerNpsScore !== 92) throw new Error('Expected verifiedCustomerNpsScore 92');
    if (!res.ledgerHash.startsWith('sha256:')) throw new Error('Expected ledgerHash');
  });

  await test('Evidence JSON is VERIFIED', async () => {
    if (evidence.status !== 'VERIFIED') throw new Error('Expected VERIFIED status');
    if (evidence.phase !== 'Phase 21') throw new Error('Expected Phase 21');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
