/******************************************************************************
 * Project        : Universal Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Commercial Productization Stream 1 Validation Test Suite
 * File           : stream1_commercial_productization.test.js
 * Version        : 2026.2.0-LTS
 * Author         : Enterprise Commercialization & Quality Engineering
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | INTERNAL
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2 Type II
 * - OWASP ASVS v4.0
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Quality Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const CommercialPackagingEngine = require('../../engine/productization/CommercialPackagingEngine');
const PartnerEcosystemEngine = require('../../engine/marketplace/PartnerEcosystemEngine');

async function testStream1CommercialProductization() {
  console.log('\n===============================================================');
  console.log('  RUNNING STREAM 1: COMMERCIAL PRODUCTIZATION UNIT TESTS');
  console.log('===============================================================\n');

  // --------------------------------------------------------------------------
  // TEST TASK 1: CommercialPackagingEngine
  // --------------------------------------------------------------------------
  console.log('[TEST 1.1] Initializing CommercialPackagingEngine...');
  const packaging = new CommercialPackagingEngine();
  assert.ok(packaging);

  console.log('[TEST 1.2] Verifying 4 Commercial Editions...');
  const editions = packaging.getCommercialEditions();
  assert.strictEqual(editions.length, 4);
  const editionIds = editions.map(e => e.id);
  assert.ok(editionIds.includes('COMMUNITY'));
  assert.ok(editionIds.includes('PROFESSIONAL'));
  assert.ok(editionIds.includes('ENTERPRISE'));
  assert.ok(editionIds.includes('GOVERNMENT_SOVEREIGN'));
  console.log('  ✓ 4 Commercial Editions verified:', editionIds.join(', '));

  console.log('[TEST 1.3] Verifying 6 Deployment Targets...');
  const targets = packaging.getDeploymentTargets();
  assert.strictEqual(targets.length, 6);
  const targetIds = targets.map(t => t.id);
  assert.ok(targetIds.includes('SAAS'));
  assert.ok(targetIds.includes('SELF_HOSTED'));
  assert.ok(targetIds.includes('AIR_GAPPED'));
  assert.ok(targetIds.includes('KUBERNETES'));
  assert.ok(targetIds.includes('DOCKER_COMPOSE'));
  assert.ok(targetIds.includes('CLOUD_MARKETPLACE'));
  console.log('  ✓ 6 Deployment Targets verified:', targetIds.join(', '));

  console.log('[TEST 1.4] Verifying 5 Licensing Models...');
  const models = packaging.getLicensingModels();
  assert.strictEqual(models.length, 5);
  const modelIds = models.map(m => m.id);
  assert.ok(modelIds.includes('FEATURE_LICENSING'));
  assert.ok(modelIds.includes('SEAT_LICENSING'));
  assert.ok(modelIds.includes('USAGE_LICENSING'));
  assert.ok(modelIds.includes('API_LICENSING'));
  assert.ok(modelIds.includes('OEM_LICENSING'));
  console.log('  ✓ 5 Licensing Models verified:', modelIds.join(', '));

  console.log('[TEST 1.5] Testing Cryptographic License Generator & Verifier...');
  const genResult = packaging.generateLicenseKey({
    edition: 'GOVERNMENT_SOVEREIGN',
    customer: 'Federal Cyber Defense Agency',
    tenantId: 'tenant-fed-001',
    seats: 2500,
    deploymentTarget: 'AIR_GAPPED',
    licensingModel: 'OEM_LICENSING'
  });

  assert.ok(genResult);
  assert.ok(genResult.licenseKey);
  assert.ok(genResult.signature);
  assert.strictEqual(genResult.payload.edition, 'GOVERNMENT_SOVEREIGN');
  assert.strictEqual(genResult.payload.deploymentTarget, 'AIR_GAPPED');

  const verifyRes = packaging.verifyLicenseKey(genResult.licenseKey);
  assert.strictEqual(verifyRes.valid, true);
  assert.strictEqual(verifyRes.edition, 'GOVERNMENT_SOVEREIGN');
  assert.strictEqual(verifyRes.seats, 2500);
  console.log('  ✓ Cryptographic License Key Generated & Verified successfully.');

  console.log('[TEST 1.6] Testing Feature Entitlement Evaluator...');
  const f1 = packaging.evaluateEntitlement(genResult, 'airgap_vault');
  assert.strictEqual(f1.allowed, true);

  const f2 = packaging.evaluateEntitlement('COMMUNITY', 'airgap_vault');
  assert.strictEqual(f2.allowed, false);

  const f3 = packaging.evaluateEntitlement('COMMUNITY', 'core_engine');
  assert.strictEqual(f3.allowed, true);
  console.log('  ✓ Feature Entitlement Evaluator working as expected.');

  console.log('[TEST 1.7] Testing Usage Metering Governor...');
  packaging.recordUsage('tenant-fed-001', 'api_calls', 50);
  packaging.recordUsage('tenant-fed-001', 'api_calls', 100);
  const usage = packaging.getMeteredUsage('tenant-fed-001');
  assert.strictEqual(usage.metrics.api_calls, 150);

  const q1 = packaging.checkQuota('tenant-fed-001', 'api_calls', 200);
  assert.strictEqual(q1.allowed, true);
  assert.strictEqual(q1.remaining, 50);

  const q2 = packaging.checkQuota('tenant-fed-001', 'api_calls', 100);
  assert.strictEqual(q2.allowed, false);
  console.log('  ✓ Usage Metering Governor quota enforcement verified.');

  // --------------------------------------------------------------------------
  // TEST TASK 2: PartnerEcosystemEngine
  // --------------------------------------------------------------------------
  console.log('\n[TEST 2.1] Initializing PartnerEcosystemEngine...');
  const ecosystem = new PartnerEcosystemEngine();
  assert.ok(ecosystem);

  console.log('[TEST 2.2] Verifying 8 Extension Categories...');
  const categories = ecosystem.getExtensionCategories();
  assert.strictEqual(categories.length, 8);
  assert.deepStrictEqual(categories, [
    'Governance Packs',
    'Connectors',
    'AI Skills',
    'Workflow templates',
    'Widgets',
    'Industry packs',
    'Compliance mappings',
    'Report templates'
  ]);
  console.log('  ✓ 8 Extension Categories verified:', categories.join(', '));

  console.log('[TEST 2.3] Testing Partner Registration & Tier Management...');
  const partner = ecosystem.registerPartner({
    name: 'CyberGuard Alliance',
    partnerTier: 'GOLD',
    email: 'contact@cyberguard.com'
  });

  assert.ok(partner);
  assert.ok(partner.partnerId);
  assert.strictEqual(partner.partnerTier, 'GOLD');
  assert.strictEqual(partner.revenueShareRate, 0.80);

  const updatedPartner = ecosystem.updatePartnerTier(partner.partnerId, 'STRATEGIC_OEM');
  assert.strictEqual(updatedPartner.partnerTier, 'STRATEGIC_OEM');
  assert.strictEqual(updatedPartner.revenueShareRate, 0.90);
  console.log('  ✓ Partner Registration and Tier upgrade verified.');

  console.log('[TEST 2.4] Testing Extension Package Certifier across categories...');
  const cert1 = ecosystem.certifyExtensionPackage({
    packageId: 'PKG-AI-SKILL-01',
    name: 'Autonomous Audit Skill',
    category: 'AI Skills'
  });
  assert.strictEqual(cert1.certified, true);
  assert.ok(cert1.certificationToken);

  const certFail = ecosystem.certifyExtensionPackage({
    packageId: 'PKG-INVALID-01',
    name: 'Invalid Category Package',
    category: 'NonExistentCategory'
  });
  assert.strictEqual(certFail.certified, false);
  console.log('  ✓ Extension Certifier automated security & compliance check verified.');

  console.log('[TEST 2.5] Testing Star Rating Registry...');
  ecosystem.submitReview('PKG-AI-SKILL-01', 'user-1', 5, 'Outstanding audit skill!');
  ecosystem.submitReview('PKG-AI-SKILL-01', 'user-2', 4, 'Very good capabilities.');
  const ratingRes = ecosystem.getExtensionRating('PKG-AI-SKILL-01');
  assert.strictEqual(ratingRes.reviewCount, 2);
  assert.strictEqual(ratingRes.averageRating, 4.5);
  assert.ok(ratingRes.bayesianRating > 0);
  console.log('  ✓ Star Rating Registry & Bayesian weighted average verified.');

  console.log('[TEST 2.6] Testing Revenue-Sharing Calculator...');
  const revShare = ecosystem.calculateRevenueShare(1000, 'GOLD');
  assert.strictEqual(revShare.partnerPayout, 800);
  assert.strictEqual(revShare.platformFee, 200);

  const payoutReport = ecosystem.generatePayoutReport(partner.partnerId, [
    { amount: 500, category: 'AI Skills' },
    { amount: 1500, category: 'Governance Packs' }
  ]);
  assert.strictEqual(payoutReport.totalGrossAmount, 2000);
  assert.strictEqual(payoutReport.totalPartnerPayout, 1800); // 90% for STRATEGIC_OEM
  assert.strictEqual(payoutReport.totalPlatformFee, 200);
  console.log('  ✓ Revenue-Sharing Calculator & Payout Report verified.');

  console.log('[TEST 2.7] Testing Extension Lifecycle Manager...');
  const publishedExt = ecosystem.publishExtension({
    packageId: 'PKG-GOV-PACK-01',
    name: 'SOC 2 Governance Pack',
    category: 'Governance Packs',
    publisherId: partner.partnerId,
    version: '2.1.0'
  });
  assert.strictEqual(publishedExt.lifecycleState, 'PUBLISHED');

  const searchRes = ecosystem.searchCatalog({ category: 'Governance Packs' });
  assert.strictEqual(searchRes.length, 1);
  assert.strictEqual(searchRes[0].extensionId, 'PKG-GOV-PACK-01');

  const updatedState = ecosystem.updateExtensionLifecycle('PKG-GOV-PACK-01', 'DEPRECATED', 'Superseded by v3');
  assert.strictEqual(updatedState.lifecycleState, 'DEPRECATED');
  console.log('  ✓ Extension Lifecycle Manager publication & state transitions verified.');

  console.log('\n===============================================================');
  console.log('  🎉 ALL STREAM 1 UNIT TESTS PASSED SUCCESSFULLY!');
  console.log('===============================================================\n');
}

if (require.main === module) {
  testStream1CommercialProductization().catch(err => {
    console.error('❌ STREAM 1 UNIT TESTS FAILED:', err);
    process.exit(1);
  });
}

module.exports = { testStream1CommercialProductization };
