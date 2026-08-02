/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Tests
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase25\stream_s7_procurement_compliance.test.js
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

const ContinuousProcurementPackageCompilerV2 = require('../../engine/operations/ContinuousProcurementPackageCompilerV2');
const RfpRequirementTraceabilityGraphV2 = require('../../engine/operations/RfpRequirementTraceabilityGraphV2');
const DueDiligenceExportManifestV3 = require('../../engine/operations/DueDiligenceExportManifestV3');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('ContinuousProcurementPackageCompilerV2 runs correctly', async () => {
    const engine = new ContinuousProcurementPackageCompilerV2();
    const result = await engine.run();
    if (result.status !== 'COMPILED') throw new Error('status should be COMPILED');
    if (result.compiledDocumentsCount !== 96) throw new Error('compiledDocumentsCount mismatch');
  });

  await test('RfpRequirementTraceabilityGraphV2 runs correctly', async () => {
    const engine = new RfpRequirementTraceabilityGraphV2();
    const result = await engine.run();
    if (result.graphStatus !== 'COMPLETE') throw new Error('graphStatus should be COMPLETE');
    if (result.evidenceCoveragePercent !== 100) throw new Error('evidenceCoveragePercent mismatch');
  });

  await test('DueDiligenceExportManifestV3 runs correctly', async () => {
    const engine = new DueDiligenceExportManifestV3();
    const result = await engine.run();
    if (result.status !== 'VERIFIED') throw new Error('status should be VERIFIED');
    if (result.registeredExportsCount !== 36) throw new Error('registeredExportsCount mismatch');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
