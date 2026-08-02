/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : SaaS Operational Intelligence & Observability Engine
 * File           : engine/saas/SaaSOperationalIntelligenceEngine.js
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
 * - SOC 2 Type II
 * - OWASP ASVS v4.0
 * - NIST SP 800-53
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * Operational Maturity Levels definition based on UAIGOS Architecture Standard
 */
const MATURITY_LEVELS = Object.freeze({
    LEVEL_1_INITIAL: { level: 1, label: 'Initial / Ad-Hoc', minScore: 0, maxScore: 39 },
    LEVEL_2_MANAGED: { level: 2, label: 'Managed / Repeatable', minScore: 40, maxScore: 59 },
    LEVEL_3_DEFINED: { level: 3, label: 'Defined / Standardized', minScore: 60, maxScore: 74 },
    LEVEL_4_QUANTITATIVELY_MANAGED: { level: 4, label: 'Quantitatively Managed', minScore: 75, maxScore: 89 },
    LEVEL_5_OPTIMIZING_AUTONOMOUS: { level: 5, label: 'Optimizing & Autonomous Sovereign', minScore: 90, maxScore: 100 }
});

/**
 * Trust Rating tiers based on cryptographic attestation & telemetry score
 */
const TRUST_RATINGS = Object.freeze({
    AAA: { rating: 'AAA', minScore: 95, status: 'EXEMPLARY_TRUST' },
    AA:  { rating: 'AA',  minScore: 85, status: 'HIGH_TRUST' },
    A:   { rating: 'A',   minScore: 75, status: 'STANDARD_TRUST' },
    BBB: { rating: 'BBB', minScore: 65, status: 'MODERATE_TRUST' },
    BB:  { rating: 'BB',  minScore: 50, status: 'ELEVATED_RISK' },
    B:   { rating: 'B',   minScore: 35, status: 'HIGH_RISK' },
    CCC: { rating: 'CCC', minScore: 0,  status: 'NON_COMPLIANT_DEFICIENT' }
});

/**
 * SaaSOperationalIntelligenceEngine
 * Continuous operational maturity tracking, tenant compliance metrics aggregation,
 * trust telemetry monitoring, and predictive certification trend forecasting engine.
 */
class SaaSOperationalIntelligenceEngine {
    /**
     * Initializes the SaaS Operational Intelligence Engine
     * @param {Object} options Configuration options
     * @param {string} options.hmacSecret HMAC secret for signing telemetry and dashboard reports
     */
    constructor(options = {}) {
        this.hmacSecret = options.hmacSecret || 'eaorcs-op-intel-default-signing-secret-2026';
        this.tenants = new Map();
    }

    /**
     * Registers a new tenant for operational observability & telemetry tracking
     * @param {string} tenantId Unique tenant identifier
     * @param {Object} metadata Tenant metadata (name, region, industry, tier, etc.)
     * @returns {Object} Registered tenant object
     */
    registerTenant(tenantId, metadata = {}) {
        if (!tenantId || typeof tenantId !== 'string') {
            throw new Error('Tenant ID must be a non-empty string');
        }

        const record = {
            tenantId,
            metadata: {
                name: metadata.name || `Tenant-${tenantId}`,
                region: metadata.region || 'global-us-east',
                industry: metadata.industry || 'FINTECH_GOV',
                tier: metadata.tier || 'ENTERPRISE',
                environment: metadata.environment || 'PRODUCTION',
                ...metadata
            },
            registeredAt: new Date().toISOString(),
            telemetryLogs: [],
            trustLogs: [],
            maturityHistory: [],
            complianceSnapshots: [],
            currentMaturity: null,
            currentTrustProfile: null
        };

        this.tenants.set(tenantId, record);
        return record;
    }

