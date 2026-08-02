/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 24 Stream P7 Tests
 * File           : tests/phase24/stream_p7_procurement_compliance.test.js
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

const ContinuousProcurementPackageCompiler = require('../../engine/operations/ContinuousProcurementPackageCompiler');
const RfpRequirementEvidenceGraph = require('../../engine/operations/RfpRequirementEvidenceGraph');
const DueDiligenceExportManifestV2 = require('../../engine/operations/DueDiligenceExportManifestV2');

async function runTests() {
  let passed = 0; let failed = 0;
  
  async function test(name, fn) {
    try { 
      await fn(); 
      console.log(`  ✅ PASS: ${name}`); 
      passed++; 
    }
    catch(e) { 
      console.error(`  ❌ FAIL: ${name} — ${e.message}`); 
      failed++; 
    }
  }
  
  console.log('Running Phase 24 Stream P7 Tests...\n');

  await test('ContinuousProcurementPackageCompiler execution', async () => {
    const compiler = new ContinuousProcurementPackageCompiler();
    const result = await compiler.run();
    if (result.compilerType !== 'CONTINUOUS_PROCUREMENT_PACKAGE_COMPILER') throw new Error('Invalid compilerType');
    if (result.commitSha !== 'b9f3108c7e4d2a1068412891') throw new Error('Invalid commitSha');
    if (result.compiledDocumentsCount !== 84) throw new Error('Invalid compiledDocumentsCount');
    if (result.status !== 'COMPILED') throw new Error('Invalid status');
  });

  await test('RfpRequirementEvidenceGraph execution', async () => {
    const graph = new RfpRequirementEvidenceGraph();
    const result = await graph.run();
    if (result.graphType !== 'RFP_REQUIREMENT_EVIDENCE_GRAPH') throw new Error('Invalid graphType');
    if (result.mappedRfpRequirementsCount !== 210) throw new Error('Invalid mappedRfpRequirementsCount');
    if (result.evidenceCoveragePercent !== 100) throw new Error('Invalid evidenceCoveragePercent');
    if (result.graphStatus !== 'COMPLETE') throw new Error('Invalid graphStatus');
  });

  await test('DueDiligenceExportManifestV2 execution', async () => {
    const manifest = new DueDiligenceExportManifestV2();
    const result = await manifest.run();
    if (result.manifestType !== 'DUE_DILIGENCE_EXPORT_MANIFEST_V2') throw new Error('Invalid manifestType');
    if (result.registeredExportsCount !== 28) throw new Error('Invalid registeredExportsCount');
    if (result.status !== 'VERIFIED') throw new Error('Invalid status');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
