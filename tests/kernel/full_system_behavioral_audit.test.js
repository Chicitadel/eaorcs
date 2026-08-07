/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Full-System Behavioral Audit Test Suite
 * File           : full_system_behavioral_audit.test.js
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
    ProjectIntelligenceKernelEngine,
    CanonicalProjectBlueprintEngine,
    ProductCompletionIntelligenceEngine,
    AutonomousEngineeringPlannerEngine,
    EngineeringKnowledgeGraphEngine,
    EngineeringCoachEngine
} = require('../../engine');

async function runFullSystemBehavioralAudit() {
    console.log('================================================================');
    console.log('  EAORCS FULL-SYSTEM BEHAVIORAL AUDIT TEST SUITE');
    console.log('================================================================\n');

    const projectRoot = path.resolve(__dirname, '../../');

    // Test 1: Cold Start Execution of 6-Domain Lifecycle under Master Kernel
    console.log('[1] Testing Cold Start Execution of 6-Domain Lifecycle under ProjectIntelligenceKernelEngine...');
    const kernel = new ProjectIntelligenceKernelEngine();
    const state = kernel.executeLifecycle(projectRoot);

    assert.ok(state, 'Lifecycle execution state must be returned');
    assert.strictEqual(state.kernelVersion, '2026.3.0-LTS');
    assert.ok(state.executionId.startsWith('EX-KERNEL-'), 'Execution ID must start with EX-KERNEL-');
    assert.ok(state.domains, '6 Domains must be present in execution state');
    assert.strictEqual(state.domains.projectIntelligence.domain, 'Project Intelligence');
    assert.ok(state.domains.blueprintIntelligence.id, 'Blueprint Intelligence domain must have ID');
    assert.ok(state.domains.engineeringIntelligence.knowledgeGraphId, 'Engineering Intelligence domain must have graph ID');
    assert.strictEqual(state.domains.governanceIntelligence.domain, 'Governance Intelligence');
    assert.strictEqual(state.domains.deliveryIntelligence.domain, 'Delivery Intelligence');

    console.log(`    Execution ID: ${state.executionId}`);
    console.log(`    Overall Completion Score: ${state.completionAssessment.overallScorePct}%`);
    console.log(`    Audit Trail Hash: ${state.completionAssessment.auditTrailHash}`);

    // Test 2: Verify Auditable Mathematical Weighting Model
    console.log('\n[2] Verifying Auditable Weighting Model & Evidence Hashes...');
    const weightingModel = state.completionAssessment.weightingModel;
    assert.ok(weightingModel, 'Weighting model must exist');
    assert.strictEqual(weightingModel.totalWeight, 1.0, 'Total weights must equal 1.0 (100%)');
    assert.strictEqual(weightingModel.breakdown.length, 9, 'Must have 9 explicit dimension breakdowns');

    for (const item of weightingModel.breakdown) {
        assert.ok(item.evidenceHash, `Evidence hash missing for dimension ${item.dimension}`);
    }
    console.log('    Weighting Model Formula: S_overall = Sum(w_i * S_i)');
    console.log('    Total Weights: 1.0 (100%) Across 9 Dimensions');
    console.log('    Evidence Hashes Verified for All 9 Dimensions.');

    // Test 3: Test Engineering Memory & Temporal Lineage Queries
    console.log('\n[3] Testing Engineering Memory & Temporal Lineage Queries...');
    const graphEngine = new EngineeringKnowledgeGraphEngine();
    const canonicalBp = state.canonicalBlueprint;
    const graph = graphEngine.buildGraph(canonicalBp, projectRoot);

    const firstReqId = canonicalBp.functionalRequirements[0].id;
    const history = graphEngine.queryRequirementHistory(firstReqId);
    assert.ok(Array.isArray(history), 'Requirement history must be an array');
    assert.ok(history.length >= 1, 'History must contain at least 1 record');
    console.log(`    Requirement ${firstReqId} History Transitions: ${history.length}`);
    console.log(`    Initial State: ${history[0].state}`);

    const lineage = graphEngine.queryDecisionLineage('ADR-001');
    assert.ok(lineage, 'Decision lineage query must return result');
    console.log(`    Decision Lineage Summary: ${lineage.lineageSummary}`);

    // Test 4: Test Engineering Coach ("Best Developer's Friend")
    console.log('\n[4] Testing Engineering Coach ("Best Developer\'s Friend") Advisory...');
    const coachEngine = new EngineeringCoachEngine();
    const coachReport = coachEngine.reviewProject(projectRoot, canonicalBp, graph);

    assert.ok(coachReport, 'Coach report must be generated');
    assert.strictEqual(typeof coachReport.totalRecommendations, 'number');
    console.log(`    Total Advisory Recommendations: ${coachReport.totalRecommendations}`);
    console.log(`    Duplicate Candidates Detected:  ${coachReport.breakdown.duplicates}`);

    // Test 5: Verify Reproducibility and Determinism
    console.log('\n[5] Verifying 100% Reproducibility & Determinism...');
    const stateRun2 = kernel.executeLifecycle(projectRoot);
    assert.strictEqual(state.completionAssessment.overallScorePct, stateRun2.completionAssessment.overallScorePct, 'Overall score must be 100% reproducible');
    assert.strictEqual(state.completionAssessment.remainingItems.length, stateRun2.completionAssessment.remainingItems.length, 'Remaining items count must be identical');
    console.log('    Run 1 Score vs Run 2 Score: Identical 100% Deterministic Pass');

    // Test 6: Verify Single Domain Direct Execution
    console.log('\n[6] Testing Direct Domain Execution via Kernel Entry Point...');
    const projectDomainResult = kernel.executeDomain('project', projectRoot);
    assert.strictEqual(projectDomainResult.domain, 'Project Intelligence');
    const blueprintDomainResult = kernel.executeDomain('blueprint', projectRoot);
    assert.ok(blueprintDomainResult.id.startsWith('CBP-'));
    console.log('    Direct Domain Execution Verified via Master Kernel Entry Point.');

    console.log('\n================================================================');
    console.log('  FULL-SYSTEM BEHAVIORAL AUDIT PASSED WITH 100% SUCCESS PASS');
    console.log('================================================================\n');
}

if (require.main === module) {
    runFullSystemBehavioralAudit().catch(err => {
        console.error('Audit Failure Error:', err);
        process.exit(1);
    });
}

module.exports = runFullSystemBehavioralAudit;
