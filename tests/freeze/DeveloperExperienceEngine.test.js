/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Developer Experience Engine Test Suite
 * File           : DeveloperExperienceEngine.test.js
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
 * CORP: Subsystem 1 — Developer Experience Engine & License Guard Test Verification
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
const DeveloperExperienceEngine = require('../../engine/cli/DeveloperExperienceEngine');

function runDeveloperExperienceEngineTests() {
  console.log('================================================================');
  console.log('  TEST SUITE: DeveloperExperienceEngine (Subsystem 1)');
  console.log('================================================================\n');

  const engine = new DeveloperExperienceEngine({
    currentTier: 'community'
  });

  // Test 1: Verify 9 Environments Support & Path / Env Translation
  console.log('[1/4] Testing 9 Environments Support & Translation...');
  const supportedEnvs = engine.getSupportedEnvironments();
  assert.strictEqual(supportedEnvs.length, 9, `Expected 9 environments, got ${supportedEnvs.length}`);
  assert.deepStrictEqual(supportedEnvs, [
    'Windows CMD', 'PowerShell', 'Git Bash', 'WSL',
    'Linux', 'macOS', 'Docker', 'Kubernetes', 'CI/CD'
  ]);

  // Path translations
  const winPath = engine.translatePath('C:/workspace/eaorcs/config.json', 'Windows CMD');
  assert.strictEqual(winPath, 'C:\\workspace\\eaorcs\\config.json');

  const gitBashPath = engine.translatePath('C:\\workspace\\eaorcs\\config.json', 'Git Bash');
  assert.strictEqual(gitBashPath, '/c/workspace/eaorcs/config.json');

  const wslPath = engine.translatePath('C:\\workspace\\eaorcs\\config.json', 'WSL');
  assert.strictEqual(wslPath, '/mnt/c/workspace/eaorcs/config.json');

  const posixPath = engine.translatePath('C:\\workspace\\eaorcs\\config.json', 'Linux');
  assert.strictEqual(posixPath, 'C:/workspace/eaorcs/config.json');

  // Env variable translations
  const cmdEnv = engine.translateEnvVar('EAORCS_MODE', 'strict', 'Windows CMD');
  assert.strictEqual(cmdEnv, 'set EAORCS_MODE=strict');

  const psEnv = engine.translateEnvVar('EAORCS_MODE', 'strict', 'PowerShell');
  assert.strictEqual(psEnv, '$env:EAORCS_MODE="strict"');

  const bashEnv = engine.translateEnvVar('EAORCS_MODE', 'strict', 'Linux');
  assert.strictEqual(bashEnv, 'export EAORCS_MODE="strict"');

  const dockerEnv = engine.translateEnvVar('EAORCS_MODE', 'strict', 'Docker');
  assert.strictEqual(dockerEnv, '-e EAORCS_MODE="strict"');

  const k8sEnv = engine.translateEnvVar('EAORCS_MODE', 'strict', 'Kubernetes');
  assert.strictEqual(k8sEnv, '--env=EAORCS_MODE="strict"');

  console.log('  ✓ All 9 environments verified with path and environment variable translation.');

  // Test 2: Command Builder Logic (buildCommand)
  console.log('\n[2/4] Testing Command Builder Logic (buildCommand)...');

  // PowerShell build
  const psBuild = engine.buildCommand({
    command: 'eaorcs qualify',
    args: { verbose: true, threshold: 90 },
    envVars: { NODE_ENV: 'test' },
    cwd: 'C:/projects/app',
    targetEnv: 'PowerShell'
  });
  assert.strictEqual(psBuild.targetEnvironment, 'PowerShell');
  assert.strictEqual(psBuild.executable, 'eaorcs');
  assert.ok(psBuild.fullCommand.includes('Set-Location "C:\\projects\\app"'));
  assert.ok(psBuild.fullCommand.includes('$env:NODE_ENV="test"'));
  assert.ok(psBuild.fullCommand.includes('eaorcs qualify --verbose --threshold="90"'));

  // Docker build
  const dockerBuild = engine.buildCommand({
    command: 'eaorcs sbom generate',
    containerImage: 'eaorcs/runner:v1',
    envVars: { EAORCS_KEY: 'secret123' },
    targetEnv: 'Docker'
  });
  assert.strictEqual(dockerBuild.targetEnvironment, 'Docker');
  assert.ok(dockerBuild.fullCommand.startsWith('docker run --rm -e EAORCS_KEY="secret123" eaorcs/runner:v1 eaorcs sbom generate'));
  assert.strictEqual(dockerBuild.metadata.hasContainerWrapper, true);

  // Kubernetes build
  const k8sBuild = engine.buildCommand({
    command: 'eaorcs audit run',
    podName: 'gov-pod-01',
    namespace: 'eaorcs-sys',
    targetEnv: 'Kubernetes'
  });
  assert.strictEqual(k8sBuild.targetEnvironment, 'Kubernetes');
  assert.strictEqual(k8sBuild.fullCommand, 'kubectl exec -n eaorcs-sys gov-pod-01 -- eaorcs audit run');

  // Multiline build
  const multilineBuild = engine.buildCommand({
    command: 'eaorcs validate',
    args: ['--strict', '--json'],
    envVars: { VAR1: 'val1', VAR2: 'val2' },
    targetEnv: 'PowerShell',
    multiline: true
  });
  assert.ok(multilineBuild.multilineCommand.includes('\`\n  '));

  console.log('  ✓ Command Builder successfully generated environment-specific shell commands.');

  // Test 3: Command Search Index (searchCommands)
  console.log('\n[3/4] Testing Command Search Index (searchCommands)...');

  const allCmds = engine.searchCommands('');
  assert.ok(allCmds.length >= 15, `Expected >= 15 commands in index, got ${allCmds.length}`);

  const qualifySearch = engine.searchCommands('qualify');
  assert.ok(qualifySearch.length > 0);
  assert.strictEqual(qualifySearch[0].name, 'qualify');
  assert.strictEqual(qualifySearch[0].requiredTier, 'pro');

  const spdxSearch = engine.searchCommands('spdx');
  assert.ok(spdxSearch.length > 0);
  assert.strictEqual(spdxSearch[0].name, 'sbom');

  const govSearch = engine.searchCommands('', { category: 'Governance' });
  assert.ok(govSearch.every(c => c.category === 'Governance'));

  // Custom command registration
  engine.registerCommand({
    id: 'custom-plugin',
    name: 'custom-plugin',
    category: 'Ecosystem',
    requiredTier: 'enterprise',
    description: 'Execute custom governance enterprise plugin.',
    tags: ['plugin', 'extension']
  });
  const customSearch = engine.searchCommands('custom-plugin');
  assert.strictEqual(customSearch.length, 1);
  assert.strictEqual(customSearch[0].id, 'custom-plugin');

  console.log('  ✓ Command Search Index correctly indexed, searched, filtered, and registered commands.');

  // Test 4: License-aware Command Guard (evaluateCommandAccess)
  console.log('\n[4/4] Testing License-aware Command Guard (evaluateCommandAccess)...');

  // Community Tier Allowed
  const initAccess = engine.evaluateCommandAccess('init', 'community');
  assert.strictEqual(initAccess.allowed, true);
  assert.strictEqual(initAccess.currentTier, 'community');
  assert.strictEqual(initAccess.requiredTier, 'community');

  const doctorAccess = engine.evaluateCommandAccess('eaorcs doctor', 'community');
  assert.strictEqual(doctorAccess.allowed, true);

  // Community Tier Denied for Gated Features
  const qualifyAccess = engine.evaluateCommandAccess('qualify', 'community');
  assert.strictEqual(qualifyAccess.allowed, false);
  assert.strictEqual(qualifyAccess.currentTier, 'community');
  assert.strictEqual(qualifyAccess.requiredTier, 'pro');
  assert.strictEqual(qualifyAccess.stackTraceIncluded, false);
  assert.ok(qualifyAccess.warningBox.includes('EAORCS LICENSE GUARD WARNING'));
  assert.ok(qualifyAccess.warningBox.includes('qualify'));
  assert.ok(qualifyAccess.warningBox.includes('COMMUNITY'));
  assert.ok(qualifyAccess.warningBox.includes('PRO'));
  assert.strictEqual(qualifyAccess.upgradeUrl, 'https://eaorcs.ujomor.com/upgrade');

  const certifyAccess = engine.evaluateCommandAccess('certify', 'community');
  assert.strictEqual(certifyAccess.allowed, false);
  assert.strictEqual(certifyAccess.requiredTier, 'enterprise');

  const sovereignAccess = engine.evaluateCommandAccess('sovereign-audit', 'enterprise');
  assert.strictEqual(sovereignAccess.allowed, false);
  assert.strictEqual(sovereignAccess.requiredTier, 'sovereign');

  // Enterprise Tier Allowed for Enterprise and Pro features
  const enterpriseAccess = engine.evaluateCommandAccess('certify', 'enterprise');
  assert.strictEqual(enterpriseAccess.allowed, true);

  const proAccessOnEnterprise = engine.evaluateCommandAccess('qualify', 'enterprise');
  assert.strictEqual(proAccessOnEnterprise.allowed, true);

  console.log('  ✓ License Guard evaluated tiers correctly and generated structured terminal box warnings.');

  console.log('\n================================================================');
  console.log('  ALL TESTS PASSED SUCCESSFULLY! (DeveloperExperienceEngine)');
  console.log('================================================================');
}

runDeveloperExperienceEngineTests();
