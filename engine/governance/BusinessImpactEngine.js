/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Governance Platform — Stream 3: Business Risk Engine
 * File           : BusinessImpactEngine.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Architectural Governance Council & Enterprise Systems Engineering
 * Organization   : Enterprise Governance & Systems Engineering
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
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
 * Copyright (c) 2026 Enterprise Governance & Systems Engineering. All Rights Reserved.
 ******************************************************************************/

'use strict';

/**
 * BusinessImpactEngine
 * Calculates financial risk, estimated downtime hours, revenue impact (€/$),
 * and customer impact severity for audit findings across enterprise platforms using domain-agnostic resource terminology.
 */
class BusinessImpactEngine {
    /**
     * @param {Object} options Configuration options
     * @param {number} [options.hourlyRevenueRateUSD=12500] Default hourly revenue rate in USD
     * @param {number} [options.hourlyRevenueRateEUR=11500] Default hourly revenue rate in EUR
     * @param {number} [options.usdToEurRate=0.92] USD to EUR conversion rate
     * @param {number} [options.totalCustomerBase=50000] Total customer base count
     */
    constructor(options = {}) {
        this.options = {
            hourlyRevenueRateUSD: options.hourlyRevenueRateUSD || 12500,
            hourlyRevenueRateEUR: options.hourlyRevenueRateEUR || 11500,
            usdToEurRate: options.usdToEurRate || 0.92,
            totalCustomerBase: options.totalCustomerBase || 50000,
            defaultCurrency: options.defaultCurrency || 'EUR',
            ...options
        };
    }

    /**
     * Calculates business impact for a single audit finding using domain-agnostic resource terminology.
     * @param {Object|string} finding Finding object or description string
     * @param {Object} [options] Overriding options for calculation
     * @returns {Object} Structured business impact evaluation
     */
    calculateFindingImpact(finding, options = {}) {
        const config = { ...this.options, ...options };
        const normalized = this._normalizeFinding(finding);

        const severity = normalized.severity.toUpperCase();
        const domain = normalized.domain.toUpperCase();
        const blastRadius = normalized.blastRadius.toUpperCase();

        // 1. Estimated Downtime Hours Calculation
        const downtimeHours = this._calculateDowntimeHours(severity, domain, blastRadius);

        // 2. Revenue Impact Calculation (€ and $)
        const revenueImpactUSD = Math.round(downtimeHours * config.hourlyRevenueRateUSD);
        const revenueImpactEUR = Math.round(downtimeHours * config.hourlyRevenueRateEUR);

        // 3. Financial Risk Calculation (incorporating potential regulatory fines, breach loss, SLA credits)
        const financialRisk = this._calculateFinancialRisk(severity, domain, blastRadius, revenueImpactEUR);

        // 4. Customer Impact Severity Calculation
        const customerImpact = this._calculateCustomerImpact(severity, blastRadius, config.totalCustomerBase);

        return {
            findingId: normalized.id,
            title: normalized.title,
            severity: severity,
            domain: normalized.domain,
            resourceType: normalized.resourceType,
            financialRiskEUR: financialRisk.eur,
            financialRiskUSD: financialRisk.usd,
            estimatedDowntimeHours: downtimeHours,
            revenueImpact: {
                eur: revenueImpactEUR,
                usd: revenueImpactUSD,
                formattedEUR: this.formatCurrency(revenueImpactEUR, 'EUR'),
                formattedUSD: this.formatCurrency(revenueImpactUSD, 'USD')
            },
            customerImpactSeverity: customerImpact.severity,
            impactedCustomerCount: customerImpact.impactedCount,
            impactedCustomerPercentage: customerImpact.impactedPercentage,
            riskLevel: this._determineOverallRiskLevel(financialRisk.eur, downtimeHours),
            details: {
                regulatoryRiskEUR: financialRisk.regulatoryEUR,
                slaPenaltyEUR: financialRisk.slaPenaltyEUR,
                remediationCostEstimateEUR: financialRisk.remediationEUR
            }
        };
    }

