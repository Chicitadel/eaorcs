/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : WorkspaceResolver Unit Verification Suite
 * File           : workspace_resolver.test.js
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
const WorkspaceResolver = require('../../engine/governance/WorkspaceResolver');

function runWorkspaceResolverTests() {
  console.log('=== Running WorkspaceResolver Verification Suite ===\n');

  // Test 1: Resolve workspace root from deep subfolder
  console.log('Test 1: Resolving workspace root from nested directory...');
  const deepDir = path.join(__dirname, '../../engine/governance');
  const root = WorkspaceResolver.resolveWorkspaceRoot(deepDir);
  assert.ok(fs.existsSync(path.join(root, 'eaorcs.config.yaml')) || fs.existsSync(path.join(root, 'package.json')), 'Workspace root should contain root indicator');
  console.log(`  ✔ Passed: Workspace root resolved to: ${root}`);

  // Test 2: Resolve relative path from root
  console.log('Test 2: Resolving relative path against workspace root...');
  const configPath = WorkspaceResolver.resolvePath('eaorcs.config.yaml', deepDir);
  assert.ok(fs.existsSync(configPath), 'Resolved config path should exist');
  console.log(`  ✔ Passed: Config path resolved to: ${configPath}`);

  // Test 3: Discover projects
  console.log('Test 3: Discovering products and projects across workspace topology...');
  const discovered = WorkspaceResolver.discoverProjects(deepDir);
  assert.ok(Array.isArray(discovered), 'Discovered projects should be an array');
  assert.ok(discovered.length > 0, 'Should discover at least 1 project/product');
  console.log(`  ✔ Passed: Discovered ${discovered.length} project(s) in workspace topology.`);

  // Test 4: Default scanner excludes
  console.log('Test 4: Verifying scanner default exclusions...');
  const excludes = WorkspaceResolver.getScannerExcludes();
  assert.ok(excludes.includes('tests'), 'Excludes should include tests');
  assert.ok(excludes.includes('node_modules'), 'Excludes should include node_modules');
  console.log('  ✔ Passed: Default scanner exclusions verified.');

  console.log('\nAll WorkspaceResolver tests PASSED successfully!\n');
}

if (require.main === module) {
  runWorkspaceResolverTests();
}

module.exports = runWorkspaceResolverTests;
