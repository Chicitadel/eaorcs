/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Test - Phase 23 Stream L7
 * File           : tests/phase23/stream_l7_procurement_evidence.test.js
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

const AutomatedProcurementPackageEngine = require('../../engine/operations/AutomatedProcurementPackageEngine');
const RfpEvidenceGraphCompiler = require('../../engine/operations/RfpEvidenceGraphCompiler');
const DueDiligenceExportManifest = require('../../engine/operations/DueDiligenceExportManifest');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('AutomatedProcurementPackageEngine verification', async () => {
    const engine = new AutomatedProcurementPackageEngine();
    const result = await engine.run();
    if (result.engineType !== 'AUTOMATED_PROCUREMENT_PACKAGE_ENGINE') throw new Error('Invalid engineType');
    if (result.compiledDocumentsCount !== 72) throw new Error('Invalid compiledDocumentsCount');
    if (result.status !== 'GENERATED') throw new Error('Invalid status');
  });

  await test('RfpEvidenceGraphCompiler verification', async () => {
    const compiler = new RfpEvidenceGraphCompiler();
    const result = await compiler.run();
    if (result.compilerType !== 'RFP_EVIDENCE_GRAPH_COMPILER') throw new Error('Invalid compilerType');
    if (result.evidenceCoveragePercent !== 100) throw new Error('Invalid evidenceCoveragePercent');
    if (result.compilerStatus !== 'COMPLETE') throw new Error('Invalid compilerStatus');
  });

  await test('DueDiligenceExportManifest verification', async () => {
    const manifest = new DueDiligenceExportManifest();
    const result = await manifest.run();
    if (result.manifestType !== 'DUE_DILIGENCE_EXPORT_MANIFEST') throw new Error('Invalid manifestType');
    if (result.exportedManifestCount !== 20) throw new Error('Invalid exportedManifestCount');
    if (result.status !== 'VERIFIED') throw new Error('Invalid status');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
