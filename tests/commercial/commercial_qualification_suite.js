'use strict';
const fs = require('fs');
const path = require('path');
const { runSubscriptionLifecycle } = require('./subscription_lifecycle.test');
const { runBillingTests } = require('./billing_engine.test');
const { runMarketplacePurchase } = require('./marketplace_purchase.test');
const { runOemPackagingTest } = require('./oem_packaging.test');
const { runPartnerApiTest } = require('./partner_api.test');

async function main() {
  console.log('================================================================');
  console.log('  EAORCS COMMERCIAL QUALIFICATION SUITE');
  console.log('================================================================\n');

  const suites = [
    { name: 'Subscription Lifecycle', fn: runSubscriptionLifecycle },
    { name: 'Billing Engine Calculations', fn: runBillingTests },
    { name: 'Marketplace Purchase Flow', fn: runMarketplacePurchase },
    { name: 'OEM Packaging & White-Label', fn: runOemPackagingTest },
    { name: 'Partner API & Webhooks', fn: runPartnerApiTest },
  ];

  const results = [];
  let totalPassed = 0, totalFailed = 0;
  for (const suite of suites) {
    console.log(`\n=== ${suite.name} ===`);
    try {
      const r = await suite.fn();
      totalPassed += r.passed; totalFailed += r.failed;
      const status = r.failed === 0 ? '✅ PASS' : '⚠️  PARTIAL';
      console.log(`  ${status} — ${r.passed}/${r.passed+r.failed} steps`);
      results.push({ name: suite.name, ...r, pass: r.failed === 0 });
    } catch(e) {
      console.error(`  ❌ ERROR: ${e.message}`);
      results.push({ name: suite.name, passed: 0, failed: 1, pass: false });
      totalFailed++;
    }
  }

  const docsDir = path.resolve(__dirname, '../../docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  const report = `# EAORCS Commercial Qualification Report\n\nGenerated: ${new Date().toISOString()}\n\n## Results\n\n| Suite | Passed | Failed | Status |\n|-------|--------|--------|--------|\n${results.map(r=>`| ${r.name} | ${r.passed} | ${r.failed||0} | ${r.pass?'✅':'⚠️'} |`).join('\n')}\n\n## Summary\n\nTotal: ${totalPassed} passed, ${totalFailed} failed.\n`;
  fs.writeFileSync(path.join(docsDir, 'commercial_qualification_report.md'), report, 'utf8');

  console.log('\n================================================================');
  console.log(`  COMMERCIAL QUALIFICATION: ${totalPassed} PASS / ${totalFailed} FAIL`);
  console.log(`  REPORT: docs/commercial_qualification_report.md`);
  console.log('================================================================\n');
  if (totalFailed > 0) process.exit(1);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
