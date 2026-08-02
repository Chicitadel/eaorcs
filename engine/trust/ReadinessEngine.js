/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Decomposed Trust Engine
 * File           : ReadinessEngine.js
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
 * ReadinessEngine
 * Assurance readiness evaluator across 15 core engineering & governance domains:
 * 1. ARCHITECTURE_INTEGRITY
 * 2. CODE_QUALITY
 * 3. SECURITY_VULNERABILITIES
 * 4. COMPLIANCE_GOVERNANCE
 * 5. CRYPTOGRAPHIC_PROTECTION
 * 6. PERFORMANCE_SCALABILITY
 * 7. OBSERVABILITY_TELEMETRY
 * 8. TEST_COVERAGE_QUALITY
 * 9. DEPENDENCY_RISK
 * 10. INFRASTRUCTURE_AS_CODE
 * 11. CICD_PIPELINE
 * 12. SECRETS_ISOLATION
 * 13. DATA_PRIVACY_GDPR
 * 14. RESILIENCE_DISASTER_RECOVERY
 * 15. PROTOCOL_FREEZE
 */
class ReadinessEngine {
    constructor(options = {}) {
        this.domains = [
            { id: 'ARCHITECTURE_INTEGRITY', name: 'Architecture Integrity', weight: 1.0, criticalThreshold: 80.0 },
            { id: 'CODE_QUALITY', name: 'Code Quality & Maintainability', weight: 0.8, criticalThreshold: 70.0 },
            { id: 'SECURITY_VULNERABILITIES', name: 'Security Vulnerability Protection', weight: 1.2, criticalThreshold: 90.0 },
            { id: 'COMPLIANCE_GOVERNANCE', name: 'Compliance & Governance Standard', weight: 1.1, criticalThreshold: 85.0 },
            { id: 'CRYPTOGRAPHIC_PROTECTION', name: 'Cryptographic Protection & Key Management', weight: 1.0, criticalThreshold: 85.0 },
            { id: 'PERFORMANCE_SCALABILITY', name: 'Performance & Scalability', weight: 0.7, criticalThreshold: 65.0 },
            { id: 'OBSERVABILITY_TELEMETRY', name: 'Observability, Logging & Telemetry', weight: 0.9, criticalThreshold: 75.0 },
            { id: 'TEST_COVERAGE_QUALITY', name: 'Test Coverage & Automated Verification', weight: 1.0, criticalThreshold: 80.0 },
            { id: 'DEPENDENCY_RISK', name: 'Supply Chain & Dependency Risk', weight: 1.0, criticalThreshold: 80.0 },
            { id: 'INFRASTRUCTURE_AS_CODE', name: 'Infrastructure as Code & Drift Isolation', weight: 0.8, criticalThreshold: 70.0 },
            { id: 'CICD_PIPELINE', name: 'CI/CD Pipeline Integrity & Reproducibility', weight: 0.9, criticalThreshold: 75.0 },
            { id: 'SECRETS_ISOLATION', name: 'Secrets Isolation & Vault Security', weight: 1.2, criticalThreshold: 90.0 },
            { id: 'DATA_PRIVACY_GDPR', name: 'Data Privacy, Retention & GDPR Compliance', weight: 0.9, criticalThreshold: 80.0 },
            { id: 'RESILIENCE_DISASTER_RECOVERY', name: 'Resilience, Fault Isolation & Failover', weight: 0.8, criticalThreshold: 70.0 },
            { id: 'PROTOCOL_FREEZE', name: 'Protocol Freeze & Contract Compatibility', weight: 1.0, criticalThreshold: 85.0 }
        ];
    }

    /**
     * Get list of domain metadata
     * @returns {Array<Object>}
     */
    getDomainDefinitions() {
        return this.domains.slice();
    }

    /**
     * Evaluates assurance readiness across all 15 domains
     * @param {Object|Array} auditData - Audit results, node findings, or evidence map
     * @returns {Object} Readiness report with aggregate score R, domain breakdown, and gaps
     */
    evaluateReadiness(auditData = {}) {
        const domainScores = {};
        const domainGaps = {};
        const domainStatus = {};

        const findings = Array.isArray(auditData.findings)
            ? auditData.findings
            : Array.isArray(auditData) ? auditData : [];

        let weightedScoreSum = 0;
        let totalWeight = 0;
        let totalGapsCount = 0;
        let blockingGapsCount = 0;

        for (const domain of this.domains) {
            const domainFindings = findings.filter(f => f.domain === domain.id || f.category === domain.id);
            
            // Calculate domain score based on passed vs failed checks or explicit provided score
            let domainScore = 100.0;

            if (auditData.domainScores && typeof auditData.domainScores[domain.id] === 'number') {
                domainScore = auditData.domainScores[domain.id];
            } else if (domainFindings.length > 0) {
                const passedCount = domainFindings.filter(f => f.status === 'PASSED' || f.passed === true).length;
                const criticalFails = domainFindings.filter(f => (f.status === 'FAILED' || !f.passed) && f.severity === 'CRITICAL').length;
                const highFails = domainFindings.filter(f => (f.status === 'FAILED' || !f.passed) && f.severity === 'HIGH').length;
                const medFails = domainFindings.filter(f => (f.status === 'FAILED' || !f.passed) && f.severity === 'MEDIUM').length;

                const deduction = (criticalFails * 30.0) + (highFails * 15.0) + (medFails * 5.0);
                domainScore = Math.max(0, 100.0 - deduction);
            }

            domainScores[domain.id] = Number(domainScore.toFixed(2));

            const isPassed = domainScore >= domain.criticalThreshold;
            domainStatus[domain.id] = isPassed ? 'READY' : 'GAPS_IDENTIFIED';

            if (!isPassed) {
                const domainGapList = domainFindings.filter(f => f.status === 'FAILED' || !f.passed);
                domainGaps[domain.id] = domainGapList;
                totalGapsCount += domainGapList.length || 1;
                if (domain.criticalThreshold >= 85.0) {
                    blockingGapsCount += 1;
                }
            }

            weightedScoreSum += domainScore * domain.weight;
            totalWeight += domain.weight;
        }

        const aggregateReadiness = totalWeight > 0 ? weightedScoreSum / totalWeight : 100.0;
        const R = Number(aggregateReadiness.toFixed(2));

        // Determine UAIGOS Architecture Maturity Level
        let maturityLevel = 'LEVEL_1_PROTOTYPE';
        if (R >= 95.0 && blockingGapsCount === 0) {
            maturityLevel = 'LEVEL_5_GLOBAL_AUTONOMOUS_PLATFORM';
        } else if (R >= 88.0 && blockingGapsCount === 0) {
            maturityLevel = 'LEVEL_4_DISTRIBUTED_PLATFORM';
        } else if (R >= 80.0) {
            maturityLevel = 'LEVEL_3_SERVICE_ORIENTED';
        } else if (R >= 65.0) {
            maturityLevel = 'LEVEL_2_MODULAR_MONOLITH';
        }

        return {
            readinessScore: R,
            maturityLevel,
            domainScores,
            domainStatus,
            domainGaps,
            totalGapsCount,
            blockingGapsCount,
            evaluatedDomainsCount: this.domains.length,
            isReadyForProduction: R >= 80.0 && blockingGapsCount === 0,
            evaluatedAt: new Date().toISOString()
        };
    }
}

module.exports = ReadinessEngine;
