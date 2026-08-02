/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Governance Platform — Stream 3: Technical Debt Engine
 * File           : TechnicalDebtEngine.js
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
 * TechnicalDebtEngine
 * Computes technical debt breakdown across 6 governance domains (Architecture, Code,
 * Security, Documentation, Testing, Infrastructure) and computes overall technical debt percentage using domain-agnostic resource terminology.
 */
class TechnicalDebtEngine {
    /**
     * @param {Object} [options] Configuration options
     * @param {number} [options.baselineProjectHours=2500] Baseline project build effort in engineering hours
     * @param {number} [options.engineeringHourlyRateUSD=125] Average engineering cost rate USD
     * @param {number} [options.engineeringHourlyRateEUR=115] Average engineering cost rate EUR
     */
    constructor(options = {}) {
        this.options = {
            baselineProjectHours: options.baselineProjectHours || 2500,
            engineeringHourlyRateUSD: options.engineeringHourlyRateUSD || 125,
            engineeringHourlyRateEUR: options.engineeringHourlyRateEUR || 115,
            ...options
        };

        this.SUPPORTED_DOMAINS = [
            'Architecture',
            'Code',
            'Security',
            'Documentation',
            'Testing',
            'Infrastructure'
        ];
    }

    /**
     * Analyzes input audit findings or metric snapshots and computes technical debt metrics using domain-agnostic resource terminology.
     * @param {Array<Object>|Object} input Audit findings list or metric snapshot object
     * @param {Object} [options] Calculation override options
     * @returns {Object} Technical debt analysis report
     */
    analyzeTechnicalDebt(input = [], options = {}) {
        const config = { ...this.options, ...options };
        const findings = this._extractFindingsList(input);

        // Initialize 6 domains
        const domainData = {};
        for (const dom of this.SUPPORTED_DOMAINS) {
            domainData[dom] = {
                domain: dom,
                findingCount: 0,
                remediationHours: 0,
                severityBreakdown: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFORMATIONAL: 0 },
                remediationCostEUR: 0,
                remediationCostUSD: 0,
                debtRatioPercent: 0,
                healthGrade: 'A',
                findings: []
            };
        }

        let totalRemediationHours = 0;
        let unmappedFindingsCount = 0;

        // Process findings into domain buckets
        for (const finding of findings) {
            const dom = this._canonicalizeDomain(finding.domain || finding.category);
            const severity = (finding.severity || finding.level || 'MEDIUM').toUpperCase();
            const hours = this._estimateRemediationHours(severity, dom, finding.effortHours);

            totalRemediationHours += hours;

            if (domainData[dom]) {
                domainData[dom].findingCount++;
                domainData[dom].remediationHours += hours;
                const sevKey = severity in domainData[dom].severityBreakdown ? severity : 'MEDIUM';
                domainData[dom].severityBreakdown[sevKey]++;
                domainData[dom].findings.push({
                    id: finding.id || `TD-${Math.floor(Math.random() * 8999 + 1000)}`,
                    title: finding.title || finding.name || 'Technical Debt Item',
                    severity: severity,
                    domain: dom,
                    resourceType: finding.resourceType || finding.resource || 'Resource',
                    remediationHours: hours
                });
            } else {
                unmappedFindingsCount++;
            }
        }

        // Calculate domain debt ratios and grades
        const domainBaselineHours = config.baselineProjectHours / this.SUPPORTED_DOMAINS.length;

        for (const dom of this.SUPPORTED_DOMAINS) {
            const domObj = domainData[dom];
            domObj.remediationHours = Number(domObj.remediationHours.toFixed(1));
            domObj.remediationCostEUR = Math.round(domObj.remediationHours * config.engineeringHourlyRateEUR);
            domObj.remediationCostUSD = Math.round(domObj.remediationHours * config.engineeringHourlyRateUSD);
            
            // Domain debt ratio = (Domain Remediation Hours / Domain Baseline Hours) * 100
            domObj.debtRatioPercent = Number(((domObj.remediationHours / domainBaselineHours) * 100).toFixed(2));
            domObj.healthGrade = this.calculateHealthGrade(domObj.debtRatioPercent, domObj.severityBreakdown.CRITICAL);
            domObj.recommendations = this._generateDomainRecommendations(dom, domObj);
        }

        // Calculate Overall Technical Debt Percentage (TDR = Total Remediation Hours / Baseline Project Hours * 100)
        const overallDebtPercentage = Number(((totalRemediationHours / config.baselineProjectHours) * 100).toFixed(2));
        const overallGrade = this.calculateHealthGrade(overallDebtPercentage, this._countTotalCritical(domainData));

        const totalCostEUR = Math.round(totalRemediationHours * config.engineeringHourlyRateEUR);
        const totalCostUSD = Math.round(totalRemediationHours * config.engineeringHourlyRateUSD);

