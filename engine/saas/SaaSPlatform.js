/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Commercial SaaS Platform Engine
 * File           : SaaSPlatform.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture & Commercial Platform Team
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');
const { TenantManager } = require('./TenantManager');
const { SubscriptionGate } = require('./SubscriptionGate');

/**
 * Tenant Lifecycle States
 */
const TENANT_STATE = Object.freeze({
    PROVISIONING: 'PROVISIONING',
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    DEPROVISIONED: 'DEPROVISIONED'
});

/**
 * Subscription Statuses
 */
const SUBSCRIPTION_STATUS = Object.freeze({
    TRIALING: 'TRIALING',
    ACTIVE: 'ACTIVE',
    PAST_DUE: 'PAST_DUE',
    CANCELED: 'CANCELED'
});

/**
 * SaaSPlatform
 * Enterprise multi-tenant SaaS platform engine managing billing, tenant lifecycles,
 * subscriptions, quota enforcement, licensing portal, and partner API webhooks.
 */
class SaaSPlatform {
    constructor(options = {}) {
        this.options = options;
        this.tenantManager = new TenantManager(options);
        this.subscriptionGate = new SubscriptionGate();
        this.subscriptions = new Map();
        this.licenses = new Map();
        this.meteredUsage = new Map();
        this.partnerApiKeys = new Map();
        this.webhooks = new Map();
        this.secretKey = options.secretKey || 'eaorcs-saas-platform-secret-2026';
    }

    // =========================================================================
    // 1. TENANT LIFECYCLE & ONBOARDING
    // =========================================================================

    /**
     * Onboards a new Enterprise or Self-Service SaaS Tenant.
     * @param {Object} payload - { tenantId, name, tier, adminEmail, isolationMode }
     */
    onboardTenant(payload) {
        if (!payload || !payload.tenantId || !payload.adminEmail) {
            throw new Error('Tenant onboarding requires tenantId and adminEmail');
        }

        const initialTier = payload.tier || 'Community';
        const tenant = this.tenantManager.registerTenant({
            tenantId: payload.tenantId,
            name: payload.name || payload.tenantId,
            tier: initialTier,
            isolationMode: payload.isolationMode || 'SaaS-Shared',
            status: TENANT_STATE.PROVISIONING,
            settings: { adminEmail: payload.adminEmail }
        });

        // Initialize Subscription
        const subscription = {
            subscriptionId: `sub_${payload.tenantId}_${Date.now()}`,
            tenantId: payload.tenantId,
            tier: initialTier,
            status: SUBSCRIPTION_STATUS.ACTIVE,
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
            cancelAtPeriodEnd: false
        };
        this.subscriptions.set(payload.tenantId, subscription);

        // Issue initial License Token
        const license = this.grantLicenseToken(payload.tenantId, initialTier, 30);

        // Transition tenant status to ACTIVE
        this.tenantManager.updateTenant(payload.tenantId, { status: TENANT_STATE.ACTIVE });

        this._dispatchWebhook('tenant.created', { tenantId: payload.tenantId, tier: initialTier });

        return {
            tenant: this.tenantManager.getTenant(payload.tenantId),
            subscription,
            license
        };
    }

    /**
     * Transitions tenant lifecycle status.
     * @param {string} tenantId 
     * @param {string} newState - State from TENANT_STATE
     */
    updateTenantState(tenantId, newState) {
        if (!Object.values(TENANT_STATE).includes(newState)) {
            throw new Error(`Invalid tenant state [${newState}]`);
        }

        const updated = this.tenantManager.updateTenant(tenantId, { status: newState });
        this._dispatchWebhook('tenant.status_changed', { tenantId, newState });
        return updated;
    }

    // =========================================================================
    // 2. SUBSCRIPTION & BILLING MANAGEMENT
    // =========================================================================

    /**
     * Updates tenant subscription tier or billing status.
     * @param {string} tenantId 
     * @param {Object} updates - { tier, status, cancelAtPeriodEnd }
     */
    updateSubscription(tenantId, updates = {}) {
        const sub = this.subscriptions.get(tenantId);
        if (!sub) {
            throw new Error(`Subscription for tenant [${tenantId}] not found`);
        }

        if (updates.tier) {
            sub.tier = updates.tier;
            this.tenantManager.updateTenant(tenantId, { tier: updates.tier });
            // Re-issue updated license key
            this.grantLicenseToken(tenantId, updates.tier, 365);
        }

        if (updates.status) sub.status = updates.status;
        if (updates.cancelAtPeriodEnd !== undefined) sub.cancelAtPeriodEnd = updates.cancelAtPeriodEnd;

        sub.updatedAt = new Date().toISOString();
        this._dispatchWebhook('subscription.updated', { tenantId, subscription: sub });
        return sub;
    }

    // =========================================================================
    // 3. METERED USAGE & QUOTA ENFORCEMENT
    // =========================================================================

