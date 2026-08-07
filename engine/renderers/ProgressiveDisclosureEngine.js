/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Progressive Disclosure Framework Engine
 * File           : ProgressiveDisclosureEngine.js
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

class ProgressiveDisclosureEngine {
    constructor(options = {}) {
        this.options = options;
        this.disclosureLevels = ['SUMMARY', 'DETAILS', 'EVIDENCE', 'TRANSACTIONS', 'REPLAY', 'TELEMETRY', 'RAW_JSON'];
    }

    /**
     * Filters unified model output based on requested disclosure level.
     * 
     * @param {Object} unifiedModel Canonical result model.
     * @param {string} level Disclosure level ("SUMMARY", "DETAILS", "EVIDENCE", "RAW_JSON").
     * @returns {Object} Tiered disclosure view.
     */
    filterLevel(unifiedModel, level = 'SUMMARY') {
        const uppercase = String(level).toUpperCase();

        if (uppercase === 'SUMMARY') {
            return {
                disclosureLevel: 'SUMMARY',
                summary: unifiedModel.summary,
                recommendationsCount: unifiedModel.recommendations.length,
                overallScorePct: unifiedModel.summary.overallScorePct
            };
        }

        if (uppercase === 'DETAILS') {
            return {
                disclosureLevel: 'DETAILS',
                summary: unifiedModel.summary,
                recommendations: unifiedModel.recommendations,
                diagnostics: unifiedModel.diagnostics
            };
        }

        if (uppercase === 'EVIDENCE') {
            return {
                disclosureLevel: 'EVIDENCE',
                summary: unifiedModel.summary,
                evidence: unifiedModel.evidence,
                metrics: unifiedModel.metrics
            };
        }

        return {
            disclosureLevel: 'RAW_JSON',
            fullModel: unifiedModel
        };
    }
}

module.exports = ProgressiveDisclosureEngine;
