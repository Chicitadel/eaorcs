/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : StreamO3ExternalAuditorIntegrationTest
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase19\stream_o3_external_auditor_integration.test.js
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

const ExternalAuditorAccessEngine = require('../../engine/audit/ExternalAuditorAccessEngine');
const ProvenanceVerificationPortal = require('../../engine/audit/ProvenanceVerificationPortal');
const AuditorReportExporter = require('../../engine/audit/AuditorReportExporter');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  const accessEngine = new ExternalAuditorAccessEngine();
  const portal = new ProvenanceVerificationPortal();
  const exporter = new AuditorReportExporter();

  await test('ExternalAuditorAccessEngine - Read-only auditor access rules', async () => {
    const res = await accessEngine.run();
    if (res.unauthorizedAttempts !== 0) throw new Error('unauthorizedAttempts should be 0');
    if (res.auditorRoles.length < 2) throw new Error('Should have >= 2 auditor roles');
    const canModifyRoles = res.auditorRoles.filter(r => r.canModify === true);
    if (canModifyRoles.length > 0) throw new Error('All auditor roles must have canModify false');
  });

  await test('ProvenanceVerificationPortal - Artifacts independently verifiable', async () => {
    const res = await portal.run();
    if (res.verifiableArtifacts.length < 8) throw new Error('Should have >= 8 artifacts');
    const unverifiable = res.verifiableArtifacts.filter(a => a.independentlyVerifiable !== true);
    if (unverifiable.length > 0) throw new Error('All artifacts must be independentlyVerifiable');
    if (res.failedVerifications !== 0) throw new Error('failedVerifications should be 0');
    if (res.openVerification !== true) throw new Error('openVerification should be true');
  });

  await test('AuditorReportExporter - Support required formats & successful automated exports', async () => {
    const res = await exporter.run();
    if (res.supportedFormats.length < 6) throw new Error('Should have >= 6 supported formats');
    if (res.successfulExports < 5) throw new Error('Should have >= 5 successful exports');
    if (res.automatedExport !== true) throw new Error('automatedExport should be true');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests().catch(e => { console.error(e); process.exit(1); });
