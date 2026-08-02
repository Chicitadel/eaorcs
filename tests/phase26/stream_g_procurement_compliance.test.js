'use strict';
/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Stream G Tests
 * File           : tests/phase26/stream_g_procurement_compliance.test.js
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

const ProcurementComplianceDossierEngine = require('../../engine/operations/ProcurementComplianceDossierEngine.js');
const RfpResponseAutomationCompiler = require('../../engine/operations/RfpResponseAutomationCompiler.js');
const ExecutiveBriefingPackageGenerator = require('../../engine/operations/ExecutiveBriefingPackageGenerator.js');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }
  
  await test('ProcurementComplianceDossierEngine execution', async () => {
    const engine = new ProcurementComplianceDossierEngine();
    const result = await engine.run();
    if (result.status !== 'COMPILED') throw new Error("Expected status COMPILED");
    if (result.compiledDossierDocumentsCount !== 112) throw new Error("Expected compiledDossierDocumentsCount to be 112");
    if (result.rfpAutomationCoveragePercent !== 100) throw new Error("Expected rfpAutomationCoveragePercent to be 100");
  });

  await test('RfpResponseAutomationCompiler execution', async () => {
    const compiler = new RfpResponseAutomationCompiler();
    const result = await compiler.run();
    if (result.status !== 'READY') throw new Error("Expected status READY");
    if (result.mappedRfpQuestionsCount !== 280) throw new Error("Expected mappedRfpQuestionsCount to be 280");
  });

  await test('ExecutiveBriefingPackageGenerator execution', async () => {
    const generator = new ExecutiveBriefingPackageGenerator();
    const result = await generator.run();
    if (result.status !== 'GENERATED') throw new Error("Expected status GENERATED");
    if (result.executiveSummaryPagesCount !== 12) throw new Error("Expected executiveSummaryPagesCount to be 12");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
