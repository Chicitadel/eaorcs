/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Phase 10 Stream 4 — Developer Ecosystem (IDE & SDK) Test Suite
 * File           : tests/phase10/stream_4_developer_ecosystem.test.js
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
 * - Language Server Protocol (LSP 3.17)
 * - OSAP v1/v2/v5/v8 Open Software Attestation Protocol
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');

const IDEEcosystemRegistry = require('../../engine/ide/IDEEcosystemRegistry');
const VSCodeExtension = require('../../sdk/vscode/extension');
const JetBrainsPluginManager = require('../../sdk/jetbrains/plugin');
const sdkPackage = require('../../sdk/index');

function runStream4Tests() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 10: STREAM 4 — DEVELOPER ECOSYSTEM (IDE & SDK) TEST SUITE');
  console.log('================================================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  function test(name, fn) {
    totalTests++;
    try {
      fn();
      passedTests++;
      console.log(`  ✅ [PASS] ${name}`);
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}\n${err.stack}`);
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 1: IDEEcosystemRegistry Engine
  // ---------------------------------------------------------------------------
  console.log('[SECTION 1] IDEEcosystemRegistry Engine & LSP Endpoints');

  const registry = new IDEEcosystemRegistry();

  test('Registry Initialization & Default Rules', () => {
    const status = registry.getRegistryStatus();
    assert.strictEqual(status.status, 'OPERATIONAL');
    assert.strictEqual(status.activeDiagnosticRules > 0, true);
    assert.strictEqual(Array.isArray(status.supportedPlatforms), true);
  });

  test('Plugin Registration, Lookup & Listing', () => {
    const regResult = registry.registerPlugin('test-vscode-plugin', {
      name: 'Test VS Code Plugin',
      platform: 'vscode',
      version: '1.2.0',
      publisher: 'Ujomor Engineering'
    });
    assert.strictEqual(regResult.success, true);
    assert.strictEqual(regResult.plugin.id, 'test-vscode-plugin');

    const fetched = registry.getPlugin('test-vscode-plugin');
    assert.notStrictEqual(fetched, null);
    assert.strictEqual(fetched.name, 'Test VS Code Plugin');

    const listVscode = registry.listPlugins({ platform: 'vscode' });
    assert.strictEqual(listVscode.some(p => p.id === 'test-vscode-plugin'), true);
  });

  test('Plugin Unregistration', () => {
    registry.registerPlugin('temp-plugin', { platform: 'cursor' });
    assert.notStrictEqual(registry.getPlugin('temp-plugin'), null);

    const unreg = registry.unregisterPlugin('temp-plugin');
    assert.strictEqual(unreg.success, true);
    assert.strictEqual(registry.getPlugin('temp-plugin'), null);
  });

  test('LSP Session Lifecycle', () => {
    const session = registry.createLspSession('session-101', {
      clientName: 'VS Code Client',
      platform: 'vscode',
      rootUri: 'file:///workspace'
    });
    assert.strictEqual(session.sessionId, 'session-101');
    assert.strictEqual(session.status, 'CONNECTED');

    const closed = registry.closeLspSession('session-101');
    assert.strictEqual(closed, true);
    assert.strictEqual(registry.closeLspSession('session-101'), false);
  });

  test('LSP Diagnostic Generation (Clean vs Non-Compliant Code)', () => {
    const cleanCode = `
      /******************************************************************************
       * Governance: Modularization Enforced
       ******************************************************************************/
      const secureUrl = 'https://api.ujomor.com';
    `;
    const cleanDiags = registry.provideDiagnostics('file:///clean.js', cleanCode);
    assert.strictEqual(cleanDiags.length, 0);

    const nonCompliantCode = `
      const secret = "api_key = 'abcdef1234567890'";
      const rawHttp = "http://insecure.internal";
      exec("rm -rf /");
    `;
    const diags = registry.provideDiagnostics('file:///dirty.js', nonCompliantCode);
    assert.strictEqual(diags.length > 0, true);
    const codes = diags.map(d => d.code);
    assert.strictEqual(codes.includes('OSAP-001'), true); // missing governance header
    assert.strictEqual(codes.includes('OSAP-002'), true); // hardcoded secret
  });

  test('OSAP Passport Inspection Handler', () => {
    const passportPath = path.join(__dirname, '../../osap-passport.json');
    const inspection = registry.inspectPassport(passportPath);
    assert.strictEqual(inspection.isValid, true);
    assert.strictEqual(typeof inspection.trustScore, 'number');
    assert.strictEqual(inspection.tier, 'GOLD');
    assert.strictEqual(inspection.verificationDetails.protocolCompliant, true);
  });

  // ---------------------------------------------------------------------------
  // SECTION 2: VS Code Extension SDK
  // ---------------------------------------------------------------------------
  console.log('\n[SECTION 2] VS Code Extension SDK (sdk/vscode/extension.js)');

  test('VS Code Extension Activation & Context Registration', () => {
    const contextMock = { subscriptions: [] };
    const actResult = VSCodeExtension.activate(contextMock);
    assert.strictEqual(actResult.status, 'ACTIVATED');
    assert.strictEqual(actResult.extensionId, 'eaorcs-vscode-extension');
    assert.strictEqual(contextMock.subscriptions.length >= 3, true);
  });

  test('VS Code Extension Inline Diagnostics Execution', () => {
    const dirtyContent = 'let secret_key = "1234567890";';
    const res = VSCodeExtension.runInlineDiagnostics('file:///test_vs.js', dirtyContent);
    assert.strictEqual(res.documentUri, 'file:///test_vs.js');
    assert.strictEqual(res.diagnosticCount > 0, true);
  });

  test('VS Code Extension Trust Node Inspection', () => {
    const nodeInfo = VSCodeExtension.inspectTrustNode('NODE-SEC-01');
    assert.strictEqual(nodeInfo.nodeId, 'NODE-SEC-01');
    assert.strictEqual(nodeInfo.status, 'VERIFIED');
    assert.strictEqual(nodeInfo.trustScore > 90, true);
  });

  test('VS Code Extension Passport Inspection & Status', () => {
    const mockPassport = {
      osap_version: '2.0.0',
      passport_id: 'PASS-VSCODE-TEST',
      trust_summary: { trust_score: 97.5, tier: 'PLATINUM' },
      issuer: { organization: 'Ujomor Engineering', digital_signature: 'sig_123' },
      subject: { artifact_id: 'vscode-sdk-test' }
    };
    const insp = VSCodeExtension.inspectPassport(mockPassport);
    assert.strictEqual(insp.passportId, 'PASS-VSCODE-TEST');
    assert.strictEqual(insp.tier, 'PLATINUM');

    const status = VSCodeExtension.getComplianceStatus();
    assert.strictEqual(status.extensionName, 'EAORCS VS Code Extension');
  });

  test('VS Code Extension Deactivation', () => {
    const deact = VSCodeExtension.deactivate();
    assert.strictEqual(deact.status, 'DEACTIVATED');
  });

  // ---------------------------------------------------------------------------
  // SECTION 3: JetBrains Plugin SDK
  // ---------------------------------------------------------------------------
  console.log('\n[SECTION 3] JetBrains Plugin SDK (sdk/jetbrains/plugin.js)');

  test('JetBrains Plugin Manager Initialization', () => {
    const pluginMgr = new JetBrainsPluginManager({ pluginId: 'jb-test-plugin' });
    const initRes = pluginMgr.initialize();
    assert.strictEqual(initRes.status, 'INITIALIZED');
    assert.strictEqual(initRes.pluginId, 'jb-test-plugin');
  });

  test('JetBrains Compliance Indicators Provider', () => {
    const pluginMgr = new JetBrainsPluginManager();
    const cleanInd = pluginMgr.getComplianceIndicators('CleanFile.java', '/* Governance: Standard */ const a = 1;');
    assert.strictEqual(cleanInd.overallStatus, 'COMPLIANT');

    const dirtyInd = pluginMgr.getComplianceIndicators('DirtyFile.java', 'const api_key = "abc12345678";');
    assert.strictEqual(dirtyInd.overallStatus, 'NON_COMPLIANT');
    assert.strictEqual(dirtyInd.diagnosticCount > 0, true);
  });

  test('JetBrains Passport Verification & ToolWindow Data', () => {
    const mockPassport = {
      osap_version: '2.0.0',
      passport_id: 'PASS-JB-TEST',
      trust_summary: { trust_score: 99.0, tier: 'GOLD' },
      issuer: { organization: 'Ujomor Governance' }
    };
    const ver = JetBrainsPluginManager.verifyPassport(mockPassport);
    assert.strictEqual(ver.passportId, 'PASS-JB-TEST');

    const twData = JetBrainsPluginManager.getInspectionToolwindowData();
    assert.strictEqual(typeof twData.title, 'string');
    assert.strictEqual(Array.isArray(twData.nodeHierarchy), true);
  });

  test('JetBrains Trust Node Inspection', () => {
    const nodeData = JetBrainsPluginManager.inspectTrustNode('JB-NODE-01');
    assert.strictEqual(nodeData.nodeId, 'JB-NODE-01');
    assert.strictEqual(nodeData.status, 'VERIFIED');
  });

  // ---------------------------------------------------------------------------
  // SECTION 4: SDK Package Exports & Integration
  // ---------------------------------------------------------------------------
  console.log('\n[SECTION 4] SDK Package Exports & Instantiation (@eaorcs/sdk)');

  test('SDK Package Object Exports', () => {
    assert.notStrictEqual(sdkPackage.EAORCSSDK, undefined);
    assert.notStrictEqual(sdkPackage.HostAwarenessEngine, undefined);
    assert.notStrictEqual(sdkPackage.StorageProvider, undefined);
    assert.notStrictEqual(sdkPackage.CacheProvider, undefined);
    assert.notStrictEqual(sdkPackage.QueueProvider, undefined);
    assert.notStrictEqual(sdkPackage.IdentityAdapter, undefined);
    assert.notStrictEqual(sdkPackage.LicensingAdapter, undefined);
    assert.notStrictEqual(sdkPackage.TelemetryAdapter, undefined);
    assert.notStrictEqual(sdkPackage.VSCodeExtension, undefined);
    assert.notStrictEqual(sdkPackage.JetBrainsPluginManager, undefined);
  });

  test('SDK Instance Capabilities & Operations', async () => {
    const sdkInstance = new sdkPackage.EAORCSSDK({ offlineMode: true });
    const caps = sdkInstance.getHostCapabilities();
    assert.strictEqual(typeof caps, 'object');

    const audit = await sdkInstance.runAudit({ edition: 'Enterprise Developer' });
    assert.strictEqual(audit.compliance, 'COMPLIANT');
    assert.strictEqual(typeof audit.auditId, 'string');
  });

  // Summary Output
  console.log('\n================================================================================');
  console.log(`  STREAM 4 TEST SUMMARY: Passed ${passedTests}/${totalTests} tests`);
  console.log('================================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

if (require.main === module) {
  runStream4Tests();
}

module.exports = { runStream4Tests };
