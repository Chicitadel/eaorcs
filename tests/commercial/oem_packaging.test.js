'use strict';

const { LicenseLifecycleManager } = require('../../engine/commercial/LicenseLifecycleManager');
const ProductCommercialization = require('../../engine/commercial/ProductCommercialization');

async function runOemPackagingTest() {
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

  const llm = new LicenseLifecycleManager();
  const pc = new ProductCommercialization();

  // Step 1: Define OEM Config
  const oemConfig = {
    partnerId: 'oem-001',
    brandName: 'AcmeSec Platform',
    logoUrl: 'https://acme.com/logo.png',
    primaryColor: '#ff6600',
    plan: 'Enterprise'
  };
  assert(oemConfig.partnerId === 'oem-001' && oemConfig.brandName === 'AcmeSec Platform', 'Step 1: OEM configuration initialized');

  // Step 2 & 3: Issue and verify license key format
  let license;
  try {
    license = llm.issueLicense({
      tenantId: oemConfig.partnerId,
      plan: oemConfig.plan,
      duration: 365,
      features: []
    });
    assert(license && license.licenseKey.startsWith('EAORCS-'), 'Steps 2 & 3: Issued license key starts with EAORCS-');
  } catch (err) {
    failed++;
    console.error(`  ❌ Steps 2 & 3 failed: ${err.message}`);
  }

  // Step 4: Activate license with partner context
  try {
    const activation = llm.activateLicense(license.licenseKey, {
      brandName: oemConfig.brandName,
      logoUrl: oemConfig.logoUrl
    });
    assert(activation && activation.status === 'ACTIVATED', 'Step 4: License activated with partner branding context');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 4 failed: ${err.message}`);
  }

  // Step 5: Verify feature 'white_label'
  try {
    const check = llm.verifyLicenseForFeature(license.licenseKey, 'white_label');
    assert(check && check.allowed === true, 'Step 5: Feature white_label allowed under license');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 5 failed: ${err.message}`);
  }

  // Step 6: Validate ProductCommercialization pre-flight & license activation
  try {
    const preflight = pc.runPreflightChecks();
    assert(preflight && preflight.overallStatus === 'SUCCESS', 'Step 6a: Preflight checks executed successfully');

    const pcActivation = pc.activateLicense(license.licenseKey, true);
    assert(pcActivation && pcActivation.status === 'ACTIVE' && pcActivation.isAirGapped === true, 'Step 6b: Product Commercialization active in OEM mode');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 6 failed: ${err.message}`);
  }

  return { passed, failed };
}

module.exports = { runOemPackagingTest };
