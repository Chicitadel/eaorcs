/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS SaaS Multi-Tenancy Engine (Stream G)
 * File           : TenantManager.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Frozen (ADR-001)
 * - Security Reviewed & Compliance Enforced
 * - Multi-Tenant Domain Isolation
 ******************************************************************************/

'use strict';

/**
 * Tenant Isolation Modes
 */
const ISOLATION_MODE = Object.freeze({
    SAAS_SHARED: 'SaaS-Shared',
    HYBRID_ISOLATED: 'Hybrid-Isolated',
    DEDICATED: 'Dedicated',
    SOVEREIGN_AIRGAPPED: 'Sovereign-Airgapped'
});

/**
 * TenantManager
 * Manages Multi-Tenant context, Organization and Repository hierarchy, isolation policies, and usage quotas.
 */
class TenantManager {
    constructor(options = {}) {
        this.tenants = new Map();
        this.organizations = new Map();
        this.repositories = new Map();
        this.activeContextStack = [];
        this.defaultQuota = options.defaultQuota || {
            maxUsers: 10,
            maxRepositories: 5,
            maxScansPerMonth: 500,
            storageMb: 1024,
            maxConcurrentJobs: 2
        };
    }

    // =========================================================================
    // 1. TENANT LIFECYCLE & ISOLATION
    // =========================================================================

