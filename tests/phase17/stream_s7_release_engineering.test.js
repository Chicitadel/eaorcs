/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 17 Stream S7 — Release Engineering Test Suite
 * File           : tests/phase17/stream_s7_release_engineering.test.js
 * Version        : 2026.17.0
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const path = require('path');
const root = path.resolve(__dirname, '../..');

const { ImmutableBuildEngine } = require(path.join(root, 'engine/release/ImmutableBuildEngine'));
const { ArtifactSigningEngine } = require(path.join(root, 'engine/release/ArtifactSigningEngine'));
const { ReleasePromotionGate } = require(path.join(root, 'engine/release/ReleasePromotionGate'));

async function runTests() {
  console.log('\n================================================================================');
  console.log('  PHASE 17 — STREAM S7: IMMUTABLE RELEASE ENGINEERING TEST SUITE');
  console.log('================================================================================\n');
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch (e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('  [ImmutableBuildEngine]');
  const build = new ImmutableBuildEngine();
  const buildResult = await build.run();
  await test('ImmutableBuildEngine returns result', async () => { if (!buildResult) throw new Error('No result'); });
  await test('Status is BUILT', async () => { if (buildResult.status !== 'BUILT') throw new Error(`Status: ${buildResult.status}`); });
  await test('Build is reproducible', async () => { if (!buildResult.reproducible) throw new Error('Build not reproducible'); });
  await test('Deterministic hash present', async () => { if (!buildResult.deterministicHash || !buildResult.deterministicHash.startsWith('sha256:')) throw new Error('Invalid hash'); });
  await test('Build ID present', async () => { if (!buildResult.buildId) throw new Error('No build ID'); });

  console.log('\n  [ArtifactSigningEngine]');
  const signing = new ArtifactSigningEngine();
  const signingResult = await signing.run();
  await test('ArtifactSigningEngine returns result', async () => { if (!signingResult) throw new Error('No result'); });
  await test('Status is SIGNED', async () => { if (signingResult.status !== 'SIGNED') throw new Error(`Status: ${signingResult.status}`); });
  await test('Signature is valid', async () => { if (!signingResult.signatureValid) throw new Error('Signature invalid'); });
  await test('SLSA Level >= 3', async () => { if (signingResult.slsaLevel < 3) throw new Error(`SLSA level: ${signingResult.slsaLevel}`); });
  await test('Provenance generated', async () => { if (!signingResult.provenanceGenerated) throw new Error('Provenance not generated'); });
  await test('Ed25519 signing algorithm', async () => { if (signingResult.signingAlgorithm !== 'Ed25519') throw new Error(`Algorithm: ${signingResult.signingAlgorithm}`); });

  console.log('\n  [ReleasePromotionGate]');
  const gate = new ReleasePromotionGate();
  const gateResult = await gate.run();
  await test('ReleasePromotionGate returns result', async () => { if (!gateResult) throw new Error('No result'); });
  await test('Status is PROMOTED', async () => { if (gateResult.status !== 'PROMOTED') throw new Error(`Status: ${gateResult.status}`); });
  await test('All gates passed', async () => { if (!gateResult.allGatesPassed) throw new Error('Not all gates passed'); });
  await test('Promotion approved', async () => { if (!gateResult.promotionApproved) throw new Error('Promotion not approved'); });
  await test('Zero gates failed', async () => { if (gateResult.gatesFailed > 0) throw new Error(`${gateResult.gatesFailed} gates failed`); });
  await test('At least 6 promotion gates', async () => { if (gateResult.promotionGates.length < 6) throw new Error(`Only ${gateResult.promotionGates.length} gates`); });

  console.log('\n================================================================================');
  console.log(`  Stream S7 Results: ${passed} PASSED / ${failed} FAILED`);
  if (failed === 0) { console.log('  🎉 STREAM S7 — RELEASE ENGINEERING: ALL TESTS PASSED\n  Verdict: S7_RELEASE_ENGINEERING_VERIFIED'); }
  else { console.log(`  ❌ STREAM S7 FAILED: ${failed} test(s) failed`); }
  console.log('================================================================================\n');
  return { passed, failed, stream: 'S7', verdict: failed === 0 ? 'VERIFIED' : 'FAILED' };
}

if (require.main === module) { runTests().then(r => process.exit(r.failed > 0 ? 1 : 0)).catch(e => { console.error(e); process.exit(1); }); }
module.exports = { runTests };