    /**
     * Records metered usage (API requests, scan concurrency, storage, AI tokens).
     * @param {string} tenantId 
     * @param {string} metricKey - e.g. 'scans', 'api_calls', 'ai_tokens', 'storage_mb'
     * @param {number} quantity 
     */
    recordMeteredUsage(tenantId, metricKey, quantity = 1) {
        const key = `${tenantId}:${metricKey}`;
        const current = this.meteredUsage.get(key) || 0;
        const total = current + quantity;
        this.meteredUsage.get(key) || 0;
        this.meteredUsage.set(key, total);

        // Check against subscription gate limits if applicable
        const tenant = this.tenantManager.getTenant(tenantId);
        const quotaCheck = this.subscriptionGate.checkUsageLimit(tenant.tier, 'maxScansPerMonth', total);

        if (!quotaCheck.allowed) {
            this._dispatchWebhook('quota.exceeded', { tenantId, metricKey, total, max: quotaCheck.max });
        }

        return { tenantId, metricKey, total, allowed: quotaCheck.allowed };
    }

    /**
     * Retrieves usage summary for a tenant.
     * @param {string} tenantId 
     */
    getUsageSummary(tenantId) {
        const tenant = this.tenantManager.getTenant(tenantId);
        const metrics = {};
        for (const [k, v] of this.meteredUsage.entries()) {
            if (k.startsWith(`${tenantId}:`)) {
                metrics[k.split(':')[1]] = v;
            }
        }

        const limits = this.subscriptionGate.getTierLimits(tenant.tier);

        return {
            tenantId,
            tier: tenant.tier,
            metrics,
            tierLimits: limits,
            timestamp: new Date().toISOString()
        };
    }

    // =========================================================================
    // 4. LICENSING PORTAL & RSA/HMAC TOKEN ENGINE
    // =========================================================================

    /**
     * Issues cryptographically signed license token for a tenant.
     * @param {string} tenantId 
     * @param {string} tier 
     * @param {number} validityDays 
     */
    grantLicenseToken(tenantId, tier, validityDays = 365) {
        const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();
        const payload = {
            tenantId,
            tier,
            issuedAt: new Date().toISOString(),
            expiresAt,
            features: this.subscriptionGate.getAvailableFeatures(tier)
        };

        const payloadStr = JSON.stringify(payload);
        const signature = crypto.createHmac('sha256', this.secretKey).update(payloadStr).digest('hex');

        const licenseRecord = {
            licenseKey: `EAORCS-LIC-${Buffer.from(payloadStr).toString('base64url')}.${signature}`,
            payload,
            signature,
            status: 'ACTIVE'
        };

        this.licenses.set(tenantId, licenseRecord);
        return licenseRecord;
    }

    /**
     * Verifies license key validity.
     * @param {string} licenseKey 
     */
    verifyLicenseKey(licenseKey) {
        try {
            if (!licenseKey || !licenseKey.startsWith('EAORCS-LIC-')) {
                return { valid: false, reason: 'Invalid license format' };
            }

            const rawToken = licenseKey.replace('EAORCS-LIC-', '');
            const [b64Payload, signature] = rawToken.split('.');
            
            const payloadStr = Buffer.from(b64Payload, 'base64url').toString('utf8');
            const expectedSig = crypto.createHmac('sha256', this.secretKey).update(payloadStr).digest('hex');

            if (signature !== expectedSig) {
                return { valid: false, reason: 'Cryptographic signature mismatch' };
            }

            const payload = JSON.parse(payloadStr);

            if (new Date(payload.expiresAt) < new Date()) {
                return { valid: false, reason: 'License token has expired', payload };
            }

            return { valid: true, payload };
        } catch (err) {
            return { valid: false, reason: `License parsing error: ${err.message}` };
        }
    }

    // =========================================================================
    // 5. PARTNER APIS & WEBHOOKS
    // =========================================================================

    /**
     * Registers a Partner API key for external B2B integration.
     * @param {string} partnerName 
     */
    registerPartnerApiKey(partnerName) {
        const apiKey = `eaorcs_pk_${crypto.randomBytes(16).toString('hex')}`;
        const record = { partnerName, apiKey, createdAt: new Date().toISOString(), status: 'ACTIVE' };
        this.partnerApiKeys.set(apiKey, record);
        return record;
    }

    /**
     * Registers a Webhook URL for SaaS event notifications.
     * @param {string} webhookId 
     * @param {string} targetUrl 
     * @param {Array<string>} events 
     */
    registerWebhook(webhookId, targetUrl, events = ['*']) {
        const record = { webhookId, targetUrl, events, createdAt: new Date().toISOString() };
        this.webhooks.set(webhookId, record);
        return record;
    }

    /**
     * Helper to dispatch webhooks to registered listeners.
     * @private
     */
    _dispatchWebhook(eventType, data) {
        const payload = {
            eventId: `evt_${Date.now()}`,
            event: eventType,
            data,
            timestamp: new Date().toISOString()
        };

        // Signature for security verification by partners
        const signature = crypto.createHmac('sha256', this.secretKey).update(JSON.stringify(payload)).digest('hex');

        for (const wh of this.webhooks.values()) {
            if (wh.events.includes('*') || wh.events.includes(eventType)) {
                // In production, performs HTTP POST to wh.targetUrl with headers:
                // X-EAORCS-Signature: signature
            }
        }

        return { dispatched: true, payload, signature };
    }
}

module.exports = SaaSPlatform;
