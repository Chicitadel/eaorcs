/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 17 Stream S8 — Compliance & Procurement Test Suite
 * File           : tests/phase17/stream_s8_compliance_procurement.test.js
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

const { IsoSoc2EvidenceEngine } = require(path.join(root, 'engine/compliance/IsoSoc2EvidenceEngine'));
const { EuCraAiActMapper } = require(path.join(root, 'engine/compliance/EuCraAiActMapper'));
const { NistFrameworkEngine } = require(path.join(root, 'engine/compliance/NistFrameworkEngine'));

async function runTests() {
  console.log('\n================================================================================');
  console.log('  PHASE 17 — STREAM S8: COMPLIANCE & PROCUREMENT EVIDENCE TEST SUITE');
  console.log('================================================================================\n');
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch (e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('  [IsoSoc2EvidenceEngine]');
  const iso = new IsoSoc2EvidenceEngine();
  const isoResult = await iso.run();
  await test('IsoSoc2EvidenceEngine returns result', async () => { if (!isoResult) throw new Error('No result'); });
  await test('Status is VERIFIED', async () => { if (isoResult.status !== 'VERIFIED') throw new Error(`Status: ${isoResult.status}`); });
  await test('ISO 27001 is COMPLIANT', async () => { const iso27001 = isoResult.frameworks.find(f => f.name === 'ISO 27001'); if (!iso27001 || iso27001.status !== 'COMPLIANT') throw new Error('ISO 27001 not compliant'); });
  await test('ISO 27001 100% control coverage', async () => { const iso27001 = isoResult.frameworks.find(f => f.name === 'ISO 27001'); if (iso27001.compliancePercent < 100) throw new Error(`${iso27001.compliancePercent}% coverage`); });
  await test('SOC 2 Type II is COMPLIANT', async () => { const soc2 = isoResult.frameworks.find(f => f.name === 'SOC 2 Type II'); if (!soc2 || soc2.status !== 'COMPLIANT') throw new Error('SOC 2 not compliant'); });
  await test('Audit trail retention >= 365 days', async () => { if (isoResult.auditTrailRetentionDays < 365) throw new Error(`Only ${isoResult.auditTrailRetentionDays} days`); });

  console.log('\n  [EuCraAiActMapper]');
  const eu = new EuCraAiActMapper();
  const euResult = await eu.run();
  await test('EuCraAiActMapper returns result', async () => { if (!euResult) throw new Error('No result'); });
  await test('Status is VERIFIED', async () => { if (euResult.status !== 'VERIFIED') throw new Error(`Status: ${euResult.status}`); });
  await test('EU CRA cybersecurity requirements MET', async () => { if (euResult.euCra.cybersecurityRequirements !== 'MET') throw new Error('CRA requirements not met'); });
  await test('EU CRA 100% article coverage', async () => { if (euResult.euCra.compliancePercent < 100) throw new Error(`CRA: ${euResult.euCra.compliancePercent}%`); });
  await test('EU AI Act transparency obligations MET', async () => { if (euResult.euAiAct.transparencyObligations !== 'MET') throw new Error('AI Act obligations not met'); });
  await test('EU AI Act 100% article coverage', async () => { if (euResult.euAiAct.compliancePercent < 100) throw new Error(`AI Act: ${euResult.euAiAct.compliancePercent}%`); });

  console.log('\n  [NistFrameworkEngine]');
  const nist = new NistFrameworkEngine();
  const nistResult = await nist.run();
  await test('NistFrameworkEngine returns result', async () => { if (!nistResult) throw new Error('No result'); });
  await test('Status is COMPLIANT', async () => { if (nistResult.status !== 'COMPLIANT') throw new Error(`Status: ${nistResult.status}`); });
  await test('Overall compliance is 100%', async () => { if (nistResult.overallCompliancePercent < 100) throw new Error(`${nistResult.overallCompliancePercent}%`); });
  await test('NIST Tier >= 3', async () => { if (nistResult.nistTier < 3) throw new Error(`Tier: ${nistResult.nistTier}`); });
  await test('All NIST functions compliant', async () => { const nc = nistResult.functions.filter(f => f.status !== 'COMPLIANT'); if (nc.length > 0) throw new Error(`${nc.length} non-compliant functions`); });
  await test('At least 5 NIST functions defined', async () => { if (nistResult.functions.length < 5) throw new Error(`Only ${nistResult.functions.length} functions`); });

  console.log('\n================================================================================');
  console.log(`  Stream S8 Results: ${passed} PASSED / ${failed} FAILED`);
  if (failed === 0) { console.log('  🎉 STREAM S8 — COMPLIANCE & PROCUREMENT: ALL TESTS PASSED\n  Verdict: S8_COMPLIANCE_PROCUREMENT_VERIFIED'); }
  else { console.log(`  ❌ STREAM S8 FAILED: ${failed} test(s) failed`); }
  console.log('================================================================================\n');
  return { passed, failed, stream: 'S8', verdict: failed === 0 ? 'VERIFIED' : 'FAILED' };
}

if (require.main === module) { runTests().then(r => process.exit(r.failed > 0 ? 1 : 0)).catch(e => { console.error(e); process.exit(1); }); }
module.exports = { runTests };
