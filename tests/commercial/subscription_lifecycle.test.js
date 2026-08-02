'use strict';

const { BillingEngine } = require('../../engine/commercial/BillingEngine');

async function runSubscriptionLifecycle() {
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

  // Step 1: Create subscription
  try {
    const sub = be.createSubscription({
      tenantId: 'lifecycle-001',
      plan: 'Community',
      billingCycle: 'monthly',
      startDate: new Date().toISOString()
    });
    assert(sub && !!sub.subscriptionId, 'Step 1: Subscription created with ID');
    assert(sub && sub.status === 'ACTIVE', 'Step 1: Subscription status is ACTIVE');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 1 failed: ${err.message}`);
  }

  // Step 2: Upgrade plan
  try {
    const upgraded = be.upgradePlan('lifecycle-001', 'Enterprise');
    assert(upgraded && upgraded.newPlan === 'Enterprise', 'Step 2: Plan upgraded to Enterprise');
    assert(upgraded && typeof upgraded.proration.netAmount === 'number', 'Step 2: Proration netAmount is a number');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 2 failed: ${err.message}`);
  }

  // Step 3: Generate invoice
  try {
    const invoice = be.generateInvoice('lifecycle-001', { start: '2026-08-01', end: '2026-09-01' });
    assert(invoice && !!invoice.invoiceId, 'Step 3: Invoice generated with ID');
    assert(invoice && invoice.total >= 0, 'Step 3: Invoice total >= 0');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 3 failed: ${err.message}`);
  }

  // Step 4: Cancel subscription
  try {
    const cancelled = be.cancelSubscription('lifecycle-001', 'user_requested');
    assert(cancelled && cancelled.status === 'CANCELLATION_SCHEDULED', 'Step 4: Status is CANCELLATION_SCHEDULED');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 4 failed: ${err.message}`);
  }

  // Step 5: Reactivate subscription
  try {
    const reactivated = be.reactivateSubscription('lifecycle-001');
    assert(reactivated && reactivated.status === 'ACTIVE', 'Step 5: Status is reactivated to ACTIVE');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 5 failed: ${err.message}`);
  }

  // Step 6: Record usage and detect overage
  try {
    be.recordUsage('lifecycle-001', 'scans', 6000);
    const overage = be.detectOverage('lifecycle-001', 'scans');
    assert(overage && typeof overage.overage === 'number' && overage.overage >= 0, 'Step 6: Overage calculated correctly');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 6 failed: ${err.message}`);
  }

  return { passed, failed };
}

module.exports = { runSubscriptionLifecycle };
