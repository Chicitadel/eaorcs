/******************************************************************************
 * Project        : EAORCS STK
 * Module         : Tenant Continuous Learning Engine (Stream 5)
 * File           : engine/learning/TenantContinuousLearningEngine.js
 * Version        : 1.0.0
 * Author         : Enterprise Architecture & Operational Resilience Governance
 * Organization   : Ujomor Platform
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE
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
 * Copyright (c) 2026 Ujomor Platform
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * TenantContinuousLearningEngine
 * 
 * Privacy-safe tenant pattern analyzer tracking:
 * - Recurring architectural bottlenecks
 * - Common policy failures
 * - Deployment trends
 * - Remediation velocity
 * - Approval bottlenecks
 * - Documentation gaps
 */
class TenantContinuousLearningEngine {
    /**
     * @param {Object} config
     * @param {string} [config.salt] - Salt for anonymizing tenant identifiers
     * @param {boolean} [config.anonymizeTenantId=true] - Whether to anonymize tenant IDs in global benchmarks
     * @param {number} [config.minKAnonymity=3] - Minimum threshold for cross-tenant aggregation
     */
    constructor(config = {}) {
        this.salt = config.salt || 'eaorcs-privacy-salt-2026';
        this.anonymizeTenantId = config.anonymizeTenantId !== false;
        this.minKAnonymity = config.minKAnonymity || 3;

        // In-memory data store per tenant (tenantKey -> patterns)
        this.tenantData = new Map();
        // Aggregated cross-tenant anonymized observations
        this.globalObservations = [];
    }

    /**
     * Anonymize a tenant identifier using SHA-256 HMAC with salt
     * @param {string} tenantId 
     * @returns {string} Anonymized hash
     */
    anonymizeId(tenantId) {
        if (!tenantId) return 'tenant_anon_unknown';
        return 'anon_tenant_' + crypto.createHmac('sha256', this.salt).update(String(tenantId)).digest('hex').substring(0, 16);
    }

    /**
     * Sanitize payloads to remove PII / confidential data before storing/learning
     * @param {Object} data 
     * @returns {Object} Scrubbed object
     */
    sanitizePayload(data) {
        if (!data || typeof data !== 'object') return data;
        const scrubbed = Array.isArray(data) ? [] : {};
        const piiKeys = ['email', 'password', 'secret', 'token', 'key', 'ssn', 'creditcard', 'authorization', 'bearer'];
        
        for (const [key, value] of Object.entries(data)) {
            const lowerKey = key.toLowerCase();
            if (piiKeys.some(p => lowerKey.includes(p))) {
                scrubbed[key] = '[REDACTED_PRIVACY_SAFE]';
            } else if (value && typeof value === 'object') {
                scrubbed[key] = this.sanitizePayload(value);
            } else {
                scrubbed[key] = value;
            }
        }
        return scrubbed;
    }

