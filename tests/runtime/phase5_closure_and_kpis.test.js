/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Phase 5 Closure & Commercial KPI Test Suite
 * File           : phase5_closure_and_kpis.test.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Platform Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');

async function runPhase5Suite() {
  console.log('\n=== PHASE 5: Architecture Decision Closure & Commercial KPI Suite ===\n');
  let passed = 0;
  let failed = 0;

  // 1. Architecture Decision Closure Register
  try {
    const ArchitectureDecisionClosureRegister = require('../../engine/governance/ArchitectureDecisionClosureRegister');
    const closureRegister = new ArchitectureDecisionClosureRegister();

    const summary = closureRegister.getClosureSummary();
    assert.strictEqual(summary.governanceStatus, 'ARCHITECTURAL_FREEZE_RATIFIED');
    assert.strictEqual(summary.totalClosedDecisions, 7);

    // Mutation request against closed ADR must be blocked
    const evalRes = closureRegister.evaluateMutationRequest('ADR-CLOSURE-001');
    assert.strictEqual(evalRes.allowed, false);
    assert.strictEqual(evalRes.status, 'MUTATION_BLOCKED');

    console.log('✅ 1. ArchitectureDecisionClosureRegister PASSED (7/7 ADRs Closed & Mutations Blocked)');
    passed++;
  } catch (err) {
    console.error('❌ 1. ArchitectureDecisionClosureRegister FAILED:', err.message);
    failed++;
  }

  // 2. Commercial KPI Targets Verification
  try {
    const CustomerSuccessPortal = require('../../engine/portal/CustomerSuccessPortal');
    const csp = new CustomerSuccessPortal();

    csp.registerTenantJourney('tenant-pilot-saas', 'PROFESSIONAL');
    csp.registerTenantJourney('tenant-pilot-enterprise', 'ENTERPRISE');
    csp.registerTenantJourney('tenant-pilot-sovereign', 'GOVERNMENT');

    assert.strictEqual(csp.getEngineStatus().trackedJourneys, 3);

    console.log('✅ 2. Commercial KPI Baseline PASSED (3/3 Pilot Workspaces Active in Customer Success Portal)');
    passed++;
  } catch (err) {
    console.error('❌ 2. Commercial KPI Baseline FAILED:', err.message);
    failed++;
  }

  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} PHASE 5 CLOSURE & KPI TESTS PASSED!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runPhase5Suite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runPhase5Suite };
