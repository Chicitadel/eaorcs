/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : SaaS Product Platform Engine
 * File           : engine/saas/SaaSProductPlatform.js
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

const crypto = require('crypto');

/**
 * Supported SaaS Subscription Tiers
 */
const SUBSCRIPTION_TIERS = Object.freeze({
  COMMERCIAL: 'COMMERCIAL',
  ENTERPRISE: 'ENTERPRISE',
  GOV_CLOUD: 'GOV_CLOUD'
});

/**
 * Tenant Lifecycle Statuses
 */
const TENANT_STATUS = Object.freeze({
  PROVISIONING: 'PROVISIONING',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DEPROVISIONED: 'DEPROVISIONED'
});

/**
 * Isolation Levels
 */
const ISOLATION_LEVEL = Object.freeze({
  SHARED: 'SHARED',
  ISOLATED: 'ISOLATED',
  SOVEREIGN: 'SOVEREIGN'
});

/**
 * Tier Entitlements & Feature Maps
 */
const TIER_ENTITLEMENT_MAP = Object.freeze({
  [SUBSCRIPTION_TIERS.COMMERCIAL]: new Set([
    'saas.basic',
    'audit.standard',
    'dsl.execution',
    'report.export',
    'org.single',
    'api.access.standard'
  ]),

  [SUBSCRIPTION_TIERS.ENTERPRISE]: new Set([
    'saas.basic',
    'audit.standard',
    'audit.advanced',
    'dsl.execution',
    'report.export',
    'org.single',
    'org.hierarchy',
    'rbac.custom',
    'governance.dora_nis2',
    'compliance.iso27001_soc2',
    'ai.council',
    'api.access.priority',
    'tenant.isolation.strict'
  ]),

  [SUBSCRIPTION_TIERS.GOV_CLOUD]: new Set([
    'saas.basic',
    'audit.standard',
    'audit.advanced',
    'dsl.execution',
    'report.export',
    'org.single',
    'org.hierarchy',
    'rbac.custom',
    'governance.dora_nis2',
    'compliance.iso27001_soc2',
    'compliance.fedramp',
    'compliance.stateramp',
    'sovereign.airgap',
    'zero_trust.strict',
    'crypto.fips140_3',
    'ai.council',
    'api.access.unlimited',
    'tenant.isolation.sovereign',
    'unlimited.scale'
  ])
});

/**
 * Quota Limits per Tier
 */
const TIER_QUOTAS = Object.freeze({
  [SUBSCRIPTION_TIERS.COMMERCIAL]: Object.freeze({
    maxOrganizations: 5,
    maxUsers: 50,
    maxStorageGb: 100,
    rateLimitRpm: 1000,
    slaPercent: 99.5
  }),

  [SUBSCRIPTION_TIERS.ENTERPRISE]: Object.freeze({
    maxOrganizations: 50,
    maxUsers: 500,
    maxStorageGb: 2000,
    rateLimitRpm: 10000,
    slaPercent: 99.99
  }),

  [SUBSCRIPTION_TIERS.GOV_CLOUD]: Object.freeze({
    maxOrganizations: -1, // Unlimited
    maxUsers: -1,         // Unlimited
    maxStorageGb: -1,     // Unlimited
    rateLimitRpm: 100000,
    slaPercent: 99.999
  })
});

/**
 * SaaSProductPlatform
 * Enterprise Multi-Tenant SaaS Platform Engine handling Onboarding, Tenant Management,
 * Organization Hierarchy, Tier Subscriptions, Feature Entitlements, and Tenant Isolation.
 */
class SaaSProductPlatform {
  constructor(options = {}) {
    this.options = options;
    this.tenants = new Map();
    this.organizations = new Map();
    this.subscriptions = new Map();
    this.customEntitlements = new Map();
    this.auditLogs = [];
  }

