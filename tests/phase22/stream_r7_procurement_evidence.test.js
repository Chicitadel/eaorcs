'use strict';
/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Stream R7 Tests
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase22\stream_r7_procurement_evidence.test.js
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

const ContinuousProcurementBundleEngine = require('../../engine/operations/ContinuousProcurementBundleEngine');
const RfpEvidencePackageCompilerV2 = require('../../engine/operations/RfpEvidencePackageCompilerV2');
const DueDiligenceExportRegistry = require('../../engine/operations/DueDiligenceExportRegistry');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('ContinuousProcurementBundleEngine runs successfully', async () => {
    const engine = new ContinuousProcurementBundleEngine();
    const result = await engine.run();
    if (result.status !== 'GENERATED') throw new Error('Expected status GENERATED');
    if (result.compiledDocumentsCount !== 60) throw new Error('Expected 60 documents');
  });

  await test('RfpEvidencePackageCompilerV2 runs successfully', async () => {
    const compiler = new RfpEvidencePackageCompilerV2();
    const result = await compiler.run();
    if (result.status !== 'COMPILED') throw new Error('Expected status COMPILED');
    if (result.compilerVerdict !== '100% EVIDENCED') throw new Error('Expected 100% EVIDENCED');
  });

  await test('DueDiligenceExportRegistry runs successfully', async () => {
    const registry = new DueDiligenceExportRegistry();
    const result = await registry.run();
    if (result.status !== 'REGISTERED') throw new Error('Expected status REGISTERED');
    if (result.exportFormat !== 'ZIP_WITH_MANIFEST') throw new Error('Expected ZIP_WITH_MANIFEST');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
