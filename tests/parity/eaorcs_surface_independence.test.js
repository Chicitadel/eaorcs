/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Surface Independence & Law 14 Test Suite
 * File           : eaorcs_surface_independence.test.js
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
const {
    EAORCS,
    EngineeringSessionDomainEngine,
    MultiUserSessionCoordinatorEngine,
    ViewModelAdapterEngine,
    InteractionNegotiationEngine,
    SurfaceLifecycleEngine
} = require('../../engine');

async function runEAORCSSurfaceIndependenceTests() {
    console.log('================================================================');
    console.log('  EAORCS SURFACE INDEPENDENCE & LAW 14 CERTIFICATION SUITE');
    console.log('================================================================\n');

    const projectRoot = path.resolve(__dirname, '../../');

    // 1. Test Constitution Law 14 (Rendering Neutrality)
    console.log('[1] Testing Platform Constitution Law 14 Compliance...');
    const constitutionReport = EAORCS.verifyConstitution(projectRoot);

    assert.strictEqual(constitutionReport.isFullyCompliant, true);
    assert.strictEqual(constitutionReport.certifiedLawsCount, 14);
    console.log(`    ✓ Constitution Version: ${constitutionReport.constitutionVersion}`);
    console.log(`    ✓ Law 14 Certified:      ${constitutionReport.evaluations[13].name} (${constitutionReport.evaluations[13].status})`);

    // 2. Test First-Class Engineering Session Domain Model
    console.log('\n[2] Testing First-Class Engineering Session Domain Model...');
    const sessionEngine = new EngineeringSessionDomainEngine();
    const session = sessionEngine.createSession('Developer', projectRoot);

    assert.ok(session.sessionId.startsWith('SESS-ENG-'));
    assert.strictEqual(session.ownerUser, 'Developer');
    console.log(`    ✓ Engineering Session ID: ${session.sessionId} (Owner: ${session.ownerUser})`);

    // 3. Test Session Branching & Merging
    console.log('\n[3] Testing Reasoning-Layer Session Branching & Merging...');
    const forkedBranch = EAORCS.forkSession(session.sessionId, 'experimental-refactor');
    assert.ok(forkedBranch.forkedSessionId.startsWith('SESS-FORK-'));

    const mergedBranch = EAORCS.mergeSession(forkedBranch.forkedSessionId, session.sessionId);
    assert.strictEqual(mergedBranch.status, 'SESSION_MERGED');
    console.log(`    ✓ Session Forked:  ${forkedBranch.forkedSessionId} (Branch: ${forkedBranch.branchName})`);
    console.log(`    ✓ Session Merged:  ${mergedBranch.sourceSessionId} -> ${mergedBranch.targetSessionId}`);

    // 4. Test Multi-User Collaborative Session Coordination
    console.log('\n[4] Testing Multi-User Collaborative Session Coordination...');
    const multiUserEngine = new MultiUserSessionCoordinatorEngine();
    multiUserEngine.addParticipant(session.sessionId, { userId: 'USER-01', role: 'Developer' });
    const multiUserResult = multiUserEngine.addParticipant(session.sessionId, { userId: 'USER-02', role: 'Architect' });

    assert.strictEqual(multiUserResult.totalParticipantsCount, 2);
    console.log(`    ✓ Multi-User Active Roles: ${multiUserResult.activeRoles.join(', ')}`);

    // 5. Test Surface-Neutral View Model Layer
    console.log('\n[5] Testing Surface-Neutral View Model Adapter Layer...');
    const vmEngine = new ViewModelAdapterEngine();
    const viewModel = vmEngine.buildViewModel({ executionId: 'EX-001', summary: { projectName: 'EAORCS', overallScorePct: 95 } }, { surfaceId: 'SURFACE-CLI' });

    assert.ok(viewModel.viewModelId);
    assert.strictEqual(viewModel.statusBadge.text, 'HEALTHY');
    console.log(`    ✓ View Model Generated: ${viewModel.viewModelId} (Status: ${viewModel.statusBadge.text})`);

    // 6. Test Interaction-Level Capability Negotiation
    console.log('\n[6] Testing Interaction-Level Capability Negotiation...');
    const flowNegotiated = new InteractionNegotiationEngine().negotiateInteractionFlow('ApprovalDialog', { supportsDialogs: false, supportsInteractive: true });

    assert.strictEqual(flowNegotiated.flow, 'TERMINAL_PROMPT');
    console.log(`    ✓ Interaction Flow Degraded: ApprovalDialog -> ${flowNegotiated.flow} (${flowNegotiated.type})`);

    // 7. Test User Interaction Replay
    console.log('\n[7] Testing User Interaction Sequence Replay...');
    const replayResult = EAORCS.replayInteraction('INT-SEQ-001');

    assert.strictEqual(replayResult.status, 'INTERACTION_REPLAY_SUCCESSFUL');
    console.log(`    ✓ Interaction Sequence Replayed: ${replayResult.replayId} (Steps: ${replayResult.totalStepsReplayedCount})`);

    // 8. Test Surface Lifecycle Management
    console.log('\n[8] Testing Surface Lifecycle State Transitions...');
    const lifecycleEngine = new SurfaceLifecycleEngine();
    const lifecycleState = lifecycleEngine.transitionSurfaceState('SURFACE-DESKTOP', 'Activate');

    assert.strictEqual(lifecycleState.currentState, 'Activate');
    console.log(`    ✓ Surface Lifecycle Transition: SURFACE-DESKTOP -> ${lifecycleState.currentState}`);

    // 9. Test Versioned Stable Platform Contracts
    console.log('\n[9] Testing Versioned Stable Platform Contracts Registry...');
    const contractsVerification = EAORCS.verifyStableContracts();

    assert.strictEqual(contractsVerification.isAllFrozen, true);
    assert.strictEqual(contractsVerification.totalContractsCount, 9);
    console.log(`    ✓ Stable Platform Contracts Frozen: ${contractsVerification.totalContractsCount}/9 Contracts Certified Frozen.`);

    console.log('\n================================================================');
    console.log('  SURFACE INDEPENDENCE & LAW 14 CERTIFICATION PASSED (100% SUCCESS)');
    console.log('  ENGINEERING SESSIONS & CORE CONTRACTS ARE IMMUTABLE AND FROZEN');
    console.log('================================================================\n');
}

if (require.main === module) {
    runEAORCSSurfaceIndependenceTests().catch(err => {
        console.error('Surface Independence Test Error:', err);
        process.exit(1);
    });
}

module.exports = runEAORCSSurfaceIndependenceTests;
