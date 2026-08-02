/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : IndependentAssuranceFramework Tests
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase18\stream_p3_independent_assurance.test.js
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

const ThirdPartyAssessmentEngine = require('../../engine/security/ThirdPartyAssessmentEngine');
const PenTestChainOfCustodyEngine = require('../../engine/security/PenTestChainOfCustodyEngine');
const ComplianceValidationChain = require('../../engine/security/ComplianceValidationChain');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('ThirdPartyAssessmentEngine validates correctly', async () => {
    const engine = new ThirdPartyAssessmentEngine();
    const result = await engine.run();
    if (result.assessments.length < 3) throw new Error('Not enough assessments');
    if (result.allPassed !== true) throw new Error('Not all passed');
    if (result.criticalFindingsTotal !== 0) throw new Error('Has critical findings');
  });

  await test('PenTestChainOfCustodyEngine validates correctly', async () => {
    const engine = new PenTestChainOfCustodyEngine();
    const result = await engine.run();
    if (result.chainIntegrity !== 'VERIFIED') throw new Error('Chain integrity not verified');
    if (result.unbrokenChain !== true) throw new Error('Chain is broken');
    if (result.custodyChain.length < 8) throw new Error('Not enough custody entries');
  });

  await test('ComplianceValidationChain validates correctly', async () => {
    const engine = new ComplianceValidationChain();
    const result = await engine.run();
    if (result.allFrameworksCompliant !== true) throw new Error('Not all frameworks compliant');
    if (result.validationFrameworks.length < 5) throw new Error('Not enough validation frameworks');
    for (const f of result.validationFrameworks) {
      if (f.outcome !== 'COMPLIANT') throw new Error(`Framework ${f.framework} not compliant`);
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}
runTests().catch(e => { console.error(e); process.exit(1); });
