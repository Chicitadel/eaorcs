'use strict';

const { BillingEngine, PLAN_PRICING } = require('../../engine/commercial/BillingEngine');

async function runBillingTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      passed++;
    } else {
      failed++;
      console.error(`  ❌ Assertion failed: ${message}`);
    }
  }

  const be = new BillingEngine();

  // Test 1: Community plan monthly invoice base = $0
  try {
    be.createSubscription({ tenantId: 'tenant-community', plan: 'Community', billingCycle: 'monthly' });
    const inv = be.generateInvoice('tenant-community');
    assert(inv.subtotal === 0, '1. Community plan base subtotal is $0');
  } catch (err) {
    failed++;
    console.error(`  ❌ Test 1 failed: ${err.message}`);
  }

  // Test 2: Pro plan invoice base = $49
  try {
    be.createSubscription({ tenantId: 'tenant-pro', plan: 'Pro', billingCycle: 'monthly' });
    const inv = be.generateInvoice('tenant-pro');
    assert(inv.subtotal === 49, '2. Pro plan base subtotal is $49');
  } catch (err) {
    failed++;
    console.error(`  ❌ Test 2 failed: ${err.message}`);
  }

  // Test 3: Enterprise plan invoice base = $999 (before tax)
  try {
    be.createSubscription({ tenantId: 'tenant-ent', plan: 'Enterprise', billingCycle: 'monthly' });
    const inv = be.generateInvoice('tenant-ent');
    assert(inv.subtotal === 999, '3. Enterprise plan base subtotal is $999');
  } catch (err) {
    failed++;
    console.error(`  ❌ Test 3 failed: ${err.message}`);
  }

  // Test 4: Proration: upgrade Pro -> Enterprise, change on day 15 of month -> credit ~$24.50, charge ~$499.50
  try {
    const proration = be.calculateProration({
      tenantId: 'tenant-pro',
      fromPlan: 'Pro',
      toPlan: 'Enterprise',
      changeDate: '2026-08-15T00:00:00.000Z'
    });
    assert(Math.abs(proration.credit - 24.50) < 0.1, '4. Proration credit is ~$24.50');
    assert(Math.abs(proration.charge - 499.50) < 0.1, '4. Proration charge is ~$499.50');
  } catch (err) {
    failed++;
    console.error(`  ❌ Test 4 failed: ${err.message}`);
  }

  // Test 5: Annual Pro = $470, monthly Pro = $49 * 12 = $588 -> annual saves $118
  try {
    const annualPro = PLAN_PRICING.Pro.annual;
    const monthlyProTotal = PLAN_PRICING.Pro.monthly * 12;
    const savings = monthlyProTotal - annualPro;
    assert(annualPro === 470 && savings === 118, '5. Annual Pro ($470) saves $118 over 12 months ($588)');
  } catch (err) {
    failed++;
    console.error(`  ❌ Test 5 failed: ${err.message}`);
  }

  // Test 6: Tax: 20% on $999 Enterprise -> invoice.total === 1198.80
  try {
    const inv = be.generateInvoice('tenant-ent');
    assert(inv.tax === 199.80 && inv.total === 1198.80, '6. Tax 20% on $999 yields total of $1198.80');
  } catch (err) {
    failed++;
    console.error(`  ❌ Test 6 failed: ${err.message}`);
  }

  return { passed, failed };
}

module.exports = { runBillingTests };
