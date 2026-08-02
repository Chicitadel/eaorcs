/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 17 Streams S4/S5/S6 Test Suites
 * File           : tests/phase17/stream_s4_api_sdk_governance.test.js
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

const { BreakingChangeDetector } = require(path.join(root, 'engine/contract/BreakingChangeDetector'));
const { SdkSyncVerificationEngine } = require(path.join(root, 'engine/contract/SdkSyncVerificationEngine'));
const { CiCdContractGate } = require(path.join(root, 'engine/contract/CiCdContractGate'));

async function runTests() {
  console.log('\n================================================================================');
  console.log('  PHASE 17 — STREAM S4: API & SDK GOVERNANCE CI/CD TEST SUITE');
  console.log('================================================================================\n');
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch (e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('  [BreakingChangeDetector]');
  const bcd = new BreakingChangeDetector();
  const bcdResult = await bcd.run();
  await test('BreakingChangeDetector returns result', async () => { if (!bcdResult) throw new Error('No result'); });
  await test('Status is PASS', async () => { if (bcdResult.status !== 'PASS') throw new Error(`Expected PASS got ${bcdResult.status}`); });
  await test('Zero total breaking changes', async () => { if (bcdResult.totalBreakingChanges !== 0) throw new Error(`${bcdResult.totalBreakingChanges} breaking changes`); });
  await test('Promotion not blocked', async () => { if (bcdResult.promotionBlocked) throw new Error('Promotion unexpectedly blocked'); });
  await test('Backward compatibility score is 100', async () => { if (bcdResult.backwardCompatibilityScore < 100) throw new Error(`Score: ${bcdResult.backwardCompatibilityScore}`); });
  await test('All contracts are COMPATIBLE', async () => { const bad = bcdResult.analyzedContracts.filter(c => c.status !== 'COMPATIBLE'); if (bad.length > 0) throw new Error(`${bad.length} incompatible contracts`); });

  console.log('\n  [SdkSyncVerificationEngine]');
  const sdk = new SdkSyncVerificationEngine();
  const sdkResult = await sdk.run();
  await test('SdkSyncVerificationEngine returns result', async () => { if (!sdkResult) throw new Error('No result'); });
  await test('Status is VERIFIED', async () => { if (sdkResult.status !== 'VERIFIED') throw new Error(`Expected VERIFIED got ${sdkResult.status}`); });
  await test('All SDKs synced', async () => { if (!sdkResult.allSdksSynced) throw new Error('SDKs not all synced'); });
  await test('Drift score is 0', async () => { if (sdkResult.driftScore !== 0) throw new Error(`Drift score: ${sdkResult.driftScore}`); });
  await test('At least 3 SDKs verified', async () => { if (sdkResult.sdks.length < 3) throw new Error(`Only ${sdkResult.sdks.length} SDKs`); });
  await test('No SDK has drift', async () => { const drifted = sdkResult.sdks.filter(s => s.contractDriftDetected); if (drifted.length > 0) throw new Error(`${drifted.length} SDKs with drift`); });

  console.log('\n  [CiCdContractGate]');
  const gate = new CiCdContractGate();
  const gateResult = await gate.run();
  await test('CiCdContractGate returns result', async () => { if (!gateResult) throw new Error('No result'); });
  await test('Status is GATE_PASSED', async () => { if (gateResult.status !== 'GATE_PASSED') throw new Error(`Expected GATE_PASSED got ${gateResult.status}`); });
  await test('Gate result is APPROVED', async () => { if (gateResult.gateResult !== 'APPROVED') throw new Error(`Gate result: ${gateResult.gateResult}`); });
  await test('Zero blocking issues', async () => { if (gateResult.blockingIssues !== 0) throw new Error(`${gateResult.blockingIssues} blocking issues`); });
  await test('Contract coverage is 100%', async () => { if (gateResult.contractCoverage < 100) throw new Error(`Coverage: ${gateResult.contractCoverage}%`); });
  await test('All pipeline stages passed', async () => { const failed2 = gateResult.pipelineStages.filter(s => s.status !== 'PASS'); if (failed2.length > 0) throw new Error(`${failed2.length} stages failed`); });

  console.log('\n================================================================================');
  console.log(`  Stream S4 Results: ${passed} PASSED / ${failed} FAILED`);
  if (failed === 0) { console.log('  🎉 STREAM S4 — API & SDK GOVERNANCE: ALL TESTS PASSED\n  Verdict: S4_API_SDK_GOVERNANCE_VERIFIED'); }
  else { console.log(`  ❌ STREAM S4 FAILED: ${failed} test(s) failed`); }
  console.log('================================================================================\n');
  return { passed, failed, stream: 'S4', verdict: failed === 0 ? 'VERIFIED' : 'FAILED' };
}

if (require.main === module) { runTests().then(r => process.exit(r.failed > 0 ? 1 : 0)).catch(e => { console.error(e); process.exit(1); }); }
module.exports = { runTests };
