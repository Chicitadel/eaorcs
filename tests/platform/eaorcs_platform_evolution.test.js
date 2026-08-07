/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Platform Evolution Test Suite
 * File           : eaorcs_platform_evolution.test.js
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
    CapabilityRegistryEngine,
    DependencyExecutionPlannerEngine,
    WorkspaceDigitalTwinEngine,
    PredictiveIntelligenceEngine,
    ExecutableGovernanceContractEngine,
    FederatedWorkspaceCoordinatorEngine,
    ProjectIntelligenceKernelEngine
} = require('../../engine');

async function runPlatformEvolutionTests() {
    console.log('================================================================');
    console.log('  TEST: EAORCS PLATFORM EVOLUTION & ECOSYSTEM GOVERNANCE SUITE');
    console.log('================================================================\n');

    const projectRoot = path.resolve(__dirname, '../../');

    // 1. Test Dynamic Capability Registry
    console.log('[1] Testing CapabilityRegistryEngine Dynamic Discovery...');
    const registry = new CapabilityRegistryEngine();
    const capabilities = registry.listCapabilities();

    assert.ok(capabilities.length >= 9, 'Should discover at least 9 built-in capabilities');
    const capBlueprint = registry.getCapability('cap.blueprint');
    assert.ok(capBlueprint, 'cap.blueprint capability must be registered');
    console.log(`    Registered Capabilities: ${capabilities.length}`);
    console.log(`    Capability: ${capBlueprint.name} (Produces: ${capBlueprint.produces.join(', ')})`);

    // 2. Test Dependency-Aware Execution Planner
    console.log('\n[2] Testing DependencyExecutionPlannerEngine DAG Resolution...');
    const dagPlanner = new DependencyExecutionPlannerEngine();
    const dagPlan = dagPlanner.buildExecutionDag(capabilities, { projectRoot });

    assert.ok(dagPlan, 'DAG plan must be generated');
    assert.strictEqual(dagPlan.plannedStepsCount, capabilities.length);
    console.log(`    Planned DAG Sequence Steps: ${dagPlan.plannedStepsCount}`);
    console.log(`    First Capability Step:      ${dagPlan.executionSequence[0].name}`);

    // 3. Test Workspace Digital Twin
    console.log('\n[3] Testing WorkspaceDigitalTwinEngine Live Synchronization...');
    const twinEngine = new WorkspaceDigitalTwinEngine();
    const kernel = new ProjectIntelligenceKernelEngine();
    const state = kernel.executeLifecycle(projectRoot);

    const twinSync = twinEngine.syncTwin(state.canonicalBlueprint, projectRoot);
    assert.ok(twinSync, 'Digital Twin sync must return state');
    assert.ok(twinSync.twinId.startsWith('TWIN-'));
    console.log(`    ✓ Workspace Twin Synced (ID: ${twinSync.twinId})`);
    console.log(`    ✓ Requirements Tracked in Twin: ${twinSync.requirementsCount}`);

    // 4. Test Predictive Intelligence & Impact Analysis
    console.log('\n[4] Testing PredictiveIntelligenceEngine Impact Predictions...');
    const predictiveEngine = new PredictiveIntelligenceEngine();
    const prediction = predictiveEngine.predictImpact({ targetFile: 'engine/kernel/ProjectIntelligenceKernelEngine.js' }, twinSync);

    assert.ok(prediction, 'Prediction report must be generated');
    assert.ok(prediction.totalPredictionsCount > 0);
    console.log(`    ✓ Risk Score: ${prediction.overallRiskScore}`);
    console.log(`    ✓ Predictive Risk Type: ${prediction.predictions[0].riskType}`);

    // 5. Test Executable Governance Contracts
    console.log('\n[5] Testing ExecutableGovernanceContractEngine Contract Evaluation...');
    const contractEngine = new ExecutableGovernanceContractEngine();
    const evalResult = contractEngine.evaluateContract('GOV-CONTRACT-001', { zeroTrustEnforced: true, testCoveragePct: 100 });

    assert.ok(evalResult, 'Contract evaluation report must exist');
    assert.strictEqual(evalResult.isCompliant, true, 'Zero trust and 100% coverage must pass contract');
    console.log(`    ✓ Executable Contract Title: ${evalResult.title}`);
    console.log(`    ✓ Contract Compliance Status: ${evalResult.isCompliant ? 'COMPLIANT' : 'NON_COMPLIANT'}`);

    // 6. Test Federated Workspace Coordinator
    console.log('\n[6] Testing FederatedWorkspaceCoordinatorEngine Cross-Repository Impact...');
    const federationCoordinator = new FederatedWorkspaceCoordinatorEngine();
    const impactReport = federationCoordinator.analyzeCrossRepositoryImpact('sdk/OsapExtensionEngine', projectRoot);

    assert.ok(impactReport, 'Impact report must be returned');
    assert.ok(impactReport.impactSummary.affectedProductsCount > 0);
    console.log(`    ✓ Affected Federated Products: ${impactReport.impactSummary.affectedProducts.join(', ')}`);
    console.log(`    ✓ Affected Federated Services:  ${impactReport.impactSummary.affectedServices.join(', ')}`);

    console.log('\n================================================================');
    console.log('  PLATFORM EVOLUTION TEST SUITE PASSED (100% SUCCESS PASS)');
    console.log('================================================================\n');
}

if (require.main === module) {
    runPlatformEvolutionTests().catch(err => {
        console.error('Platform Evolution Test Error:', err);
        process.exit(1);
    });
}

module.exports = runPlatformEvolutionTests;
