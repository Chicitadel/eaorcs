/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Release Engineering Tests
 * File           : tests/phase26/stream_a_release_engineering.test.js
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

const ReleaseEngineeringEngine = require('../../engine/operations/ReleaseEngineeringEngine');
const ReproducibleBuildVerifier = require('../../engine/operations/ReproducibleBuildVerifier');
const SignedReleaseArtifactRegistry = require('../../engine/operations/SignedReleaseArtifactRegistry');

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

  await test('ReleaseEngineeringEngine returns expected release candidate metadata', async () => {
    const engine = new ReleaseEngineeringEngine();
    const result = await engine.run();
    if (result.engineType !== 'RELEASE_ENGINEERING_ENGINE') throw new Error('Invalid engineType');
    if (result.releaseCandidateVersion !== '1.0.0-rc1') throw new Error('Invalid version');
    if (result.commitSha !== 'd9e5201a9f23c51085920312') throw new Error('Invalid commit sha');
    if (result.status !== 'RELEASE_READY') throw new Error('Invalid status');
    if (!result.reproducibleBuildConfirmed) throw new Error('Invalid reproducible build status');
  });

  await test('ReproducibleBuildVerifier validates parity and checksum', async () => {
    const verifier = new ReproducibleBuildVerifier();
    const result = await verifier.run();
    if (result.verifierType !== 'REPRODUCIBLE_BUILD_VERIFIER') throw new Error('Invalid verifierType');
    if (result.buildParityRatioPercent !== 100) throw new Error('Invalid parity percent');
    if (result.status !== 'VERIFIED') throw new Error('Invalid status');
  });

  await test('SignedReleaseArtifactRegistry manages signatures successfully', async () => {
    const registry = new SignedReleaseArtifactRegistry();
    const result = await registry.run();
    if (result.registryType !== 'SIGNED_RELEASE_ARTIFACT_REGISTRY') throw new Error('Invalid registryType');
    if (result.registeredArtifactsCount !== 12) throw new Error('Invalid artifact count');
    if (result.cosignSignatureStatus !== 'VALID') throw new Error('Invalid signature status');
    if (result.status !== 'REGISTERED') throw new Error('Invalid status');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
