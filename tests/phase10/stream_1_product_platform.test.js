/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 10 Stream 1 — SaaS Product Platform Test Suite
 * File           : tests/phase10/stream_1_product_platform.test.js
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
const {
  SaaSProductPlatform,
  SUBSCRIPTION_TIERS,
  TENANT_STATUS,
  ISOLATION_LEVEL
} = require('../../engine/saas/SaaSProductPlatform');

async function runStream1TestSuite() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 10: STREAM 1 — SAAS PRODUCT PLATFORM TEST SUITE');
  console.log('================================================================================\n');

  const platform = new SaaSProductPlatform();

  // ---------------------------------------------------------------------------
  // 1. Multi-Tenant Provisioning & Onboarding Verification
  // ---------------------------------------------------------------------------
  console.log('[1/5] Testing Multi-Tenant Provisioning & Onboarding Engine...');

  // 1.1 Commercial Tier Onboarding
  const commRes = platform.onboardTenant({
    name: 'Acme Commercial Corp',
    code: 'acme',
    contactEmail: 'admin@acme.com',
    tier: SUBSCRIPTION_TIERS.COMMERCIAL,
    adminUser: { name: 'Alice Smith', email: 'alice@acme.com' }
  });

  assert.strictEqual(commRes.success, true, 'Onboarding should succeed');
  assert.ok(commRes.tenantId.startsWith('tnt_'), 'Tenant ID should start with tnt_');
  assert.strictEqual(commRes.tenant.code, 'acme', 'Tenant code mismatch');
  assert.strictEqual(commRes.tenant.status, TENANT_STATUS.ACTIVE, 'Tenant status should be ACTIVE');
  assert.strictEqual(commRes.tenant.isolationLevel, ISOLATION_LEVEL.SHARED, 'Commercial isolation should default to SHARED');
  assert.strictEqual(commRes.rootOrganization.isRoot, true, 'Root org flag should be true');
  assert.strictEqual(commRes.rootOrganization.members.length, 1, 'Primary admin should be added');
  assert.strictEqual(commRes.subscription.tier, SUBSCRIPTION_TIERS.COMMERCIAL, 'Subscription tier mismatch');
  console.log(`     ✅ Provisioned Commercial Tenant: ${commRes.tenantId} (${commRes.tenant.name})`);

  // 1.2 Enterprise Tier Onboarding
  const entRes = platform.onboardTenant({
    name: 'Global Logistics Enterprise',
    code: 'glog',
    contactEmail: 'security@glogistics.com',
    tier: SUBSCRIPTION_TIERS.ENTERPRISE,
    adminUser: { name: 'Bob Johnson', email: 'bob@glogistics.com' }
  });

  assert.strictEqual(entRes.tenant.isolationLevel, ISOLATION_LEVEL.ISOLATED, 'Enterprise isolation should default to ISOLATED');
  assert.strictEqual(entRes.subscription.tier, SUBSCRIPTION_TIERS.ENTERPRISE, 'Subscription tier mismatch');
  console.log(`     ✅ Provisioned Enterprise Tenant: ${entRes.tenantId} (${entRes.tenant.name})`);

  // 1.3 GovCloud Tier Onboarding
  const govRes = platform.onboardTenant({
    name: 'Defense Systems Agency',
    code: 'dsa-gov',
    contactEmail: 'secops@dsa.gov',
    tier: SUBSCRIPTION_TIERS.GOV_CLOUD,
    adminUser: { name: 'Commander Ray', email: 'ray@dsa.gov' }
  });

  assert.strictEqual(govRes.tenant.isolationLevel, ISOLATION_LEVEL.SOVEREIGN, 'GovCloud isolation should default to SOVEREIGN');
  assert.strictEqual(govRes.subscription.tier, SUBSCRIPTION_TIERS.GOV_CLOUD, 'Subscription tier mismatch');
  console.log(`     ✅ Provisioned GovCloud Tenant: ${govRes.tenantId} (${govRes.tenant.name})`);

  // 1.4 Test Duplicate Tenant Code Rejection
  assert.throws(() => {
    platform.onboardTenant({
      name: 'Acme Duplicate',
      code: 'acme',
      contactEmail: 'other@acme.com'
    });
  }, /Tenant code "acme" already exists/, 'Duplicate code should throw error');
  console.log('     ✅ Verified Duplicate Tenant Code Rejection');

  // ---------------------------------------------------------------------------
  // 2. Organization Hierarchy & Quota Management Verification
  // ---------------------------------------------------------------------------
  console.log('\n[2/5] Testing Organization Hierarchy & Quota Enforcement...');

  const acmeTenantId = commRes.tenantId;
  const rootOrgId = commRes.rootOrganization.orgId;

  // 2.1 Create Child Organizations
  const engOrg = platform.createOrganization(acmeTenantId, {
    name: 'Engineering Division',
    parentOrgId: rootOrgId
  });
  assert.strictEqual(engOrg.parentOrgId, rootOrgId, 'Parent org ID mismatch');

  const salesOrg = platform.createOrganization(acmeTenantId, {
    name: 'Global Sales',
    parentOrgId: rootOrgId
  });

  const devopsOrg = platform.createOrganization(acmeTenantId, {
    name: 'DevOps & Platform Team',
    parentOrgId: engOrg.orgId
  });
  assert.strictEqual(devopsOrg.parentOrgId, engOrg.orgId, 'Nested parent org ID mismatch');

  // 2.2 Verify Organization Hierarchy Tree
  const hierarchy = platform.getOrgHierarchy(acmeTenantId);
  assert.strictEqual(hierarchy.totalOrganizations, 4, 'Total organizations count mismatch (1 root + 3 children)');
  assert.strictEqual(hierarchy.roots.length, 1, 'Should have exactly 1 root org');
  assert.strictEqual(hierarchy.roots[0].childrenNodes.length, 2, 'Root org should have 2 direct children');
  console.log('     ✅ Verified Multi-Tier Organization Tree Hierarchy');

  // 2.3 Cross-Tenant Parent Org Assignment Prevention
  assert.throws(() => {
    platform.createOrganization(entRes.tenantId, {
      name: 'Illegal Cross Tenant Org',
      parentOrgId: rootOrgId // Root org of ACME!
    });
  }, /SEC_TENANT_VIOLATION/, 'Cross-tenant parent assignment must throw SEC_TENANT_VIOLATION');
  console.log('     ✅ Verified Cross-Tenant Parent Organization Assignment Prevention');

  // 2.4 Quota Limit Enforcement (COMMERCIAL Tier maxOrganizations = 5)
  // Already have 4 orgs for ACME (root, eng, sales, devops). Add 5th org (allowed).
  platform.createOrganization(acmeTenantId, { name: 'Finance & Legal', parentOrgId: rootOrgId });

  // Attempt 6th org creation (should exceed quota)
  assert.throws(() => {
    platform.createOrganization(acmeTenantId, { name: 'Excess Sub-Org', parentOrgId: rootOrgId });
  }, /Organization quota exceeded for tenant tier "COMMERCIAL"/, 'Exceeding maxOrganizations quota must throw error');
  console.log('     ✅ Verified Tier Organization Quota Limits Enforcement');

  // ---------------------------------------------------------------------------
  // 3. Subscription Upgrade & Tier Transition Verification
  // ---------------------------------------------------------------------------
  console.log('\n[3/5] Testing Subscription Upgrades & Tier Transitions...');

  // 3.1 Upgrade ACME from COMMERCIAL to ENTERPRISE
  const upgradeRes = platform.upgradeSubscription(acmeTenantId, SUBSCRIPTION_TIERS.ENTERPRISE);
  assert.strictEqual(upgradeRes.subscription.tier, SUBSCRIPTION_TIERS.ENTERPRISE, 'Upgraded tier should be ENTERPRISE');
  assert.strictEqual(upgradeRes.tenant.tier, SUBSCRIPTION_TIERS.ENTERPRISE, 'Tenant tier should be ENTERPRISE');
  assert.strictEqual(upgradeRes.tenant.isolationLevel, ISOLATION_LEVEL.ISOLATED, 'Isolation level should upgrade to ISOLATED');
  assert.strictEqual(upgradeRes.quotas.maxOrganizations, 50, 'Max organizations should expand to 50');

  // Now create 6th org for ACME after upgrade (should succeed now)
  const orgPostUpgrade = platform.createOrganization(acmeTenantId, { name: 'R&D Innovation Lab', parentOrgId: rootOrgId });
  assert.ok(orgPostUpgrade.orgId, '6th org creation should succeed after subscription upgrade');
  console.log('     ✅ Upgraded Commercial Tenant to Enterprise Tier & Expanded Quotas');

  // 3.2 Upgrade Enterprise Tenant to GovCloud Tier
  const glogTenantId = entRes.tenantId;
  const govUpgrade = platform.upgradeSubscription(glogTenantId, SUBSCRIPTION_TIERS.GOV_CLOUD);
  assert.strictEqual(govUpgrade.subscription.tier, SUBSCRIPTION_TIERS.GOV_CLOUD, 'Upgraded tier should be GOV_CLOUD');
  assert.strictEqual(govUpgrade.tenant.isolationLevel, ISOLATION_LEVEL.SOVEREIGN, 'Isolation level should upgrade to SOVEREIGN');
  assert.strictEqual(govUpgrade.quotas.maxOrganizations, -1, 'GovCloud should offer unlimited organizations');
  console.log('     ✅ Upgraded Enterprise Tenant to Sovereign GovCloud Tier');

  // ---------------------------------------------------------------------------
  // 4. Feature Entitlement Enforcement Verification
  // ---------------------------------------------------------------------------
  console.log('\n[4/5] Testing Feature Entitlement Enforcement...');

  const freshCommTenant = platform.onboardTenant({
    name: 'Standard Startup LLC',
    code: 'startllc',
    contactEmail: 'info@startup.io',
    tier: SUBSCRIPTION_TIERS.COMMERCIAL
  });
  const startId = freshCommTenant.tenantId;

  // 4.1 Entitlements for Commercial Tier
  assert.strictEqual(platform.hasEntitlement(startId, 'saas.basic'), true, 'Commercial should have saas.basic');
  assert.strictEqual(platform.hasEntitlement(startId, 'audit.standard'), true, 'Commercial should have audit.standard');
  assert.strictEqual(platform.hasEntitlement(startId, 'compliance.fedramp'), false, 'Commercial must NOT have compliance.fedramp');
  assert.strictEqual(platform.hasEntitlement(startId, 'sovereign.airgap'), false, 'Commercial must NOT have sovereign.airgap');

  // 4.2 Entitlements for Enterprise Tier
  assert.strictEqual(platform.hasEntitlement(acmeTenantId, 'ai.council'), true, 'Enterprise should have ai.council');
  assert.strictEqual(platform.hasEntitlement(acmeTenantId, 'governance.dora_nis2'), true, 'Enterprise should have governance.dora_nis2');
  assert.strictEqual(platform.hasEntitlement(acmeTenantId, 'compliance.fedramp'), false, 'Enterprise must NOT have compliance.fedramp');

  // 4.3 Entitlements for GovCloud Tier
  const dodTenantId = govRes.tenantId;
  assert.strictEqual(platform.hasEntitlement(dodTenantId, 'compliance.fedramp'), true, 'GovCloud must have compliance.fedramp');
  assert.strictEqual(platform.hasEntitlement(dodTenantId, 'sovereign.airgap'), true, 'GovCloud must have sovereign.airgap');
  assert.strictEqual(platform.hasEntitlement(dodTenantId, 'crypto.fips140_3'), true, 'GovCloud must have crypto.fips140_3');

  // 4.4 Entitlement Enforcement on Suspended Tenant
  platform.updateTenantStatus(startId, TENANT_STATUS.SUSPENDED, 'Payment delinquency');
  const suspendedCheck = platform.verifyEntitlement(startId, 'saas.basic');
  assert.strictEqual(suspendedCheck.allowed, false, 'Suspended tenant should be denied entitlement access');
  assert.strictEqual(suspendedCheck.reason, 'Tenant status is SUSPENDED', 'Reason should cite SUSPENDED status');
  console.log('     ✅ Verified Feature Entitlements Across Tiers & Suspended Tenant Enforcement');

  // ---------------------------------------------------------------------------
  // 5. Tenant Isolation & Security Boundary Verification
  // ---------------------------------------------------------------------------
  console.log('\n[5/5] Testing Tenant Isolation & Cross-Tenant Security Boundaries...');

  // 5.1 Verification of Tenant Isolation
  const isoCheck = platform.verifyTenantIsolation(acmeTenantId, dodTenantId);
  assert.strictEqual(isoCheck.isolated, true, 'Tenants must be strictly isolated');
  assert.strictEqual(isoCheck.isolationLevelA, ISOLATION_LEVEL.ISOLATED, 'ACME isolation level mismatch');
  assert.strictEqual(isoCheck.isolationLevelB, ISOLATION_LEVEL.SOVEREIGN, 'DoD isolation level mismatch');

  // 5.2 Self-Isolation assertion failure check
  assert.throws(() => {
    platform.verifyTenantIsolation(acmeTenantId, acmeTenantId);
  }, /Isolation check failed/, 'Same tenant isolation check should throw error');

  // 5.3 Assertion of Tenant Access Boundary
  assert.strictEqual(platform.assertTenantAccess(acmeTenantId, acmeTenantId), true, 'Same tenant access should pass');

  assert.throws(() => {
    platform.assertTenantAccess(acmeTenantId, dodTenantId);
  }, /SEC_TENANT_VIOLATION: Cross-tenant data access violation detected/, 'Cross-tenant access must throw SEC_TENANT_VIOLATION');
  console.log('     ✅ Verified Cross-Tenant Isolation & Zero-Trust Access Boundaries');

  // 5.4 Audit Log Governance Verification
  const acmeLogs = platform.getAuditLogs(acmeTenantId);
  assert.ok(acmeLogs.length >= 4, 'Audit logs for ACME should record onboarding, org creation, upgrade, etc.');
  console.log('     ✅ Verified Complete Governance Audit Logging Trail');

  console.log('\n================================================================================');
  console.log('🎉 STREAM 1 (SAAS PRODUCT PLATFORM): ALL TEST SUITES PASSED CLEANLY (100%).');
  console.log('================================================================================\n');
}

if (require.main === module) {
  runStream1TestSuite().catch(err => {
    console.error('❌ Stream 1 Test Failed:', err);
    process.exit(1);
  });
}

module.exports = { runStream1TestSuite };
