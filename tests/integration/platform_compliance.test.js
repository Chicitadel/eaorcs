/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Air Roofers Platform Integration Compliance Test Suite
 * File           : platform_compliance.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Air Roofers / Ujomor Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
 *
 * Governance:
 * - AI Governed
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
 * Copyright (c) 2026 Air Roofers / Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const ProductIntegrationComplianceEngine = require('../../engine/integration/ProductIntegrationComplianceEngine');
const IntegrationComplianceReporter = require('../../engine/integration/IntegrationComplianceReporter');

function runComplianceTestSuite() {
  console.log('===============================================================');
  console.log('Running Air Roofers Platform Integration Compliance Test Suite');
  console.log('===============================================================\n');

  const engine = new ProductIntegrationComplianceEngine();

  // Test 1: EAORCS Self-Compliance (Fully Compliant Product)
  console.log('[TEST 1] Evaluating EAORCS Self-Compliance Descriptor...');
  const eaorcsDescriptor = {
    name: 'EAORCS',
    adapters: {
      billing: 'https://billing.airroofers.eu/api/v1',
      licensing: 'https://licensing.airroofers.eu/api/v1',
      identity: 'https://identity.airroofers.eu/api/v1',
      telemetry: 'https://telemetry.airroofers.eu/api/v1 (X-Telemetry-Key)',
      support: 'https://support.airroofers.eu/api/v1 (X-Correlation-ID)'
    },
    hasHealthEndpoint: true,
    hasCorrelationIds: true,
    hasOpenApiSpec: true,
    hasOtaHook: true,
    hasStorageGovernor: true,
    packageJson: {
      dependencies: {
        '@airroofers/core-sdk': '^2026.1.0-lts'
      }
    },
    noHardcodedSecrets: true,
    hasFailFast: true
  };

  const eaorcsReport = engine.validateProduct(eaorcsDescriptor);
  assert.strictEqual(eaorcsReport.summary.total, 13, 'Expected 13 total requirements checked');
  assert.strictEqual(eaorcsReport.summary.pass, 13, 'Expected all 13 checks to PASS for EAORCS');
  assert.strictEqual(eaorcsReport.summary.warn, 0, 'Expected 0 WARN for EAORCS');
  assert.strictEqual(eaorcsReport.summary.fail, 0, 'Expected 0 FAIL for EAORCS');
  assert.strictEqual(eaorcsReport.summary.compliant, true, 'Expected EAORCS to be marked fully compliant');
  
  eaorcsReport.results.forEach(r => {
    assert.strictEqual(r.status, 'PASS', `Requirement ${r.id} expected status PASS but got ${r.status}`);
  });
  console.log('  -> PASS: All 13 mandatory compliance checks PASSED for EAORCS.\n');

  // Test 2: Non-Compliant Product Descriptor
  console.log('[TEST 2] Evaluating Non-Compliant Product Descriptor...');
  const nonCompliantDescriptor = {
    name: 'LegacyRogueSystem',
    adapters: {
      billing: 'https://local-billing.internal.net/api',
      identity: 'https://my-identity-db.internal'
    },
    hasLocalBillingLogic: true,
    hasUserDatabase: true,
    hasHealthEndpoint: false,
    hasCorrelationIds: false,
    hasOpenApiSpec: false,
    hasOtaHook: false,
    hasStorageGovernor: false,
    packageJson: { dependencies: {} },
    noHardcodedSecrets: false,
    hasFailFast: false
  };

  const nonCompliantReport = engine.validateProduct(nonCompliantDescriptor);
  assert.strictEqual(nonCompliantReport.summary.compliant, false, 'Expected non-compliant product to fail overall compliance');
  assert.ok(nonCompliantReport.summary.fail >= 10, 'Expected multiple FAIL statuses for non-compliant product');

  const int01 = nonCompliantReport.results.find(r => r.id === 'INT-01');
  assert.strictEqual(int01.status, 'FAIL', 'INT-01 should FAIL when local billing logic is detected');

  const int13 = nonCompliantReport.results.find(r => r.id === 'INT-13');
  assert.strictEqual(int13.status, 'FAIL', 'INT-13 should FAIL when local user DB is detected');

  console.log(`  -> PASS: Correctly identified non-compliance (${nonCompliantReport.summary.fail} FAILs).\n`);

  // Test 3: Partial Compliance Descriptor (Warnings)
  console.log('[TEST 3] Evaluating Partial Compliance Descriptor (WARN states)...');
  const partialDescriptor = {
    name: 'PartialIntegrationApp',
    adapters: {
      billing: 'https://billing.airroofers.eu/api/v1',
      licensing: 'https://licensing.airroofers.eu/api/v1',
      identity: 'https://identity.airroofers.eu/api/v1',
      telemetry: 'https://telemetry.airroofers.eu/api/v1', // Missing X-Telemetry-Key header -> WARN
      support: 'https://support.airroofers.eu/api/v1 (X-Correlation-ID)'
    },
    hasHealthEndpoint: true,
    hasCorrelationIds: true,
    hasOpenApiSpec: true,
    hasOtaHook: 'custom_deploy_script.sh', // Unverified smart_deploy.sh reference -> WARN
    hasStorageGovernor: { logRotation: true, tempCleanup: false }, // Incomplete cleanup -> WARN
    packageJson: {
      dependencies: {
        '@airroofers/core-sdk': '2026.1.0'
      }
    },
    noHardcodedSecrets: true,
    hasFailFast: true
  };

  const partialReport = engine.validateProduct(partialDescriptor);
  assert.ok(partialReport.summary.warn > 0, 'Expected WARN statuses for partial compliance');

  const int03 = partialReport.results.find(r => r.id === 'INT-03');
  assert.strictEqual(int03.status, 'WARN', 'INT-03 should WARN when X-Telemetry-Key header is missing');

  const int04 = partialReport.results.find(r => r.id === 'INT-04');
  assert.strictEqual(int04.status, 'WARN', 'INT-04 should WARN when temp cleanup is incomplete');

  const int06 = partialReport.results.find(r => r.id === 'INT-06');
  assert.strictEqual(int06.status, 'WARN', 'INT-06 should WARN when smart_deploy.sh reference is unverified');

  console.log(`  -> PASS: Correctly identified partial compliance (${partialReport.summary.warn} WARNs).\n`);

  // Test 4: Reporter Formatting Test
  console.log('[TEST 4] Testing IntegrationComplianceReporter Output...');
  const { json, markdown } = IntegrationComplianceReporter.generateReport(eaorcsReport);
  assert.ok(typeof json === 'string' && json.includes('EAORCS'), 'JSON report must contain product name');
  assert.ok(typeof markdown === 'string' && markdown.includes('Air Roofers Platform Integration Compliance Report'), 'Markdown report header missing');
  assert.ok(markdown.includes('INT-01') && markdown.includes('INT-13'), 'Markdown table must contain all requirement IDs');
  console.log('  -> PASS: Reporter successfully generated valid JSON and Markdown outputs.\n');

  console.log('---------------------------------------------------------------');
  console.log('All compliance tests completed successfully! (4/4 test suites)');
  console.log('---------------------------------------------------------------\n');
}

if (require.main === module) {
  runComplianceTestSuite();
}

module.exports = { runComplianceTestSuite };
