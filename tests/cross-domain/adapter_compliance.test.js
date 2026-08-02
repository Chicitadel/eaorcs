/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Cross-Domain Integration Verification / Adapter Compliance Test
 * File           : adapter_compliance.test.js
 * Version        : 1.0.0
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Ujomor Systems / Air Roofers
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
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
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems / Air Roofers
 * All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const AdapterComplianceEngine = require('../../engine/integration/AdapterComplianceEngine');

function runAdapterComplianceTests() {
  console.log('=== Running Adapter Compliance Engine Tests ===\n');

  const engine = new AdapterComplianceEngine();

  // Test 1: Test all 5 adapter contracts defined
  console.log('Test 1: Verify all 5 adapter contracts are defined...');
  const contractKeys = Object.keys(AdapterComplianceEngine.ADAPTER_CONTRACTS);
  assert.strictEqual(contractKeys.length, 5, 'Expected 5 adapter contracts.');
  assert.ok(contractKeys.includes('BillingAdapter'), 'BillingAdapter contract must be defined.');
  assert.ok(contractKeys.includes('LicensingAdapter'), 'LicensingAdapter contract must be defined.');
  assert.ok(contractKeys.includes('IdentityAdapter'), 'IdentityAdapter contract must be defined.');
  assert.ok(contractKeys.includes('TelemetryAdapter'), 'TelemetryAdapter contract must be defined.');
  assert.ok(contractKeys.includes('SupportAdapter'), 'SupportAdapter contract must be defined.');
  console.log('  ✔ Passed: All 5 adapter contracts defined.');

  // Test 2: Verify compliant adapter (correct endpoint, no prohibited patterns) -> PASS
  console.log('Test 2: Verify compliant mock adapter content passes check...');
  const compliantBillingCode = `
    const endpoint = 'https://billing.airroofers.eu/api/v1';
    class BillingAdapter {
      constructor() {
        this.headers = { 'X-Correlation-ID': 'corr-123' };
      }
      async recordEvent(event) {
        // Only delegate metered events
      }
    }
  `;
  const compliantResult = engine.checkAdapter(compliantBillingCode, 'BillingAdapter');
  assert.strictEqual(compliantResult.status, 'PASS', 'Compliant adapter should PASS.');
  assert.strictEqual(compliantResult.endpoint_found, true, 'Endpoint should be found.');
  assert.strictEqual(compliantResult.correlation_id_present, true, 'Correlation ID should be present.');
  assert.strictEqual(compliantResult.violations.length, 0, 'No violations expected.');
  console.log('  ✔ Passed: Compliant adapter evaluated as PASS.');

  // Test 3: Verify non-compliant adapter (prohibited pattern found) -> FAIL with violation detail
  console.log('Test 3: Verify non-compliant mock adapter content fails check...');
  const nonCompliantBillingCode = `
    const endpoint = 'https://billing.airroofers.eu/api/v1';
    class BillingAdapter {
      constructor() {
        this.headers = { 'X-Correlation-ID': 'corr-123' };
      }
      async createInvoice(tenantId, amount) {
        // Prohibited domain logic inside adapter!
        return { invoiceId: 'inv_123', amount };
      }
    }
  `;
  const nonCompliantResult = engine.checkAdapter(nonCompliantBillingCode, 'BillingAdapter');
  assert.strictEqual(nonCompliantResult.status, 'FAIL', 'Non-compliant adapter should FAIL.');
  assert.ok(nonCompliantResult.violations.length > 0, 'Violations array should not be empty.');
  assert.ok(
    nonCompliantResult.violations.some(v => v.includes('createInvoice')),
    'Violation detail should reference createInvoice.'
  );
  console.log('  ✔ Passed: Non-compliant adapter failed with clear violation details.');

  // Test 4: Validate all adapters against missing/fallback paths
  console.log('Test 4: Validate all adapters handling missing files gracefully as WARN...');
  const allResult = engine.validateAllAdapters(['non_existent_dir']);
  assert.strictEqual(allResult.totalChecked, 5, 'Should check all 5 contracts.');
  assert.strictEqual(allResult.warnCount, 5, 'All missing adapter files should be reported as WARN.');
  console.log('  ✔ Passed: missing adapters handled as WARN without throwing error.');

  console.log('\nAll Adapter Compliance tests PASSED successfully!\n');
}

if (require.main === module) {
  runAdapterComplianceTests();
}

module.exports = runAdapterComplianceTests;
