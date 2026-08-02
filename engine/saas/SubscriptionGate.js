/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Subscription Gate & License Tier Engine (Stream G)
 * File           : SubscriptionGate.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Frozen (ADR-001)
 * - Subscription & Monetization Control Enforced
 ******************************************************************************/

'use strict';

const { LICENSE_TIER } = require('../contract/ProductBoundaryContract');

/**
 * Feature matrix mapped per license tier.
 */
const TIER_FEATURE_MAP = Object.freeze({
    [LICENSE_TIER.COMMUNITY]: new Set([
        'audit.basic',
        'dsl.execution',
        'report.standard',
        'cli.local'
    ]),

    [LICENSE_TIER.PRO]: new Set([
        'audit.basic',
        'audit.advanced',
        'dsl.execution',
        'report.standard',
        'report.export',
        'cli.local',
        'ai.council',
        'custom.rules',
        'plugin.basic'
    ]),

    [LICENSE_TIER.BUSINESS]: new Set([
        'audit.basic',
        'audit.advanced',
        'dsl.execution',
        'report.standard',
        'report.export',
        'cli.local',
        'ai.council',
        'custom.rules',
        'plugin.basic',
        'plugin.marketplace',
        'saas.multitenancy',
        'rbac.enterprise',
        'realtime.assurance',
        'policy.dora_nis2',
        'policy.iso27001_soc2'
    ]),

    [LICENSE_TIER.ENTERPRISE]: new Set([
        'audit.basic',
        'audit.advanced',
        'dsl.execution',
        'report.standard',
        'report.export',
        'cli.local',
        'ai.council',
        'custom.rules',
        'plugin.basic',
        'plugin.marketplace',
        'saas.multitenancy',
        'rbac.enterprise',
        'realtime.assurance',
        'policy.dora_nis2',
        'policy.iso27001_soc2',
        'policy.eu_ai_act',
        'policy.custom_packs',
        'saml.sso',
        'hsm.signing',
        'unlimited.quotas'
    ]),

    [LICENSE_TIER.SOVEREIGN]: new Set([
        'audit.basic',
        'audit.advanced',
        'dsl.execution',
        'report.standard',
        'report.export',
        'cli.local',
        'ai.council',
        'custom.rules',
        'plugin.basic',
        'plugin.marketplace',
        'saas.multitenancy',
        'rbac.enterprise',
        'realtime.assurance',
        'policy.dora_nis2',
        'policy.iso27001_soc2',
        'policy.eu_ai_act',
        'policy.custom_packs',
        'saml.sso',
        'hsm.signing',
        'unlimited.quotas',
        'airgapped.deployment',
        'sovereign.cryptography',
        'zero.external.telemetry',
        'dedicated.isolation'
    ])
});

/**
 * Resource limits per license tier.
 */
const TIER_LIMIT_MAP = Object.freeze({
    [LICENSE_TIER.COMMUNITY]: {
        maxOrganizations: 1,
        maxRepositories: 5,
        maxUsers: 5,
        maxScansPerMonth: 100,
        maxConcurrentJobs: 1,
        retentionDays: 30
    },
    [LICENSE_TIER.PRO]: {
        maxOrganizations: 3,
        maxRepositories: 25,
        maxUsers: 25,
        maxScansPerMonth: 1000,
        maxConcurrentJobs: 3,
        retentionDays: 90
    },
    [LICENSE_TIER.BUSINESS]: {
        maxOrganizations: 10,
        maxRepositories: 100,
        maxUsers: 100,
        maxScansPerMonth: 10000,
        maxConcurrentJobs: 10,
        retentionDays: 365
    },
    [LICENSE_TIER.ENTERPRISE]: {
        maxOrganizations: -1, // Unlimited
        maxRepositories: -1,
        maxUsers: -1,
        maxScansPerMonth: 100000,
        maxConcurrentJobs: 50,
        retentionDays: 2555 // 7 Years
    },
    [LICENSE_TIER.SOVEREIGN]: {
        maxOrganizations: -1,
        maxRepositories: -1,
        maxUsers: -1,
        maxScansPerMonth: -1,
        maxConcurrentJobs: -1,
        retentionDays: -1 // Unlimited / Perpetual
    }
});

/**
 * SubscriptionGate
 * Gatekeeper enforcing license tier feature entitlement and usage boundaries.
 */
