/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Architecture Review Board Engine Freeze Test
 * File           : eaorcs_corp_arb_change_control.test.js
 * Version        : 2026.3.1-LTS
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
 * CORP: Layer F ARB Change Control
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const { ArchitectureReviewBoardEngine, evaluateArbChangeRequest } = require('../../engine/governance/ArchitectureReviewBoardEngine');

console.log('[EAORCS Layer F Test] Starting verification of Architecture Review Board Change Control Engine...');

// 1. Instantiation Test
const engine = new ArchitectureReviewBoardEngine();
assert.ok(engine, 'ArchitectureReviewBoardEngine must instantiate');

// 2. Valid Approved Change Request Evaluation
const validAdrPayload = {
    adrId: 'ADR-2026-088',
    title: 'Extensible Telemetry Provider Surface Adapter',
    author: 'Ujomor Governance Authority',
    rationale: 'Expose non-intrusive telemetry provider hooks for Enterprise observability without altering public facade.',
    proposedChanges: ['Register TelemetryProviderAdapter in engine/adapters/'],
    impactAnalysis: {
        securityImpact: 'LOW',
        operationalCost: 'NEUTRAL',
        constitutionalLawChecks: {
            law1_SinglePublicFacade: true,
            law2_DeterministicExecution: true,
            law3_ExplainableDecisions: true,
            law4_AuditableEvidence: true,
            law5_ReversibleModifications: true,
            law6_BackwardCompliance: true,
            law7_ExplicitCapabilityContracts: true,
            law8_ZeroHiddenSideEffects: true,
            law9_NoAiOnlyDependency: true,
            law10_ReproducibleOutcomes: true,
            law11_PlatformParity: true,
            law12_NativeSurfaceExperience: true,
            law13_InteractionContinuity: true,
            law14_RenderingNeutrality: true
        }
    },
    migrationPlan: {
        steps: ['Phase 1: Deploy adapter', 'Phase 2: Enable opt-in telemetry'],
        rollbackProcedure: 'Remove adapter registration file and restart facade',
        zeroDowntime: true,
        validationScript: 'node tests/freeze/eaorcs_corp_phase1_foundation.test.js'
    },
    compatibilityReport: {
        facadeBreaking: false,
        backwardCompatible: true,
        contractParity: true
    },
    arbSignoffs: [
        { authority: 'Security Authority', signedBy: 'CISO', approved: true },
        { authority: 'Architecture Authority', signedBy: 'Principal Architect', approved: true },
        { authority: 'Governance Authority', signedBy: 'Governance Lead', approved: true }
    ]
};

const approvedResult = engine.evaluateArbChangeRequest(validAdrPayload);
assert.strictEqual(approvedResult.decision, 'APPROVED', 'Valid ADR payload should be APPROVED');
assert.strictEqual(approvedResult.gateEvaluations.completenessCheck.status, 'PASSED');
assert.strictEqual(approvedResult.gateEvaluations.impactAnalysis.status, 'PASSED');
assert.strictEqual(approvedResult.gateEvaluations.migrationPlan.status, 'PASSED');
assert.strictEqual(approvedResult.gateEvaluations.compatibilityReport.status, 'PASSED');
assert.strictEqual(approvedResult.gateEvaluations.arbSignoffs.status, 'PASSED');
assert.strictEqual(approvedResult.constitutionalCompliance.passed, true);
assert.ok(approvedResult.auditSignature, 'Evaluation must return audit cryptographic signature');
console.log('  [PASS] Valid ADR change request APPROVED successfully.');

// 3. Facade Breaking Change Request (REJECTED)
const breakingAdrPayload = JSON.parse(JSON.stringify(validAdrPayload));
breakingAdrPayload.adrId = 'ADR-2026-999';
breakingAdrPayload.compatibilityReport.facadeBreaking = true;
breakingAdrPayload.compatibilityReport.backwardCompatible = false;

const breakingResult = evaluateArbChangeRequest(breakingAdrPayload);
assert.strictEqual(breakingResult.decision, 'REJECTED', 'Facade breaking change must be REJECTED');
assert.strictEqual(breakingResult.gateEvaluations.compatibilityReport.status, 'FAILED');
assert.ok(breakingResult.criticalFailures.some(f => f.includes('Facade Breaking Change Violation')), 'Critical failures must note facade violation');
console.log('  [PASS] Facade breaking ADR change request REJECTED as expected.');

// 4. Missing Quorum ARB Sign-offs (REJECTED)
const noQuorumAdrPayload = JSON.parse(JSON.stringify(validAdrPayload));
noQuorumAdrPayload.adrId = 'ADR-2026-100';
noQuorumAdrPayload.arbSignoffs = [
    { authority: 'Security Authority', signedBy: 'CISO', approved: false }
];

const noQuorumResult = engine.evaluateArbChangeRequest(noQuorumAdrPayload);
assert.strictEqual(noQuorumResult.decision, 'REJECTED', 'ADR without sign-off quorum must be REJECTED');
assert.strictEqual(noQuorumResult.gateEvaluations.arbSignoffs.status, 'FAILED');
console.log('  [PASS] ADR without quorum REJECTED as expected.');

// 5. Constitutional Law Violation Test (Law 8 Side Effects Failure)
const lawViolationPayload = JSON.parse(JSON.stringify(validAdrPayload));
lawViolationPayload.adrId = 'ADR-2026-101';
lawViolationPayload.impactAnalysis.constitutionalLawChecks.law8_ZeroHiddenSideEffects = false;

const lawViolationResult = engine.evaluateArbChangeRequest(lawViolationPayload);
assert.strictEqual(lawViolationResult.constitutionalCompliance.passed, false, 'Constitutional compliance must fail if Law 8 is violated');
assert.ok(lawViolationResult.constitutionalCompliance.violations.length > 0);
console.log('  [PASS] Constitutional law violation detected and handled.');

// 6. Markdown ADR String Parsing Test
const markdownAdrText = `
# ADR-2026-050: Public Facade Refactoring
Status: PROPOSED
Author: Architecture Review Board

## Rationale
Refactor internal helpers while keeping EAORCS facade contracts frozen.
`;
const markdownResult = engine.evaluateArbChangeRequest(markdownAdrText);
assert.strictEqual(markdownResult.changeRequestId, 'ADR-2026-050');
assert.strictEqual(markdownResult.title, 'ADR-2026-050: Public Facade Refactoring');
assert.ok(markdownResult.decision === 'APPROVED' || markdownResult.decision === 'CONDITIONAL');
console.log('  [PASS] Markdown ADR parsed and evaluated successfully.');

console.log('[EAORCS Layer F Test] Architecture Review Board Change Control verification PASSED successfully.\n');
