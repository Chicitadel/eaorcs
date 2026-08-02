/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : SupplyChainVerification
 * File           : tests/phase19/stream_o6_supply_chain_verification.test.js
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

const SbomExternalVerifier = require('../../engine/supplychain/SbomExternalVerifier.js');
const DependencyAttestationEngine = require('../../engine/supplychain/DependencyAttestationEngine.js');
const SignatureVerificationChain = require('../../engine/supplychain/SignatureVerificationChain.js');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('SbomExternalVerifier validation', async () => {
    const engine = new SbomExternalVerifier();
    const result = await engine.run();
    if (result.sbomVerifications.length < 5) throw new Error('Requires at least 5 releases');
    if (!result.sbomVerifications.every(r => r.submittedToExternalRegistry === true)) throw new Error('All releases must be submitted to external registry');
    if (result.vulnerableComponents !== 0) throw new Error('vulnerableComponents must be 0');
    if (result.status !== 'VERIFIED') throw new Error('Status must be VERIFIED');
  });

  await test('DependencyAttestationEngine validation', async () => {
    const engine = new DependencyAttestationEngine();
    const result = await engine.run();
    if (result.dependencyAttestations.length < 8) throw new Error('Requires at least 8 dependencies');
    if (result.attestedDependencies !== result.totalDependencies) throw new Error('attestedDependencies must equal totalDependencies');
    if (result.unpinnedDependencies !== 0) throw new Error('unpinnedDependencies must be 0');
    if (result.status !== 'ATTESTED') throw new Error('Status must be ATTESTED');
  });

  await test('SignatureVerificationChain validation', async () => {
    const engine = new SignatureVerificationChain();
    const result = await engine.run();
    if (result.signatureVerifications.length < 5) throw new Error('Requires at least 5 signature verifications');
    if (result.invalidSignatures !== 0) throw new Error('invalidSignatures must be 0');
    if (!result.signatureVerifications.every(v => v.independentlyVerifiable === true)) throw new Error('All signatures must be independently verifiable');
    if (result.status !== 'VERIFIED') throw new Error('Status must be VERIFIED');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
