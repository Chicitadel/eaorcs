'use strict';

/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : ReleaseSupplyChainAttestationTests
 * File           : tests/phase18/stream_p7_release_supply_chain.test.js
 * Version        : 2026.18.0
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

const ProvenanceChainEngine = require('../../engine/release/ProvenanceChainEngine');
const ReproducibilityVerifier = require('../../engine/release/ReproducibilityVerifier');
const SupplyChainAttestationEngine = require('../../engine/release/SupplyChainAttestationEngine');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('Running Phase 18 Stream P7 Release & Supply Chain Attestation Tests...\n');

  await test('ProvenanceChainEngine returns valid end-to-end release provenance', async () => {
    const engine = new ProvenanceChainEngine();
    const result = await engine.run();
    if (result.provenanceType !== 'END_TO_END_RELEASE_PROVENANCE') throw new Error('Invalid provenanceType');
    if (!result.releaseChain || result.releaseChain.length < 5) throw new Error('Insufficient releaseChain entries');
    if (result.totalReleases !== 5) throw new Error('Invalid totalReleases');
    if (result.allSignatureValid !== true) throw new Error('allSignatureValid must be true');
    if (result.allSlsaLevel3 !== true) throw new Error('allSlsaLevel3 must be true');
    if (result.provenanceChainIntegrity !== 'VERIFIED') throw new Error('provenanceChainIntegrity must be VERIFIED');
    if (result.status !== 'ATTESTED') throw new Error('status must be ATTESTED');
  });

  await test('ReproducibilityVerifier validates deterministic builds', async () => {
    const verifier = new ReproducibilityVerifier();
    const result = await verifier.run();
    if (!result.verificationRuns || result.verificationRuns.length < 5) throw new Error('Insufficient verificationRuns entries');
    
    result.verificationRuns.forEach((run, i) => {
      if (run.originalHash !== run.reproductionHash) throw new Error(`Hashes do not match for run ${i}`);
      if (run.verdict !== 'REPRODUCIBLE') throw new Error(`Verdict is not REPRODUCIBLE for run ${i}`);
    });

    if (result.totalVerifications !== 5) throw new Error('Invalid totalVerifications');
    if (result.reproducibleBuilds !== result.totalVerifications) throw new Error('Not all builds reproducible');
    if (result.reproducibilityRate !== 100) throw new Error('Reproducibility rate not 100');
    if (result.nonReproducibleBuilds !== 0) throw new Error('Non reproducible builds must be 0');
    if (result.hermetic !== true) throw new Error('Hermetic must be true');
    if (result.status !== 'VERIFIED') throw new Error('status must be VERIFIED');
  });

  await test('SupplyChainAttestationEngine verifies SLSA 3 constraints', async () => {
    const engine = new SupplyChainAttestationEngine();
    const result = await engine.run();
    
    if (result.attestationType !== 'SUPPLY_CHAIN_SECURITY') throw new Error('Invalid attestationType');
    if (!result.supplyChainChecks || result.supplyChainChecks.length < 8) throw new Error('Insufficient supplyChainChecks entries');
    if (result.allChecksPassed !== true) throw new Error('allChecksPassed must be true');
    
    result.supplyChainChecks.forEach((check, i) => {
      if (check.status !== 'PASS') throw new Error(`Check status is not PASS for check ${i}`);
    });

    if (!result.slsaProvenance || result.slsaProvenance.level < 3) throw new Error('Invalid slsaProvenance level');
    if (result.status !== 'ATTESTED') throw new Error('status must be ATTESTED');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
