/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Cross-Domain Integration Verification / Bounded Context Test
 * File           : bounded_context.test.js
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
const CrossDomainValidator = require('../../engine/integration/CrossDomainValidator');
const BoundedContextGuard = require('../../engine/integration/BoundedContextGuard');

function runBoundedContextTests() {
  console.log('=== Running Bounded Context Integration Tests ===\n');

  const validator = new CrossDomainValidator();
  const guard = new BoundedContextGuard();

  // Test 1: Test all 8 interaction rules validate correctly for compliant interactions
  console.log('Test 1: Validate compliant interactions across all 8 rules...');
  const allRulesResult = validator.validateAllRules();
  assert.strictEqual(allRulesResult.totalRules, 8, 'Expected exactly 8 interaction rules.');
  assert.strictEqual(allRulesResult.passed, 8, 'All 8 rules should pass for compliant allowed interactions.');
  console.log('  ✔ Passed: All 8 rules validated as compliant for allowed actions.');

  // Test 2: Test prohibited interactions are detected
  console.log('Test 2: Verify prohibited interactions are correctly detected...');
  const prohibitedChecks = [
    { origin: 'Support', target: 'Products', action: 'direct_db_query' },
    { origin: 'Support', target: 'Billing', action: 'issue_invoices' },
    { origin: 'Support', target: 'Identity', action: 'store_user_passwords' },
    { origin: 'Support', target: 'Licensing', action: 'issue_license_keys' },
    { origin: 'Support', target: 'Downloads', action: 'host_binary_files' },
    { origin: 'Support', target: 'Notifications', action: 'configure_raw_smtp' },
    { origin: 'Support', target: 'Operations', action: 'scrape_system_metrics' }
  ];

  for (const check of prohibitedChecks) {
    const res = validator.validateInteraction(check.origin, check.target, check.action);
    assert.strictEqual(res.compliant, false, `Expected prohibited action '${check.action}' to fail.`);
    assert.ok(res.violation && res.violation.includes('prohibited'), `Violation message should state action is prohibited.`);
  }
  console.log('  ✔ Passed: Prohibited interactions were successfully flagged.');

  // Test 3: Test drift pattern detection on a descriptor with violations
  console.log('Test 3: Detect drift patterns from a descriptor...');
  const mockDescriptor = {
    interactions: [
      { origin: 'Support', target: 'Products', action: 'GET /v1/products' }, // Compliant
      { origin: 'Support', target: 'Billing', action: 'process_credit_cards' }, // Prohibited
      { origin: 'Support', target: 'Workspace', action: 'delete_workspaces' } // Prohibited
    ]
  };

  const driftResult = validator.detectDriftPatterns(mockDescriptor);
  assert.strictEqual(driftResult.totalScanned, 3, 'Scanned 3 interactions.');
  assert.strictEqual(driftResult.driftDetected, true, 'Drift should be detected.');
  assert.strictEqual(driftResult.violations.length, 2, 'Should detect exactly 2 violations.');
  console.log('  ✔ Passed: Drift pattern detection properly identified 2 architectural violations.');

  // Test 4: Test BoundedContextGuard correctly identifies violation signatures in sample code strings
  console.log('Test 4: Verify BoundedContextGuard violation signatures detection in sample code...');
  const sampleCode = `
    function processSupportRequest(req) {
      if (req.type === 'billing') {
        const invoice = issueInvoice(req.userId);
        chargeCard(req.cardToken, 100);
      }
      if (req.type === 'admin') {
        createUser(req.username, req.password);
        storePassword(req.userId, req.password);
      }
      return { status: 'ok' };
    }
  `;

  const guardResult = guard.scanContent(sampleCode, 'sample_module.js');
  assert.strictEqual(guardResult.violations.length, 4, 'Should detect 4 violations in sample code.');

  const billingViolations = guardResult.violations.filter(v => v.domain === 'Billing');
  assert.strictEqual(billingViolations.length, 2, 'Should find 2 Billing violations.');

  const identityViolations = guardResult.violations.filter(v => v.domain === 'Identity');
  assert.strictEqual(identityViolations.length, 2, 'Should find 2 Identity violations.');

  console.log('  ✔ Passed: BoundedContextGuard correctly identified all domain violation signatures.');

  console.log('\nAll Bounded Context tests PASSED successfully!\n');
}

if (require.main === module) {
  runBoundedContextTests();
}

module.exports = runBoundedContextTests;