  /**
   * Onboard a new multi-tenant organization.
   * @param {Object} params 
   * @returns {Object} Onboarding Result
   */
  onboardTenant(params = {}) {
    const { name, code, contactEmail, tier = SUBSCRIPTION_TIERS.COMMERCIAL, isolationLevel, adminUser = {} } = params;

    if (!name || typeof name !== 'string') {
      throw new Error('Tenant onboarding failed: "name" is required');
    }
    if (!code || typeof code !== 'string') {
      throw new Error('Tenant onboarding failed: "code" is required');
    }
    if (!contactEmail || typeof contactEmail !== 'string') {
      throw new Error('Tenant onboarding failed: "contactEmail" is required');
    }

    const normalizedCode = code.toLowerCase().trim();

    // Check for code uniqueness across tenants
    for (const tenant of this.tenants.values()) {
      if (tenant.code === normalizedCode) {
        throw new Error(`Tenant onboarding failed: Tenant code "${normalizedCode}" already exists`);
      }
    }

    const validatedTier = SUBSCRIPTION_TIERS[tier] ? tier : SUBSCRIPTION_TIERS.COMMERCIAL;

    // Determine isolation level
    let defaultIsolation = ISOLATION_LEVEL.SHARED;
    if (validatedTier === SUBSCRIPTION_TIERS.ENTERPRISE) {
      defaultIsolation = ISOLATION_LEVEL.ISOLATED;
    } else if (validatedTier === SUBSCRIPTION_TIERS.GOV_CLOUD) {
      defaultIsolation = ISOLATION_LEVEL.SOVEREIGN;
    }
    const finalIsolation = isolationLevel && ISOLATION_LEVEL[isolationLevel] ? isolationLevel : defaultIsolation;

    const tenantId = `tnt_${crypto.randomBytes(6).toString('hex')}`;
    const createdAt = new Date().toISOString();

    const tenantRecord = {
      tenantId,
      name,
      code: normalizedCode,
      contactEmail,
      status: TENANT_STATUS.ACTIVE,
      isolationLevel: finalIsolation,
      tier: validatedTier,
      createdAt,
      updatedAt: createdAt
    };

    this.tenants.set(tenantId, tenantRecord);

    // Provision root organization
    const rootOrgId = `org_${crypto.randomBytes(6).toString('hex')}`;
    const rootOrg = {
      orgId: rootOrgId,
      tenantId,
      name: `${name} Root Organization`,
      code: `${normalizedCode}-root`,
      parentOrgId: null,
      children: [],
      members: [],
      isRoot: true,
      createdAt
    };

    // Add primary admin user if provided
    if (adminUser.userId || adminUser.email) {
      const adminMember = {
        userId: adminUser.userId || `usr_${crypto.randomBytes(4).toString('hex')}`,
        email: adminUser.email || contactEmail,
        name: adminUser.name || 'Primary Admin',
        role: adminUser.role || 'TENANT_ADMIN',
        addedAt: createdAt
      };
      rootOrg.members.push(adminMember);
    }

    this.organizations.set(rootOrgId, rootOrg);

    // Provision Subscription
    const subscriptionId = `sub_${crypto.randomBytes(6).toString('hex')}`;
    const subscriptionRecord = {
      subscriptionId,
      tenantId,
      tier: validatedTier,
      status: 'ACTIVE',
      billingCycle: 'ANNUAL',
      startDate: createdAt,
      renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: createdAt
    };

    this.subscriptions.set(tenantId, subscriptionRecord);

    // Log Audit Event
    this._logAudit(tenantId, 'TENANT_ONBOARDED', {
      tenantId,
      name,
      tier: validatedTier,
      isolationLevel: finalIsolation,
      rootOrgId
    });

    const entitlements = this.getEntitlements(tenantId);
    const quotas = TIER_QUOTAS[validatedTier];

    return {
      success: true,
      tenantId,
      status: TENANT_STATUS.ACTIVE,
      tenant: tenantRecord,
      rootOrganization: rootOrg,
      subscription: subscriptionRecord,
      entitlements,
      quotas
    };
  }