    /**
     * Registers a new Tenant.
     * @param {Object} config 
     * @returns {Object} Tenant Record
     */
    registerTenant(config) {
        if (!config || !config.tenantId || typeof config.tenantId !== 'string') {
            throw new Error('Tenant registration requires a valid tenantId string');
        }

        if (this.tenants.has(config.tenantId)) {
            throw new Error(`Tenant [${config.tenantId}] is already registered`);
        }

        const tenant = {
            tenantId: config.tenantId,
            name: config.name || config.tenantId,
            tier: config.tier || 'Community',
            isolationMode: config.isolationMode || ISOLATION_MODE.SAAS_SHARED,
            status: config.status || 'ACTIVE',
            quota: { ...this.defaultQuota, ...(config.quota || {}) },
            usage: {
                currentUsers: 0,
                currentRepositories: 0,
                scansThisMonth: 0,
                storageUsedMb: 0
            },
            settings: config.settings || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.tenants.set(config.tenantId, tenant);
        return tenant;
    }

    /**
     * Gets a Tenant by ID.
     * @param {string} tenantId 
     * @returns {Object} Tenant record
     */
    getTenant(tenantId) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) {
            throw new Error(`Tenant [${tenantId}] not found`);
        }
        return tenant;
    }

    /**
     * Updates tenant configuration or settings.
     * @param {string} tenantId 
     * @param {Object} updates 
     * @returns {Object} Updated tenant record
     */
    updateTenant(tenantId, updates = {}) {
        const tenant = this.getTenant(tenantId);
        if (updates.name) tenant.name = updates.name;
        if (updates.tier) tenant.tier = updates.tier;
        if (updates.isolationMode) tenant.isolationMode = updates.isolationMode;
        if (updates.status) tenant.status = updates.status;
        if (updates.settings) tenant.settings = { ...tenant.settings, ...updates.settings };
        if (updates.quota) tenant.quota = { ...tenant.quota, ...updates.quota };
        tenant.updatedAt = new Date().toISOString();
        return tenant;
    }

    // =========================================================================
    // 2. ORGANIZATION & REPOSITORY HIERARCHY
    // =========================================================================

    /**
     * Creates an Organization within a Tenant.
     * @param {Object} orgConfig 
     * @returns {Object} Organization Record
     */
    createOrganization(orgConfig) {
        if (!orgConfig || !orgConfig.orgId || !orgConfig.tenantId) {
            throw new Error('Organization creation requires orgId and tenantId');
        }

        // Verify tenant exists
        this.getTenant(orgConfig.tenantId);

        if (this.organizations.has(orgConfig.orgId)) {
            throw new Error(`Organization [${orgConfig.orgId}] already exists`);
        }

        const org = {
            orgId: orgConfig.orgId,
            tenantId: orgConfig.tenantId,
            name: orgConfig.name || orgConfig.orgId,
            ownerId: orgConfig.ownerId || 'usr_admin',
            settings: orgConfig.settings || {},
            createdAt: new Date().toISOString()
        };

        this.organizations.set(orgConfig.orgId, org);
        return org;
    }

    /**
     * Gets Organization details.
     * @param {string} orgId 
     * @returns {Object} Organization record
     */
    getOrganization(orgId) {
        const org = this.organizations.get(orgId);
        if (!org) {
            throw new Error(`Organization [${orgId}] not found`);
        }
        return org;
    }

    /**
     * Creates a Repository within an Organization.
     * @param {Object} repoConfig 
     * @returns {Object} Repository Record
     */
    createRepository(repoConfig) {
        if (!repoConfig || !repoConfig.repoId || !repoConfig.orgId) {
            throw new Error('Repository creation requires repoId and orgId');
        }

        const org = this.getOrganization(repoConfig.orgId);

        if (this.repositories.has(repoConfig.repoId)) {
            throw new Error(`Repository [${repoConfig.repoId}] already exists`);
        }

        const repo = {
            repoId: repoConfig.repoId,
            orgId: repoConfig.orgId,
            tenantId: org.tenantId,
            name: repoConfig.name || repoConfig.repoId,
            visibility: repoConfig.visibility || 'PRIVATE',
            settings: repoConfig.settings || {},
            createdAt: new Date().toISOString()
        };

        this.repositories.set(repoConfig.repoId, repo);

        // Increment tenant repository usage
        const tenant = this.getTenant(org.tenantId);
        tenant.usage.currentRepositories += 1;

        return repo;
    }

    /**
     * Returns full hierarchy tree for a Tenant.
     * @param {string} tenantId 
     * @returns {Object} Hierarchy Tree
     */
    getHierarchy(tenantId) {
        const tenant = this.getTenant(tenantId);
        const orgs = Array.from(this.organizations.values()).filter(o => o.tenantId === tenantId);
        
        const orgTree = orgs.map(org => {
            const repos = Array.from(this.repositories.values()).filter(r => r.orgId === org.orgId);
            return {
                ...org,
                repositories: repos
            };
        });

        return {
            tenantId: tenant.tenantId,
            name: tenant.name,
            tier: tenant.tier,
            isolationMode: tenant.isolationMode,
            status: tenant.status,
            quota: tenant.quota,
            usage: tenant.usage,
            organizations: orgTree
        };
    }

    // =========================================================================
    // 3. CONTEXT MANAGEMENT
    // =========================================================================

    /**
     * Sets current active tenant context.
     * @param {string} tenantId 
     */
    pushTenantContext(tenantId) {
        const tenant = this.getTenant(tenantId);
        this.activeContextStack.push(tenant);
        return tenant;
    }

    /**
     * Pops active tenant context.
     */
    popTenantContext() {
        return this.activeContextStack.pop();
    }

    /**
     * Returns active tenant context.
     * @returns {Object|null}
     */
    getTenantContext() {
        if (this.activeContextStack.length === 0) return null;
        return this.activeContextStack[this.activeContextStack.length - 1];
    }

    /**
     * Executes function inside tenant context scope.
     * @param {string} tenantId 
     * @param {Function} fn 
     * @returns {*} result of fn
     */
    runInTenantContext(tenantId, fn) {
        this.pushTenantContext(tenantId);
        try {
            return fn();
        } finally {
            this.popTenantContext();
        }
    }

    // =========================================================================
    // 4. QUOTAS & USAGE VALIDATION
    // =========================================================================

    /**
     * Checks if a tenant usage limit has been exceeded.
     * @param {string} tenantId 
     * @param {string} metric 
     * @param {number} amountToAdd 
     * @returns {Object} { allowed: boolean, reason: string }
     */
    checkQuota(tenantId, metric, amountToAdd = 1) {
        const tenant = this.getTenant(tenantId);
        const limitMap = {
            users: { current: tenant.usage.currentUsers, max: tenant.quota.maxUsers },
            repositories: { current: tenant.usage.currentRepositories, max: tenant.quota.maxRepositories },
            scans: { current: tenant.usage.scansThisMonth, max: tenant.quota.maxScansPerMonth },
            storage: { current: tenant.usage.storageUsedMb, max: tenant.quota.storageMb }
        };

        const check = limitMap[metric];
        if (!check) {
            return { allowed: true, reason: 'Unknown metric, bypass quota check' };
        }

        if (check.max !== -1 && (check.current + amountToAdd) > check.max) {
            return {
                allowed: false,
                reason: `Quota exceeded for [${metric}]: current ${check.current} + ${amountToAdd} exceeds max allowed ${check.max} for tier [${tenant.tier}]`
            };
        }

        return { allowed: true, reason: 'Within quota limits' };
    }

    /**
     * Records usage metric for a tenant.
     * @param {string} tenantId 
     * @param {string} metric 
     * @param {number} delta 
     */
    recordUsage(tenantId, metric, delta = 1) {
        const tenant = this.getTenant(tenantId);
        if (metric === 'scans') tenant.usage.scansThisMonth += delta;
        else if (metric === 'users') tenant.usage.currentUsers += delta;
        else if (metric === 'storage') tenant.usage.storageUsedMb += delta;
        return tenant.usage;
    }
}

module.exports = {
    TenantManager,
    ISOLATION_MODE
};
