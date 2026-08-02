'use strict';
/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : StreamFProcurementReadinessTest
 * File           : tests/phase20/stream_f_procurement_readiness.test.js
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

const ProductionProcurementPackageEngine = require('../../engine/validation/ProductionProcurementPackageEngine');
const LiveRfpAttestationGenerator = require('../../engine/validation/LiveRfpAttestationGenerator');
const AuditorArtifactBundler = require('../../engine/validation/AuditorArtifactBundler');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('ProductionProcurementPackageEngine returns ready status', async () => {
    const engine = new ProductionProcurementPackageEngine();
    const result = await engine.run();
    if (result.status !== 'READY') throw new Error('Expected status READY');
    if (result.engineType !== 'PRODUCTION_PROCUREMENT_PACKAGE_ENGINE') throw new Error('Expected engineType PRODUCTION_PROCUREMENT_PACKAGE_ENGINE');
    if (!result.portalDownloadUrl.includes('procurement.airroofers.eu')) throw new Error('Invalid download URL');
  });

  await test('LiveRfpAttestationGenerator returns generated status', async () => {
    const generator = new LiveRfpAttestationGenerator();
    const result = await generator.run();
    if (result.status !== 'GENERATED') throw new Error('Expected status GENERATED');
    if (result.generatorType !== 'LIVE_RFP_ATTESTATION_GENERATOR') throw new Error('Expected generatorType LIVE_RFP_ATTESTATION_GENERATOR');
    if (result.rfpQuestionsAnswered !== result.evidenceBackedAnswersCount) throw new Error('Mismatched answer counts');
  });

  await test('AuditorArtifactBundler returns bundled status', async () => {
    const bundler = new AuditorArtifactBundler();
    const result = await bundler.run();
    if (result.status !== 'BUNDLED') throw new Error('Expected status BUNDLED');
    if (result.bundlerType !== 'AUDITOR_ARTIFACT_BUNDLER') throw new Error('Expected bundlerType AUDITOR_ARTIFACT_BUNDLER');
    if (result.exportFormat !== 'ZIP_WITH_MANIFEST') throw new Error('Expected format ZIP_WITH_MANIFEST');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
