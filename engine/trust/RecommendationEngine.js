/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Decomposed Trust Engine
 * File           : RecommendationEngine.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Authority & Systems Engineering
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
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

/**
 * RecommendationEngine
 * Prescriptive remediation engine with financial ROI calculations.
 * Analyzes findings across 15 assurance domains, estimates engineering effort (hours),
 * risk financial exposure ($), remediation cost ($), risk reduction value ($),
 * and financial ROI percentage:
 *
 * ROI (%) = ((Risk Reduction Value - Remediation Cost) / Remediation Cost) * 100
 */
class RecommendationEngine {
    constructor(options = {}) {
        this.hourlyEngineeringRate = options.hourlyRate || 150.0; // $150/hr default enterprise developer rate
    }

    /**
     * Generates prioritized prescriptive remediation recommendations with financial ROI
     * @param {Object} auditResults - Audit result containing findings or domain gaps
     * @param {Object} [options] - Additional parameters (hourlyRate, riskMultiplier)
     * @returns {Object} Remediation report with financial ROI analysis
     */
    generateRecommendations(auditResults = {}, options = {}) {
        const rate = Number(options.hourlyRate || this.hourlyEngineeringRate);
        const findings = Array.isArray(auditResults.findings)
            ? auditResults.findings
            : Array.isArray(auditResults) ? auditResults : [];

        const recommendations = [];
        let totalCost = 0;
        let totalRiskReduction = 0;
        let totalHours = 0;

        findings.forEach((finding, idx) => {
            if (finding.status === 'PASSED' || finding.passed === true) return;

            const severity = (finding.severity || finding.level || 'MEDIUM').toUpperCase();
            const domain = finding.domain || finding.category || 'GENERAL';

            // Estimate effort hours & financial exposure based on severity
            let effortHours = 4;
            let financialExposure = 10000;
            let effectiveness = 0.90; // 90% risk reduction upon fix

            if (severity === 'CRITICAL') {
                effortHours = 16;
                financialExposure = 120000; // Potential breach/outage cost
                effectiveness = 0.95;
            } else if (severity === 'HIGH') {
                effortHours = 8;
                financialExposure = 45000;
                effectiveness = 0.90;
            } else if (severity === 'MEDIUM') {
                effortHours = 4;
                financialExposure = 12000;
                effectiveness = 0.85;
            } else if (severity === 'LOW') {
                effortHours = 2;
                financialExposure = 3000;
                effectiveness = 0.80;
            }

            const remediationCost = effortHours * rate;
            const riskReductionValue = financialExposure * effectiveness;
            const netSavings = Math.max(0, riskReductionValue - remediationCost);

            const roiPercentage = remediationCost > 0
                ? Number((((riskReductionValue - remediationCost) / remediationCost) * 100).toFixed(2))
                : 0.0;

            const rec = {
                id: finding.id || `REC-${domain}-${idx + 1}`,
                title: finding.title || finding.message || `Remediate ${severity} gap in ${domain}`,
                domain,
                severity,
                prescriptiveSteps: finding.remediationSteps || [
                    `Audit and patch failing control in ${domain}`,
                    `Enforce governance validation rule in build pipeline`,
                    `Verify fix with EAORCS engine audit`
                ],
                financials: {
                    effortHours,
                    hourlyRate: rate,
                    remediationCost,
                    estimatedFinancialExposure: financialExposure,
                    riskReductionValue,
                    netSavings,
                    roiPercentage
                }
            };

            recommendations.push(rec);

            totalHours += effortHours;
            totalCost += remediationCost;
            totalRiskReduction += riskReductionValue;
        });

        // Sort recommendations by highest ROI percentage descending
        recommendations.sort((a, b) => b.financials.roiPercentage - a.financials.roiPercentage);

        const netPortfolioSavings = Math.max(0, totalRiskReduction - totalCost);
        const overallROI = totalCost > 0
            ? Number((((totalRiskReduction - totalCost) / totalCost) * 100).toFixed(2))
            : 0.0;

        return {
            recommendationsCount: recommendations.length,
            summary: {
                totalEffortHours: totalHours,
                hourlyRate: rate,
                totalRemediationCost: totalCost,
                totalRiskReductionValue: totalRiskReduction,
                netPortfolioSavings,
                overallROI
            },
            recommendations,
            generatedAt: new Date().toISOString()
        };
    }
}

module.exports = RecommendationEngine;