    /**
     * Calculates aggregate business impact across a list of audit findings.
     * @param {Array<Object>} findings List of audit findings
     * @param {Object} [options] Overriding options
     * @returns {Object} Aggregate business impact report
     */
    calculateAggregateImpact(findings = [], options = {}) {
        const config = { ...this.options, ...options };
        if (!Array.isArray(findings)) {
            findings = [findings];
        }

        const evaluatedFindings = findings.map(f => this.calculateFindingImpact(f, config));

        let totalFinancialRiskEUR = 0;
        let totalFinancialRiskUSD = 0;
        let totalDowntimeHours = 0;
        let totalRevenueImpactEUR = 0;
        let totalRevenueImpactUSD = 0;
        let totalImpactedCustomers = 0;

        const domainBreakdown = {};
        const severityBreakdown = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFORMATIONAL: 0 };
        let worstCustomerImpact = 'NEGLIGIBLE';

        const severityOrder = ['NEGLIGIBLE', 'LOW', 'MODERATE', 'HIGH', 'EXTREME'];

        for (const imp of evaluatedFindings) {
            totalFinancialRiskEUR += imp.financialRiskEUR;
            totalFinancialRiskUSD += imp.financialRiskUSD;
            totalDowntimeHours += imp.estimatedDowntimeHours;
            totalRevenueImpactEUR += imp.revenueImpact.eur;
            totalRevenueImpactUSD += imp.revenueImpact.usd;
            totalImpactedCustomers += imp.impactedCustomerCount;

            const sev = imp.severity in severityBreakdown ? imp.severity : 'MEDIUM';
            severityBreakdown[sev]++;

            const dom = imp.domain || 'UNSPECIFIED';
            if (!domainBreakdown[dom]) {
                domainBreakdown[dom] = { count: 0, financialRiskEUR: 0, downtimeHours: 0 };
            }
            domainBreakdown[dom].count++;
            domainBreakdown[dom].financialRiskEUR += imp.financialRiskEUR;
            domainBreakdown[dom].downtimeHours += imp.estimatedDowntimeHours;

            if (severityOrder.indexOf(imp.customerImpactSeverity) > severityOrder.indexOf(worstCustomerImpact)) {
                worstCustomerImpact = imp.customerImpactSeverity;
            }
        }

        // Deduplicate customer impact cap at totalCustomerBase
        const maxImpactedCustomers = Math.min(totalImpactedCustomers, config.totalCustomerBase);
        const aggregateImpactedPercentage = Number(((maxImpactedCustomers / config.totalCustomerBase) * 100).toFixed(2));

