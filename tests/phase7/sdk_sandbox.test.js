/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Streams 9 & 10 End-to-End Verification Test Suite
 * File           : sdk_sandbox.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | TEST SUITE
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
const fs = require('fs');
const path = require('path');

const PublicSdkPackageBuilder = require('../../sdk/public/PublicSdkPackageBuilder');
const PluginEcosystemSandbox = require('../../engine/marketplace/PluginEcosystemSandbox');

async function runTest() {
  console.log('================================================================');
  console.log('  EAORCS STREAMS 9 & 10: PUBLIC SDK BUILDER & SANDBOX TEST SUITE');
  console.log('================================================================\n');

  const testOutDir = path.join(__dirname, '../../scratch/test_sdks_output');

  // Ensure scratch dir clean state
  if (fs.existsSync(testOutDir)) {
    fs.rmSync(testOutDir, { recursive: true, force: true });
  }
  fs.mkdirSync(testOutDir, { recursive: true });

  let totalTests = 0;
  let passedTests = 0;

  function runTestCase(name, fn) {
    totalTests++;
    try {
      fn();
      passedTests++;
      console.log(`[PASS] ${totalTests}. ${name}`);
    } catch (err) {
      console.error(`[FAIL] ${totalTests}. ${name}`);
      console.error(`       Error: ${err.message}`);
      throw err;
    }
  }

  console.log('--- PART 1: Public Developer SDK Package Builder Tests ---');

  const builder = new PublicSdkPackageBuilder();

  runTestCase('Node.js SDK Package Compilation (@eaorcs/sdk)', () => {
    const res = builder.buildNodeJsSdk(testOutDir);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.target, 'nodejs');
    assert.strictEqual(res.packageName, '@eaorcs/sdk');
    assert.ok(res.fileCount >= 4);

    const pkgJsonPath = path.join(testOutDir, 'nodejs', 'package.json');
    assert.ok(fs.existsSync(pkgJsonPath));
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    assert.strictEqual(pkg.name, '@eaorcs/sdk');
    assert.deepStrictEqual(pkg.dependencies, {}); // Zero dependency constraint
  });

  runTestCase('Python SDK Package Compilation (eaorcs-sdk)', () => {
    const res = builder.buildPythonSdk(testOutDir);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.target, 'python');
    assert.strictEqual(res.packageName, 'eaorcs-sdk');
    assert.ok(res.fileCount >= 5);

    const initPyPath = path.join(testOutDir, 'python', 'eaorcs_sdk', '__init__.py');
    assert.ok(fs.existsSync(initPyPath));
    const initContent = fs.readFileSync(initPyPath, 'utf8');
    assert.ok(initContent.includes('EaorcsClient'));
  });

  runTestCase('Java SDK Package Compilation (com.eaorcs.sdk)', () => {
    const res = builder.buildJavaSdk(testOutDir);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.target, 'java');
    assert.strictEqual(res.packageName, 'com.eaorcs.sdk');
    assert.ok(res.fileCount >= 3);

    const pomXmlPath = path.join(testOutDir, 'java', 'pom.xml');
    assert.ok(fs.existsSync(pomXmlPath));
    const pomContent = fs.readFileSync(pomXmlPath, 'utf8');
    assert.ok(pomContent.includes('<artifactId>eaorcs-sdk</artifactId>'));
    assert.ok(pomContent.includes('<dependencies/>')); // Zero external dependencies
  });

  runTestCase('OpenAPI REST Client Specification Generation', () => {
    const res = builder.buildOpenApiSpec(testOutDir);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.target, 'openapi');
    assert.strictEqual(res.packageName, 'eaorcs-openapi-spec');
    assert.ok(res.fileCount >= 3);

    const openApiJsonPath = path.join(testOutDir, 'openapi', 'openapi.json');
    assert.ok(fs.existsSync(openApiJsonPath));
    const spec = JSON.parse(fs.readFileSync(openApiJsonPath, 'utf8'));
    assert.strictEqual(spec.openapi, '3.0.3');
    assert.ok(spec.paths['/api/v1/governance/evaluate']);
  });

  runTestCase('Comprehensive All-SDK Build Execution (buildAllSdks)', () => {
    const res = builder.buildAllSdks(testOutDir);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.totalPackages, 4);
    assert.ok(res.totalFilesWritten >= 15);
    assert.ok(res.totalSizeBytes > 0);
    assert.ok(res.buildDurationMs >= 0);
  });

  console.log('\n--- PART 2: Marketplace Plugin Sandbox Engine Tests ---');

  const sandboxEngine = new PluginEcosystemSandbox();

  const manifest = {
    id: 'plugin-enterprise-auditor',
    name: 'Enterprise Compliance Auditor Plugin',
    version: '1.2.0',
    publisher: 'Ujomor Marketplace Partner',
    declaredPermissions: {
      network: { allow: true, allowedDomains: ['api.enterprise.internal'] },
      fs: { allow: true, allowedPaths: [path.join(testOutDir, 'sandbox-storage')], readOnly: false },
      execution: { maxExecutionTimeMs: 1500, allowChildProcess: false },
      memory: { maxHeapMb: 64 }
    },
    hooks: {
      onAuditRequest: `
        (function(payload, sandboxApi) {
          const report = {
            audited: true,
            subject: payload.subject,
            status: 'COMPLIANT'
          };
          return report;
        })(payload, sandboxApi);
      `,
      onUnauthorizedNetwork: `
        (function(payload, sandboxApi) {
          return sandboxApi.fetch('https://forbidden-unauthorized-domain.com/data');
        })(payload, sandboxApi);
      `,
      onUnauthorizedFsRead: `
        (function(payload, sandboxApi) {
          return sandboxApi.readFile('C:\\Windows\\System32\\config\\SAM');
        })(payload, sandboxApi);
      `,
      onUnauthorizedExec: `
        (function(payload, sandboxApi) {
          return sandboxApi.exec('powershell Get-Process');
        })(payload, sandboxApi);
      `,
      onResourceExhaustion: `
        (function(payload, sandboxApi) {
          return sandboxApi.allocateMemory(512); // Max cap is 64MB
        })(payload, sandboxApi);
      `
    }
  };

  runTestCase('Plugin Descriptor Registration', () => {
    const regRes = sandboxEngine.registerPluginDescriptor(manifest);
    assert.strictEqual(regRes.registered, true);
    assert.strictEqual(regRes.pluginId, 'plugin-enterprise-auditor');
    assert.strictEqual(regRes.status, 'ACTIVE');
  });

  runTestCase('Plugin Sandbox Context Initialization with Capabilities', () => {
    const sbRes = sandboxEngine.createPluginSandbox('plugin-enterprise-auditor', manifest.declaredPermissions);
    assert.strictEqual(sbRes.initialized, true);
    assert.strictEqual(sbRes.sandboxId, 'plugin-enterprise-auditor');
    assert.strictEqual(sbRes.effectiveCapabilities.network.allow, true);
    assert.deepStrictEqual(sbRes.effectiveCapabilities.network.allowedDomains, ['api.enterprise.internal']);
  });

  runTestCase('Legitimate Hook Execution inside Sandbox', () => {
    const hookRes = sandboxEngine.executePluginHook('plugin-enterprise-auditor', 'onAuditRequest', { subject: 'FinanceService' });
    assert.strictEqual(hookRes.success, true);
    assert.strictEqual(hookRes.result.audited, true);
    assert.strictEqual(hookRes.result.subject, 'FinanceService');
    assert.strictEqual(hookRes.result.status, 'COMPLIANT');
  });

  runTestCase('Network Access Security Violation Interception', () => {
    const hookRes = sandboxEngine.executePluginHook('plugin-enterprise-auditor', 'onUnauthorizedNetwork');
    assert.strictEqual(hookRes.success, false);
    assert.ok(hookRes.error.includes('domain'));
    assert.ok(hookRes.violation);
    assert.strictEqual(hookRes.violation.type, 'NETWORK_VIOLATION');
  });

  runTestCase('File System Access Security Violation Interception', () => {
    const hookRes = sandboxEngine.executePluginHook('plugin-enterprise-auditor', 'onUnauthorizedFsRead');
    assert.strictEqual(hookRes.success, false);
    assert.ok(hookRes.error.includes('denied') || hookRes.error.includes('Capability Error'));
    assert.ok(hookRes.violation);
    assert.strictEqual(hookRes.violation.type, 'FS_VIOLATION');
  });

  runTestCase('Child Process Execution Security Violation Interception', () => {
    const hookRes = sandboxEngine.executePluginHook('plugin-enterprise-auditor', 'onUnauthorizedExec');
    assert.strictEqual(hookRes.success, false);
    assert.ok(hookRes.error.includes('prohibited') || hookRes.error.includes('Child process'));
    assert.ok(hookRes.violation);
    assert.strictEqual(hookRes.violation.type, 'EXECUTION_VIOLATION');
  });

  runTestCase('Resource Exhaustion Memory Cap Interception', () => {
    const hookRes = sandboxEngine.executePluginHook('plugin-enterprise-auditor', 'onResourceExhaustion');
    assert.strictEqual(hookRes.success, false);
    assert.ok(hookRes.error.includes('Memory allocation') || hookRes.error.includes('exceeds cap'));
    assert.ok(hookRes.violation);
    assert.strictEqual(hookRes.violation.type, 'RESOURCE_EXHAUSTION');
  });

  runTestCase('Sandbox Security Violations Query & Metrics', () => {
    const violations = sandboxEngine.getSandboxViolations('plugin-enterprise-auditor');
    assert.ok(violations.length >= 4);
    const violationTypes = violations.map(v => v.type);
    assert.ok(violationTypes.includes('NETWORK_VIOLATION'));
    assert.ok(violationTypes.includes('FS_VIOLATION'));
    assert.ok(violationTypes.includes('EXECUTION_VIOLATION'));
    assert.ok(violationTypes.includes('RESOURCE_EXHAUSTION'));
  });

  console.log('\n================================================================');
  console.log(`  VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
  console.log('================================================================\n');

  // Clean output directory
  fs.rmSync(testOutDir, { recursive: true, force: true });
}

runTest().catch((err) => {
  console.error('\n[FATAL TEST FAILURE]', err);
  process.exit(1);
});
