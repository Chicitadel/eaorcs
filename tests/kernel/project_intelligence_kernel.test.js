/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Project Intelligence Kernel Test Suite
 * File           : project_intelligence_kernel.test.js
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
    EngineeringKnowledgeGraphEngine
} = require('../../engine');

async function testProjectIntelligenceKernel() {
    console.log('================================================================');
    console.log('  TEST: EAORCS PROJECT INTELLIGENCE & COMPLETION KERNEL');
    console.log('================================================================\n');

    const projectRoot = path.resolve(__dirname, '../../');

    // 1. Test Canonical Blueprint Resolution
    console.log('[1] Testing CanonicalProjectBlueprintEngine...');
    const blueprintEngine = new CanonicalProjectBlueprintEngine();
    const canonicalBlueprint = blueprintEngine.resolveCanonicalBlueprint(projectRoot);

    assert.ok(canonicalBlueprint, 'Canonical blueprint should be resolved');
    assert.ok(canonicalBlueprint.id.startsWith('CBP-'), 'Blueprint ID should start with CBP-');
    assert.ok(canonicalBlueprint.functionalRequirements.length > 0, 'Should contain functional requirements');
    console.log(`    Resolved Blueprint ID: ${canonicalBlueprint.id}`);
    console.log(`    Requirements Count:    ${canonicalBlueprint.functionalRequirements.length}`);
    console.log(`    Discovered Specs:     ${canonicalBlueprint.specifications.length}`);

    // 2. Test Product Completion Intelligence
    console.log('\n[2] Testing ProductCompletionIntelligenceEngine...');
    const completionEngine = new ProductCompletionIntelligenceEngine();
    const completionReport = completionEngine.evaluateCompletion(projectRoot, canonicalBlueprint);

    assert.ok(completionReport, 'Completion report should be generated');
    assert.strictEqual(typeof completionReport.overallScorePct, 'number', 'Overall score should be a number');
    assert.ok(completionReport.dimensions, 'Dimensions breakdown should exist');
    console.log(`    Overall Score: ${completionReport.overallScorePct}%`);
    console.log(`    Requirements:  ${completionReport.dimensions.requirementsPct}%`);
    console.log(`    Backend:       ${completionReport.dimensions.backendPct}%`);
    console.log(`    Test Suite:    ${completionReport.dimensions.testCoveragePct}%`);

    // 3. Test Engineering Knowledge Graph
    console.log('\n[3] Testing EngineeringKnowledgeGraphEngine...');
    const graphEngine = new EngineeringKnowledgeGraphEngine();
    const knowledgeGraph = graphEngine.buildGraph(canonicalBlueprint, projectRoot);

    assert.ok(knowledgeGraph, 'Knowledge graph should be constructed');
    assert.ok(knowledgeGraph.totalNodes > 0, 'Knowledge graph should contain nodes');
    assert.ok(knowledgeGraph.totalEdges > 0, 'Knowledge graph should contain edges');
    console.log(`    Total Nodes: ${knowledgeGraph.totalNodes}`);
    console.log(`    Total Edges: ${knowledgeGraph.totalEdges}`);

    // 4. Test Autonomous Engineering Planner
    console.log('\n[4] Testing AutonomousEngineeringPlannerEngine...');
    const plannerEngine = new AutonomousEngineeringPlannerEngine();
    const executionPlan = plannerEngine.generateEngineeringPlan(completionReport, canonicalBlueprint);

    assert.ok(executionPlan, 'Execution plan should be generated');
    assert.ok(Array.isArray(executionPlan.workStreams), 'WorkStreams should be an array');
    console.log(`    WorkStreams Count: ${executionPlan.workStreams.length}`);
    console.log(`    Status:            ${executionPlan.status}`);

    // 5. Test Master ProjectIntelligenceKernelEngine Lifecycle Execution
    console.log('\n[5] Testing Master ProjectIntelligenceKernelEngine Execution...');
    const kernelEngine = new ProjectIntelligenceKernelEngine();
    const lifecycleResult = kernelEngine.executeLifecycle(projectRoot);

    assert.ok(lifecycleResult, 'Lifecycle result should be returned');
    assert.strictEqual(lifecycleResult.kernelVersion, '2026.3.0-LTS');
    assert.ok(lifecycleResult.canonicalBlueprint);
    assert.ok(lifecycleResult.completionAssessment);
    assert.ok(lifecycleResult.executionPlan);
    assert.ok(lifecycleResult.downstreamReadiness);

    console.log('\n================================================================');
    console.log('  PROJECT INTELLIGENCE KERNEL TEST SUITE PASSED (100% SUCCESS)');
    console.log('================================================================\n');

    console.log(lifecycleResult.formattedSummaryReport);
}

if (require.main === module) {
    testProjectIntelligenceKernel().catch(err => {
        console.error('Test Error:', err);
        process.exit(1);
    });
}

module.exports = testProjectIntelligenceKernel;
