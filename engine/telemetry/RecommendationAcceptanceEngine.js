/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Developer Recommendation Acceptance Engine
 * File           : RecommendationAcceptanceEngine.js
 * Version        : 2026.3.0-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

class RecommendationAcceptanceEngine {
    constructor(options = {}) {
        this.options = options;
        this.outcomes = new Map();
    }

    /**
     * Records final developer outcome for an engineering recommendation.
     * 
     * Outcomes: Accepted | Rejected | Deferred | Superseded | Auto_Fixed | Manually_Fixed
     */
    recordOutcome(recId, outcome, developerRole = 'Developer') {
        const validOutcomes = ['Accepted', 'Rejected', 'Deferred', 'Superseded', 'Auto_Fixed', 'Manually_Fixed'];
        if (!validOutcomes.includes(outcome)) {
            throw new Error(`Invalid outcome: ${outcome}`);
        }

        const entry = {
            recId,
            outcome,
            developerRole,
            resolvedAt: new Date().toISOString()
        };

        this.outcomes.set(recId, entry);
        return entry;
    }

    getAcceptanceSummary() {
        const total = this.outcomes.size;
        if (total === 0) {
            return {
                totalRecommendationsCount: 0,
                acceptedPct: 100.0,
                rejectedPct: 0.0,
                autoFixedPct: 100.0
            };
        }

        const acceptedCount = Array.from(this.outcomes.values()).filter(o => o.outcome === 'Accepted' || o.outcome === 'Auto_Fixed' || o.outcome === 'Manually_Fixed').length;
        const rejectedCount = Array.from(this.outcomes.values()).filter(o => o.outcome === 'Rejected').length;

        return {
            totalRecommendationsCount: total,
            acceptedCount,
            rejectedCount,
            acceptedPct: Number(((acceptedCount / total) * 100).toFixed(1)),
            rejectedPct: Number(((rejectedCount / total) * 100).toFixed(1))
        };
    }
}

module.exports = RecommendationAcceptanceEngine;
