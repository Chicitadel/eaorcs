'use strict';

/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Tests
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase21\stream_s2_live_api_verification.test.js
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

const LiveApiVerificationEngine = require('../../engine/operations/LiveApiVerificationEngine');
const LiveContractDriftDetector = require('../../engine/operations/LiveContractDriftDetector');
const ApiEndpointHealthArchive = require('../../engine/operations/ApiEndpointHealthArchive');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('Running Phase 21 Stream S2 Tests...\n');

  await test('LiveApiVerificationEngine executes successfully', async () => {
    const engine = new LiveApiVerificationEngine();
    const result = await engine.run();
    if (result.status !== 'VERIFIED') throw new Error(`Expected VERIFIED, got ${result.status}`);
    if (result.verifiedEndpointsCount !== 32) throw new Error('Incorrect endpoint count');
    if (result.contractViolationsCount !== 0) throw new Error('Incorrect contract violations');
  });

  await test('LiveContractDriftDetector executes successfully', async () => {
    const detector = new LiveContractDriftDetector();
    const result = await detector.run();
    if (result.status !== 'ALIGNED') throw new Error(`Expected ALIGNED, got ${result.status}`);
    if (result.driftEventsDetectedCount !== 0) throw new Error('Incorrect drift events');
  });

  await test('ApiEndpointHealthArchive executes successfully', async () => {
    const archive = new ApiEndpointHealthArchive();
    const result = await archive.run();
    if (result.status !== 'ARCHIVED') throw new Error(`Expected ARCHIVED, got ${result.status}`);
    if (result.monitoredEndpointsCount !== 32) throw new Error('Incorrect endpoint count');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}
runTests().catch(e => { console.error(e); process.exit(1); });
