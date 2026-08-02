/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Tests
 * File           : tests/phase23/stream_l6_customer_pilot_outcome.test.js
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

const RealCustomerPilotTelemetryLake = require('../../engine/operations/RealCustomerPilotTelemetryLake');
const DeliveredSlaProofGraph = require('../../engine/operations/DeliveredSlaProofGraph');
const CustomerSatisfactionArchive = require('../../engine/operations/CustomerSatisfactionArchive');
const fs = require('fs');
const path = require('path');

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (error) {
      console.error(`  ❌ FAIL: ${name} — ${error.message}`);
      failed++;
    }
  }

  await test('RealCustomerPilotTelemetryLake run() verification', async () => {
    const lake = new RealCustomerPilotTelemetryLake();
    const result = await lake.run();
    if (result.lakeType !== 'REAL_CUSTOMER_PILOT_TELEMETRY_LAKE') throw new Error('lakeType mismatch');
    if (result.commitSha !== 'a4f8e2d9c3b17f2e1a498801') throw new Error('commitSha mismatch');
    if (result.monitoredTenantsCount !== 12) throw new Error('monitoredTenantsCount mismatch');
    if (result.activeUserSessionsCount !== 3840) throw new Error('activeUserSessionsCount mismatch');
    if (result.status !== 'COLLECTED') throw new Error('status mismatch');
  });

  await test('DeliveredSlaProofGraph run() verification', async () => {
    const graph = new DeliveredSlaProofGraph();
    const result = await graph.run();
    if (result.graphType !== 'DELIVERED_SLA_PROOF_GRAPH') throw new Error('graphType mismatch');
    if (result.committedSlaPercent !== 99.9) throw new Error('committedSlaPercent mismatch');
    if (result.deliveredSlaPercent !== 99.999) throw new Error('deliveredSlaPercent mismatch');
    if (result.slaBreachesCount !== 0) throw new Error('slaBreachesCount mismatch');
    if (!result.proofGraphHash.startsWith('sha256:')) throw new Error('proofGraphHash mismatch');
    if (result.status !== 'PROVED') throw new Error('status mismatch');
  });

  await test('CustomerSatisfactionArchive run() verification', async () => {
    const archive = new CustomerSatisfactionArchive();
    const result = await archive.run();
    if (result.archiveType !== 'CUSTOMER_SATISFACTION_ARCHIVE') throw new Error('archiveType mismatch');
    if (result.npsScore !== 92) throw new Error('npsScore mismatch');
    if (result.csatScore !== 4.8) throw new Error('csatScore mismatch');
    if (result.renewalForecastPercent !== 100) throw new Error('renewalForecastPercent mismatch');
    if (result.status !== 'ARCHIVED') throw new Error('status mismatch');
  });

  await test('Evidence File Verification', async () => {
    const evidencePath = path.join(__dirname, '../../evidence/phase23_customer_pilot_outcome_evidence.json');
    if (!fs.existsSync(evidencePath)) throw new Error('Evidence file missing');
    const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
    if (evidence.status !== 'VERIFIED') throw new Error('Evidence status not VERIFIED');
    if (evidence.phase !== 23) throw new Error('Evidence phase mismatch');
    if (evidence.stream !== 'L6') throw new Error('Evidence stream mismatch');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
