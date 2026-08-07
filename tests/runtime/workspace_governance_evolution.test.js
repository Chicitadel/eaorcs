/******************************************************************************
 * Project        : Air Roofers Platform Ecosystem
 * Module         : Workspace-Level Governance Evolution Master Test Suite
 * File           : tests/runtime/workspace_governance_evolution.test.js
 * Version        : 2026.3.0-LTS (Governance Runtime v3.0.0)
 * Author         : Enterprise Architecture & Security Governance Board
 * Organization   : Air Roofers Governance Directorate
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE
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
 * - AR-STD-PKG-001 to AR-STD-PKG-020
 * - AR-STD-REP-001
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Air Roofers Governance Directorate
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');

const WorkspaceGovernanceRuntime = require('../../engine/governance/WorkspaceGovernanceRuntime');
const EvidenceGraphEngine = require('../../engine/governance/EvidenceGraphEngine');
const AirRoofersPackagingEngine = require('../../engine/packaging/AirRoofersPackagingEngine');

async function runWorkspaceEvolutionTestSuite() {
  console.log('================================================================');
  console.log('Running Workspace-Level Governance Evolution Master Test Suite');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  const wsRuntime = new WorkspaceGovernanceRuntime();

  // 1. Authoritative Workspace Manifest (airroofers.workspace.yaml) Test
  console.log('[Test Stream 1] Authoritative Workspace Manifest (airroofers.workspace.yaml)');
  const manifestPath = wsRuntime.resolveWorkspaceManifestPath();
  assert(fs.existsSync(manifestPath), 'airroofers.workspace.yaml exists at workspace root.');

  const manifestInfo = wsRuntime.loadWorkspaceManifest();
  assert(manifestInfo.runtimeVersion === 'v3.0.0', 'WorkspaceGovernanceRuntime version is v3.0.0');

  // 2. Canonical Standards Centralization Test (00_engineering_guide)
  console.log('\n[Test Stream 2] Single Source of Truth Standards Centralization (00_engineering_guide)');
  const stdDir = wsRuntime.resolveStandardsDirectory();
  assert(fs.existsSync(stdDir), '00_engineering_guide/Global_Product_Packaging directory resolved.');
  assert(fs.existsSync(path.join(stdDir, 'AR-STD-PKG-001_Global_Product_Packaging_Standard.md')), 'Contains AR-STD-PKG-001 in 00_engineering_guide.');
  assert(fs.existsSync(path.join(stdDir, 'AR-STD-PKG-020_Package_Lifecycle_Operations_Standard.md')), 'Contains AR-STD-PKG-020 in 00_engineering_guide.');

  // 3. End-to-End Evidence Graph Engine Test
  console.log('\n[Test Stream 3] End-to-End Cryptographic Evidence Graph Engine');
  const evidenceGraph = EvidenceGraphEngine.buildEvidenceGraph({ id: 'EAORCS', version: '2026.3.0-LTS' });
  assert(evidenceGraph.governanceRuntime === 'v3.0.0', 'Evidence graph binds Governance Runtime v3.0.0');
  assert(evidenceGraph.lineageChain.length === 9, 'Evidence graph contains full 9-stage lineage chain (Requirement to Deployment).');
  assert(typeof evidenceGraph.rootCryptographicHash === 'string', 'Root cryptographic hash computed.');
  assert(typeof evidenceGraph.signature === 'string', 'Cryptographic signature generated.');

  // 4. Integrated AGPA Execution & Evidence Graph Output Test
  console.log('\n[Test Stream 4] Integrated AGPA Execution & EVIDENCE_GRAPH.json Output');
  const kernel = new AirRoofersPackagingEngine();
  const res = kernel.packageProduct('EAORCS', 'Enterprise', null, { invokedViaKernel: true });
  assert(res.status === 'SUCCESS', 'AGPA Master Kernel packaging succeeds under Workspace Governance Runtime v3.0.0');
  assert(fs.existsSync(path.join(res.packageDir, 'evidence_graph', 'EVIDENCE_GRAPH.json')), 'Packaged output contains evidence_graph/EVIDENCE_GRAPH.json');

  console.log(`\n================================================================`);
  console.log(`[WORKSPACE EVOLUTION TEST SUITE COMPLETE] Passed ${passed}/${total} assertions (100% SUCCESS)`);
  console.log(`================================================================\n`);
}

if (require.main === module) {
  runWorkspaceEvolutionTestSuite().catch(err => {
    console.error(`[TEST FAILURE] ${err.message}`);
    process.exit(1);
  });
}

module.exports = runWorkspaceEvolutionTestSuite;
