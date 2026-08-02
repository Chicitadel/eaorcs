/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : PEP Stream E — Commercial & Operational Product Readiness Test Suite
 * File           : tests/pep/stream_e_product_readiness.test.js
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
const ProductReadinessEngine = require('../../engine/commercial/ProductReadinessEngine');

async function runStreamEProductReadinessTests() {
  console.log('================================================================================');
  console.log('  EAORCS PEP STREAM E — COMMERCIAL & OPERATIONAL PRODUCT READINESS SUITE');
  console.log('================================================================================\n');

  const engine = new ProductReadinessEngine({
    signingSecret: 'TEST_SUITE_COMMERCIAL_READINESS_SECRET_2026'
  });

  // ---------------------------------------------------------------------------
  // 1. Edition Feature Entitlement Tests
  // ---------------------------------------------------------------------------
  console.log('[1/4] Testing Edition Packaging & Feature Entitlements...');

  const communityPkg = engine.packageEditions('COMMUNITY');
  assert.strictEqual(communityPkg.success, true);
  assert.strictEqual(communityPkg.manifest.edition, 'COMMUNITY');
  assert.strictEqual(communityPkg.manifest.limits.includedUsers, 10);
  assert.strictEqual(communityPkg.manifest.pricingSummary.monthlyBasePriceUSD, 0);
  assert.ok(communityPkg.packageHash);
  assert.ok(communityPkg.signature);

  const commercialPkg = engine.packageEditions('COMMERCIAL');
  assert.strictEqual(commercialPkg.manifest.edition, 'COMMERCIAL');
  assert.ok(commercialPkg.manifest.features.includes('CI_CD_INTEGRATIONS'));
  assert.ok(commercialPkg.manifest.complianceStandards.includes('ISO_27001'));

  const enterprisePkg = engine.packageEditions('ENTERPRISE');
  assert.strictEqual(enterprisePkg.manifest.edition, 'ENTERPRISE');
  assert.ok(enterprisePkg.manifest.features.includes('AIR_GAPPED_DEPLOYMENT'));
  assert.ok(enterprisePkg.manifest.features.includes('OSAP_PASSPORT_ISSUANCE'));
  assert.strictEqual(enterprisePkg.manifest.security.airGappedSupport, true);

  const govCloudPkg = engine.packageEditions('GOV_CLOUD');
  assert.strictEqual(govCloudPkg.manifest.edition, 'GOV_CLOUD');
  assert.ok(govCloudPkg.manifest.features.includes('FIPS_140_3_CRYPTOGRAPHY'));
  assert.ok(govCloudPkg.manifest.complianceStandards.includes('FEDRAMP_HIGH'));
  assert.strictEqual(govCloudPkg.manifest.security.fipsModeRequired, true);

  // Test entitlement checks
  assert.strictEqual(engine.checkEntitlement('COMMUNITY', 'BASIC_SECURITY_SCANNING'), true);
  assert.strictEqual(engine.checkEntitlement('COMMUNITY', 'AIR_GAPPED_DEPLOYMENT'), false);
  assert.strictEqual(engine.checkEntitlement('ENTERPRISE', 'AIR_GAPPED_DEPLOYMENT'), true);
  assert.strictEqual(engine.checkEntitlement('GOV_CLOUD', 'FIPS_140_3_CRYPTOGRAPHY'), true);

  console.log('      ✓ Packaging and entitlement matrix verified across all 4 editions (COMMUNITY, COMMERCIAL, ENTERPRISE, GOV_CLOUD)');

  // ---------------------------------------------------------------------------
  // 2. Trial License Issuing Tests
  // ---------------------------------------------------------------------------
  console.log('\n[2/4] Testing Trial License Issuing & Cryptographic Verification...');

  const customerInfo = {
    organizationName: 'Acme Cyber Systems',
    email: 'secops@acmecyber.com',
    department: 'Global Information Security'
  };

  const trialResult = engine.generateTrialLicense(customerInfo, {
    edition: 'ENTERPRISE',
    durationDays: 30,
    maxUsers: 100
  });

  assert.strictEqual(trialResult.success, true);
  assert.ok(trialResult.licenseId.startsWith('TRIAL-ENTERPRISE-'));
  assert.ok(trialResult.license.licenseToken);
  assert.ok(trialResult.license.signature);

  // Verify valid trial license
  const verification = engine.verifyTrialLicense(trialResult.license);
  assert.strictEqual(verification.valid, true);
  assert.strictEqual(verification.expired, false);
  assert.strictEqual(verification.daysRemaining, 30);
  assert.strictEqual(verification.payload.grantee.organizationName, 'Acme Cyber Systems');

  // Verify expiration logic
  const futureDate = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000);
  const expiredVerification = engine.verifyTrialLicense(trialResult.license, futureDate);
  assert.strictEqual(expiredVerification.valid, false);
  assert.strictEqual(expiredVerification.expired, true);
  assert.strictEqual(expiredVerification.reason, 'LICENSE_EXPIRED');

  // Verify signature rejection on tamper
  const tamperedLicense = JSON.parse(JSON.stringify(trialResult.license));
  tamperedLicense.payload.quotas.maxUsers = 999999;
  const tamperedVerification = engine.verifyTrialLicense(tamperedLicense);
  assert.strictEqual(tamperedVerification.valid, false);
  assert.strictEqual(tamperedVerification.reason, 'INVALID_SIGNATURE');

  console.log('      ✓ Evaluation trial license issuance, token encoding, HMAC verification, and expiration controls verified');

  // ---------------------------------------------------------------------------
  // 3. RFP Procurement Due Diligence Pack Compiler Tests
  // ---------------------------------------------------------------------------
  console.log('\n[3/4] Testing RFP Procurement Due Diligence Pack Compiler...');

  const rfpRequest = {
    clientName: 'US Federal Defense Logistics Agency',
    rfpId: 'DLA-RFP-2026-9941',
    edition: 'GOV_CLOUD',
    userCount: 2000,
    repoCount: 1500,
    billingCycle: 'ANNUAL'
  };

  const rfpBundle = engine.compileRfpPackage(rfpRequest);
  assert.strictEqual(rfpBundle.success, true);
  assert.strictEqual(rfpBundle.packageId, 'DUE-DILIGENCE-DLA-RFP-2026-9941');
  assert.ok(rfpBundle.checksum);
  assert.ok(rfpBundle.signature);

  const pack = rfpBundle.rfpPackage;
  assert.strictEqual(pack.compiledFor, 'US Federal Defense Logistics Agency');
  assert.strictEqual(pack.complianceFrameworks.soc2TypeII.certified, true);
  assert.strictEqual(pack.complianceFrameworks.iso27001.certified, true);
  assert.strictEqual(pack.complianceFrameworks.fedRampHigh.status, 'FEDRAMP_HIGH_AUTHORIZED');
  assert.strictEqual(pack.securityArchitecture.zeroTrustArchitecture, 'ENFORCED');
  assert.strictEqual(pack.securityArchitecture.fips140_3Mode, true);
  assert.strictEqual(pack.supplyChainIntegrity.slsaLevel, 'SLSA Level 4 Hermetic Build Provenance');
  assert.strictEqual(pack.slaAndSupport.rpoHours, 0.25);
  assert.strictEqual(pack.slaAndSupport.rtoHours, 1.0);

  console.log('      ✓ RFP Procurement Due Diligence Package compiled with complete compliance & governance controls');

  // ---------------------------------------------------------------------------
  // 4. Pricing Calculator Tests
  // ---------------------------------------------------------------------------
  console.log('\n[4/4] Testing Pricing Calculator across editions and scale options...');

  // Community Edition pricing test
  const communityQuote = engine.calculatePricing({ edition: 'COMMUNITY' });
  assert.strictEqual(communityQuote.pricingBreakdownUSD.effectiveMonthlyCost, 0);
  assert.strictEqual(communityQuote.pricingBreakdownUSD.totalAnnualCost, 0);

  // Commercial Edition with extra scale
  const commercialQuote = engine.calculatePricing({
    edition: 'COMMERCIAL',
    billingCycle: 'MONTHLY',
    users: 100, // 50 extra users @ $12/mo = $600
    repos: 100  // 50 extra repos @ $15/mo = $750
  });

  assert.strictEqual(commercialQuote.scale.extraUsers, 50);
  assert.strictEqual(commercialQuote.scale.extraRepos, 50);
  assert.strictEqual(commercialQuote.pricingBreakdownUSD.baseMonthlyFee, 499);
  assert.strictEqual(commercialQuote.pricingBreakdownUSD.extraUserMonthlyFee, 600);
  assert.strictEqual(commercialQuote.pricingBreakdownUSD.extraRepoMonthlyFee, 750);
  assert.strictEqual(commercialQuote.pricingBreakdownUSD.effectiveMonthlyCost, 499 + 600 + 750);

  // Enterprise Edition with Annual Discount & Add-ons
  const enterpriseQuote = engine.calculatePricing({
    edition: 'ENTERPRISE',
    billingCycle: 'ANNUAL',
    users: 500,
    repos: 500,
    addOns: {
      dedicatedTam: true,
      premiumSla: true
    }
  });

  assert.strictEqual(enterpriseQuote.billingCycle, 'ANNUAL');
  assert.strictEqual(enterpriseQuote.pricingBreakdownUSD.totalAddOnsMonthly, 3200); // TAM ($2000) + Premium SLA ($1200)
  assert.ok(enterpriseQuote.pricingBreakdownUSD.totalAnnualCost > 0);
  assert.ok(enterpriseQuote.quoteValidUntil);

  console.log('      ✓ Pricing calculator verified across free, monthly, annual, scaled usage, and add-on scenarios');

  console.log('\n================================================================================');
  console.log('  🎉 PEP STREAM E PRODUCT READINESS SUITE: PASSED 100% CLEANLY');
  console.log('================================================================================\n');
}

runStreamEProductReadinessTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
