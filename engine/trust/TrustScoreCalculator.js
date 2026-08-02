/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Decomposed Trust Engine
 * File           : TrustScoreCalculator.js
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
 * TrustScoreCalculator
 * Computes deterministic Trust Score based on:
 * - Readiness Score (R): Aggregate domain readiness (0-100)
 * - Evidence Confidence (Cev): Hashing, attestation depth & source verification (0.0 - 1.0)
 * - Statistical Confidence (Cconf): Sample size, variance & margins of error (0.0 - 1.0)
 *
 * Trust Formula:
 * T = R * (w_r + w_ev * Cev + w_conf * Cconf) - Penalties
 * Normalized to 0.00 - 100.00 scale.
 */
class TrustScoreCalculator {
    constructor(options = {}) {
        this.weights = {
            readiness: options.weights?.readiness ?? 0.50,
            evidence: options.weights?.evidence ?? 0.30,
            confidence: options.weights?.confidence ?? 0.20
        };

        // Normalize weights to sum to 1.0
        const totalWeight = this.weights.readiness + this.weights.evidence + this.weights.confidence;
        this.weights.readiness /= totalWeight;
        this.weights.evidence /= totalWeight;
        this.weights.confidence /= totalWeight;

        this.penaltyFactors = {
            criticalSecurityGap: options.penalties?.criticalSecurityGap ?? 25.0,
            highSecurityGap: options.penalties?.highSecurityGap ?? 10.0,
            unresolvedVulnerability: options.penalties?.unresolvedVulnerability ?? 5.0,
            complianceViolation: options.penalties?.complianceViolation ?? 15.0,
            decayPenalty: options.penalties?.decayPenalty ?? 2.0
        };
    }

    /**
     * Compute Trust Score from component inputs or graph outputs
     * @param {Object} params
     * @param {number} [params.readiness] - Aggregate readiness score (0-100)
     * @param {number} [params.evidenceConfidence] - Evidence confidence factor (0.0-1.0)
     * @param {number} [params.statisticalConfidence] - Statistical confidence factor (0.0-1.0)
     * @param {Object} [params.domainScores] - Individual domain scores dictionary
     * @param {Array} [params.findings] - List of audit findings/gaps
     * @param {number} [params.decayDays] - Days elapsed since last attestation
     * @param {Object} [params.graph] - TrustFabricGraph instance (optional)
     * @returns {Object} Trust calculation report
     */
    calculateTrustScore(params = {}) {
        let readinessInput = params.readiness ?? params.readinessScore;
        let evidenceConfidenceInput = params.evidenceConfidence ?? (params.evidenceScore !== undefined ? (params.evidenceScore > 1 ? params.evidenceScore / 100 : params.evidenceScore) : undefined);
        let statisticalConfidenceInput = params.statisticalConfidence ?? (params.confidenceScore !== undefined ? (params.confidenceScore > 1 ? params.confidenceScore / 100 : params.confidenceScore) : undefined);

        // Optional integration with TrustFabricGraph
        if (params.graph && typeof params.graph.computeGraphTrustScore === 'function') {
            const graphScore = params.graph.computeGraphTrustScore();
            if (readinessInput === undefined) readinessInput = graphScore.compositeTrustScore;
        }

        const R = Math.max(0, Math.min(100, Number(readinessInput ?? 95.0)));
        const Cev = Math.max(0, Math.min(1.0, Number(evidenceConfidenceInput ?? 1.0)));
        const Cconf = Math.max(0, Math.min(1.0, Number(statisticalConfidenceInput ?? 1.0)));

        const wR = this.weights.readiness;
        const wEv = this.weights.evidence;
        const wConf = this.weights.confidence;

        // Base Trust Component Calculation
        const confidenceMultiplier = (wR + wEv * Cev + wConf * Cconf);
        let baseTrustScore = R * confidenceMultiplier;

        // Calculate Penalties
        const findings = Array.isArray(params.findings) ? params.findings : [];
        let penaltyTotal = 0;
        const penaltyBreakdown = [];

        const criticalCount = params.criticalFailures !== undefined
            ? params.criticalFailures
            : findings.filter(f => (f.severity === 'CRITICAL' || f.level === 'CRITICAL') && f.status !== 'RESOLVED' && f.status !== 'PASSED').length;
        if (criticalCount > 0) {
            const p = criticalCount * this.penaltyFactors.criticalSecurityGap;
            penaltyTotal += p;
            penaltyBreakdown.push({ factor: 'CRITICAL_SECURITY_GAPS', count: criticalCount, penalty: p });
        }

        const highCount = findings.filter(f => (f.severity === 'HIGH' || f.level === 'HIGH') && f.status !== 'RESOLVED' && f.status !== 'PASSED' && params.criticalFailures !== 0).length;
        if (highCount > 0) {
            const p = highCount * this.penaltyFactors.highSecurityGap;
            penaltyTotal += p;
            penaltyBreakdown.push({ factor: 'HIGH_SECURITY_GAPS', count: highCount, penalty: p });
        }

        const complianceViolations = findings.filter(f => f.category === 'COMPLIANCE' && f.status === 'FAILED').length;
        if (complianceViolations > 0) {
            const p = complianceViolations * this.penaltyFactors.complianceViolation;
            penaltyTotal += p;
            penaltyBreakdown.push({ factor: 'COMPLIANCE_VIOLATIONS', count: complianceViolations, penalty: p });
        }

        // Apply decay if attestation is aged
        const decayDays = Number(params.decayDays || 0);
        if (decayDays > 7) {
            const p = Math.min(20, (decayDays - 7) * this.penaltyFactors.decayPenalty);
            penaltyTotal += p;
            penaltyBreakdown.push({ factor: 'ATTESTATION_DECAY', decayDays, penalty: p });
        }

        // Final Trust Score
        const finalTrustScore = Math.max(0, Math.min(100, Number((baseTrustScore - penaltyTotal).toFixed(2))));

        // Determine Trust Tier
        let tier = 'BRONZE';
        if (finalTrustScore >= 95.0 && criticalCount === 0) {
            tier = 'GOLD';
        } else if (finalTrustScore >= 85.0 && criticalCount === 0) {
            tier = 'SILVER';
        } else if (finalTrustScore >= 70.0) {
            tier = 'BRONZE';
        } else {
            tier = 'UNTRUSTED';
        }

        return {
            trustScore: finalTrustScore,
            baseScore: Number(baseTrustScore.toFixed(2)),
            tier,
            components: {
                readiness: R,
                evidenceConfidence: Cev,
                statisticalConfidence: Cconf,
                confidenceMultiplier: Number(confidenceMultiplier.toFixed(4))
            },
            weights: this.weights,
            penalties: {
                totalPenalty: Number(penaltyTotal.toFixed(2)),
                breakdown: penaltyBreakdown
            },
            domainScores: params.domainScores || {},
            calculatedAt: new Date().toISOString()
        };
    }
}

module.exports = TrustScoreCalculator;
