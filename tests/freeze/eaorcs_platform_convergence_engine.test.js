/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Stream 3 Unified Platform Convergence Pipeline Freeze Test
 * File           : eaorcs_platform_convergence_engine.test.js
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
 * CORP: Stream 3 - Unified Platform Convergence Pipeline
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

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '../../');
const PlatformConvergenceEngine = require('../../engine/pipeline/PlatformConvergenceEngine');

console.log('[EAORCS Stream 3 Test] Starting verification of Unified Platform Convergence Pipeline...');

// 1. Header Compliance Check
const enginePath = path.join(rootDir, 'engine', 'pipeline', 'PlatformConvergenceEngine.js');
assert.ok(fs.existsSync(enginePath), 'PlatformConvergenceEngine.js must exist');
const engineContent = fs.readFileSync(enginePath, 'utf8');
assert.ok(engineContent.includes('Universal Autonomous AI Governance Operating System (UAIGOS)'), 'Engine must contain UAIGOS header');
assert.ok(engineContent.includes('Ujomor Systems & Enterprise Governance Authority'), 'Engine must contain Author');
assert.ok(engineContent.includes('CORP: Stream 3 - Unified Platform Convergence Pipeline'), 'Engine must contain CORP reference');
console.log('✓ Header compliance verified.');

// 2. Instantiate and Run 10-stage Pipeline
const engine = new PlatformConvergenceEngine({ verbose: false });
const tmpOutputDir = path.join(rootDir, 'tmp', 'stream3_convergence_test');

const result = engine.runPipeline(rootDir, { outputDir: tmpOutputDir });

// 3. Verify Pipeline Overview
assert.ok(result, 'runPipeline must return result object');
assert.strictEqual(result.success, true, 'Pipeline execution must succeed');
assert.ok(result.pipelineId.startsWith('PCONV-'), 'pipelineId must follow format PCONV-');
assert.strictEqual(result.summary.totalStages, 10, 'Must execute exactly 10 stages');
assert.strictEqual(result.summary.passedStages, 10, 'All 10 stages must pass');
assert.strictEqual(result.summary.failedStages, 0, 'No stages should fail');
assert.strictEqual(result.summary.status, 'PASSED', 'Overall summary status must be PASSED');
console.log('✓ Overall 10-stage pipeline execution verified.');

// 4. Verify Individual Stages
const expectedStageNames = [
  'Workspace Discovery',
  'Descriptors Parsing',
  'Schema Validation',
  'Registries Generation',
  'Knowledge Graph Construction',
  'Architecture Generation',
  'Documentation Qualification',
  'Qualification Certification',
  'Packaging Orchestration',
  'Release Verification'
];

expectedStageNames.forEach((stageName, index) => {
  const stageNum = index + 1;
  const stageData = result.stages[index];
  assert.ok(stageData, `Stage ${stageNum} data must exist`);
  assert.strictEqual(stageData.stage, stageNum, `Stage ${stageNum} number must match ${stageNum}`);
  assert.strictEqual(stageData.name, stageName, `Stage ${stageNum} name must be ${stageName}`);
  assert.strictEqual(stageData.status, 'SUCCESS', `Stage ${stageNum} status must be SUCCESS`);
});
console.log('✓ All 10 stages verified individually in exact sequence.');

// 5. Stage 1 Detail Verification
const stage1 = result.stageMap['Workspace Discovery'];
assert.ok(stage1.discovery.totalDiscoveredFiles > 0, 'Must discover workspace files');
assert.ok(stage1.discovery.engineModuleCount > 0, 'Must discover engine modules');
console.log('✓ Stage 1 (Workspace Discovery) verified.');

// 6. Stage 2 Detail Verification
const stage2 = result.stageMap['Descriptors Parsing'];
assert.ok(stage2.descriptors.product, 'Product descriptor must be parsed');
assert.ok(stage2.descriptors.architecture, 'Architecture descriptor must be parsed');
console.log('✓ Stage 2 (Descriptors Parsing) verified.');

