/******************************************************************************
 * Project        : Universal Autonomous Engineering System (EAORCS)
 * Module         : Epistemic Confidence Engine
 * File           : OperationalConfidenceEngine.js
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
 * OperationalConfidenceEngine
 * Measures runtime reliability, SLA compliance, and specification execution confidence.
 */
class OperationalConfidenceEngine {
    constructor(options = {}) {
        this.options = options;
        this.operationalScore = 0;
        this.lastResult = null;
    }

    /**
     * Computes runtime operational confidence score.
     * @param {Object|Array} [healthLogs] - Service health logs, uptime metrics, error rates
     * @param {Object|Array} [testResults] - Runtime test execution results
     * @returns {Object} Operational evaluation summary
     */
    computeOperationalConfidence(healthLogs = [], testResults = {}) {
        const reliability = this._evaluateReliability(healthLogs);
        const compliance = this._evaluateCompliance(healthLogs, testResults);
        const passRate = this._evaluatePassRate(testResults);

        const score = Math.round(
            (reliability * 0.40) +
            (compliance * 0.30) +
            (passRate * 0.30)
        );

        this.operationalScore = Math.min(100, Math.max(0, score));
        this.lastResult = {
            score: this.operationalScore,
            breakdown: {
                reliability,
                compliance,
                passRate
            },
            timestamp: new Date().toISOString()
        };

        return this.lastResult;
    }

    /**
     * Returns computed operational confidence score (0-100).
     * @returns {number} Score
     */
    getOperationalScore() {
        return this.operationalScore;
    }

    /**
     * Evaluates runtime reliability from health logs (0-100).
     * @private
     */
    _evaluateReliability(logs) {
        if (typeof logs === 'object' && typeof logs.uptime === 'number') {
            return Math.min(100, Math.max(0, Math.round(logs.uptime)));
        }

        let logsArray = Array.isArray(logs) ? logs : [logs];
        if (logsArray.length === 0) return 90;

        let errorCount = 0;
        let healthyCount = 0;

        logsArray.forEach(log => {
            if (typeof log === 'string') {
                if (log.includes('ERROR') || log.includes('FAIL')) errorCount++;
                else healthyCount++;
            } else if (typeof log === 'object' && log !== null) {
                if (log.status === 'ERROR' || log.status === 'UNHEALTHY' || log.level === 'error') {
                    errorCount++;
                } else {
                    healthyCount++;
                }
            }
        });

        const total = logsArray.length;
        const healthyRatio = healthyCount / total;
        return Math.min(100, Math.max(0, Math.round(healthyRatio * 100)));
    }

    /**
     * Evaluates SLA & policy compliance (0-100).
     * @private
     */
    _evaluateCompliance(healthLogs, testResults) {
        if (typeof healthLogs === 'object' && typeof healthLogs.slaCompliance === 'number') {
            return Math.min(100, Math.max(0, Math.round(healthLogs.slaCompliance)));
        }
        if (typeof testResults === 'object' && typeof testResults.complianceScore === 'number') {
            return Math.min(100, Math.max(0, Math.round(testResults.complianceScore)));
        }
        return 95; // Default baseline compliance
    }

    /**
     * Evaluates test pass rate (0-100).
     * @private
     */
    _evaluatePassRate(testResults) {
        if (typeof testResults === 'number') {
            return Math.min(100, Math.max(0, Math.round(testResults)));
        }
        if (typeof testResults.passRate === 'number') {
            return Math.min(100, Math.max(0, Math.round(testResults.passRate)));
        }
        if (typeof testResults.passed === 'number' && typeof testResults.total === 'number') {
            if (testResults.total === 0) return 100;
            return Math.min(100, Math.max(0, Math.round((testResults.passed / testResults.total) * 100)));
        }
        if (Array.isArray(testResults)) {
            const passed = testResults.filter(t => t.passed || t.status === 'PASSED' || t.status === 'passed').length;
            if (testResults.length === 0) return 100;
            return Math.min(100, Math.max(0, Math.round((passed / testResults.length) * 100)));
        }
        return 90;
    }
}

module.exports = {
    OperationalConfidenceEngine
};
