/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Environment Detection Engine Test Suite
 * File           : EnvironmentDetectionEngine.test.js
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
 * CORP: Subsystem 1 — Environment Detection Engine & DXC Core Test Verification
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

const EnvironmentDetectionEngine = require('../../engine/cli/EnvironmentDetectionEngine');
const DeveloperExperienceEngine = require('../../engine/cli/DeveloperExperienceEngine');

function runEnvironmentDetectionEngineTests() {
  console.log('================================================================');
  console.log('  TEST SUITE: EnvironmentDetectionEngine & DXC Core (Subsystem 1)');
  console.log('================================================================\n');

  // Test 1: Direct Probing & System Detection
  console.log('[1/4] Testing Direct System Probes...');
  const detector = new EnvironmentDetectionEngine();
  const res = detector.detectEnvironment(__dirname);

  assert.ok(res.timestamp, 'Timestamp should be defined');
  assert.ok(res.workspaceRoot, 'Workspace root should be defined');
  assert.ok(res.probes, 'Probes object should exist');
  assert.ok(res.probes.os, 'OS probe should return value');
  assert.ok(res.probes.shell, 'Shell probe should return value');
  assert.ok(res.probes.node, 'Node probe should return value');
  assert.ok(res.probes.java, 'Java probe should return value');
  assert.ok(res.probes.git, 'Git probe should return value');
  assert.ok(res.probes.docker, 'Docker probe should return value');
  assert.ok(res.probes.kubernetes, 'Kubernetes probe should return value');
  assert.ok(res.probes.wsl, 'WSL probe should return value');
  assert.ok(res.recommendedEnvironment, 'Recommended environment should be determined');

  console.log(`  ✓ System Probes Executed: OS=${res.probes.os}, Shell=${res.probes.shell}, Node=${res.probes.node}, Docker=${res.probes.docker}`);

  // Test 2: Readiness Matrix Calculation
  console.log('\n[2/4] Testing Environment Capability Readiness Matrix Calculation...');
  assert.ok(typeof res.readinessMatrix.score === 'number', 'Score should be a number');
  assert.ok(res.readinessMatrix.score >= 0 && res.readinessMatrix.score <= 100, 'Score should be between 0 and 100');
  assert.ok(['OPTIMAL', 'READY', 'DEGRADED'].includes(res.readinessMatrix.overallStatus), 'Status should be valid');
  assert.ok(res.readinessMatrix.capabilities.nodeRuntime, 'nodeRuntime capability should exist');
  assert.ok(res.readinessMatrix.capabilities.gitVcs, 'gitVcs capability should exist');

  console.log(`  ✓ Readiness Matrix Score=${res.readinessMatrix.score}/100, OverallStatus=${res.readinessMatrix.overallStatus}`);

  // Test 3: Overrides & Specific Matrix Assertions
  console.log('\n[3/4] Testing Overrides & Specific Environment Assertions...');
  const mockDetector = new EnvironmentDetectionEngine({
    overrides: {
      os: 'Windows 11 Pro 24H2 Build 26100.4202',
      shell: 'PowerShell 7.5',
      node: 'v22',
      java: 'JDK 21',
      git: '2.52',
      docker: 'Running',
      kubernetes: 'Not Installed',
      wsl: 'Ubuntu 24.04'
    }
  });
  const mockRes = mockDetector.detectEnvironment();

  assert.strictEqual(mockRes.probes.os, 'Windows 11 Pro 24H2 Build 26100.4202');
  assert.strictEqual(mockRes.probes.shell, 'PowerShell 7.5');
  assert.strictEqual(mockRes.probes.node, 'v22');
  assert.strictEqual(mockRes.probes.java, 'JDK 21');
  assert.strictEqual(mockRes.probes.git, '2.52');
  assert.strictEqual(mockRes.probes.docker, 'Running');
  assert.strictEqual(mockRes.probes.kubernetes, 'Not Installed');
  assert.strictEqual(mockRes.probes.wsl, 'Ubuntu 24.04');
  assert.strictEqual(mockRes.readinessMatrix.score, 100);
  assert.strictEqual(mockRes.readinessMatrix.overallStatus, 'OPTIMAL');
  assert.strictEqual(mockRes.recommendedEnvironment, 'win_powershell');

  console.log('  ✓ Overrides successfully verified with 100/100 OPTIMAL score and win_powershell recommended tab.');

  // Test 4: DeveloperExperienceEngine Integration & Shell Command Synthesis
  console.log('\n[4/4] Testing DeveloperExperienceEngine Integration & getEquivalentShellCommands...');
  const dxEngine = new DeveloperExperienceEngine({
    environmentDetection: {
      overrides: {
        os: 'Windows 11 Pro 24H2 Build 26100.4202',
        shell: 'PowerShell 7.5',
        node: 'v22',
        java: 'JDK 21',
        git: '2.52',
        docker: 'Running',
        kubernetes: 'Not Installed',
        wsl: 'Ubuntu 24.04'
      }
    }
  });

  const envInfo = dxEngine.detectEnvironment();
  assert.strictEqual(envInfo.probes.os, 'Windows 11 Pro 24H2 Build 26100.4202');

  const shellCmds = dxEngine.getEquivalentShellCommands('eaorcs qualify --verbose');
  assert.strictEqual(shellCmds.inputCommand, 'eaorcs qualify --verbose');
  assert.strictEqual(shellCmds.recommendedEnvironment, 'win_powershell');
  assert.ok(shellCmds.recommendedCommand.includes('eaorcs qualify --verbose'));
  assert.ok(shellCmds.environments.win_powershell);
  assert.ok(shellCmds.environments.win_cmd);
  assert.ok(shellCmds.environments.linux_bash);
  assert.ok(shellCmds.environments.macos_zsh);
  assert.ok(shellCmds.environments.docker_container);
  assert.ok(shellCmds.canonicalEnvironments['PowerShell']);
  assert.ok(shellCmds.canonicalEnvironments['Linux']);

  console.log('  ✓ DeveloperExperienceEngine integration and getEquivalentShellCommands verified.');

  console.log('\n================================================================');
  console.log('  ALL TESTS PASSED SUCCESSFULLY! (EnvironmentDetectionEngine)');
  console.log('================================================================');
}

runEnvironmentDetectionEngineTests();
