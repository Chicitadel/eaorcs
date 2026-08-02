/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : SecurityOperations Test
 * File           : tests/phase22/stream_r4_security_operations.test.js
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

const ContinuousSecOpsAttestationEngine = require('../../engine/operations/ContinuousSecOpsAttestationEngine');
const SignedSbomRegistryArchive = require('../../engine/operations/SignedSbomRegistryArchive');
const LiveVulnerabilityScanLedger = require('../../engine/operations/LiveVulnerabilityScanLedger');

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${name} — ${e.message}`);
      failed++;
    }
  }

  console.log('Running Phase 22 Stream R4 Tests...');

  await test('ContinuousSecOpsAttestationEngine execution', async () => {
    const engine = new ContinuousSecOpsAttestationEngine();
    const result = await engine.run();
    if (result.status !== 'ATTESTED') throw new Error('Status mismatch');
    if (result.unaddressedCveCount !== 0) throw new Error('Unaddressed CVE count mismatch');
  });

  await test('SignedSbomRegistryArchive execution', async () => {
    const engine = new SignedSbomRegistryArchive();
    const result = await engine.run();
    if (result.status !== 'VERIFIED') throw new Error('Status mismatch');
    if (result.cosignVerifiedComponentsCount !== 42) throw new Error('Components count mismatch');
  });

  await test('LiveVulnerabilityScanLedger execution', async () => {
    const engine = new LiveVulnerabilityScanLedger();
    const result = await engine.run();
    if (result.status !== 'CLEAN') throw new Error('Status mismatch');
    if (result.criticalVulnerabilitiesCount !== 0) throw new Error('Critical vulnerabilities count mismatch');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
