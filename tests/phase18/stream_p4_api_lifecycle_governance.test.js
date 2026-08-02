/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : ApiLifecycleGovernance
 * File           : tests/phase18/stream_p4_api_lifecycle_governance.test.js
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

const ContractCompatibilityReporter = require('../../engine/contract/ContractCompatibilityReporter');
const MergeRequestContractGate = require('../../engine/contract/MergeRequestContractGate');
const ApiChangelogEngine = require('../../engine/contract/ApiChangelogEngine');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('ContractCompatibilityReporter outputs published reports', async () => {
    const reporter = new ContractCompatibilityReporter();
    const result = await reporter.run();
    if (result.releases.length < 5) throw new Error('Expected >= 5 releases');
    if (result.totalBreakingChanges !== 0) throw new Error('Expected 0 totalBreakingChanges');
    if (result.status !== 'PUBLISHED') throw new Error('Expected status PUBLISHED');
  });

  await test('MergeRequestContractGate enforces zero breaking changes', async () => {
    const gate = new MergeRequestContractGate();
    const result = await gate.run();
    if (result.totalBlocked !== 0) throw new Error('Expected 0 totalBlocked');
    if (result.automatedEnforcement !== true) throw new Error('Expected automatedEnforcement to be true');
    const allApproved = result.mergeRequestChecks.every(mr => mr.gateResult === 'APPROVED');
    if (!allApproved) throw new Error('Expected all MRs to be APPROVED');
  });

  await test('ApiChangelogEngine maintains backward compatibility', async () => {
    const changelog = new ApiChangelogEngine();
    const result = await changelog.run();
    if (result.changelogEntries.length < 10) throw new Error('Expected >= 10 changelog entries');
    if (result.breakingChanges !== 0) throw new Error('Expected 0 breaking changes');
    const allBackwardCompatible = result.changelogEntries.every(entry => entry.backwardCompatible === true);
    if (!allBackwardCompatible) throw new Error('Expected all entries to be backwardCompatible');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