        return {
            totalFindingsEvaluated: evaluatedFindings.length,
            totalFinancialRiskEUR,
            totalFinancialRiskUSD,
            formattedTotalFinancialRiskEUR: this.formatCurrency(totalFinancialRiskEUR, 'EUR'),
            formattedTotalFinancialRiskUSD: this.formatCurrency(totalFinancialRiskUSD, 'USD'),
            totalEstimatedDowntimeHours: Number(totalDowntimeHours.toFixed(1)),
            totalDowntimeHours: Number(totalDowntimeHours.toFixed(1)),
            totalRevenueImpact: {
                eur: totalRevenueImpactEUR,
                usd: totalRevenueImpactUSD,
                formattedEUR: this.formatCurrency(totalRevenueImpactEUR, 'EUR'),
                formattedUSD: this.formatCurrency(totalRevenueImpactUSD, 'USD')
            },
            customerImpactSummary: {
                worstSeverity: worstCustomerImpact,
                estimatedImpactedCustomers: maxImpactedCustomers,
                impactedPercentage: aggregateImpactedPercentage
            },
            severityBreakdown,
            domainBreakdown,
            evaluatedFindings
        };
    }

    /**
     * Formats a monetary amount into a clean currency string.
     * @param {number} amount Amount to format
     * @param {string} currency 'EUR' or 'USD'
     * @returns {string} Formatted currency string (e.g. "€125,000" or "$125,000")
     */
    formatCurrency(amount, currency = 'EUR') {
        const symbol = currency === 'EUR' ? '€' : '$';
        const formattedNumber = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `${symbol}${formattedNumber}`;
    }

    // --- Private Helper Methods ---

    _normalizeFinding(finding) {
        if (typeof finding === 'string') {
            return {
                id: `FIND-${Math.floor(Math.random() * 8999 + 1000)}`,
                title: finding,
                severity: 'MEDIUM',
                domain: 'Architecture',
                resourceType: 'Resource',
                blastRadius: 'LOCAL'
            };
        }

        return {
            id: finding.id || finding.findingId || `FIND-${Math.floor(Math.random() * 8999 + 1000)}`,
            title: finding.title || finding.description || finding.name || 'Unnamed Finding',
            severity: finding.severity || finding.level || 'MEDIUM',
            domain: finding.domain || finding.category || 'Architecture',
            resourceType: finding.resourceType || finding.resource || 'Resource',
            blastRadius: finding.blastRadius || finding.scope || 'LOCAL'
        };
    }

    _calculateDowntimeHours(severity, domain, blastRadius) {
        const severityBaseHours = {
            CRITICAL: 24,
            HIGH: 8,
            MEDIUM: 2,
            LOW: 0.5,
            INFORMATIONAL: 0
        };

        const domainMultipliers = {
            INFRASTRUCTURE: 1.8,
            SECURITY: 1.5,
            ARCHITECTURE: 1.2,
            CODE: 1.0,
            TESTING: 0.5,
            DOCUMENTATION: 0.1
        };

        const blastMultipliers = {
            GLOBAL: 2.0,
            REGIONAL: 1.4,
            LOCAL: 1.0,
            ISOLATED: 0.5
        };

        const base = severityBaseHours[severity] !== undefined ? severityBaseHours[severity] : 2;
        const domMult = domainMultipliers[domain] || 1.0;
        const blastMult = blastMultipliers[blastRadius] || 1.0;

        return Number((base * domMult * blastMult).toFixed(1));
    }

    _calculateFinancialRisk(severity, domain, blastRadius, revenueImpactEUR) {
        const baseRiskBySeverityEUR = {
            CRITICAL: 150000,
            HIGH: 45000,
            MEDIUM: 10000,
            LOW: 2500,
            INFORMATIONAL: 0
        };

        const baseEUR = baseRiskBySeverityEUR[severity] !== undefined ? baseRiskBySeverityEUR[severity] : 10000;
        
        let regulatoryEUR = 0;
        if (domain === 'SECURITY' && (severity === 'CRITICAL' || severity === 'HIGH')) {
            regulatoryEUR = severity === 'CRITICAL' ? 250000 : 75000;
        }

        let slaPenaltyEUR = Math.round(revenueImpactEUR * 0.25);
        let remediationEUR = severity === 'CRITICAL' ? 15000 : (severity === 'HIGH' ? 6000 : 2000);

        const totalRiskEUR = Math.round(baseEUR + revenueImpactEUR + regulatoryEUR + slaPenaltyEUR + remediationEUR);
        const totalRiskUSD = Math.round(totalRiskEUR / this.options.usdToEurRate);

        return {
            eur: totalRiskEUR,
            usd: totalRiskUSD,
            regulatoryEUR,
            slaPenaltyEUR,
            remediationEUR
        };
    }

    _calculateCustomerImpact(severity, blastRadius, totalCustomerBase) {
        let percentage = 0;

        if (blastRadius === 'GLOBAL') {
            percentage = severity === 'CRITICAL' ? 85 : (severity === 'HIGH' ? 50 : 25);
        } else if (blastRadius === 'REGIONAL') {
            percentage = severity === 'CRITICAL' ? 40 : (severity === 'HIGH' ? 20 : 10);
        } else {
            percentage = severity === 'CRITICAL' ? 15 : (severity === 'HIGH' ? 5 : 1);
        }

        const impactedCount = Math.round((percentage / 100) * totalCustomerBase);

        let customerSeverity = 'NEGLIGIBLE';
        if (percentage >= 50) customerSeverity = 'EXTREME';
        else if (percentage >= 20) customerSeverity = 'HIGH';
        else if (percentage >= 5) customerSeverity = 'MODERATE';
        else if (percentage > 0) customerSeverity = 'LOW';

        return {
            severity: customerSeverity,
            impactedCount,
            impactedPercentage: percentage
        };
    }

    _determineOverallRiskLevel(financialRiskEUR, downtimeHours) {
        if (financialRiskEUR >= 250000 || downtimeHours >= 24) return 'CRITICAL';
        if (financialRiskEUR >= 75000 || downtimeHours >= 8) return 'HIGH';
        if (financialRiskEUR >= 15000 || downtimeHours >= 2) return 'MEDIUM';
        return 'LOW';
    }
}

module.exports = BusinessImpactEngine;
