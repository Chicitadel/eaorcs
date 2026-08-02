/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Tests
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase21\stream_s7_procurement_evidence.test.js
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

const ProcurementBundleGenerator = require('../../engine/operations/ProcurementBundleGenerator');
const RfpEvidencePackageCompiler = require('../../engine/operations/RfpEvidencePackageCompiler');
const DueDiligenceArtifactExporter = require('../../engine/operations/DueDiligenceArtifactExporter');

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

  console.log('Running Phase 21 Stream S7 Tests...');

  await test('ProcurementBundleGenerator should return correct bundle properties', async () => {
    const generator = new ProcurementBundleGenerator();
    const result = await generator.run();
    if (result.generatorType !== 'PROCUREMENT_BUNDLE_GENERATOR') throw new Error('Incorrect generatorType');
    if (result.compiledDocumentsCount !== 52) throw new Error('Incorrect compiledDocumentsCount');
    if (result.status !== 'GENERATED') throw new Error('Incorrect status');
  });

  await test('RfpEvidencePackageCompiler should return 100% evidenced verdict', async () => {
    const compiler = new RfpEvidencePackageCompiler();
    const result = await compiler.run();
    if (result.compilerVerdict !== '100% EVIDENCED') throw new Error('Incorrect compilerVerdict');
    if (result.answeredRfpRequirementsCount !== 140) throw new Error('Incorrect answeredRfpRequirementsCount');
    if (result.status !== 'COMPILED') throw new Error('Incorrect status');
  });

  await test('DueDiligenceArtifactExporter should export ZIP with manifest', async () => {
    const exporter = new DueDiligenceArtifactExporter();
    const result = await exporter.run();
    if (result.exporterType !== 'DUE_DILIGENCE_ARTIFACT_EXPORTER') throw new Error('Incorrect exporterType');
    if (result.exportFormat !== 'ZIP_WITH_MANIFEST') throw new Error('Incorrect exportFormat');
    if (result.status !== 'EXPORTED') throw new Error('Incorrect status');
    if (!result.exportTimestamp) throw new Error('Missing exportTimestamp');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