// 7. Stage 3 Detail Verification
const stage3 = result.stageMap['Schema Validation'];
assert.strictEqual(stage3.valid, true, 'Schemas must be valid');
assert.ok(stage3.validations.length >= 2, 'Must validate product and architecture schemas');
console.log('✓ Stage 3 (Schema Validation) verified.');

// 8. Stage 4 Detail Verification
const stage4 = result.stageMap['Registries Generation'];
assert.ok(stage4.registries.release_manifest, 'release_manifest.yaml path must exist');
assert.ok(stage4.registries.platform_registry, 'platform_registry.yaml path must exist');
assert.ok(stage4.registries.capability_registry, 'capability_registry.yaml path must exist');
assert.ok(stage4.registries.governance_registry, 'governance_registry.yaml path must exist');
assert.ok(fs.existsSync(stage4.registries.release_manifest), 'release_manifest.yaml file must exist on disk');
assert.ok(fs.existsSync(stage4.registries.platform_registry), 'platform_registry.yaml file must exist on disk');
assert.ok(fs.existsSync(stage4.registries.capability_registry), 'capability_registry.yaml file must exist on disk');
assert.ok(fs.existsSync(stage4.registries.governance_registry), 'governance_registry.yaml file must exist on disk');
console.log('✓ Stage 4 (Registries Generation) verified.');

// 9. Stage 5 Detail Verification
const stage5 = result.stageMap['Knowledge Graph Construction'];
assert.ok(stage5.knowledgeGraph, 'Knowledge graph must exist');
assert.ok(stage5.knowledgeGraph.nodes.length >= 10, 'Knowledge graph must contain nodes');
assert.ok(stage5.knowledgeGraph.edges.length >= 5, 'Knowledge graph must contain edges');
console.log('✓ Stage 5 (Knowledge Graph Construction) verified.');

// 10. Stage 6 Detail Verification
const stage6 = result.stageMap['Architecture Generation'];
assert.ok(stage6.architecture.mermaid.includes('flowchart TD'), 'Mermaid representation must be valid');
assert.ok(stage6.architecture.ascii.includes('UAIGOS'), 'ASCII representation must be valid');
console.log('✓ Stage 6 (Architecture Generation) verified.');

// 11. Stage 7 Detail Verification
const stage7 = result.stageMap['Documentation Qualification'];
assert.strictEqual(stage7.qualified, true, 'Documentation must be qualified');
assert.ok(stage7.score >= 70, 'Documentation score must meet qualification threshold');
console.log('✓ Stage 7 (Documentation Qualification) verified.');

// 12. Stage 8 Detail Verification
const stage8 = result.stageMap['Qualification Certification'];
assert.strictEqual(stage8.certified, true, 'Qualification must be certified');
assert.strictEqual(stage8.certificate.status, 'CERTIFIED', 'Certificate status must be CERTIFIED');
assert.ok(stage8.certificate.signature, 'Certificate must be signed');
console.log('✓ Stage 8 (Qualification Certification) verified.');

// 13. Stage 9 Detail Verification
const stage9 = result.stageMap['Packaging Orchestration'];
assert.ok(stage9.package, 'Package result must exist');
assert.ok(stage9.package.packageId, 'Package must have packageId');
assert.ok(stage9.package.packageHash, 'Package must have SHA-256 digest');
console.log('✓ Stage 9 (Packaging Orchestration) verified.');

// 14. Stage 10 Detail Verification
const stage10 = result.stageMap['Release Verification'];
assert.strictEqual(stage10.verified, true, 'Release verification must succeed');
assert.strictEqual(stage10.releaseDecision, 'APPROVED', 'Release decision must be APPROVED');
console.log('✓ Stage 10 (Release Verification) verified.');

// 15. Static Helper Method Verification
const staticResult = PlatformConvergenceEngine.runPipeline(rootDir, { outputDir: tmpOutputDir });
assert.strictEqual(staticResult.success, true, 'Static runPipeline must succeed');
assert.strictEqual(staticResult.summary.passedStages, 10, 'Static runPipeline must pass all 10 stages');
console.log('✓ Static runPipeline helper verified.');

console.log('--- ALL STREAM 3 PLATFORM CONVERGENCE PIPELINE TESTS PASSED CLEANLY! ---');