class SubscriptionGate {
    constructor() {
        this.tiers = LICENSE_TIER;
    }

    /**
     * Resolves tier string from a string or tenant object.
     * @param {string|Object} tenantOrTier 
     * @returns {string} Tier identifier
     */
    resolveTier(tenantOrTier) {
        if (!tenantOrTier) return LICENSE_TIER.COMMUNITY;
        if (typeof tenantOrTier === 'string') return tenantOrTier;
        if (tenantOrTier.tier) return tenantOrTier.tier;
        return LICENSE_TIER.COMMUNITY;
    }

    /**
     * Checks if a feature key is allowed for a given tier.
     * @param {string|Object} tenantOrTier 
     * @param {string} featureKey 
     * @returns {boolean}
     */
    isFeatureAllowed(tenantOrTier, featureKey) {
        const tier = this.resolveTier(tenantOrTier);
        const features = TIER_FEATURE_MAP[tier];
        if (!features) return false;
        const normalizedKey = (featureKey || '').replace(/_/g, '.');
        return features.has(featureKey) || features.has(normalizedKey) || features.has('unlimited.quotas');
    }

    /**
     * Asserts that a feature is enabled for a tier; throws error if disallowed.
     * @param {string|Object} tenantOrTier 
     * @param {string} featureKey 
     */
    assertFeature(tenantOrTier, featureKey) {
        const tier = this.resolveTier(tenantOrTier);
        if (!this.isFeatureAllowed(tier, featureKey)) {
            throw new Error(`Feature [${featureKey}] is not available in license tier [${tier}]. Upgrade to Enterprise or Sovereign tier.`);
        }
    }

    /**
     * Gets limits for a given license tier.
     * @param {string|Object} tenantOrTier 
     * @returns {Object} Tier limits
     */
    getTierLimits(tenantOrTier) {
        const tier = this.resolveTier(tenantOrTier);
        return TIER_LIMIT_MAP[tier] || TIER_LIMIT_MAP[LICENSE_TIER.COMMUNITY];
    }

    /**
     * Checks whether usage is within tier limit.
     * @param {string|Object} tenantOrTier 
     * @param {string} limitKey e.g. 'maxScansPerMonth', 'maxUsers', 'maxRepositories'
     * @param {number} currentUsage 
     * @returns {Object} { allowed: boolean, max: number, current: number, reason: string }
     */
    checkUsageLimit(tenantOrTier, limitKey, currentUsage) {
        const limits = this.getTierLimits(tenantOrTier);
        const max = limits[limitKey];
        
        if (max === undefined) {
            return { allowed: true, max: -1, current: currentUsage, reason: 'Limit key not defined' };
        }

        if (max !== -1 && currentUsage >= max) {
            return {
                allowed: false,
                max,
                current: currentUsage,
                reason: `Limit [${limitKey}] reached: ${currentUsage}/${max} on tier [${this.resolveTier(tenantOrTier)}]`
            };
        }

        return {
            allowed: true,
            max,
            current: currentUsage,
            reason: `Usage ${currentUsage}/${max === -1 ? 'Unlimited' : max} within tier limits`
        };
    }

    /**
     * Gets set of all available features for a tier.
     * @param {string|Object} tenantOrTier 
     * @returns {Array<string>} Array of feature keys
     */
    getAvailableFeatures(tenantOrTier) {
        const tier = this.resolveTier(tenantOrTier);
        const features = TIER_FEATURE_MAP[tier];
        return features ? Array.from(features) : [];
    }

    /**
     * Checks if upgrading from current tier to target tier is valid.
     * @param {string} currentTier 
     * @param {string} targetTier 
     * @returns {boolean}
     */
    canUpgradeTo(currentTier, targetTier) {
        const order = [LICENSE_TIER.COMMUNITY, LICENSE_TIER.PRO, LICENSE_TIER.BUSINESS, LICENSE_TIER.ENTERPRISE, LICENSE_TIER.SOVEREIGN];
        const curIdx = order.indexOf(currentTier);
        const tgtIdx = order.indexOf(targetTier);
        return tgtIdx > curIdx;
    }
}

module.exports = {
    SubscriptionGate,
    TIER_FEATURE_MAP,
    TIER_LIMIT_MAP
};
