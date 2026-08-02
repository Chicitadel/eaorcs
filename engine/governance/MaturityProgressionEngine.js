/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Governance Platform — Stream 3: Maturity Progression Engine
 * File           : MaturityProgressionEngine.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Ujomor Systems & Enterprise Governance
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

/**
 * MaturityProgressionEngine
 * Evaluates 6 governance & engineering maturity levels:
 * Level 1: Initial
 * Level 2: Managed
 * Level 3: Defined
 * Level 4: Measured
 * Level 5: Optimized
 * Level 6: Autonomous
 */
class MaturityProgressionEngine {
    constructor(options = {}) {
        this.options = { ...options };

        this.MATURITY_LEVELS = [
            { level: 1, name: 'Initial', minScore: 0, maxScore: 19.9, description: 'Ad-hoc execution, unmanaged processes, basic baseline.' },
            { level: 2, name: 'Managed', minScore: 20, maxScore: 39.9, description: 'Basic governance, issue tracking, standard tooling.' },
            { level: 3, name: 'Defined', minScore: 40, maxScore: 59.9, description: 'Documented specifications, frozen API contracts, standardized protocols.' },
            { level: 4, name: 'Measured', minScore: 60, maxScore: 79.9, description: 'Comprehensive telemetry, automated test coverage, strict quality gates.' },
            { level: 5, name: 'Optimized', minScore: 80, maxScore: 94.9, description: 'Continuous feedback, predictive analytics, failure recovery, proactive tuning.' },
            { level: 6, name: 'Autonomous', minScore: 95, maxScore: 100, description: 'Self-healing systems, autonomous AI governance enforcement, zero-touch verification.' }
        ];

        this.EVALUATION_DIMENSIONS = [
            'Governance & Compliance',
            'Architecture & Contracts',
            'Security & Zero Trust',
            'Testing & Quality Assurance',
            'Observability & Telemetry',
            'Autonomous Operations & Self-Healing'
        ];
    }

    /**
     * Evaluates system audit results or metrics and determines maturity level (1-6).
     * @param {Object} auditResults Audit results or metrics snapshot
     * @param {Object} [options] Override options
     * @returns {Object} Structured maturity evaluation report
     */
    evaluateMaturity(auditResults = {}, options = {}) {
        const config = { ...this.options, ...options };
        const dimensions = this._assessDimensions(auditResults);

        // Calculate overall weighted percentage score (0-100%)
        let totalWeightedScore = 0;
        let totalWeights = 0;

        for (const dim of Object.values(dimensions)) {
            totalWeightedScore += dim.score * dim.weight;
            totalWeights += dim.weight;
        }

        const overallPercentage = totalWeights > 0 ? Number((totalWeightedScore / totalWeights).toFixed(2)) : 0;

        // Map to 1-6 Level scale
        const levelMeta = this._getMaturityLevelMeta(overallPercentage);
        const continuousLevelScore = Number((1 + (overallPercentage / 100) * 5).toFixed(2)); // Maps 0%->1.00, 100%->6.00

        // Gap analysis for next maturity level
        const gapAnalysis = this._performGapAnalysis(levelMeta, dimensions, overallPercentage);

        // Actionable roadmap to advance to next level
        const progressionRoadmap = this._buildProgressionRoadmap(levelMeta, gapAnalysis);

        return {
            overallMaturityPercentage: overallPercentage,
            maturityLevelNumber: levelMeta.level,
            maturityLevelName: levelMeta.name,
            continuousLevelScore,
            description: levelMeta.description,
            dimensions,
            gapAnalysis,
            progressionRoadmap,
            maturityScale: this.MATURITY_LEVELS
        };
    }

    /**
     * Retrieves maturity level definition for a given score percentage.
     * @param {number} scorePercent Score percentage 0-100
     * @returns {Object} Level metadata object
     */
    getLevelByScore(scorePercent) {
        return this._getMaturityLevelMeta(scorePercent);
    }

    // --- Private Helper Methods ---

