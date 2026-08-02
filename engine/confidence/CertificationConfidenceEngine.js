/******************************************************************************
 * Project        : Universal Autonomous Engineering System (EAORCS)
 * Module         : Epistemic Confidence Engine
 * File           : CertificationConfidenceEngine.js
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
 * CertificationConfidenceEngine
 * Mathematical specification verification score combining test coverage,
 * traceability depth, and proof validation graph attestations.
 */
class CertificationConfidenceEngine {
    constructor(options = {}) {
        this.options = options;
        this.currentScore = 0;
        this.lastResult = null;
    }

    /**
     * Computes the mathematical certification confidence score.
     * @param {Object} [traceabilityResults] - Specification traceability metrics
     * @param {Object|Array} [evidenceGraph] - Verified evidence graph and cryptographic proofs
     * @returns {Object} Confidence evaluation including score and breakdown
     */
    computeCertificationConfidence(traceabilityResults = {}, evidenceGraph = {}) {
        const testCoverage = this._evaluateTestCoverage(traceabilityResults, evidenceGraph);
        const traceabilityDepth = this._evaluateTraceabilityDepth(traceabilityResults);
        const proofValidation = this._evaluateProofValidation(evidenceGraph);

        const score = Math.round(
            (testCoverage * 0.35) +
            (traceabilityDepth * 0.35) +
            (proofValidation * 0.30)
        );

        this.currentScore = Math.min(100, Math.max(0, score));
        this.lastResult = {
            score: this.currentScore,
            breakdown: {
                testCoverage,
                traceabilityDepth,
                proofValidation
            },
            timestamp: new Date().toISOString()
        };

        return this.lastResult;
    }

    /**
     * Returns the computed certification confidence score (0-100).
     * @returns {number} Confidence score
     */
    getConfidenceScore() {
        return this.currentScore;
    }

    /**
     * Evaluates test coverage score (0-100).
     * @private
     */
    _evaluateTestCoverage(traceability, evidence) {
        if (typeof traceability.coverageRatio === 'number') {
            return Math.min(100, Math.max(0, Math.round(traceability.coverageRatio * 100)));
        }
        if (typeof traceability.coveredRequirements === 'number' && typeof traceability.totalRequirements === 'number') {
            if (traceability.totalRequirements === 0) return 100;
            return Math.min(100, Math.max(0, Math.round((traceability.coveredRequirements / traceability.totalRequirements) * 100)));
        }
        if (Array.isArray(evidence.tests)) {
            const passed = evidence.tests.filter(t => t.status === 'passed' || t.passed === true).length;
            if (evidence.tests.length === 0) return 0;
            return Math.min(100, Math.max(0, Math.round((passed / evidence.tests.length) * 100)));
        }
        return 75; // Default baseline if unspecified
    }

    /**
     * Evaluates traceability depth score (0-100).
     * @private
     */
    _evaluateTraceabilityDepth(traceability) {
        if (typeof traceability.depthScore === 'number') {
            return Math.min(100, Math.max(0, Math.round(traceability.depthScore)));
        }
        const depth = typeof traceability.linkDepth === 'number' ? traceability.linkDepth : 3;
        const orphaned = typeof traceability.orphanedCount === 'number' ? traceability.orphanedCount : 0;

        let depthScore = Math.min(100, depth * 25);
        depthScore -= orphaned * 10;

        return Math.min(100, Math.max(0, Math.round(depthScore)));
    }

    /**
     * Evaluates proof validation graph attestations (0-100).
     * @private
     */
    _evaluateProofValidation(evidence) {
        if (typeof evidence.proofScore === 'number') {
            return Math.min(100, Math.max(0, Math.round(evidence.proofScore)));
        }
        
        let proofs = [];
        if (Array.isArray(evidence.proofs)) {
            proofs = evidence.proofs;
        } else if (Array.isArray(evidence.nodes)) {
            proofs = evidence.nodes.filter(n => n.type === 'proof' || n.proofVerified !== undefined);
        }

        if (proofs.length === 0) {
            return evidence.verified === true ? 100 : 80;
        }

        const validCount = proofs.filter(p => p.valid === true || p.verified === true || p.status === 'VALID').length;
        return Math.min(100, Math.max(0, Math.round((validCount / proofs.length) * 100)));
    }
}

module.exports = {
    CertificationConfidenceEngine
};
