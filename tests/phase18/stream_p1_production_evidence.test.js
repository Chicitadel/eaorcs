/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : StreamP1ProductionEvidenceTest
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase18\stream_p1_production_evidence.test.js
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

const ProductionDeploymentLedger = require('../../engine/evidence/ProductionDeploymentLedger');
const UptimeHistoryEngine = require('../../engine/evidence/UptimeHistoryEngine');
const AvailabilityAuditTrail = require('../../engine/evidence/AvailabilityAuditTrail');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('Running Phase 18 Stream P1 Production Evidence Tests...');

  await test('ProductionDeploymentLedger validates correctly', async () => {
    const engine = new ProductionDeploymentLedger();
    const result = await engine.run();
    if (result.ledgerType !== 'APPEND_ONLY') throw new Error('Incorrect ledgerType');
    if (result.status !== 'VERIFIED') throw new Error('Incorrect status');
    if (!Array.isArray(result.deploymentRecords) || result.deploymentRecords.length < 5) {
        throw new Error('Insufficient deployment records');
    }
    for (const record of result.deploymentRecords) {
        if (record.status !== 'SUCCESS') throw new Error('Record status not SUCCESS');
        if (record.rolledBack !== false) throw new Error('Record rolledBack should be false');
    }
  });

  await test('UptimeHistoryEngine validates correctly', async () => {
    const engine = new UptimeHistoryEngine();
    const result = await engine.run();
    if (result.ledgerType !== 'TIME_SERIES') throw new Error('Incorrect ledgerType');
    if (result.status !== 'COMPLIANT') throw new Error('Incorrect status');
    if (!Array.isArray(result.uptimeHistory) || result.uptimeHistory.length < 30) {
        throw new Error('Insufficient uptime history entries');
    }
    for (const entry of result.uptimeHistory) {
        if (entry.uptimePercent < 99.9) throw new Error('uptimePercent below threshold');
    }
  });

  await test('AvailabilityAuditTrail validates correctly', async () => {
    const engine = new AvailabilityAuditTrail();
    const result = await engine.run();
    if (result.ledgerType !== 'CHAIN_OF_CUSTODY') throw new Error('Incorrect ledgerType');
    if (result.status !== 'IMMUTABLE') throw new Error('Incorrect status');
    if (result.chainIntegrity !== 'VERIFIED') throw new Error('Chain integrity not verified');
    if (result.tamperedEntries !== 0) throw new Error('Tampered entries > 0');
    if (!Array.isArray(result.auditTrailEntries) || result.auditTrailEntries.length < 10) {
        throw new Error('Insufficient audit trail entries');
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
