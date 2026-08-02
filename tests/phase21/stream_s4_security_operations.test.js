/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Test_Phase21_S4
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase21\stream_s4_security_operations.test.js
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

const SecOpsAttestationEngine = require('../../engine/operations/SecOpsAttestationEngine.js');
const SignedSbomRegistry = require('../../engine/operations/SignedSbomRegistry.js');
const VulnerabilityScanHistory = require('../../engine/operations/VulnerabilityScanHistory.js');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }
  
  await test('SecOpsAttestationEngine runs correctly', async () => {
    const engine = new SecOpsAttestationEngine();
    const result = await engine.run();
    if (result.attestationType !== 'SECOPS_ATTESTATION_ENGINE') throw new Error('Invalid attestationType');
    if (result.status !== 'ATTESTED') throw new Error('Invalid status');
  });

  await test('SignedSbomRegistry runs correctly', async () => {
    const engine = new SignedSbomRegistry();
    const result = await engine.run();
    if (result.registryType !== 'SIGNED_SBOM_REGISTRY') throw new Error('Invalid registryType');
    if (result.status !== 'REGISTERED') throw new Error('Invalid status');
  });

  await test('VulnerabilityScanHistory runs correctly', async () => {
    const engine = new VulnerabilityScanHistory();
    const result = await engine.run();
    if (result.historyType !== 'VULNERABILITY_SCAN_HISTORY') throw new Error('Invalid historyType');
    if (result.status !== 'CLEAN') throw new Error('Invalid status');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}
runTests().catch(e => { console.error(e); process.exit(1); });
