/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Comprehensive Workspace Topology & Path Regression Suite
 * File           : workspace_topology_regression.test.js
 * Version        : 2026.1-LTS
 * Author         : Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const WorkspaceResolver = require('../../engine/governance/WorkspaceResolver');

function runTopologyRegressionTests() {
  console.log('================================================================');
  console.log('  EAORCS Workspace Topology & Path Regression Verification');
  console.log('================================================================\n');

  // Test 1: Workspace root resolution from repository root
  console.log('[1/10] Test: Execution from repository root directory...');
  const rootFromCwd = WorkspaceResolver.resolveWorkspaceRoot(process.cwd());
  assert.ok(rootFromCwd, 'Workspace root must be resolved.');
  assert.ok(fs.existsSync(path.join(rootFromCwd, 'eaorcs.config.yaml')) || fs.existsSync(path.join(rootFromCwd, 'package.json')), 'Root indicator missing.');
  console.log('       ✔ PASS: Root resolved correctly.\n');

  // Test 2: Execution from deep nested subdirectory
  console.log('[2/10] Test: Execution from deep nested subfolder (engine/governance)...');
  const deepDir = path.join(rootFromCwd, 'engine', 'governance');
  const rootFromDeep = WorkspaceResolver.resolveWorkspaceRoot(deepDir);
  assert.strictEqual(rootFromDeep, rootFromCwd, 'Deep folder must resolve to the exact same workspace root.');
  console.log('       ✔ PASS: Deep subdirectory resolved to same canonical root.\n');

  // Test 3: Execution from test subfolder (tests/governance)
  console.log('[3/10] Test: Execution from tests subfolder (tests/governance)...');
  const testSubDir = path.join(rootFromCwd, 'tests', 'governance');
  const rootFromTestDir = WorkspaceResolver.resolveWorkspaceRoot(testSubDir);
  assert.strictEqual(rootFromTestDir, rootFromCwd, 'Test subfolder must resolve to the exact same workspace root.');
  console.log('       ✔ PASS: Test subfolder resolved correctly.\n');

  // Test 4: Immutable WorkspaceTopology model verification
  console.log('[4/10] Test: Immutable WorkspaceTopology model generation...');
  const topology = WorkspaceResolver.getWorkspaceTopology(process.cwd(), true);
  assert.ok(topology.workspaceRoot, 'Topology must contain workspaceRoot.');
  assert.ok(topology.environment.platform, 'Topology must contain OS platform.');
  assert.ok(topology.discovered, 'Topology must contain discovered object.');
  assert.ok(Object.isFrozen(topology), 'WorkspaceTopology object MUST be frozen (immutable).');
  assert.ok(Object.isFrozen(topology.paths), 'Topology paths MUST be frozen.');
  assert.ok(Object.isFrozen(topology.discovered), 'Topology discovered MUST be frozen.');
  console.log('       ✔ PASS: Topology object is fully frozen and immutable.\n');

  // Test 5: Topology Report Export
  console.log('[5/10] Test: Saving topology JSON report...');
  const savedReportPath = WorkspaceResolver.saveTopologyReport(process.cwd());
  assert.ok(fs.existsSync(savedReportPath), 'Topology report file must exist.');
  const reportData = JSON.parse(fs.readFileSync(savedReportPath, 'utf8'));
  assert.strictEqual(reportData.workspaceRoot, rootFromCwd, 'Saved report root must match.');
  console.log(`       ✔ PASS: Saved topology report verified at ${savedReportPath}\n`);

  // Test 6: Cross-platform path separator handling
  console.log('[6/10] Test: Cross-platform path separator normalization...');
  const relativeTestPath = 'docs/workspace_topology.json';
  const resolvedPath = WorkspaceResolver.resolvePath(relativeTestPath);
  assert.strictEqual(resolvedPath, path.join(rootFromCwd, 'docs', 'workspace_topology.json'), 'Path resolution must normalize separators.');
  console.log('       ✔ PASS: Cross-platform paths normalized cleanly.\n');

  // Test 7: Simulated repository under products/ or projects/
  console.log('[7/10] Test: Discovered product & project topology structure...');
  const discovered = WorkspaceResolver.discoverProjects(process.cwd());
  assert.ok(Array.isArray(discovered), 'Discovered projects must be an array.');
  assert.ok(discovered.length > 0, 'Must discover at least 1 project/product in workspace.');
  for (const item of discovered) {
    assert.ok(item.name, 'Discovered item must have name.');
    assert.ok(item.path, 'Discovered item must have path.');
    assert.ok(item.category, 'Discovered item must have category.');
  }
  console.log(`       ✔ PASS: Successfully discovered ${discovered.length} workspace module(s).\n`);

  // Test 8: Missing optional directories resilience
  console.log('[8/10] Test: Missing optional directories resilience...');
  const nonExistentDir = path.join(rootFromCwd, 'scratch_non_existent_dir_xyz');
  const rootFromNonExistent = WorkspaceResolver.resolveWorkspaceRoot(nonExistentDir);
  assert.ok(rootFromNonExistent, 'Must resolve root even if starting directory is missing.');
  console.log('       ✔ PASS: Resilient against missing optional directories.\n');

  // Test 9: Default scanner exclusions
  console.log('[9/10] Test: Scanner default excludes compliance...');
  const excludes = WorkspaceResolver.getScannerExcludes();
  assert.ok(excludes.includes('tests'), 'Must exclude tests.');
  assert.ok(excludes.includes('node_modules'), 'Must exclude node_modules.');
  assert.ok(excludes.includes('.git'), 'Must exclude .git.');
  console.log('       ✔ PASS: Scanner default excludes verified.\n');

  // Test 10: CI Checkout Environment Awareness
  console.log('[10/10] Test: CI environment detection...');
  const isCi = topology.environment.isCi;
  assert.strictEqual(typeof isCi, 'boolean', 'isCi indicator must be boolean.');
  console.log(`       ✔ PASS: Environment detected (CI Mode: ${isCi}).\n`);

  console.log('================================================================');
  console.log('🎉 ALL 10 TOPOLOGY REGRESSION TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================\n');
}

if (require.main === module) {
  runTopologyRegressionTests();
}

module.exports = runTopologyRegressionTests;