    _assessDimensions(input) {
        const dims = {};

        // Extract metrics or findings from input
        const qualityScore = typeof input.qualityScore === 'number' ? input.qualityScore : (input.overallImplementationMaturityScore || 85);
        const testCoverage = typeof input.testCoverage === 'number' ? input.testCoverage : 90;
        const apiGovernancePassed = input.apiGovernancePassed !== false;
        const securityPassed = input.securityPassed !== false;
        const telemetryScore = typeof input.telemetryScore === 'number' ? input.telemetryScore : 88;
        const autonomousScore = typeof input.autonomousScore === 'number' ? input.autonomousScore : (qualityScore > 90 ? 92 : 60);

        dims['Governance & Compliance'] = {
            name: 'Governance & Compliance',
            score: qualityScore,
            weight: 1.5,
            status: qualityScore >= 80 ? 'OPTIMAL' : 'NEEDS_IMPROVEMENT',
            keyIndicator: 'Policy enforcement & audit trail readiness'
        };

        dims['Architecture & Contracts'] = {
            name: 'Architecture & Contracts',
            score: apiGovernancePassed ? Math.min(100, qualityScore + 5) : 55,
            weight: 1.5,
            status: apiGovernancePassed ? 'OPTIMAL' : 'DEGRADED',
            keyIndicator: 'OpenAPI specs, JSON schemas & contract freeze'
        };

        dims['Security & Zero Trust'] = {
            name: 'Security & Zero Trust',
            score: securityPassed ? Math.min(100, qualityScore + 2) : 40,
            weight: 2.0,
            status: securityPassed ? 'OPTIMAL' : 'CRITICAL_GAP',
            keyIndicator: 'RBAC, secrets isolation & vulnerability scanning'
        };

        dims['Testing & Quality Assurance'] = {
            name: 'Testing & Quality Assurance',
            score: testCoverage,
            weight: 1.0,
            status: testCoverage >= 85 ? 'OPTIMAL' : 'NEEDS_IMPROVEMENT',
            keyIndicator: 'Unit, integration & contract test coverage'
        };

        dims['Observability & Telemetry'] = {
            name: 'Observability & Telemetry',
            score: telemetryScore,
            weight: 1.0,
            status: telemetryScore >= 80 ? 'OPTIMAL' : 'NEEDS_IMPROVEMENT',
            keyIndicator: 'Distributed tracing, metrics & structured logging'
        };

        dims['Autonomous Operations & Self-Healing'] = {
            name: 'Autonomous Operations & Self-Healing',
            score: autonomousScore,
            weight: 1.0,
            status: autonomousScore >= 85 ? 'OPTIMAL' : 'DEVELOPING',
            keyIndicator: 'Self-healing, automated remediation & AI governance loop'
        };

        return dims;
    }

    _getMaturityLevelMeta(scorePercent) {
        for (let i = this.MATURITY_LEVELS.length - 1; i >= 0; i--) {
            const lvl = this.MATURITY_LEVELS[i];
            if (scorePercent >= lvl.minScore) {
                return lvl;
            }
        }
        return this.MATURITY_LEVELS[0];
    }

    _performGapAnalysis(currentLevelMeta, dimensions, overallPercentage) {
        const nextLevelNumber = Math.min(6, currentLevelMeta.level + 1);
        const nextLevelMeta = this.MATURITY_LEVELS.find(l => l.level === nextLevelNumber) || currentLevelMeta;
        
        const targetPercentage = nextLevelMeta.minScore;
        const percentageGap = Number(Math.max(0, targetPercentage - overallPercentage).toFixed(2));

        const weakDimensions = [];
        for (const [key, dim] of Object.entries(dimensions)) {
            if (dim.score < targetPercentage) {
                weakDimensions.push({
                    dimension: key,
                    currentScore: dim.score,
                    targetScore: targetPercentage,
                    gapPoints: Number((targetPercentage - dim.score).toFixed(1))
                });
            }
        }

        return {
            currentLevel: currentLevelMeta.level,
            nextLevel: nextLevelNumber,
            isMaxLevel: currentLevelMeta.level === 6,
            overallPercentageGap: percentageGap,
            weakDimensions
        };
    }

    _buildProgressionRoadmap(currentLevelMeta, gapAnalysis) {
        if (gapAnalysis.isMaxLevel) {
            return {
                targetLevel: 6,
                targetName: 'Autonomous',
                milestones: ['Maintain Level 6 Autonomous continuous compliance and self-healing resilience.']
            };
        }

        const nextLevelNumber = gapAnalysis.nextLevel;
        const nextLevelMeta = this.MATURITY_LEVELS.find(l => l.level === nextLevelNumber);

        const milestones = [];
        for (const weak of gapAnalysis.weakDimensions) {
            milestones.push(`Upgrade ${weak.dimension} score from ${weak.currentScore}% to at least ${weak.targetScore}%.`);
        }

        if (nextLevelNumber === 4) {
            milestones.push('Implement automated OpenTelemetry pipelines and enforce 90%+ contract test coverage.');
        } else if (nextLevelNumber === 5) {
            milestones.push('Deploy predictive failure analytics and continuous feedback loops.');
        } else if (nextLevelNumber === 6) {
            milestones.push('Enable autonomous AI governance enforcement and zero-touch launch attestation.');
        }

        return {
            targetLevel: nextLevelNumber,
            targetName: nextLevelMeta ? nextLevelMeta.name : 'Next Level',
            estimatedTimeframe: '1-2 Sprints',
            milestones
        };
    }
}

module.exports = MaturityProgressionEngine;
