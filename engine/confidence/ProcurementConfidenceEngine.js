/******************************************************************************
 * Project        : Universal Autonomous Engineering System (EAORCS)
 * Module         : Epistemic Confidence Engine
 * File           : ProcurementConfidenceEngine.js
 * Version        : 1.0.0
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Platform
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
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
 * Copyright (c) 2026 Ujomor Platform. All Rights Reserved.
 ******************************************************************************/

'use strict';

/**
 * ProcurementConfidenceEngine
 * Generates executive & procurement confidence index for enterprise and government buyers.
 */
class ProcurementConfidenceEngine {
    constructor(options = {}) {
        this.options = options;
        this.currentIndex = null;
    }

    /**
     * Generates composite Procurement Confidence Index (PCI).
     * @param {number|Object} specScore - Blueprint spec confidence score or object
     * @param {number|Object} certScore - Certification confidence score or object
     * @param {number|Object} opsScore - Operational confidence score or object
     * @returns {Object} Procurement confidence index result
     */
    generateProcurementIndex(specScore, certScore, opsScore) {
        const spec = this._extractScore(specScore);
        const cert = this._extractScore(certScore);
        const ops = this._extractScore(opsScore);

        const compositeScore = Math.round(
            (spec * 0.30) +
            (cert * 0.40) +
            (ops * 0.30)
        );

        const finalScore = Math.min(100, Math.max(0, compositeScore));
        const tier = this._determineTier(finalScore);
        const riskLevel = this._determineRiskLevel(finalScore);

        this.currentIndex = {
            procurementIndex: finalScore,
            score: finalScore,
            tier,
            riskLevel,
            breakdown: {
                specScore: spec,
                certScore: cert,
                opsScore: ops
            },
            timestamp: new Date().toISOString()
        };

        return this.currentIndex;
    }

    /**
     * Retrieves structured executive summary report.
     * @returns {Object} Executive summary report
     */
    getExecutiveSummary() {
        if (!this.currentIndex) {
            return {
                status: 'NOT_EVALUATED',
                message: 'No procurement index has been generated yet.'
            };
        }

        const idx = this.currentIndex;
        return {
            title: 'EAORCS Executive Procurement & Governance Confidence Report',
            procurementIndex: idx.procurementIndex,
            tier: idx.tier,
            riskLevel: idx.riskLevel,
            readiness: idx.procurementIndex >= 70 ? 'ACQUISITION_APPROVED' : 'REMEDIATION_REQUIRED',
            scoreBreakdown: idx.breakdown,
            recommendation: this._generateRecommendation(idx),
            timestamp: idx.timestamp
        };
    }

    /**
     * Extracts numeric score from number or object.
     * @private
     */
    _extractScore(val) {
        if (typeof val === 'number') return Math.min(100, Math.max(0, val));
        if (typeof val === 'object' && val !== null) {
            if (typeof val.score === 'number') return Math.min(100, Math.max(0, val.score));
            if (typeof val.procurementIndex === 'number') return Math.min(100, Math.max(0, val.procurementIndex));
        }
        return 75; // Default fallback
    }

    /**
     * Determines rating tier based on PCI score.
     * @private
     */
    _determineTier(score) {
        if (score >= 90) return 'AAA - Sovereign Government Grade';
        if (score >= 80) return 'AA - Enterprise Mission-Critical';
        if (score >= 70) return 'A - Production Ready';
        if (score >= 50) return 'B - Standard Commercial';
        return 'C - High Risk / Experimental';
    }

    /**
     * Determines risk level based on PCI score.
     * @private
     */
    _determineRiskLevel(score) {
        if (score >= 85) return 'LOW';
        if (score >= 70) return 'MODERATE';
        if (score >= 50) return 'ELEVATED';
        return 'CRITICAL';
    }

    /**
     * Generates executive recommendation string.
     * @private
     */
    _generateRecommendation(idx) {
        if (idx.procurementIndex >= 90) {
            return 'Full commercial and government procurement clearance granted. Meets sovereign security and compliance criteria.';
        }
        if (idx.procurementIndex >= 70) {
            return 'Approved for enterprise deployment. Recommended for standard production workloads.';
        }
        return 'Remediation required before formal enterprise procurement approval.';
    }
}

module.exports = {
    ProcurementConfidenceEngine
};
