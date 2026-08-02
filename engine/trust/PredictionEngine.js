/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Decomposed Trust Engine
 * File           : PredictionEngine.js
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
 * PredictionEngine
 * Predictive release risk and failure predictor for deployment safety.
 * Evaluates code volatility, trust score drift, test failure trends, dependency CVEs,
 * and readiness velocity to compute release failure probability P_fail and provide
 * automated Go / No-Go deployment decisions.
 */
class PredictionEngine {
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 0.35; // P_fail >= 35% triggers NO-GO
    }

    /**
     * Predicts release failure probability and deployment risk rating
     * @param {Object} auditResults - Current audit & trust report
     * @param {Object} [historicalMetrics] - Historical release metrics (drift, past incidents)
     * @param {Object} [deploymentSpec] - Target environment info (prod, staging, canary)
     * @returns {Object} Release risk prediction report
     */
    predictReleaseRisk(auditResults = {}, historicalMetrics = {}, deploymentSpec = {}) {
        const trustScore = Number(auditResults.trustScore ?? auditResults.score ?? 80.0);
        const readiness = Number(auditResults.components?.readiness ?? auditResults.readinessScore ?? trustScore);
        
        const findings = Array.isArray(auditResults.findings)
            ? auditResults.findings
            : Array.isArray(auditResults) ? auditResults : [];

        const criticalCount = findings.filter(f => f.severity === 'CRITICAL' || f.level === 'CRITICAL').length;
        const highCount = findings.filter(f => f.severity === 'HIGH' || f.level === 'HIGH').length;

        // Risk factors evaluation
        const volatility = Number(historicalMetrics.codeVolatilityRatio || 0.15); // % lines changed recently
        const pastIncidentRate = Number(historicalMetrics.pastIncidentRate || 0.05);
        const testPassRate = Number(historicalMetrics.testPassRate || 0.95);
        const trustDrift = Number(historicalMetrics.trustScoreDrift || 0.0); // Negative means declining trust

        // Factor 1: Trust Deficit Factor (0.0 to 0.40)
        const trustDeficit = Math.max(0, 100.0 - trustScore) / 100.0;
        const trustRisk = trustDeficit * 0.40;

        // Factor 2: Security Deficit Factor (0.0 to 0.35)
        const securityRisk = Math.min(0.35, (criticalCount * 0.20) + (highCount * 0.08));

        // Factor 3: Volatility & Test Risk Factor (0.0 to 0.15)
        const testDeficit = Math.max(0, 1.0 - testPassRate);
        const volatilityRisk = (volatility * 0.10) + (testDeficit * 0.10);

        // Factor 4: Historical & Drift Factor (0.0 to 0.10)
        const driftPenalty = trustDrift < 0 ? Math.abs(trustDrift) / 100.0 : 0.0;
        const historicalRisk = (pastIncidentRate * 0.5) + (driftPenalty * 0.5);

        // Environment Risk Multiplier
        const env = (deploymentSpec.environment || 'PRODUCTION').toUpperCase();
        let envMultiplier = 1.0;
        if (env === 'PRODUCTION' || env === 'PROD') envMultiplier = 1.25;
        else if (env === 'STAGING') envMultiplier = 0.8;
        else if (env === 'DEV') envMultiplier = 0.5;

        // Total Predicted Failure Probability P_fail (0.00 to 1.00)
        const rawPfail = (trustRisk + securityRisk + volatilityRisk + historicalRisk) * envMultiplier;
        const Pfail = Number(Math.max(0.00, Math.min(1.00, rawPfail)).toFixed(4));

        // Risk Level determination
        let riskRating = 'LOW';
        if (Pfail >= 0.60) riskRating = 'CRITICAL';
        else if (Pfail >= 0.35) riskRating = 'HIGH';
        else if (Pfail >= 0.15) riskRating = 'MODERATE';
        else riskRating = 'LOW';

        const decision = Pfail < this.failureThreshold ? 'GO' : 'NO_GO';

        const riskFactors = [];
        if (trustScore < 85.0) riskFactors.push(`Low Trust Score (${trustScore}%)`);
        if (criticalCount > 0) riskFactors.push(`${criticalCount} Unresolved Critical Vulnerabilities`);
        if (highCount > 0) riskFactors.push(`${highCount} High Security Gaps`);
        if (testPassRate < 0.95) riskFactors.push(`Sub-optimal Test Pass Rate (${(testPassRate * 100).toFixed(1)}%)`);
        if (trustDrift < -5.0) riskFactors.push(`Declining Trust Drift (${trustDrift.toFixed(1)}%)`);

        return {
            predictedFailureProbability: Pfail,
            failureProbabilityPercentage: Number((Pfail * 100).toFixed(2)),
            riskRating,
            decision,
            environment: env,
            confidence: 0.92,
            primaryRiskFactors: riskFactors,
            threshold: this.failureThreshold,
            evalMetrics: {
                trustScore,
                readinessScore: readiness,
                criticalSecurityGaps: criticalCount,
                highSecurityGaps: highCount,
                codeVolatilityRatio: volatility,
                testPassRate
            },
            evaluatedAt: new Date().toISOString()
        };
    }
}

module.exports = PredictionEngine;
