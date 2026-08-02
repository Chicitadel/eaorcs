/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Stream 10 — SaaS Production Hardening & Multi-Tenant Security Engine
 * File           : SaaSProductionHardeningEngine.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance Authority
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance Authority. All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

class SaaSProductionHardeningEngine {
    /**
     * Constructs an instance of SaaS Production Hardening Engine.
     * @param {Object} options Engine configuration options.
     */
    constructor(options = {}) {
        this.options = Object.assign({
            verbose: false,
            defaultWindowMs: 1000,
            hmacSecret: 'eaorcs-saas-audit-secret-2026'
        }, options);

        this.tenants = new Map();
    }

    /**
     * Registers multi-tenant enterprise isolation policy and configures security boundaries.
     * 
     * @param {string} tenantId Unique tenant identifier.
     * @param {Object} isolationPolicy Custom tenant isolation policy parameters.
     * @returns {Object} Registered tenant record.
     */
    registerTenantIsolation(tenantId, isolationPolicy = {}) {
        if (!tenantId || typeof tenantId !== 'string') {
            throw new TypeError('tenantId must be a non-empty string');
        }

        const policy = Object.assign({
            tier: 'ENTERPRISE',
            dataBoundary: 'ISOLATED_NAMESPACE',
            maxRequestsPerSec: 1000,
            maxStorageMb: 10240,
            maxCpuQuota: 100,
            maxApiCalls: 50000,
            rateLimitWindowMs: this.options.defaultWindowMs,
            networkPolicy: 'STRICT_ZERO_TRUST',
            encryptionAtRest: true
        }, isolationPolicy);

        const initialHash = '0'.repeat(64);

        const tenantRecord = {
            tenantId,
            isolationPolicy: policy,
            usage: {
                requests: 0,
                storage_mb: 0,
                cpu_seconds: 0,
                api_calls: 0
            },
            rateLimitWindow: {
                windowStart: Date.now(),
                requestCount: 0,
                apiCallCount: 0
            },
            auditLedger: [],
            lastAuditHash: initialHash,
            status: 'ACTIVE',
            registeredAt: new Date().toISOString()
        };

        this.tenants.set(tenantId, tenantRecord);

        // Record initial registration in immutable audit log
        this.logTenantAudit(tenantId, 'TENANT_REGISTERED', {
            isolationPolicy: policy,
            securityTier: policy.tier
        });

        return {
            tenantId,
            isolationPolicy: policy,
            status: tenantRecord.status,
            registeredAt: tenantRecord.registeredAt
        };
    }

