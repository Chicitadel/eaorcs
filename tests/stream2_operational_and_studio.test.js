/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Stream 2 Operational & Governance Studio Qualification Suite
 * File           : tests/stream2_operational_and_studio.test.js
 * Version        : 2026.2.0-LTS
 * Author         : Operational Governance Council & Ujomor Systems Engineering
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
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
 * Copyright (c) 2026 Chicitadel / Air Roofers SASU
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const OperationalExcellenceBenchmarker = require('../engine/benchmark/OperationalExcellenceBenchmarker');
const GovernanceStudioEngine = require('../engine/studio/GovernanceStudioEngine');

console.log('=== Starting Stream 2 Operational Excellence & Governance Studio Test Suite ===\n');

// =========================================================================
// 1. OperationalExcellenceBenchmarker Tests
// =========================================================================

console.log('[TEST 1] Initializing OperationalExcellenceBenchmarker...');
const benchmarker = new OperationalExcellenceBenchmarker();
assert.ok(benchmarker, 'Benchmarker instance must be created successfully');

console.log('\n[TEST 2] Testing Scale Testing Simulator across profiles...');
const scale10k = benchmarker.runScaleTest('10k_repos');
assert.strictEqual(scale10k.status, 'PASSED', '10k_repos scale test must pass');
assert.strictEqual(scale10k.graphNodeCount, 1000000, '10k_repos profile must feature 1,000,000 graph nodes');
assert.strictEqual(scale10k.simulatedEventThroughputSec, 50000, 'Event throughput must match 50,000 events/sec');

const scale1Proj = benchmarker.runScaleTest('1_project');
assert.strictEqual(scale1Proj.graphNodeCount, 500, '1_project profile must feature 500 nodes');

const scaleHyper = benchmarker.runScaleTest('hyper_scale');
assert.strictEqual(scaleHyper.graphNodeCount, 10000000, 'hyper_scale profile must feature 10,000,000 nodes');
console.log('  -> Scale Testing Simulator PASSED!');

console.log('\n[TEST 3] Running Fault Isolation Drills...');
const faultResults = benchmarker.runFaultIsolationDrills();
assert.strictEqual(faultResults.totalDrills, 4, 'Must execute exactly 4 fault drills');
assert.strictEqual(faultResults.passedCount, 4, 'All 4 fault drills must pass');
assert.strictEqual(faultResults.overallResilienceScore, 100, 'Resilience score must be 100%');
assert.strictEqual(faultResults.status, 'PASSED', 'Overall fault status must be PASSED');
console.log('  -> Fault Isolation Drills PASSED!');

console.log('\n[TEST 4] Verifying SLA Performance Targets...');
const slaResults = benchmarker.verifySLAPerformance();
assert.strictEqual(slaResults.overallCompliant, true, 'SLA targets must be compliant');
assert.strictEqual(slaResults.totalTargets, 5, 'Must verify 5 core SLA metrics');
assert.strictEqual(slaResults.verifications.uiLatencyMs.targetSlaMs, 100, 'UI latency target must be 100ms');
assert.strictEqual(slaResults.verifications.graphQueryMs.targetSlaMs, 50, 'Graph query target must be 50ms');
assert.strictEqual(slaResults.verifications.reportGenMs.targetSlaMs, 500, 'Report generation target must be 500ms');
assert.strictEqual(slaResults.verifications.eventPropMs.targetSlaMs, 10, 'Event propagation target must be 10ms');
assert.strictEqual(slaResults.verifications.searchResponseMs.targetSlaMs, 30, 'Search response target must be 30ms');
console.log('  -> SLA Target Verification PASSED!');

console.log('\n[TEST 5] Executing full operational suite...');
const fullSuite = benchmarker.runFullOperationalSuite();
assert.strictEqual(fullSuite.status, 'EXCELLENCE_CERTIFIED', 'Full suite status must be EXCELLENCE_CERTIFIED');
console.log('  -> Full Operational Suite PASSED!');

