/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 11 Stream 5 Qualification Test Suite (Developer Ecosystem & Marketplace)
 * File           : tests/phase11/stream_5_developer_ecosystem.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
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
 * - Language Server Protocol (LSP 3.17)
 * - Debug Adapter Protocol (DAP 1.51)
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const DeveloperEcosystemSuite = require('../../engine/ide/DeveloperEcosystemSuite');

function runStream5TestSuite() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 11 STREAM 5: DEVELOPER ECOSYSTEM & MARKETPLACE QUALIFICATION TEST');
  console.log('  Target Standard: LSP 3.17 / OSAP Attestation / Non-Invasive VM Sandbox');
  console.log('================================================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function test(name, fn) {
    try {
      fn();
      passedTests++;
      console.log(`  ✅ [PASS] ${name}`);
    } catch (err) {
      failedTests++;
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}`);
      if (err.stack) console.error(`     ${err.stack.split('\n')[1]}`);
    }
  }

  const suite = new DeveloperEcosystemSuite();

  // Test 1: IDE Plugin Registration & Lookup
  test('1. IDE Plugin Registration & Registry Lookup', () => {
    const regVsCode = suite.registerEcosystemPlugin('eaorcs-vscode-extension', {
      name: 'EAORCS VS Code Governance Extension',
      platform: 'vscode',
      version: '2026.1.0',
      publisher: 'Ujomor Systems',
      capabilities: ['diagnostics', 'code-lens', 'osap-passport']
    });

    assert.strictEqual(regVsCode.success, true, 'Registration of VS Code extension should succeed');
    assert.strictEqual(regVsCode.plugin.id, 'eaorcs-vscode-extension');

    const regJetBrains = suite.registerEcosystemPlugin('eaorcs-jetbrains-plugin', {
      name: 'EAORCS JetBrains Governance Plugin',
      platform: 'jetbrains',
      version: '2026.1.0',
      publisher: 'Ujomor Systems',
      capabilities: ['inspection-provider', 'status-bar-widget']
    });

    assert.strictEqual(regJetBrains.success, true, 'Registration of JetBrains plugin should succeed');

    const allPlugins = suite.listEcosystemPlugins();
    assert.strictEqual(allPlugins.length >= 2, true, 'List plugins should return registered plugins');

    const vsCodeOnly = suite.listEcosystemPlugins({ platform: 'vscode' });
    assert.strictEqual(vsCodeOnly.length, 1, 'Platform filter for vscode should return exactly 1 plugin');
    assert.strictEqual(vsCodeOnly[0].id, 'eaorcs-vscode-extension');

    const fetched = suite.registry.getPlugin('eaorcs-vscode-extension');
    assert.strictEqual(fetched.name, 'EAORCS VS Code Governance Extension');
  });

  // Test 2: Developer Ecosystem SDK Exports Integrity
  test('2. Developer Ecosystem SDK Exports Surface', () => {
    const sdk = suite.exportEcosystemSDK();

    assert.strictEqual(sdk.version, '2026.1.0-LTS', 'SDK version should match expected release string');
    assert.strictEqual(typeof sdk.IDEEcosystemRegistry, 'function', 'IDEEcosystemRegistry class should be exported');
    assert.strictEqual(typeof sdk.ProductionIdeAdapterSuite, 'function', 'ProductionIdeAdapterSuite class should be exported');
    assert.strictEqual(typeof sdk.PluginEcosystemSandbox, 'function', 'PluginEcosystemSandbox class should be exported');
    assert.strictEqual(typeof sdk.MarketplaceEngine, 'function', 'MarketplaceEngine class should be exported');

    assert.strictEqual(typeof sdk.createSuiteInstance, 'function', 'createSuiteInstance factory should be exported');
    assert.strictEqual(typeof sdk.validateVSCodeLspDiagnostics, 'function', 'validateVSCodeLspDiagnostics function should be exported');
    assert.strictEqual(typeof sdk.verifyJetBrainsPluginIndicators, 'function', 'verifyJetBrainsPluginIndicators function should be exported');
    assert.strictEqual(typeof sdk.validateMarketplaceExtensionSandbox, 'function', 'validateMarketplaceExtensionSandbox function should be exported');

    assert.strictEqual(sdk.LSP_DIAGNOSTIC_SEVERITY.Error, 1);
    assert.strictEqual(sdk.LSP_DIAGNOSTIC_SEVERITY.Warning, 2);
    assert.strictEqual(sdk.LSP_DIAGNOSTIC_SEVERITY.Information, 3);
    assert.strictEqual(sdk.LSP_DIAGNOSTIC_SEVERITY.Hint, 4);

    assert.strictEqual(Array.isArray(sdk.OSAP_RULES), true);
    assert.strictEqual(sdk.OSAP_RULES.length, 4);
    assert.strictEqual(sdk.OSAP_RULES[0].id, 'OSAP-001');
    assert.strictEqual(sdk.OSAP_RULES[1].id, 'OSAP-002');
    assert.strictEqual(sdk.OSAP_RULES[2].id, 'OSAP-003');
    assert.strictEqual(sdk.OSAP_RULES[3].id, 'OSAP-004');
  });

  // Test 3: VS Code Extension LSP Diagnostic Handlers (OSAP-001 to OSAP-004)
  test('3. VS Code LSP Diagnostic Handlers (OSAP-001 to OSAP-004)', () => {
    // 3a. Clean compliant file
    const cleanCode = `/******************************************************************************
 * Project        : Universal Autonomous Engineering Governance Operating System
 * Governance: Security Reviewed, Architecture Controlled
 * Standards: ISO 27001, SOC 2
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance
 ******************************************************************************/

'use strict';
const spawnSync = require('child_process').spawnSync;
const https = require('https');

function safeProcess() {
  return spawnSync('node', ['--version']);
}
module.exports = safeProcess;
`;

    const cleanReport = suite.validateVSCodeLspDiagnostics(cleanCode, { filePath: 'src/clean.js' });
    assert.strictEqual(cleanReport.valid, true, 'Clean code should pass LSP diagnostic validation');
    assert.strictEqual(cleanReport.errorCount, 0, 'Clean code should have 0 errors');
    assert.strictEqual(cleanReport.warningCount, 0, 'Clean code should have 0 warnings');

    // 3b. Missing Governance Header (OSAP-001)
    const missingHeaderCode = `
'use strict';
console.log("Hello World");
`;
    const osap1Report = suite.validateVSCodeLspDiagnostics(missingHeaderCode, { filePath: 'src/no_header.js' });
    const osap1Diag = osap1Report.diagnostics.find(d => d.code === 'OSAP-001');
    assert.ok(osap1Diag, 'OSAP-001 diagnostic should be triggered for code without governance header');
    assert.strictEqual(osap1Diag.severity, 2, 'OSAP-001 should have severity Warning (2)');

    // 3c. Hardcoded Secret Exposure Risk (OSAP-002)
    const secretExposureCode = `/******************************************************************************
 * Governance: Controlled
 ******************************************************************************/
const api_key = "secret_key_1234567890_exposed";
`;
    const osap2Report = suite.validateVSCodeLspDiagnostics(secretExposureCode, { filePath: 'src/secrets.js' });
    assert.strictEqual(osap2Report.valid, false, 'File with hardcoded secret must fail valid check');
    const osap2Diag = osap2Report.diagnostics.find(d => d.code === 'OSAP-002');
    assert.ok(osap2Diag, 'OSAP-002 diagnostic should be triggered');
    assert.strictEqual(osap2Diag.severity, 1, 'OSAP-002 should have severity Error (1)');
    assert.strictEqual(osap2Diag.range.start.line, 3, 'LSP 3.17 Range start line should accurately locate secret');

    // 3d. Unrestricted Network Call (OSAP-003)
    const httpInsecureCode = `/******************************************************************************
 * Governance: Controlled
 ******************************************************************************/
fetch('http://unencrypted-insecure-api.org/data');
`;
    const osap3Report = suite.validateVSCodeLspDiagnostics(httpInsecureCode, { filePath: 'src/network.js' });
    const osap3Diag = osap3Report.diagnostics.find(d => d.code === 'OSAP-003');
    assert.ok(osap3Diag, 'OSAP-003 diagnostic should be triggered');
    assert.strictEqual(osap3Diag.severity, 3, 'OSAP-003 should have severity Information (3)');

    // 3e. Unchecked System Command Execution (OSAP-004)
    const unsafeExecCode = `/******************************************************************************
 * Governance: Controlled
 ******************************************************************************/
const { exec } = require('child_process');
exec('ls -la /tmp');
`;
    const osap4Report = suite.validateVSCodeLspDiagnostics(unsafeExecCode, { filePath: 'src/exec.js' });
    const osap4Diag = osap4Report.diagnostics.find(d => d.code === 'OSAP-004');
    assert.ok(osap4Diag, 'OSAP-004 diagnostic should be triggered');
    assert.strictEqual(osap4Diag.severity, 2, 'OSAP-004 should have severity Warning (2)');
  });

  // Test 4: JetBrains Plugin Indicators Verification
  test('4. JetBrains Plugin Indicators & Descriptor Verification', () => {
    // 4a. Valid JetBrains plugin configuration
    const jetbrainsValidConfig = {
      id: 'com.ujomor.eaorcs.jetbrains',
      name: 'EAORCS JetBrains Governance Plugin',
      version: '2026.1.0',
      vendor: 'Ujomor Systems',
      ideaVersion: { sinceBuild: '241.0', untilBuild: '262.*' },
      depends: ['com.intellij.modules.platform', 'com.intellij.modules.lang'],
      extensions: {
        inspectionToolProvider: 'com.ujomor.eaorcs.inspection.EAORCSInspectionProvider',
        statusBarWidgetFactory: 'com.ujomor.eaorcs.widget.GovernanceStatusWidgetFactory'
      },
      actionHandlers: ['EAORCS.InspectFile', 'EAORCS.VerifyAttestation']
    };

    const validReport = suite.verifyJetBrainsPluginIndicators(jetbrainsValidConfig);
    assert.strictEqual(validReport.valid, true, 'Valid JetBrains config should be accepted');
    assert.strictEqual(validReport.score, 100, 'Score should be 100 for complete indicators');
    assert.strictEqual(validReport.indicators.hasIdeaPluginDescriptor, true);
    assert.strictEqual(validReport.indicators.hasPlatformDependency, true);
    assert.strictEqual(validReport.indicators.hasInspectionProvider, true);
    assert.strictEqual(validReport.indicators.hasWidgetFactory, true);
    assert.strictEqual(validReport.indicators.hasActionHandlers, true);

    // 4b. Incomplete JetBrains plugin configuration
    const incompleteConfig = {
      name: 'Incomplete JetBrains Plugin',
      version: '0.1.0'
    };

    const incompleteReport = suite.verifyJetBrainsPluginIndicators(incompleteConfig);
    assert.strictEqual(incompleteReport.valid, false, 'Incomplete JetBrains config should fail validation');
    assert.strictEqual(incompleteReport.issues.length > 0, true, 'Issues should be listed for incomplete config');
  });

  // Test 5: Marketplace Extension Sandbox Validation (Non-Invasive)
  test('5. Non-Invasive Marketplace Extension Sandbox Validation', () => {
    const manifest = {
      id: 'ext-marketplace-security-pack',
      name: 'Security Governance Policy Extension',
      version: '1.2.0',
      publisher: 'Certified Marketplace Partner',
      declaredPermissions: {
        network: { allow: false, allowedDomains: [] },
        filesystem: { read: ['/tmp'], write: [] },
        processExecution: { allow: false }
      },
      hooks: {
        onInitialize: 'function() { return { status: "ACTIVE", sandboxReady: true }; }',
        onAudit: 'function() { return { passed: true }; }'
      }
    };

    const sandboxResult = suite.validateMarketplaceExtensionSandbox(manifest);
    assert.strictEqual(sandboxResult.valid, true, 'Sandbox validation should pass for valid extension manifest');
    assert.strictEqual(sandboxResult.sandboxCreated, true, 'Isolated VM sandbox should be successfully instantiated');
    assert.strictEqual(sandboxResult.nonInvasiveVerified, true, 'Execution must be non-invasive with 0 global scope mutations');
    assert.strictEqual(sandboxResult.permissionsEnforced, true, 'Permissions must be enforced strictly');
    assert.strictEqual(sandboxResult.status, 'VERIFIED_SECURE');

    // Test simulation of security violation
    const violationManifest = {
      id: 'ext-malicious-attempt',
      name: 'Unverified Extension',
      version: '0.9.0',
      publisher: 'Unknown Publisher',
      simulateViolation: true,
      hooks: {
        onInitialize: 'function() { return { status: "OK" }; }'
      }
    };

    const violResult = suite.validateMarketplaceExtensionSandbox(violationManifest);
    assert.strictEqual(violResult.violationsDetected > 0, true, 'Security violation should be detected and recorded');
    assert.strictEqual(violResult.status, 'FLAGGED_VIOLATION');
  });

  // Test 6: End-to-End Full Ecosystem Audit Suite Execution
  test('6. Full End-to-End Ecosystem Audit Suite', () => {
    const fullAudit = suite.runFullEcosystemAudit();
    assert.strictEqual(fullAudit.passed, true, 'Full Ecosystem Audit Suite must pass 100% cleanly');
    assert.strictEqual(fullAudit.summary.cleanCodeDiagnosticsPassed, true);
    assert.strictEqual(fullAudit.summary.violatingCodeDiagnosticsDetected >= 3, true);
    assert.strictEqual(fullAudit.summary.jetbrainsIndicatorsVerified, true);
    assert.strictEqual(fullAudit.summary.marketplaceSandboxVerified, true);
    assert.strictEqual(fullAudit.summary.sdkExportsVerified, true);
  });

  console.log('\n================================================================================');
  console.log(`  STREAM 5 DEVELOPER ECOSYSTEM SUITE: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================================\n');

  if (failedTests === 0) {
    console.log('🎉 STREAM 5 QUALIFICATION PASSED WITH 100% CLEAN RESULTS.\n');
    process.exit(0);
  } else {
    console.error('❌ STREAM 5 QUALIFICATION FAILED.\n');
    process.exit(1);
  }
}

runStream5TestSuite();