    /**
     * Ingests a new telemetry record for a registered tenant.
     * Continuously updates maturity, compliance, and trust calculations.
     * 
     * @param {string} tenantId Unique tenant identifier
     * @param {Object} telemetryData Quantitative telemetry metrics
     * @returns {Object} Stored telemetry record
     */
    ingestTenantTelemetry(tenantId, telemetryData = {}) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) {
            throw new Error(`Tenant '${tenantId}' is not registered in Operational Intelligence Engine`);
        }

        const timestamp = telemetryData.timestamp || new Date().toISOString();
        
        // Extract & set fallback defaults for telemetry attributes
        const telemetryRecord = {
            recordId: `TELEMETRY-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
            tenantId,
            timestamp,
            cpuUtilizationPercent: Number(telemetryData.cpuUtilizationPercent ?? 25),
            memoryUtilizationPercent: Number(telemetryData.memoryUtilizationPercent ?? 30),
            requestCount: Number(telemetryData.requestCount ?? 1000),
            latencyMsP95: Number(telemetryData.latencyMsP95 ?? 45),
            errorRate: Number(telemetryData.errorRate ?? 0.001),
            passedComplianceChecks: Number(telemetryData.passedComplianceChecks ?? 98),
            totalComplianceChecks: Number(telemetryData.totalComplianceChecks ?? 100),
            encryptionEnabled: Boolean(telemetryData.encryptionEnabled ?? true),
            zeroTrustEnforced: Boolean(telemetryData.zeroTrustEnforced ?? true),
            auditLogIntegrity: Boolean(telemetryData.auditLogIntegrity ?? true),
            backupSuccess: Boolean(telemetryData.backupSuccess ?? true),
            securityIncidentCount: Number(telemetryData.securityIncidentCount ?? 0),
            customMetrics: telemetryData.customMetrics || {}
        };

        // Compute HMAC signature for telemetry record payload
        const payloadStr = JSON.stringify({
            recordId: telemetryRecord.recordId,
            tenantId: telemetryRecord.tenantId,
            timestamp: telemetryRecord.timestamp,
            passed: telemetryRecord.passedComplianceChecks,
            total: telemetryRecord.totalComplianceChecks,
            incidentCount: telemetryRecord.securityIncidentCount
        });

        telemetryRecord.signature = crypto.createHmac('sha256', this.hmacSecret)
            .update(payloadStr)
            .digest('hex');

        tenant.telemetryLogs.push(telemetryRecord);

        // Keep last 500 telemetry records per tenant to optimize memory footprint
        if (tenant.telemetryLogs.length > 500) {
            tenant.telemetryLogs.shift();
        }

        // Recalculate operational maturity & compliance snapshot
        this.calculateOperationalMaturity(tenantId);

        return telemetryRecord;
    }

    /**
     * Calculates continuous operational maturity score and maturity level for a tenant
     * 
     * @param {string} tenantId Unique tenant identifier
     * @returns {Object} Operational maturity evaluation result
     */
    calculateOperationalMaturity(tenantId) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) {
            throw new Error(`Tenant '${tenantId}' is not registered`);
        }

        if (tenant.telemetryLogs.length === 0) {
            // Default initial state if no telemetry ingested yet
            const defaultMaturity = {
                tenantId,
                maturityScore: 0,
                maturityLevel: MATURITY_LEVELS.LEVEL_1_INITIAL,
                dimensions: {
                    resilienceSla: 0,
                    securityIsolation: 0,
                    regulatoryCompliance: 0,
                    telemetryObservability: 0
                },
                evaluatedAt: new Date().toISOString()
            };
            tenant.currentMaturity = defaultMaturity;
            return defaultMaturity;
        }

        // Take average of last 5 telemetry logs for smooth windowing
        const recentLogs = tenant.telemetryLogs.slice(-5);
        const count = recentLogs.length;

        let avgLatency = 0;
        let avgErrorRate = 0;
        let avgComplianceRate = 0;
        let zeroTrustPassCount = 0;
        let auditLogPassCount = 0;
        let backupPassCount = 0;
        let totalIncidents = 0;

        for (const log of recentLogs) {
            avgLatency += log.latencyMsP95;
            avgErrorRate += log.errorRate;
            avgComplianceRate += (log.passedComplianceChecks / Math.max(1, log.totalComplianceChecks));
            if (log.zeroTrustEnforced && log.encryptionEnabled) zeroTrustPassCount++;
            if (log.auditLogIntegrity) auditLogPassCount++;
            if (log.backupSuccess) backupPassCount++;
            totalIncidents += log.securityIncidentCount;
        }

        avgLatency /= count;
        avgErrorRate /= count;
        avgComplianceRate /= count;

        // 1. Resilience & SLA Adherence Score (Max 25 pts)
        let resilienceScore = 25;
        if (avgErrorRate > 0.05) resilienceScore -= 15;
        else if (avgErrorRate > 0.01) resilienceScore -= 8;
        if (avgLatency > 500) resilienceScore -= 10;
        else if (avgLatency > 200) resilienceScore -= 5;
        resilienceScore = Math.max(0, resilienceScore);

        // 2. Security Posture & Isolation Score (Max 25 pts)
        let securityScore = 25;
        securityScore *= (zeroTrustPassCount / count);
        if (totalIncidents > 0) securityScore -= (totalIncidents * 10);
        securityScore = Math.max(0, securityScore);

        // 3. Regulatory Compliance Score (Max 25 pts)
        let complianceScore = avgComplianceRate * 25;
        complianceScore = Math.max(0, Math.min(25, complianceScore));

        // 4. Telemetry & Observability Depth Score (Max 25 pts)
        let observabilityScore = 25;
        observabilityScore *= (auditLogPassCount / count) * 0.5 + (backupPassCount / count) * 0.5;
        observabilityScore = Math.max(0, observabilityScore);

        const totalScore = Math.round(resilienceScore + securityScore + complianceScore + observabilityScore);

        // Map to Maturity Level
        let maturityLevel = MATURITY_LEVELS.LEVEL_1_INITIAL;
        if (totalScore >= MATURITY_LEVELS.LEVEL_5_OPTIMIZING_AUTONOMOUS.minScore) {
            maturityLevel = MATURITY_LEVELS.LEVEL_5_OPTIMIZING_AUTONOMOUS;
        } else if (totalScore >= MATURITY_LEVELS.LEVEL_4_QUANTITATIVELY_MANAGED.minScore) {
            maturityLevel = MATURITY_LEVELS.LEVEL_4_QUANTITATIVELY_MANAGED;
        } else if (totalScore >= MATURITY_LEVELS.LEVEL_3_DEFINED.minScore) {
            maturityLevel = MATURITY_LEVELS.LEVEL_3_DEFINED;
        } else if (totalScore >= MATURITY_LEVELS.LEVEL_2_MANAGED.minScore) {
            maturityLevel = MATURITY_LEVELS.LEVEL_2_MANAGED;
        }

        const maturityRecord = {
            tenantId,
            maturityScore: totalScore,
            maturityLevel,
            dimensions: {
                resilienceSla: Math.round(resilienceScore * 4), // Normalize to 100
                securityIsolation: Math.round(securityScore * 4),
                regulatoryCompliance: Math.round(complianceScore * 4),
                telemetryObservability: Math.round(observabilityScore * 4)
            },
            evaluatedAt: new Date().toISOString()
        };

        tenant.currentMaturity = maturityRecord;
        tenant.maturityHistory.push(maturityRecord);
        if (tenant.maturityHistory.length > 200) tenant.maturityHistory.shift();

        return maturityRecord;
    }

    /**
     * Records and processes trust metric telemetry for a tenant
     * 
     * @param {string} tenantId Unique tenant identifier
     * @param {Object} trustData Trust attestation metrics
     * @returns {Object} Updated trust profile
     */
    recordTrustTelemetry(tenantId, trustData = {}) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) {
            throw new Error(`Tenant '${tenantId}' is not registered`);
        }

        const timestamp = trustData.timestamp || new Date().toISOString();
        const attestationStatus = trustData.attestationStatus || 'VERIFIED';
        const proofIntegrityScore = Number(trustData.proofIntegrityScore ?? 100);
        const verificationLatencyMs = Number(trustData.verificationLatencyMs ?? 15);
        const keyRotationAgeDays = Number(trustData.keyRotationAgeDays ?? 12);
        const zeroTrustPolicyEnforcementRate = Number(trustData.zeroTrustPolicyEnforcementRate ?? 100);

        // Compute overall Trust Score (0-100)
        let baseTrustScore = (proofIntegrityScore * 0.4) + (zeroTrustPolicyEnforcementRate * 0.4);
        let bonusOpsScore = 20;
        if (keyRotationAgeDays > 90) bonusOpsScore -= 10;
        if (verificationLatencyMs > 200) bonusOpsScore -= 10;
        if (attestationStatus !== 'VERIFIED') bonusOpsScore -= 20;

        let trustScore = Math.max(0, Math.min(100, Math.round(baseTrustScore + bonusOpsScore)));

        // Determine Rating Tier
        let trustRating = TRUST_RATINGS.CCC;
        for (const tier of Object.values(TRUST_RATINGS)) {
            if (trustScore >= tier.minScore) {
                trustRating = tier;
                break;
            }
        }

        const trustRecord = {
            recordId: `TRUST-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
            tenantId,
            timestamp,
            attestationStatus,
            proofIntegrityScore,
            verificationLatencyMs,
            keyRotationAgeDays,
            zeroTrustPolicyEnforcementRate,
            trustScore,
            trustRating: trustRating.rating,
            trustStatus: trustRating.status
        };

        tenant.trustLogs.push(trustRecord);
        if (tenant.trustLogs.length > 200) tenant.trustLogs.shift();

        tenant.currentTrustProfile = trustRecord;
        return trustRecord;
    }

    /**
     * Retrieves tenant trust profile
     * @param {string} tenantId 
     * @returns {Object} Tenant trust profile
     */
    getTenantTrustProfile(tenantId) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) {
            throw new Error(`Tenant '${tenantId}' is not registered`);
        }

        if (!tenant.currentTrustProfile) {
            // Auto generate initial trust record if none exists
            return this.recordTrustTelemetry(tenantId, {});
        }

        return tenant.currentTrustProfile;
    }

    /**
     * Aggregates tenant compliance metrics across platform or filtered subset
     * 
     * @param {Object} filter Options to filter tenant aggregation (region, industry, tier)
     * @returns {Object} Aggregated platform compliance metrics
     */
    aggregateTenantComplianceMetrics(filter = {}) {
        let matchingTenants = Array.from(this.tenants.values());

        if (filter.region) {
            matchingTenants = matchingTenants.filter(t => t.metadata.region === filter.region);
        }
        if (filter.industry) {
            matchingTenants = matchingTenants.filter(t => t.metadata.industry === filter.industry);
        }
        if (filter.tier) {
            matchingTenants = matchingTenants.filter(t => t.metadata.tier === filter.tier);
        }

        const totalTenants = matchingTenants.length;
        if (totalTenants === 0) {
            return {
                totalTenants: 0,
                platformComplianceIndex: 100,
                compliantTenantsCount: 0,
                atRiskTenantsCount: 0,
                frameworkCoverage: {
                    ISO_27001: 100,
                    SOC_2: 100,
                    HIPAA: 100,
                    GDPR: 100,
                    OSAP_TRUST_FRAMEWORK: 100
                },
                topViolations: [],
                aggregatedAt: new Date().toISOString()
            };
        }

        let totalComplianceSum = 0;
        let compliantCount = 0;
        let atRiskCount = 0;
        const violationsMap = new Map();

        for (const tenant of matchingTenants) {
            // Get latest telemetry
            const latestLog = tenant.telemetryLogs[tenant.telemetryLogs.length - 1];
            const compRate = latestLog 
                ? Math.round((latestLog.passedComplianceChecks / Math.max(1, latestLog.totalComplianceChecks)) * 100)
                : 100;

            totalComplianceSum += compRate;
            if (compRate >= 85) compliantCount++;
            if (compRate < 70) atRiskCount++;

            if (latestLog && latestLog.securityIncidentCount > 0) {
                violationsMap.set('SECURITY_INCIDENT_DETECTED', (violationsMap.get('SECURITY_INCIDENT_DETECTED') || 0) + latestLog.securityIncidentCount);
            }
            if (latestLog && !latestLog.encryptionEnabled) {
                violationsMap.set('ENCRYPTION_AT_REST_DISABLED', (violationsMap.get('ENCRYPTION_AT_REST_DISABLED') || 0) + 1);
            }
            if (latestLog && !latestLog.zeroTrustEnforced) {
                violationsMap.set('ZERO_TRUST_POLICY_BYPASS', (violationsMap.get('ZERO_TRUST_POLICY_BYPASS') || 0) + 1);
            }
            if (latestLog && !latestLog.auditLogIntegrity) {
                violationsMap.set('AUDIT_LEDGER_TAMPERING', (violationsMap.get('AUDIT_LEDGER_TAMPERING') || 0) + 1);
            }
        }

        const avgIndex = Math.round(totalComplianceSum / totalTenants);

        const frameworkCoverage = {
            ISO_27001: Math.min(100, Math.round(avgIndex * 0.98)),
            SOC_2: Math.min(100, Math.round(avgIndex * 0.99)),
            HIPAA: Math.min(100, Math.round(avgIndex * 0.97)),
            GDPR: Math.min(100, Math.round(avgIndex * 1.0)),
            OSAP_TRUST_FRAMEWORK: Math.min(100, Math.round(avgIndex * 0.99))
        };

        const topViolations = Array.from(violationsMap.entries())
            .map(([rule, occurrenceCount]) => ({ rule, occurrenceCount }))
            .sort((a, b) => b.occurrenceCount - a.occurrenceCount);

        return {
            totalTenants,
            platformComplianceIndex: avgIndex,
            compliantTenantsCount: compliantCount,
            atRiskTenantsCount: atRiskCount,
            frameworkCoverage,
            topViolations,
            aggregatedAt: new Date().toISOString()
        };
    }

    /**
     * Forecasts tenant certification readiness and compliance score trends over a specified horizon
     * 
     * @param {string} tenantId Unique tenant identifier
     * @param {number} horizonMonths Forecasting horizon in months (default 6)
     * @returns {Object} Predictive trend forecast report
     */
    forecastCertificationTrends(tenantId, horizonMonths = 6) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) {
            throw new Error(`Tenant '${tenantId}' is not registered`);
        }

        const history = tenant.maturityHistory;
        const currentMaturity = tenant.currentMaturity || this.calculateOperationalMaturity(tenantId);
        const currentTrust = tenant.currentTrustProfile || this.getTenantTrustProfile(tenantId);

        let scoreDriftPerPeriod = 0;
        if (history.length >= 2) {
            const first = history[0].maturityScore;
            const last = history[history.length - 1].maturityScore;
            scoreDriftPerPeriod = (last - first) / (history.length - 1);
        }

        const currentScore = currentMaturity.maturityScore;
        const projectedScores = {};
        const milestones = [1, 2, 3, 6, 12];

        for (const m of milestones) {
            if (m <= horizonMonths) {
                const projected = Math.max(0, Math.min(100, Math.round(currentScore + (scoreDriftPerPeriod * m * 2))));
                projectedScores[`month_${m}`] = projected;
            }
        }

        // Calculate audit readiness probability (%)
        let readinessProbability = 100;
        if (currentScore < 85) readinessProbability -= (85 - currentScore) * 3;
        if (currentTrust.trustScore < 80) readinessProbability -= 15;
        if (scoreDriftPerPeriod < 0) readinessProbability -= 20;
        readinessProbability = Math.max(0, Math.min(100, Math.round(readinessProbability)));

        // Risk classification
        let certificationRisk = 'LOW_RISK';
        if (readinessProbability < 50) certificationRisk = 'CRITICAL_RISK';
        else if (readinessProbability < 75) certificationRisk = 'ELEVATED_RISK';
        else if (readinessProbability < 90) certificationRisk = 'MODERATE_RISK';

        // Remediation Recommendations
        const remediationRecommendations = [];
        if (currentScore < 80) {
            remediationRecommendations.push('Upgrade security posture by enforcing zero-trust MFA and mandatory key rotation.');
        }
        if (currentTrust.keyRotationAgeDays > 60) {
            remediationRecommendations.push('Perform cryptographic key rotation to lower key age exposure.');
        }
        if (readinessProbability < 90) {
            remediationRecommendations.push('Schedule mock audit review for ISO 27001 / SOC 2 controls.');
        }
        if (remediationRecommendations.length === 0) {
            remediationRecommendations.push('Maintain current operational metrics; tenant is fully audit ready.');
        }

        return {
            tenantId,
            forecastHorizonMonths: horizonMonths,
            currentMaturityLevel: currentMaturity.maturityLevel.label,
            currentMaturityScore: currentScore,
            currentTrustScore: currentTrust.trustScore,
            historicalVelocity: Number(scoreDriftPerPeriod.toFixed(2)),
            projectedScores,
            readinessProbability,
            certificationRisk,
            remediationRecommendations,
            forecastedAt: new Date().toISOString()
        };
    }

    /**
     * Generates a complete operational intelligence dashboard report for the platform
     * 
     * @param {Object} filter Optional query filter
     * @returns {Object} Comprehensive dashboard report
     */
    generateOperationalDashboardReport(filter = {}) {
        const timestamp = new Date().toISOString();
        const tenantList = Array.from(this.tenants.values());

        const maturityDistribution = {
            LEVEL_1_INITIAL: 0,
            LEVEL_2_MANAGED: 0,
            LEVEL_3_DEFINED: 0,
            LEVEL_4_QUANTITATIVELY_MANAGED: 0,
            LEVEL_5_OPTIMIZING_AUTONOMOUS: 0
        };

        let totalMaturitySum = 0;
        const highRiskAlerts = [];

        for (const tenant of tenantList) {
            const maturity = tenant.currentMaturity || this.calculateOperationalMaturity(tenant.tenantId);
            totalMaturitySum += maturity.maturityScore;

            if (maturity.maturityLevel.level === 1) maturityDistribution.LEVEL_1_INITIAL++;
            else if (maturity.maturityLevel.level === 2) maturityDistribution.LEVEL_2_MANAGED++;
            else if (maturity.maturityLevel.level === 3) maturityDistribution.LEVEL_3_DEFINED++;
            else if (maturity.maturityLevel.level === 4) maturityDistribution.LEVEL_4_QUANTITATIVELY_MANAGED++;
            else if (maturity.maturityLevel.level === 5) maturityDistribution.LEVEL_5_OPTIMIZING_AUTONOMOUS++;

            const forecast = this.forecastCertificationTrends(tenant.tenantId, 3);
            if (forecast.certificationRisk === 'CRITICAL_RISK' || forecast.certificationRisk === 'ELEVATED_RISK') {
                highRiskAlerts.push({
                    tenantId: tenant.tenantId,
                    name: tenant.metadata.name,
                    risk: forecast.certificationRisk,
                    readinessProbability: forecast.readinessProbability,
                    currentScore: forecast.currentMaturityScore
                });
            }
        }

        const tenantCount = tenantList.length;
        const meanPlatformMaturity = tenantCount > 0 ? Math.round(totalMaturitySum / tenantCount) : 100;
        const complianceAggregates = this.aggregateTenantComplianceMetrics(filter);

        const reportSummary = {
            reportId: `DASHBOARD-RPT-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
            timestamp,
            tenantCount,
            platformMaturity: {
                meanScore: meanPlatformMaturity,
                distribution: maturityDistribution
            },
            complianceAggregates,
            highRiskAlerts,
            governanceStatus: 'UAIGOS_STREAM_F_OPERATIONAL_INTELLIGENCE_VERIFIED'
        };

        // Sign report
        const signatureStr = JSON.stringify({
            reportId: reportSummary.reportId,
            timestamp: reportSummary.timestamp,
            tenantCount: reportSummary.tenantCount,
            meanScore: reportSummary.platformMaturity.meanScore
        });

        reportSummary.hmacSignature = crypto.createHmac('sha256', this.hmacSecret)
            .update(signatureStr)
            .digest('hex');

        return reportSummary;
    }

    /**
     * Verifies the cryptographic HMAC signature of a dashboard report
     * @param {Object} report Dashboard report object
     * @returns {boolean} True if signature is valid
     */
    verifyDashboardReportSignature(report) {
        if (!report || !report.hmacSignature) return false;

        const signatureStr = JSON.stringify({
            reportId: report.reportId,
            timestamp: report.timestamp,
            tenantCount: report.tenantCount,
            meanScore: report.platformMaturity.meanScore
        });

        const expectedSig = crypto.createHmac('sha256', this.hmacSecret)
            .update(signatureStr)
            .digest('hex');

        return report.hmacSignature === expectedSig;
    }

    /**
     * Returns history of ingested telemetry for a tenant
     * @param {string} tenantId 
     * @returns {Array<Object>} Telemetry history
     */
    getTenantTelemetryHistory(tenantId) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) throw new Error(`Tenant '${tenantId}' is not registered`);
        return tenant.telemetryLogs;
    }

    /**
     * Returns maturity evaluation history for a tenant
     * @param {string} tenantId 
     * @returns {Array<Object>} Maturity history
     */
    getTenantMaturityHistory(tenantId) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) throw new Error(`Tenant '${tenantId}' is not registered`);
        return tenant.maturityHistory;
    }
}

module.exports = SaaSOperationalIntelligenceEngine;
module.exports.SaaSOperationalIntelligenceEngine = SaaSOperationalIntelligenceEngine;
module.exports.MATURITY_LEVELS = MATURITY_LEVELS;
module.exports.TRUST_RATINGS = TRUST_RATINGS;
