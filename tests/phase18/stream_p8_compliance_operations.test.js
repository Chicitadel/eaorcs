/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Stream P8 Tests
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase18\stream_p8_compliance_operations.test.js
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

const RuntimeComplianceMappingEngine = require('../../engine/compliance/RuntimeComplianceMappingEngine.js');
const AuditTrailArchiver = require('../../engine/compliance/AuditTrailArchiver.js');
const EvidenceRetentionEngine = require('../../engine/compliance/EvidenceRetentionEngine.js');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('RuntimeComplianceMappingEngine validates mappings', async () => {
    const engine = new RuntimeComplianceMappingEngine();
    const result = await engine.run();
    if (result.allFrameworksCompliant !== true) throw new Error('allFrameworksCompliant is not true');
    if (result.continuousMonitoring !== true) throw new Error('continuousMonitoring is not true');
    if (result.frameworkMappings.length < 5) throw new Error('Less than 5 frameworks');
    if (!result.frameworkMappings.every(f => f.status === 'COMPLIANT')) throw new Error('Not all frameworks COMPLIANT');
  });

  await test('AuditTrailArchiver validates chain integrity', async () => {
    const engine = new AuditTrailArchiver();
    const result = await engine.run();
    if (result.auditEntries.length < 50) throw new Error('Less than 50 entries');
    if (result.chainIntegrity !== 'VERIFIED') throw new Error('chainIntegrity not VERIFIED');
    if (result.tamperedEntries !== 0) throw new Error('tamperedEntries not 0');
  });

  await test('EvidenceRetentionEngine validates retention policies', async () => {
    const engine = new EvidenceRetentionEngine();
    const result = await engine.run();
    if (result.allPoliciesCompliant !== true) throw new Error('allPoliciesCompliant not true');
    if (result.gdprCompliant !== true) throw new Error('gdprCompliant not true');
    if (result.retentionPolicies.length < 7) throw new Error('Less than 7 policies');
    if (!result.retentionPolicies.every(p => p.status === 'COMPLIANT')) throw new Error('Not all policies COMPLIANT');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
