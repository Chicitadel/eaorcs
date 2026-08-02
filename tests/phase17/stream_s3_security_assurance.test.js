/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 17 Stream S3 — Security Assurance Test Suite
 * File           : tests/phase17/stream_s3_security_assurance.test.js
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

const { SastDastPipelineOrchestrator } = require(path.join(root, 'engine/security/SastDastPipelineOrchestrator'));
const { SbomValidationEngine } = require(path.join(root, 'engine/security/SbomValidationEngine'));
const { PenTestSimulationEngine } = require(path.join(root, 'engine/security/PenTestSimulationEngine'));

async function runTests() {
  console.log('\n================================================================================');
  console.log('  PHASE 17 — STREAM S3: EXTERNAL SECURITY ASSURANCE TEST SUITE');
  console.log('================================================================================\n');

  let passed = 0; let failed = 0;

  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch (e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  // SAST/DAST
  console.log('  [SastDastPipelineOrchestrator]');
  const sast = new SastDastPipelineOrchestrator();
  const sastResult = await sast.run();
  await test('SAST/DAST returns result', async () => { if (!sastResult) throw new Error('No result'); });
  await test('Status is CLEAN', async () => { if (sastResult.status !== 'CLEAN') throw new Error(`Expected CLEAN got ${sastResult.status}`); });
  await test('Zero critical vulnerabilities', async () => { if (sastResult.scanResults.criticalVulnerabilities !== 0) throw new Error(`${sastResult.scanResults.criticalVulnerabilities} critical vulns`); });
  await test('Zero high vulnerabilities', async () => { if (sastResult.scanResults.highVulnerabilities !== 0) throw new Error(`${sastResult.scanResults.highVulnerabilities} high vulns`); });
  await test('Zero exploitable vulnerabilities', async () => { if (sastResult.scanResults.exploitableVulnerabilities !== 0) throw new Error(`${sastResult.scanResults.exploitableVulnerabilities} exploitable`); });
  await test('OWASP Top 10 compliance PASS', async () => { if (sastResult.owaspTop10Compliance !== 'PASS') throw new Error(`OWASP compliance: ${sastResult.owaspTop10Compliance}`); });
  await test('All OWASP categories pass', async () => { const failed = sastResult.owaspTop10Categories.filter(c => c.status !== 'PASS'); if (failed.length > 0) throw new Error(`${failed.length} categories failed`); });

  // SBOM
  console.log('\n  [SbomValidationEngine]');
  const sbom = new SbomValidationEngine();
  const sbomResult = await sbom.run();
  await test('SBOM validation returns result', async () => { if (!sbomResult) throw new Error('No result'); });
  await test('Status is VALIDATED', async () => { if (sbomResult.status !== 'VALIDATED') throw new Error(`Expected VALIDATED got ${sbomResult.status}`); });
  await test('Zero known vulnerable components', async () => { if (sbomResult.knownVulnerableComponents !== 0) throw new Error(`${sbomResult.knownVulnerableComponents} vulnerable`); });
  await test('License compliance PASS', async () => { if (sbomResult.licenseCompliance !== 'PASS') throw new Error(`License compliance: ${sbomResult.licenseCompliance}`); });
  await test('SBOM is signed', async () => { if (!sbomResult.sbomSigned) throw new Error('SBOM not signed'); });

  // PenTest
  console.log('\n  [PenTestSimulationEngine]');
  const pentest = new PenTestSimulationEngine();
  const pentestResult = await pentest.run();
  await test('PenTest simulation returns result', async () => { if (!pentestResult) throw new Error('No result'); });
  await test('Status is PASS', async () => { if (pentestResult.status !== 'PASS') throw new Error(`Expected PASS got ${pentestResult.status}`); });
  await test('Zero exploitable vulnerabilities', async () => { if (pentestResult.exploitableVulnerabilities !== 0) throw new Error(`${pentestResult.exploitableVulnerabilities} exploitable`); });
  await test('Security posture is HARDENED', async () => { if (pentestResult.securityPosture !== 'HARDENED') throw new Error(`Posture: ${pentestResult.securityPosture}`); });
  await test('Zero-trust verified', async () => { if (!pentestResult.zeroTrustVerified) throw new Error('Zero-trust not verified'); });
  await test('All attack vectors blocked', async () => { const unblocked = pentestResult.testScenarios.filter(s => s.status !== 'BLOCKED'); if (unblocked.length > 0) throw new Error(`${unblocked.length} scenarios not blocked`); });
  await test('At least 6 test scenarios', async () => { if (pentestResult.testScenarios.length < 6) throw new Error(`Only ${pentestResult.testScenarios.length} scenarios`); });

  console.log('\n================================================================================');
  console.log(`  Stream S3 Results: ${passed} PASSED / ${failed} FAILED`);
  if (failed === 0) { console.log('  🎉 STREAM S3 — SECURITY ASSURANCE: ALL TESTS PASSED\n  Verdict: S3_SECURITY_ASSURANCE_VERIFIED'); }
  else { console.log(`  ❌ STREAM S3 FAILED: ${failed} test(s) failed`); }
  console.log('================================================================================\n');
  return { passed, failed, stream: 'S3', verdict: failed === 0 ? 'VERIFIED' : 'FAILED' };
}

if (require.main === module) {
  runTests().then(r => process.exit(r.failed > 0 ? 1 : 0)).catch(e => { console.error(e); process.exit(1); });
}
module.exports = { runTests };
