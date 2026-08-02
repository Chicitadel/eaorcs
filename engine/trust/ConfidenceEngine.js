/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Decomposed Trust Engine
 * File           : ConfidenceEngine.js
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
 * ConfidenceEngine
 * Statistical confidence evaluator for evidence sampling, variance, standard error,
 * confidence intervals, sample freshness, and statistical significance across audit data.
 */
class ConfidenceEngine {
    constructor(options = {}) {
        this.zScore95 = options.zScore || 1.96; // 95% Confidence Level Z-score
        this.minSampleRatio = options.minSampleRatio || 0.10; // Minimum 10% sample population
        this.halfLifeDays = options.halfLifeDays || 30; // Freshness decay half-life
    }

    /**
     * Evaluates statistical confidence for a dataset of evidence metrics or observations
     * @param {Array<Object>} evidenceList - List of evidence objects or data points
     * @param {Object} metadata - Population & sampling context
     * @returns {Object} Statistical confidence evaluation
     */
    evaluateConfidence(evidenceList = [], metadata = {}) {
        const totalPopulation = Number(metadata.totalPopulation || evidenceList.length || 1);
        const sampleSize = evidenceList.length;

        if (sampleSize === 0) {
            return {
                confidenceScore: 0.0,
                marginOfError: 100.0,
                sampleCompleteness: 0.0,
                freshnessScore: 0.0,
                statisticalSignificance: false,
                confidenceInterval: [0.0, 0.0],
                reason: 'No evidence observations submitted'
            };
        }

        // Extract numerical metric values (or pass/fail ratios)
        const values = evidenceList.map(e => {
            if (typeof e.score === 'number') return e.score;
            if (typeof e.passed === 'boolean') return e.passed ? 100 : 0;
            if (typeof e.value === 'number') return e.value;
            return 100; // Default complete attestation
        });

        const mean = values.reduce((sum, v) => sum + v, 0) / sampleSize;

        // Calculate sample variance and standard deviation
        const variance = values.length > 1
            ? values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (sampleSize - 1)
            : 0;
        const stdDev = Math.sqrt(variance);

        // Standard Error & Margin of Error
        const standardError = sampleSize > 0 ? stdDev / Math.sqrt(sampleSize) : 0;

        // Finite Population Correction (FPC) if total population is known
        const fpc = (totalPopulation > sampleSize && totalPopulation > 1)
            ? Math.sqrt((totalPopulation - sampleSize) / (totalPopulation - 1))
            : 1.0;

        const marginOfError = this.zScore95 * standardError * fpc;

        // Confidence interval [lower, upper]
        const lowerCI = Math.max(0, Number((mean - marginOfError).toFixed(2)));
        const upperCI = Math.min(100, Number((mean + marginOfError).toFixed(2)));

        // Completeness factor (sample size vs population)
        const sampleCompleteness = Math.min(1.0, sampleSize / totalPopulation);

        // Calculate sample freshness score
        const now = Date.now();
        const freshnessScores = evidenceList.map(e => {
            const timestamp = e.timestamp ? new Date(e.timestamp).getTime() : now;
            const ageDays = (now - timestamp) / (1000 * 60 * 60 * 24);
            return Math.exp(-Math.LN2 * (Math.max(0, ageDays) / this.halfLifeDays));
        });
        const avgFreshness = freshnessScores.reduce((sum, f) => sum + f, 0) / freshnessScores.length;

        // Composite Statistical Confidence Score Cconf (0.0 to 1.0)
        // High confidence requires adequate sample size, low margin of error, high completeness, and fresh evidence
        const moeFactor = Math.max(0, 1.0 - (marginOfError / 50.0));
        const sampleFactor = Math.min(1.0, Math.sqrt(sampleSize / 10)); // Saturates around 10+ samples per domain

        const compositeConfidence = Math.min(1.0, Math.max(0.0,
            (0.40 * sampleCompleteness) +
            (0.30 * moeFactor) +
            (0.20 * avgFreshness) +
            (0.10 * sampleFactor)
        ));

        const statisticalSignificance = sampleSize >= 5 && sampleCompleteness >= this.minSampleRatio && marginOfError <= 15.0;

        return {
            confidenceScore: Number(compositeConfidence.toFixed(4)),
            mean: Number(mean.toFixed(2)),
            stdDev: Number(stdDev.toFixed(2)),
            marginOfError: Number(marginOfError.toFixed(2)),
            sampleCompleteness: Number(sampleCompleteness.toFixed(4)),
            freshnessScore: Number(avgFreshness.toFixed(4)),
            sampleSize,
            totalPopulation,
            confidenceInterval: [lowerCI, upperCI],
            statisticalSignificance
        };
    }
}

module.exports = ConfidenceEngine;