    /**
     * Helper to retrieve or initialize tenant store
     * @param {string} tenantId 
     * @private
     */
    _getOrCreateTenantStore(tenantId) {
        if (!this.tenantData.has(tenantId)) {
            this.tenantData.set(tenantId, {
                tenantId,
                anonymizedId: this.anonymizeId(tenantId),
                architecturalBottlenecks: [],
                policyFailures: [],
                deploymentTrends: [],
                remediationLogs: [],
                approvalBottlenecks: [],
                documentationGaps: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
        return this.tenantData.get(tenantId);
    }

    /**
     * Record an architectural bottleneck event for a tenant
     * @param {string} tenantId 
     * @param {Object} bottleneck
     * @param {string} bottleneck.component - Affected service/component name
     * @param {string} bottleneck.type - e.g. 'HIGH_LATENCY', 'CIRCULAR_DEP', 'RESOURCE_CONTENTION'
     * @param {number} bottleneck.severity - 1 (low) to 5 (critical)
     * @param {string} bottleneck.description
     */
    recordArchitecturalBottleneck(tenantId, bottleneck) {
        const store = this._getOrCreateTenantStore(tenantId);
        const entry = {
            id: `bn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            component: bottleneck.component || 'UnknownComponent',
            type: bottleneck.type || 'UNKNOWN_BOTTLENECK',
            severity: Number(bottleneck.severity) || 3,
            description: bottleneck.description || '',
            timestamp: new Date().toISOString(),
            payload: this.sanitizePayload(bottleneck.payload || {})
        };
        store.architecturalBottlenecks.push(entry);
        store.updatedAt = new Date().toISOString();

        this._recordGlobalObservation('architecturalBottleneck', store.anonymizedId, entry);
        return entry;
    }

    /**
     * Record a policy failure event for a tenant
     * @param {string} tenantId 
     * @param {Object} failure
     * @param {string} failure.policyId - e.g. 'POL-SOC2-001'
     * @param {string} failure.ruleName - e.g. 'MISSING_ENCRYPTION_AT_REST'
     * @param {string} failure.category - e.g. 'SECURITY', 'COMPLIANCE', 'ARCHITECTURE'
     * @param {string} failure.status - e.g. 'OPEN', 'BLOCKED', 'OVERRIDDEN'
     */
    recordPolicyFailure(tenantId, failure) {
        const store = this._getOrCreateTenantStore(tenantId);
        const entry = {
            id: `pf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            policyId: failure.policyId || 'POL-GENERIC',
            ruleName: failure.ruleName || 'UNSPECIFIED_RULE',
            category: failure.category || 'GOVERNANCE',
            status: failure.status || 'OPEN',
            timestamp: new Date().toISOString(),
            payload: this.sanitizePayload(failure.payload || {})
        };
        store.policyFailures.push(entry);
        store.updatedAt = new Date().toISOString();

        this._recordGlobalObservation('policyFailure', store.anonymizedId, entry);
        return entry;
    }

    /**
     * Record a deployment trend event
     * @param {string} tenantId 
     * @param {Object} deployment
     * @param {string} deployment.environment - e.g. 'STAGING', 'PROD'
     * @param {boolean} deployment.success
     * @param {number} deployment.durationMs
     * @param {boolean} deployment.rolledBack
     */
    recordDeploymentTrend(tenantId, deployment) {
        const store = this._getOrCreateTenantStore(tenantId);
        const entry = {
            id: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            environment: deployment.environment || 'PROD',
            success: Boolean(deployment.success),
            durationMs: Number(deployment.durationMs) || 0,
            rolledBack: Boolean(deployment.rolledBack),
            timestamp: new Date().toISOString()
        };
        store.deploymentTrends.push(entry);
        store.updatedAt = new Date().toISOString();

        this._recordGlobalObservation('deploymentTrend', store.anonymizedId, entry);
        return entry;
    }

    /**
     * Record a remediation velocity event (resolution of issue/finding)
     * @param {string} tenantId 
     * @param {Object} remediation
     * @param {string} remediation.findingId
     * @param {number} remediation.timeToRemediateHours - MTTR calculation input
     * @param {boolean} remediation.automated - Whether resolved via auto-remediation
     * @param {boolean} remediation.metSLA - Met governance SLA
     */
    recordRemediationVelocity(tenantId, remediation) {
        const store = this._getOrCreateTenantStore(tenantId);
        const entry = {
            id: `rem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            findingId: remediation.findingId || 'FINDING-UNKNOWN',
            timeToRemediateHours: Number(remediation.timeToRemediateHours) || 0,
            automated: Boolean(remediation.automated),
            metSLA: remediation.metSLA !== false,
            timestamp: new Date().toISOString()
        };
        store.remediationLogs.push(entry);
        store.updatedAt = new Date().toISOString();

        this._recordGlobalObservation('remediationVelocity', store.anonymizedId, entry);
        return entry;
    }

    /**
     * Record an approval bottleneck event
     * @param {string} tenantId 
     * @param {Object} approval
     * @param {string} approval.gateName - e.g. 'SECURITY_ARCHITECTURE_BOARD'
     * @param {number} approval.waitDurationHours
     * @param {string} approval.approverRole
     * @param {string} approval.status - e.g. 'PENDING', 'APPROVED', 'TIMED_OUT'
     */
    recordApprovalBottleneck(tenantId, approval) {
        const store = this._getOrCreateTenantStore(tenantId);
        const entry = {
            id: `appr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            gateName: approval.gateName || 'GOVERNANCE_GATE',
            waitDurationHours: Number(approval.waitDurationHours) || 0,
            approverRole: approval.approverRole || 'ARCHITECT',
            status: approval.status || 'PENDING',
            timestamp: new Date().toISOString()
        };
        store.approvalBottlenecks.push(entry);
        store.updatedAt = new Date().toISOString();

        this._recordGlobalObservation('approvalBottleneck', store.anonymizedId, entry);
        return entry;
    }

    /**
     * Record a documentation gap event
     * @param {string} tenantId 
     * @param {Object} gap
     * @param {string} gap.domain - e.g. 'PAYMENTS_API', 'ADR_DECISIONS'
     * @param {string} gap.gapType - e.g. 'MISSING_ADR', 'OUTDATED_SCHEMA', 'NO_RUNBOOK'
     * @param {number} gap.impactScore - 1 to 5
     */
    recordDocumentationGap(tenantId, gap) {
        const store = this._getOrCreateTenantStore(tenantId);
        const entry = {
            id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            domain: gap.domain || 'SYSTEM',
            gapType: gap.gapType || 'MISSING_DOCS',
            impactScore: Number(gap.impactScore) || 3,
            timestamp: new Date().toISOString()
        };
        store.documentationGaps.push(entry);
        store.updatedAt = new Date().toISOString();

        this._recordGlobalObservation('documentationGap', store.anonymizedId, entry);
        return entry;
    }

    /**
     * Private recorder for cross-tenant anonymized learning store
     * @private
     */
    _recordGlobalObservation(category, anonTenantId, entry) {
        this.globalObservations.push({
            category,
            anonTenantId,
            timestamp: entry.timestamp,
            type: entry.type || entry.ruleName || entry.gapType || entry.gateName || 'GENERIC',
            value: entry.timeToRemediateHours || entry.waitDurationHours || entry.durationMs || entry.severity || 1
        });
    }

    /**
     * Analyze pattern metrics for a specific tenant
     * @param {string} tenantId 
     * @returns {Object} Tenant pattern analysis
     */
    analyzeTenantPatterns(tenantId) {
        const store = this._getOrCreateTenantStore(tenantId);

        // 1. Bottleneck recurring pattern frequency
        const bottleneckFreq = {};
        store.architecturalBottlenecks.forEach(b => {
            bottleneckFreq[b.type] = (bottleneckFreq[b.type] || 0) + 1;
        });

        // 2. Common policy failure count & top failing rules
        const policyFailureFreq = {};
        store.policyFailures.forEach(pf => {
            policyFailureFreq[pf.ruleName] = (policyFailureFreq[pf.ruleName] || 0) + 1;
        });

        // 3. Deployment trend metrics
        const totalDeps = store.deploymentTrends.length;
        const successfulDeps = store.deploymentTrends.filter(d => d.success).length;
        const rollbackDeps = store.deploymentTrends.filter(d => d.rolledBack).length;
        const avgDeployDurationMs = totalDeps > 0
            ? Math.round(store.deploymentTrends.reduce((acc, d) => acc + d.durationMs, 0) / totalDeps)
            : 0;

        // 4. Remediation velocity (MTTR)
        const totalRemediationEvents = store.remediationLogs.length;
        const avgMTTRHours = totalRemediationEvents > 0
            ? Number((store.remediationLogs.reduce((acc, r) => acc + r.timeToRemediateHours, 0) / totalRemediationEvents).toFixed(2))
            : 0;
        const autoRemediationPercentage = totalRemediationEvents > 0
            ? Number(((store.remediationLogs.filter(r => r.automated).length / totalRemediationEvents) * 100).toFixed(1))
            : 0;

        // 5. Approval Bottlenecks (Average approval wait time)
        const totalApprovals = store.approvalBottlenecks.length;
        const avgApprovalWaitHours = totalApprovals > 0
            ? Number((store.approvalBottlenecks.reduce((acc, a) => acc + a.waitDurationHours, 0) / totalApprovals).toFixed(2))
            : 0;

        // 6. Documentation Gaps summary
        const docGapFreq = {};
        store.documentationGaps.forEach(g => {
            docGapFreq[g.gapType] = (docGapFreq[g.gapType] || 0) + 1;
        });

        return {
            tenantId,
            anonymizedId: store.anonymizedId,
            summary: {
                totalBottlenecksRecorded: store.architecturalBottlenecks.length,
                totalPolicyFailuresRecorded: store.policyFailures.length,
                deploymentSuccessRatePercent: totalDeps > 0 ? Number(((successfulDeps / totalDeps) * 100).toFixed(1)) : 100,
                rollbackRatePercent: totalDeps > 0 ? Number(((rollbackDeps / totalDeps) * 100).toFixed(1)) : 0,
                meanTimeToRemediateHours: avgMTTRHours,
                autoRemediationRatePercent: autoRemediationPercentage,
                avgApprovalDelayHours: avgApprovalWaitHours,
                totalDocumentationGaps: store.documentationGaps.length
            },
            patterns: {
                recurringArchitecturalBottlenecks: bottleneckFreq,
                commonPolicyFailures: policyFailureFreq,
                approvalBottlenecksByGate: store.approvalBottlenecks,
                documentationGapsByType: docGapFreq
            },
            updatedAt: store.updatedAt
        };
    }

    /**
     * Generate Privacy-Safe Cross-Tenant Insights & Benchmarks
     * Enforces k-anonymity to prevent identifying individual tenants.
     * @returns {Object} Global cross-tenant pattern benchmarks
     */
    getCrossTenantInsights() {
        const uniqueTenants = new Set(this.globalObservations.map(o => o.anonTenantId)).size;
        const kAnonymitySatisfied = uniqueTenants >= this.minKAnonymity;

        const categoryCounts = {};
        const typeFrequencies = {};

        this.globalObservations.forEach(obs => {
            categoryCounts[obs.category] = (categoryCounts[obs.category] || 0) + 1;
            const key = `${obs.category}:${obs.type}`;
            typeFrequencies[key] = (typeFrequencies[key] || 0) + 1;
        });

        // Top 5 cross-tenant systemic risks
        const topSystemicRisks = Object.entries(typeFrequencies)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([key, count]) => {
                const [category, type] = key.split(':');
                return { category, type, totalOccurrences: count };
            });

        return {
            privacyNotice: 'All data scrubbed & aggregated using SHA-256 salted hashes and k-anonymity thresholds.',
            totalAnonymizedTenantsObserved: uniqueTenants,
            kAnonymitySatisfied,
            globalObservationsCount: this.globalObservations.length,
            categoryDistribution: categoryCounts,
            topSystemicRisks: kAnonymitySatisfied ? topSystemicRisks : ['INSUFFICIENT_K_ANONYMITY_THRESHOLD_DATA'],
            recommendedGlobalPolicies: this._deriveGlobalPolicyRecommendations(topSystemicRisks)
        };
    }

    /**
     * Derive continuous learning recommendations based on observed bottlenecks
     * @private
     */
    _deriveGlobalPolicyRecommendations(topRisks) {
        const recommendations = [];
        topRisks.forEach(risk => {
            if (risk.category === 'architecturalBottleneck') {
                recommendations.push(`Implement automated caching or decoupled messaging for high occurrence pattern: ${risk.type}`);
            } else if (risk.category === 'policyFailure') {
                recommendations.push(`Enforce pre-commit / CI gate for frequent failing rule: ${risk.type}`);
            } else if (risk.category === 'approvalBottleneck') {
                recommendations.push(`Delegate automated approval rules for low-risk gate: ${risk.type}`);
            } else if (risk.category === 'documentationGap') {
                recommendations.push(`Enable automated OpenAPI / ADR generation tooling for domain: ${risk.type}`);
            }
        });
        if (recommendations.length === 0) {
            recommendations.push('Maintain baseline governance policies; no critical cross-tenant systemic risks detected.');
        }
        return recommendations;
    }

    /**
     * Export engine state for persistence
     */
    exportState() {
        const exportedTenants = {};
        for (const [tenantId, data] of this.tenantData.entries()) {
            exportedTenants[tenantId] = data;
        }
        return {
            salt: this.salt,
            tenantData: exportedTenants,
            globalObservations: this.globalObservations
        };
    }

    /**
     * Import engine state
     * @param {Object} stateData 
     */
    importState(stateData) {
        if (!stateData || typeof stateData !== 'object') return;
        if (stateData.salt) this.salt = stateData.salt;
        if (stateData.tenantData) {
            for (const [tenantId, data] of Object.entries(stateData.tenantData)) {
                this.tenantData.set(tenantId, data);
            }
        }
        if (Array.isArray(stateData.globalObservations)) {
            this.globalObservations = stateData.globalObservations;
        }
    }
}

module.exports = TenantContinuousLearningEngine;