// =========================================================================
// 2. GovernanceStudioEngine Tests
// =========================================================================

console.log('\n[TEST 6] Initializing GovernanceStudioEngine...');
const studio = new GovernanceStudioEngine({ projectName: 'Commercial Governance Suite' });
assert.ok(studio, 'GovernanceStudioEngine instance must be created successfully');

console.log('\n[TEST 7] Defining Code-Free Graphical Governance Components...');
const policy = studio.definePolicy({
    id: 'pol-sec-01',
    name: 'Zero Trust Secrets Policy',
    severity: 'CRITICAL',
    complianceMappings: ['ISO_27001', 'SOC_2_TYPE_II', 'NIST_SP_800_53']
});
assert.strictEqual(policy.id, 'pol-sec-01');

const scoring = studio.defineScoringModel({
    id: 'score-risk-01',
    name: 'Enterprise Risk Scoring Model',
    baseScore: 100
});
assert.strictEqual(scoring.id, 'score-risk-01');

const evidence = studio.defineEvidenceMatrix({
    id: 'evid-mat-01',
    name: 'SOC2 Evidence Requirement Matrix'
});
assert.strictEqual(evidence.id, 'evid-mat-01');

const workflow = studio.defineGovernanceWorkflow({
    id: 'flow-ci-01',
    name: 'CI Gate Governance Workflow'
});
assert.strictEqual(workflow.id, 'flow-ci-01');

const approval = studio.defineApprovalChain({
    id: 'app-gate-01',
    name: 'Multi-Sig Release Gate Approval Chain',
    quorumCount: 2
});
assert.strictEqual(approval.id, 'app-gate-01');
console.log('  -> Code-Free Definitions PASSED!');

console.log('\n[TEST 8] Generating Visual Canvas Schema (Nodes & Edges)...');
const canvasSchema = studio.generateCanvasSchema();
assert.ok(canvasSchema.viewport.nodes.length >= 5, 'Visual canvas must generate at least 5 nodes');
assert.ok(canvasSchema.viewport.edges.length >= 2, 'Visual canvas must generate edges connecting components');
assert.strictEqual(canvasSchema.summary.totalNodes, 5, 'Canvas summary node count must be 5');
console.log(`  -> Canvas Schema Generated: ${canvasSchema.summary.totalNodes} Nodes, ${canvasSchema.summary.totalEdges} Edges.`);

console.log('\n[TEST 9] Testing Studio Exporter and Importer with Checksum Verification...');
const exportData = studio.exportProject();
assert.ok(exportData.checksum, 'Export package must contain SHA-256 checksum');
assert.ok(exportData.signature, 'Export package must contain cryptographic signature');

const newStudioInstance = new GovernanceStudioEngine();
const importStatus = newStudioInstance.importProject(exportData);
assert.strictEqual(importStatus.success, true, 'Import must complete successfully');
assert.strictEqual(importStatus.checksumVerified, true, 'Checksum verification must succeed');
assert.strictEqual(importStatus.importedSummary.totalNodes, 5, 'Imported component node count must match exported project');
console.log('  -> Studio Exporter / Importer PASSED!');

console.log('\n[TEST 10] Validating Canvas & Compiling to Executable Policy Set...');
const validation = studio.validateCanvas();
assert.strictEqual(validation.valid, true, 'Studio canvas validation must be valid');

const compiledRules = studio.compileToExecutablePolicySet();
assert.strictEqual(compiledRules.policyCount, 1, 'Compiled rule set must contain 1 policy');
assert.strictEqual(compiledRules.runtimeRules[0].id, 'pol-sec-01', 'Compiled rule ID must match defined policy');
console.log('  -> Policy Compilation PASSED!');

console.log('\n================================================================');
console.log('  ALL STREAM 2 OPERATIONAL & STUDIO TESTS COMPLETED SUCCESSFULLY');
console.log('================================================================\n');
