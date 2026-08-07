/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Enterprise Runtime Refinements Test Suite
 * File           : eaorcs_enterprise_runtime_refinements.test.js
 * Version        : 2026.3.0-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const {
    EAORCSRuntimeEngine,
    ExecutionPolicyEngine,
    ConsentManagerEngine,
    EngineeringTransactionEngine,
    ExecutionJournalEngine
} = require('../../engine');

async function runEnterpriseRuntimeRefinementTests() {
    console.log('================================================================');
    console.log('  TEST: EAORCS ENTERPRISE RUNTIME REFINEMENTS SUITE');
    console.log('================================================================\n');

    const projectRoot = path.resolve(__dirname, '../../');

    // 1. Test Thin Runtime Simulation Mode (Zero Side Effects)
    console.log('[1] Testing Simulation Execution Mode (Zero Side Effects)...');
    const runtimeSim = new EAORCSRuntimeEngine({ projectRoot, mode: 'Simulation' });
    runtimeSim.startHost();

    const simResult = runtimeSim.handleEvent({ type: 'FILE_SAVE', path: 'UserService.js', source: 'Notepad' });

    assert.strictEqual(simResult.mode, 'Simulation');
    assert.strictEqual(simResult.runtimeAction, 'SIMULATION_COMPLETED');
    assert.strictEqual(simResult.sideEffectsApplied, false, 'Simulation mode must have zero side effects');
    console.log('    ✓ Simulation Mode Execution Completed with Zero File Modifications.');

    // 2. Test Detached Repository Onboarding (eaorcs attach)
    console.log('\n[2] Testing Detached Repository Onboarding (attachRepository)...');
    const attachResult = runtimeSim.attachRepository(projectRoot);

    assert.strictEqual(attachResult.status, 'REPOSITORY_ATTACHED');
    assert.ok(attachResult.canonicalBlueprintId.startsWith('CBP-'));
    assert.strictEqual(attachResult.governanceInitialized, true);
    console.log(`    ✓ Attached Target Directory: ${attachResult.targetDir}`);
    console.log(`    ✓ Canonical Blueprint ID: ${attachResult.canonicalBlueprintId}`);

    // 3. Test Engineering Transaction Atomic Commit & Rollback
    console.log('\n[3] Testing EngineeringTransactionEngine Commit & Rollback...');
    const txEngine = new EngineeringTransactionEngine();
    const testFilePath = path.join(projectRoot, 'tmp_tx_test_file.txt');

    txEngine.beginTransaction('Test Staging Modification');
    txEngine.stageFileChange(testFilePath, 'Staged File Content');

    assert.strictEqual(fs.existsSync(testFilePath), false, 'Staged file should not exist on disk before commit');

    const rollbackResult = txEngine.rollbackTransaction();
    assert.strictEqual(rollbackResult.status, 'ROLLED_BACK');
    assert.strictEqual(fs.existsSync(testFilePath), false, 'Rolled back file should not exist');
    console.log('    ✓ Atomic Staging and Rollback Verified Cleanly.');

    // 4. Test Explainable Policy Decisions
    console.log('\n[4] Testing Explainable Policy Decisions...');
    const policyEngine = new ExecutionPolicyEngine();
    const explainableDecision = policyEngine.resolveDecision('MODIFY', { targetFile: 'Main.js', confidencePct: 96 });

    assert.ok(explainableDecision.reason, 'Reason must be present');
    assert.ok(explainableDecision.appliedRule, 'Applied rule must be present');
    assert.strictEqual(explainableDecision.decision, 'AUTO');
    console.log(`    ✓ Explainable Decision: ${explainableDecision.decision}`);
    console.log(`    ✓ Reason:             ${explainableDecision.reason}`);
    console.log(`    ✓ Applied Rule:       ${explainableDecision.appliedRule}`);

    // 5. Test Execution Journaling & Replay Engine
    console.log('\n[5] Testing ExecutionJournalEngine Recording & Replay...');
    const journalEngine = new ExecutionJournalEngine();
    const journalEntry = journalEngine.recordJournal({
        sessionId: 'SESS-TEST-001',
        mode: 'Interactive',
        runtimeAction: 'COMPLETED',
        kernelStateSummary: { executionId: 'EX-TEST-01', overallScorePct: 92.5 }
    });

    assert.ok(journalEntry.journalId.startsWith('JRNL-'));

    const replayed = journalEngine.replayJournal(journalEntry.journalId);
    assert.strictEqual(replayed.status, 'REPLAY_SUCCESSFUL');
    assert.strictEqual(replayed.checksumVerified, true);
    console.log(`    ✓ Journal Recorded: ${journalEntry.journalId}`);
    console.log(`    ✓ Deterministic Session Replay Status: ${replayed.status}`);

    // 6. Test Role-Based Multi-User Consent Manager
    console.log('\n[6] Testing Role-Based Multi-User Consent Manager...');
    const consentManager = new ConsentManagerEngine();

    // Architect approves MODIFY -> Allowed
    const architectConsent = consentManager.recordConsent('MODIFY:Architecture.js', true, 'session', 'Architect');
    assert.strictEqual(architectConsent.approved, true);

    // Developer attempts to approve RELEASE -> Authorization Denied Error
    assert.throws(() => {
        consentManager.recordConsent('RELEASE:Production', true, 'session', 'Developer');
    }, /Role Authorization Denied/, 'Developer role must not be authorized for RELEASE stage');

    console.log('    ✓ Architect Approval for MODIFY: Granted.');
    console.log('    ✓ Developer Approval for RELEASE: Correctly Denied by Role Authorization.');

    console.log('\n================================================================');
    console.log('  ENTERPRISE RUNTIME REFINEMENTS PASSED (100% SUCCESS PASS)');
    console.log('================================================================\n');
}

if (require.main === module) {
    runEnterpriseRuntimeRefinementTests().catch(err => {
        console.error('Enterprise Runtime Test Error:', err);
        process.exit(1);
    });
}

module.exports = runEnterpriseRuntimeRefinementTests;