  /**
   * Get Tenant details by tenantId.
   * @param {string} tenantId 
   * @returns {Object} Tenant Record
   */
  getTenant(tenantId) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }
    return tenant;
  }

  /**
   * List tenants with optional filter.
   * @param {Object} filter 
   * @returns {Array<Object>}
   */
  listTenants(filter = {}) {
    let result = Array.from(this.tenants.values());
    if (filter.status) {
      result = result.filter(t => t.status === filter.status);
    }
    if (filter.tier) {
      result = result.filter(t => t.tier === filter.tier);
    }
    return result;
  }

  /**
   * Update tenant status (ACTIVE, SUSPENDED, DEPROVISIONED).
   * @param {string} tenantId 
   * @param {string} newStatus 
   * @param {string} reason 
   */
  updateTenantStatus(tenantId, newStatus, reason = '') {
    const tenant = this.getTenant(tenantId);
    if (!TENANT_STATUS[newStatus]) {
      throw new Error(`Invalid tenant status: ${newStatus}`);
    }

    const previousStatus = tenant.status;
    tenant.status = newStatus;
    tenant.updatedAt = new Date().toISOString();

    // If subscription exists, update subscription status accordingly
    const sub = this.subscriptions.get(tenantId);
    if (sub) {
      if (newStatus === TENANT_STATUS.SUSPENDED) {
        sub.status = 'SUSPENDED';
      } else if (newStatus === TENANT_STATUS.DEPROVISIONED) {
        sub.status = 'CANCELED';
      } else if (newStatus === TENANT_STATUS.ACTIVE) {
        sub.status = 'ACTIVE';
      }
    }

    this._logAudit(tenantId, 'TENANT_STATUS_UPDATED', {
      tenantId,
      previousStatus,
      newStatus,
      reason
    });

    return tenant;
  }

  /**
   * Offboard/deprovision tenant.
   * @param {string} tenantId 
   */
  offboardTenant(tenantId) {
    return this.updateTenantStatus(tenantId, TENANT_STATUS.DEPROVISIONED, 'Tenant offboarded');
  }

  /**
   * Create an Organization under a tenant.
   * @param {string} tenantId 
   * @param {Object} orgData 
   * @returns {Object} Organization Record
   */
  createOrganization(tenantId, orgData = {}) {
    const tenant = this.getTenant(tenantId);
    if (tenant.status !== TENANT_STATUS.ACTIVE) {
      throw new Error(`Cannot create organization: Tenant "${tenantId}" is not ACTIVE`);
    }

    const { name, code, parentOrgId = null, metadata = {} } = orgData;

    if (!name || typeof name !== 'string') {
      throw new Error('Organization creation failed: "name" is required');
    }

    // Check organization quota for tenant tier
    const tenantOrgs = this.getTenantOrganizations(tenantId);
    const quotas = TIER_QUOTAS[tenant.tier];

    if (quotas.maxOrganizations !== -1 && tenantOrgs.length >= quotas.maxOrganizations) {
      throw new Error(`Organization quota exceeded for tenant tier "${tenant.tier}". Max allowed: ${quotas.maxOrganizations}`);
    }

    // Validate parentOrgId if provided
    let parentOrg = null;
    if (parentOrgId) {
      parentOrg = this.organizations.get(parentOrgId);
      if (!parentOrg) {
        throw new Error(`Parent organization not found: ${parentOrgId}`);
      }

      // Enforce strict tenant isolation: parentOrg MUST belong to the same tenant!
      this.assertTenantAccess(tenantId, parentOrg.tenantId);
    }

    const orgId = `org_${crypto.randomBytes(6).toString('hex')}`;
    const createdAt = new Date().toISOString();
    const orgCode = code || `${tenant.code}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const newOrg = {
      orgId,
      tenantId,
      name,
      code: orgCode,
      parentOrgId: parentOrgId || null,
      children: [],
      members: [],
      metadata,
      isRoot: false,
      createdAt
    };

    this.organizations.set(orgId, newOrg);

    if (parentOrg) {
      parentOrg.children.push(orgId);
    }

    this._logAudit(tenantId, 'ORGANIZATION_CREATED', {
      tenantId,
      orgId,
      name,
      parentOrgId
    });

    return newOrg;
  }

  /**
   * Get an Organization by orgId.
   * @param {string} orgId 
   * @returns {Object}
   */
  getOrganization(orgId) {
    const org = this.organizations.get(orgId);
    if (!org) {
      throw new Error(`Organization not found: ${orgId}`);
    }
    return org;
  }

  /**
   * Get all organizations belonging to a tenant.
   * @param {string} tenantId 
   * @returns {Array<Object>}
   */
  getTenantOrganizations(tenantId) {
    this.getTenant(tenantId); // Validates tenant exists
    const orgs = [];
    for (const org of this.organizations.values()) {
      if (org.tenantId === tenantId) {
        orgs.push(org);
      }
    }
    return orgs;
  }

  /**
   * Get organizational hierarchy for a tenant as a tree.
   * @param {string} tenantId 
   * @returns {Object} Hierarchy Tree
   */
  getOrgHierarchy(tenantId) {
    const tenantOrgs = this.getTenantOrganizations(tenantId);
    const orgMap = new Map();

    tenantOrgs.forEach(org => {
      orgMap.set(org.orgId, {
        ...org,
        childrenNodes: []
      });
    });

    const roots = [];
    orgMap.forEach(node => {
      if (node.parentOrgId && orgMap.has(node.parentOrgId)) {
        orgMap.get(node.parentOrgId).childrenNodes.push(node);
      } else {
        roots.push(node);
      }
    });

    return {
      tenantId,
      totalOrganizations: tenantOrgs.length,
      roots
    };
  }

  /**
   * Add member user to organization.
   * @param {string} tenantId 
   * @param {string} orgId 
   * @param {Object} user 
   */
  addMemberToOrg(tenantId, orgId, user = {}) {
    const org = this.getOrganization(orgId);
    this.assertTenantAccess(tenantId, org.tenantId);

    const tenant = this.getTenant(tenantId);
    const quotas = TIER_QUOTAS[tenant.tier];

    // Check overall user count across tenant orgs if bounded
    if (quotas.maxUsers !== -1) {
      const allOrgs = this.getTenantOrganizations(tenantId);
      const uniqueUsers = new Set();
      allOrgs.forEach(o => o.members.forEach(m => uniqueUsers.add(m.userId)));
      if (!uniqueUsers.has(user.userId) && uniqueUsers.size >= quotas.maxUsers) {
        throw new Error(`User quota exceeded for tenant tier "${tenant.tier}". Max allowed: ${quotas.maxUsers}`);
      }
    }

    const member = {
      userId: user.userId || `usr_${crypto.randomBytes(4).toString('hex')}`,
      email: user.email || 'user@example.com',
      name: user.name || 'Org Member',
      role: user.role || 'MEMBER',
      addedAt: new Date().toISOString()
    };

    org.members.push(member);

    this._logAudit(tenantId, 'ORG_MEMBER_ADDED', {
      tenantId,
      orgId,
      userId: member.userId,
      role: member.role
    });

    return member;
  }

  /**
   * Get Active Subscription for a tenant.
   * @param {string} tenantId 
   * @returns {Object}
   */
  getSubscription(tenantId) {
    this.getTenant(tenantId);
    const sub = this.subscriptions.get(tenantId);
    if (!sub) {
      throw new Error(`No active subscription found for tenant: ${tenantId}`);
    }
    return sub;
  }

  /**
   * Upgrade or modify subscription tier.
   * @param {string} tenantId 
   * @param {string} targetTier 
   * @param {Object} options 
   * @returns {Object} Updated Subscription
   */
  upgradeSubscription(tenantId, targetTier, options = {}) {
    const tenant = this.getTenant(tenantId);
    const sub = this.getSubscription(tenantId);

    if (!SUBSCRIPTION_TIERS[targetTier]) {
      throw new Error(`Invalid target subscription tier: ${targetTier}`);
    }

    const previousTier = sub.tier;
    sub.tier = targetTier;
    sub.updatedAt = new Date().toISOString();
    tenant.tier = targetTier;

    // Upgrade isolation level if moving to higher tier
    if (targetTier === SUBSCRIPTION_TIERS.ENTERPRISE && tenant.isolationLevel === ISOLATION_LEVEL.SHARED) {
      tenant.isolationLevel = ISOLATION_LEVEL.ISOLATED;
    } else if (targetTier === SUBSCRIPTION_TIERS.GOV_CLOUD) {
      tenant.isolationLevel = ISOLATION_LEVEL.SOVEREIGN;
    }

    this._logAudit(tenantId, 'SUBSCRIPTION_UPGRADED', {
      tenantId,
      previousTier,
      targetTier,
      newIsolationLevel: tenant.isolationLevel
    });

    return {
      subscription: sub,
      tenant,
      entitlements: this.getEntitlements(tenantId),
      quotas: TIER_QUOTAS[targetTier]
    };
  }

  /**
   * Get feature entitlements for tenant based on tier and custom overrides.
   * @param {string} tenantId 
   * @returns {Array<string>}
   */
  getEntitlements(tenantId) {
    const tenant = this.getTenant(tenantId);
    const baseSet = TIER_ENTITLEMENT_MAP[tenant.tier] || new Set();
    const result = new Set(baseSet);

    // Apply custom entitlement overrides if any
    const custom = this.customEntitlements.get(tenantId);
    if (custom) {
      custom.granted.forEach(f => result.add(f));
      custom.revoked.forEach(f => result.delete(f));
    }

    return Array.from(result);
  }

  /**
   * Verify whether a tenant has entitlement to a specific feature.
   * @param {string} tenantId 
   * @param {string} featureKey 
   * @returns {Object} Verification Result
   */
  verifyEntitlement(tenantId, featureKey) {
    let tenant;
    try {
      tenant = this.getTenant(tenantId);
    } catch (err) {
      return { allowed: false, featureKey, reason: `Tenant not found: ${tenantId}` };
    }

    if (tenant.status !== TENANT_STATUS.ACTIVE) {
      return { allowed: false, featureKey, tier: tenant.tier, reason: `Tenant status is ${tenant.status}` };
    }

    const sub = this.subscriptions.get(tenantId);
    if (!sub || sub.status !== 'ACTIVE') {
      return { allowed: false, featureKey, tier: tenant.tier, reason: `Subscription status is ${sub ? sub.status : 'NONE'}` };
    }

    const entitlements = this.getEntitlements(tenantId);
    const hasFeature = entitlements.includes(featureKey);

    return {
      allowed: hasFeature,
      featureKey,
      tier: tenant.tier,
      isolationLevel: tenant.isolationLevel,
      reason: hasFeature ? 'Entitlement granted' : `Feature "${featureKey}" not entitled under tier "${tenant.tier}"`
    };
  }

  /**
   * Helper check returning boolean.
   * @param {string} tenantId 
   * @param {string} featureKey 
   * @returns {boolean}
   */
  hasEntitlement(tenantId, featureKey) {
    const result = this.verifyEntitlement(tenantId, featureKey);
    return result.allowed;
  }

  /**
   * Verify isolation between two tenants.
   * @param {string} tenantIdA 
   * @param {string} tenantIdB 
   * @returns {Object}
   */
  verifyTenantIsolation(tenantIdA, tenantIdB) {
    const tenantA = this.getTenant(tenantIdA);
    const tenantB = this.getTenant(tenantIdB);

    const isIsolated = tenantIdA !== tenantIdB;
    if (!isIsolated) {
      throw new Error(`Isolation check failed: Provided tenant IDs are identical (${tenantIdA})`);
    }

    return {
      isolated: true,
      tenantIdA,
      tenantIdB,
      isolationLevelA: tenantA.isolationLevel,
      isolationLevelB: tenantB.isolationLevel,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Assert tenant security boundary between requesting tenant and resource tenant.
   * Throws error if cross-tenant violation occurs.
   * @param {string} requestTenantId 
   * @param {string} resourceTenantId 
   */
  assertTenantAccess(requestTenantId, resourceTenantId) {
    if (!requestTenantId || !resourceTenantId || requestTenantId !== resourceTenantId) {
      throw new Error(`SEC_TENANT_VIOLATION: Cross-tenant data access violation detected between requesting tenant "${requestTenantId}" and resource tenant "${resourceTenantId}"`);
    }
    return true;
  }

  /**
   * Audit log recorder.
   * @private
   */
  _logAudit(tenantId, action, details) {
    const entry = {
      auditId: `aud_${crypto.randomBytes(6).toString('hex')}`,
      tenantId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.push(entry);
    return entry;
  }

  /**
   * Retrieve audit logs for a tenant.
   * @param {string} tenantId 
   * @returns {Array<Object>}
   */
  getAuditLogs(tenantId = null) {
    if (!tenantId) return this.auditLogs;
    return this.auditLogs.filter(log => log.tenantId === tenantId);
  }
}

module.exports = {
  SaaSProductPlatform,
  SUBSCRIPTION_TIERS,
  TENANT_STATUS,
  ISOLATION_LEVEL,
  TIER_ENTITLEMENT_MAP,
  TIER_QUOTAS
};