        return {
            overallTechnicalDebtPercentage: overallDebtPercentage,
            overallHealthGrade: overallGrade,
            totalRemediationHours: Number(totalRemediationHours.toFixed(1)),
            totalRemediationCostEUR: totalCostEUR,
            totalRemediationCostUSD: totalCostUSD,
            formattedTotalRemediationCostEUR: `€${totalCostEUR.toLocaleString()}`,
            formattedTotalRemediationCostUSD: `$${totalCostUSD.toLocaleString()}`,
            baselineProjectHours: config.baselineProjectHours,
            totalFindingsAnalyzed: findings.length,
            unmappedFindingsCount,
            domains: domainData,
            executiveSummary: this._buildExecutiveSummary(overallDebtPercentage, overallGrade, domainData)
        };
    }

    /**
     * Calculates letter grade for technical debt ratio.
     * @param {number} debtPercentage Debt percentage (0-100+)
     * @param {number} [criticalCount=0] Number of unresolved critical findings
     * @returns {string} Grade 'A' | 'B' | 'C' | 'D' | 'F'
     */
    calculateHealthGrade(debtPercentage, criticalCount = 0) {
        if (criticalCount > 3 || debtPercentage >= 35) return 'F';
        if (criticalCount > 0 || debtPercentage >= 20) return 'D';
        if (debtPercentage >= 10) return 'C';
        if (debtPercentage >= 5) return 'B';
        return 'A';
    }

    // --- Private Helper Methods ---

    _extractFindingsList(input) {
        if (Array.isArray(input)) return input;
        if (input && Array.isArray(input.findings)) return input.findings;
        if (input && Array.isArray(input.evaluatedFindings)) return input.evaluatedFindings;
        if (input && typeof input === 'object') return [input];
        return [];
    }

    _canonicalizeDomain(domainStr) {
        if (!domainStr) return 'Code';
        const str = String(domainStr).trim().toLowerCase();
        
        if (str.includes('arch')) return 'Architecture';
        if (str.includes('sec')) return 'Security';
        if (str.includes('doc')) return 'Documentation';
        if (str.includes('test') || str.includes('qa')) return 'Testing';
        if (str.includes('infra') || str.includes('ops') || str.includes('deploy')) return 'Infrastructure';
        return 'Code';
    }

    _estimateRemediationHours(severity, domain, customHours) {
        if (typeof customHours === 'number' && customHours > 0) return customHours;

        const baseHoursBySeverity = {
            CRITICAL: 40,
            HIGH: 16,
            MEDIUM: 6,
            LOW: 2,
            INFORMATIONAL: 0.5
        };

        const domainMultipliers = {
            Architecture: 1.5,
            Infrastructure: 1.3,
            Security: 1.2,
            Testing: 1.0,
            Code: 0.9,
            Documentation: 0.5
        };

        const base = baseHoursBySeverity[severity] !== undefined ? baseHoursBySeverity[severity] : 6;
        const domMult = domainMultipliers[domain] || 1.0;

        return Number((base * domMult).toFixed(1));
    }

    _countTotalCritical(domainData) {
        let count = 0;
        for (const dom of Object.values(domainData)) {
            count += dom.severityBreakdown.CRITICAL || 0;
        }
        return count;
    }

    _generateDomainRecommendations(domain, domainObj) {
        const recs = [];
        if (domainObj.severityBreakdown.CRITICAL > 0) {
            recs.push(`Immediate resolution required for ${domainObj.severityBreakdown.CRITICAL} critical ${domain.toLowerCase()} finding(s).`);
        }
        if (domainObj.debtRatioPercent > 15) {
            recs.push(`High debt accumulation in ${domain} (${domainObj.debtRatioPercent}%). Allocate refactoring sprint.`);
        }
        if (domain === 'Security' && domainObj.findingCount > 0) {
            recs.push('Enforce Security Office Zero-Trust protocol checks and static application security testing (SAST).');
        }
        if (domain === 'Testing' && domainObj.findingCount > 0) {
            recs.push('Increase unit & integration test coverage to enforce frozen contract stability.');
        }
        if (recs.length === 0) {
            recs.push(`${domain} domain is in healthy state (Grade ${domainObj.healthGrade}). Maintain current governance standards.`);
        }
        return recs;
    }

    _buildExecutiveSummary(debtPercentage, grade, domainData) {
        let status = 'HEALTHY';
        if (grade === 'F' || grade === 'D') status = 'REQUIRES_IMMEDIATE_ACTION';
        else if (grade === 'C') status = 'NEEDS_ATTENTION';

        const highestDebtDomain = Object.values(domainData)
            .sort((a, b) => b.remediationHours - a.remediationHours)[0];

        return {
            status,
            overallDebtPercentage: debtPercentage,
            overallGrade: grade,
            primaryRiskDomain: highestDebtDomain ? highestDebtDomain.domain : 'None',
            summaryMessage: `Overall technical debt ratio is ${debtPercentage}% (Grade ${grade}). Primary debt driver is ${highestDebtDomain ? highestDebtDomain.domain : 'N/A'}.`
        };
    }
}

module.exports = TechnicalDebtEngine;
