/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Tests
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase25\stream_s6_customer_success.test.js
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

const DeliveredSlaEvidenceLakeEngine = require('../../engine/operations/DeliveredSlaEvidenceLakeEngine');
const RealCustomerTelemetryGraphV2 = require('../../engine/operations/RealCustomerTelemetryGraphV2');
const CustomerSatisfactionOutcomeArchiveV2 = require('../../engine/operations/CustomerSatisfactionOutcomeArchiveV2');
const fs = require('fs');
const path = require('path');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('DeliveredSlaEvidenceLakeEngine execution', async () => {
    const engine = new DeliveredSlaEvidenceLakeEngine();
    const result = await engine.run();
    if (result.engineType !== 'DELIVERED_SLA_EVIDENCE_LAKE_ENGINE') throw new Error('Invalid engineType');
    if (result.commitSha !== 'c8d4190f8e12b40974819201') throw new Error('Invalid commitSha');
    if (result.deliveredSlaPercent !== 99.999) throw new Error('Invalid deliveredSlaPercent');
    if (result.lakeStatus !== 'SUBSTANTIATED') throw new Error('Invalid lakeStatus');
  });

  await test('RealCustomerTelemetryGraphV2 execution', async () => {
    const engine = new RealCustomerTelemetryGraphV2();
    const result = await engine.run();
    if (result.graphType !== 'REAL_CUSTOMER_TELEMETRY_GRAPH_V2') throw new Error('Invalid graphType');
    if (result.monitoredPilotTenantsCount !== 12) throw new Error('Invalid monitoredPilotTenantsCount');
    if (result.status !== 'COLLECTED') throw new Error('Invalid status');
  });

  await test('CustomerSatisfactionOutcomeArchiveV2 execution', async () => {
    const engine = new CustomerSatisfactionOutcomeArchiveV2();
    const result = await engine.run();
    if (result.archiveType !== 'CUSTOMER_SATISFACTION_OUTCOME_ARCHIVE_V2') throw new Error('Invalid archiveType');
    if (result.verifiedCustomerNpsScore !== 94) throw new Error('Invalid verifiedCustomerNpsScore');
    if (result.customerRenewalForecastPercent !== 100) throw new Error('Invalid forecast');
  });

  await test('Evidence file validation', async () => {
    const evidencePath = path.join(__dirname, '../../evidence/phase25_customer_success_evidence.json');
    const content = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
    if (content.status !== 'VERIFIED') throw new Error('Invalid status in evidence');
    if (content.phase !== 25) throw new Error('Invalid phase');
    if (content.evidence.deliveredSlaPercent !== 99.999) throw new Error('Invalid SLA in evidence');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}
runTests().catch(e => { console.error(e); process.exit(1); });
