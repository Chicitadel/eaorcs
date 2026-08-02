/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Procurement Evidence Portal
 * File           : tests/phase19/stream_o5_procurement_evidence_portal.test.js
 * Version        : 2026.19.0
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

const EvidencePackageGenerator = require('../../engine/procurement/EvidencePackageGenerator');
const DueDiligenceReporter = require('../../engine/procurement/DueDiligenceReporter');
const RfpEvidenceBundler = require('../../engine/procurement/RfpEvidenceBundler');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('EvidencePackageGenerator produces valid packages', async () => {
    const engine = new EvidencePackageGenerator();
    const result = await engine.run();
    if (result.generatedPackages.length < 5) throw new Error('Not enough packages');
    const allSigned = result.generatedPackages.every(p => p.signedAt);
    if (!allSigned) throw new Error('Not all packages are signed');
    if (!result.selfService) throw new Error('selfService must be true');
    if (result.portalUrl !== 'https://procurement.airroofers.eu/evidence') throw new Error('Invalid portalUrl');
  });

  await test('DueDiligenceReporter compiles valid reports', async () => {
    const engine = new DueDiligenceReporter();
    const result = await engine.run();
    if (result.reportSections.length < 8) throw new Error('Not enough sections');
    const allVerifiable = result.reportSections.every(s => s.externallyVerifiable);
    if (!allVerifiable) throw new Error('Not all sections are externally verifiable');
    if (!result.automatedGeneration) throw new Error('automatedGeneration must be true');
  });

  await test('RfpEvidenceBundler creates valid bundles', async () => {
    const engine = new RfpEvidenceBundler();
    const result = await engine.run();
    if (result.rfpBundles.length < 3) throw new Error('Not enough bundles');
    const allWatermarked = result.rfpBundles.every(b => b.watermarked);
    if (!allWatermarked) throw new Error('Not all bundles are watermarked');
    if (!result.standardBundleTemplate) throw new Error('standardBundleTemplate must be true');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