    /**
     * Enforces tenant quota boundaries and security rate-limiting limits.
     * 
     * @param {string} tenantId Unique tenant identifier.
     * @param {string} metric Resource metric type ('requests', 'storage_mb', 'api_calls', 'cpu_seconds').
     * @param {number} amount Quantity requested/consumed (default: 1).
     * @param {Object} options Enforcement options.
     * @returns {Object} Quota enforcement evaluation result.
     */
    enforceQuota(tenantId, metric, amount = 1, options = {}) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) {
            throw new Error(`Tenant '${tenantId}' is not registered`);
        }

        if (typeof amount !== 'number' || amount <= 0) {
            throw new TypeError('Amount must be a positive number');
        }

        const now = Date.now();
        const policy = tenant.isolationPolicy;
        const windowMs = policy.rateLimitWindowMs || this.options.defaultWindowMs;

        // Reset rate-limit sliding window if expired
        if (now - tenant.rateLimitWindow.windowStart >= windowMs) {
            tenant.rateLimitWindow.windowStart = now;
            tenant.rateLimitWindow.requestCount = 0;
            tenant.rateLimitWindow.apiCallCount = 0;
        }

        let allowed = true;
        let limit = Infinity;
        let currentUsage = 0;
        let reason = null;

        switch (metric.toLowerCase()) {
            case 'requests':
                limit = policy.maxRequestsPerSec;
                currentUsage = tenant.rateLimitWindow.requestCount + amount;
                if (currentUsage > limit) {
                    allowed = false;
                    reason = `Request rate limit exceeded (${currentUsage}/${limit} req/sec)`;
                } else {
                    tenant.rateLimitWindow.requestCount += amount;
                    tenant.usage.requests += amount;
                }
                break;

            case 'api_calls':
                limit = policy.maxApiCalls;
                currentUsage = tenant.usage.api_calls + amount;
                if (currentUsage > limit) {
                    allowed = false;
                    reason = `API calls quota exceeded (${currentUsage}/${limit})`;
                } else {
                    tenant.rateLimitWindow.apiCallCount += amount;
                    tenant.usage.api_calls += amount;
                }
                break;

            case 'storage_mb':
                limit = policy.maxStorageMb;
                currentUsage = tenant.usage.storage_mb + amount;
                if (currentUsage > limit) {
                    allowed = false;
                    reason = `Storage quota exceeded (${currentUsage}/${limit} MB)`;
                } else {
                    tenant.usage.storage_mb += amount;
                }
                break;

            case 'cpu_seconds':
                limit = policy.maxCpuQuota;
                currentUsage = tenant.usage.cpu_seconds + amount;
                if (currentUsage > limit) {
                    allowed = false;
                    reason = `CPU quota exceeded (${currentUsage}/${limit} sec)`;
                } else {
                    tenant.usage.cpu_seconds += amount;
                }
                break;

            default:
                // Generic metric check against policy limit if specified
                limit = policy[metric] !== undefined ? policy[metric] : Infinity;
                currentUsage = (tenant.usage[metric] || 0) + amount;
                if (currentUsage > limit) {
                    allowed = false;
                    reason = `Custom metric '${metric}' quota exceeded (${currentUsage}/${limit})`;
                } else {
                    tenant.usage[metric] = currentUsage;
                }
                break;
        }

        const remaining = Math.max(0, limit - currentUsage);

        if (!allowed) {
            this.logTenantAudit(tenantId, 'QUOTA_BREACH_ATTEMPT', {
                metric,
                amount,
                currentUsage,
                limit,
                reason
            });

            if (options.throwOnExceed) {
                const err = new Error(`Quota Enforced: ${reason}`);
                err.code = 'ERR_QUOTA_EXCEEDED';
                err.tenantId = tenantId;
                err.metric = metric;
                throw err;
            }
        }

        return {
            allowed,
            tenantId,
            metric,
            requestedAmount: amount,
            currentUsage,
            limit,
            remaining,
            reason
        };
    }

    /**
     * Emits an immutable, cryptographically-linked audit log entry into tenant's ledger.
     * 
     * @param {string} tenantId Unique tenant identifier.
     * @param {string} action Action performed (e.g. 'CONFIG_UPDATE', 'DATA_EXPORT').
     * @param {Object} details Audit entry payload details.
     * @returns {Object} Created audit log entry record.
     */
    logTenantAudit(tenantId, action, details = {}) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) {
            throw new Error(`Tenant '${tenantId}' is not registered`);
        }

        const auditId = `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
        const timestamp = new Date().toISOString();
        const previousHash = tenant.lastAuditHash;

        const payloadStr = JSON.stringify({
            auditId,
            tenantId,
            timestamp,
            action,
            details,
            previousHash
        });

        const entryHash = crypto.createHash('sha256')
            .update(payloadStr)
            .digest('hex');

        const signature = crypto.createHmac('sha256', this.options.hmacSecret)
            .update(entryHash)
            .digest('hex');

        const auditEntry = {
            auditId,
            tenantId,
            timestamp,
            action,
            details,
            previousHash,
            entryHash,
            signature
        };

        tenant.auditLedger.push(auditEntry);
        tenant.lastAuditHash = entryHash;

        return auditEntry;
    }

    /**
     * Verifies the cryptographic chain integrity of a tenant's audit ledger.
     * 
     * @param {string} tenantId Unique tenant identifier.
     * @returns {Object} Ledger audit integrity result.
     */
    validateTenantAuditIntegrity(tenantId) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) {
            throw new Error(`Tenant '${tenantId}' is not registered`);
        }

        const ledger = tenant.auditLedger;
        let expectedPrevHash = '0'.repeat(64);

        for (let i = 0; i < ledger.length; i++) {
            const entry = ledger[i];

            if (entry.previousHash !== expectedPrevHash) {
                return {
                    valid: false,
                    tamperedIndex: i,
                    reason: `Hash chain mismatch at index ${i}`
                };
            }

            const payloadStr = JSON.stringify({
                auditId: entry.auditId,
                tenantId: entry.tenantId,
                timestamp: entry.timestamp,
                action: entry.action,
                details: entry.details,
                previousHash: entry.previousHash
            });

            const computedHash = crypto.createHash('sha256')
                .update(payloadStr)
                .digest('hex');

            if (computedHash !== entry.entryHash) {
                return {
                    valid: false,
                    tamperedIndex: i,
                    reason: `Tampered payload content at index ${i}`
                };
            }

            const computedSig = crypto.createHmac('sha256', this.options.hmacSecret)
                .update(computedHash)
                .digest('hex');

            if (computedSig !== entry.signature) {
                return {
                    valid: false,
                    tamperedIndex: i,
                    reason: `Invalid HMAC signature at index ${i}`
                };
            }

            expectedPrevHash = entry.entryHash;
        }

        return {
            valid: true,
            totalEntries: ledger.length,
            lastAuditHash: tenant.lastAuditHash
        };
    }

    /**
     * Retrieves current usage metrics and security state for a registered tenant.
     * 
     * @param {string} tenantId Unique tenant identifier.
     * @returns {Object} Tenant usage and status summary.
     */
    getTenantUsage(tenantId) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) {
            throw new Error(`Tenant '${tenantId}' is not registered`);
        }

        const integrity = this.validateTenantAuditIntegrity(tenantId);

        return {
            tenantId,
            isolationPolicy: tenant.isolationPolicy,
            currentUsage: Object.assign({}, tenant.usage),
            rateLimitStatus: {
                windowStart: tenant.rateLimitWindow.windowStart,
                requestCount: tenant.rateLimitWindow.requestCount,
                apiCallCount: tenant.rateLimitWindow.apiCallCount
            },
            auditLogCount: tenant.auditLedger.length,
            lastAuditHash: tenant.lastAuditHash,
            complianceStatus: integrity.valid ? 'COMPLIANT' : 'TAMPERED_BREACH',
            auditLedgerIntegrity: integrity.valid,
            status: tenant.status,
            registeredAt: tenant.registeredAt
        };
    }
}

module.exports = SaaSProductionHardeningEngine;
