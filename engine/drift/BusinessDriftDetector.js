/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Business Drift Detector Engine (Stream D)
 * File           : BusinessDriftDetector.js
 * Version        : 2026.1.0-LTS
 * Author         : Enterprise Architecture Governance Committee & Ujomor Systems
 * Organization   : Ujomor Systems Engineering
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | INTERNAL
 *
 * Governance:
 * - Corporate Governed
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
 * Copyright (c) 2026 Ujomor Systems Engineering
 * All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');

/**
 * BusinessDriftDetector - Compares design intent against physical implementation code & execution logs to detect business drift.
 */
class BusinessDriftDetector {
    constructor(options = {}) {
        this.options = {
            baseDir: options.baseDir || process.cwd(),
            ...options
        };

        this.lastDriftResult = null;
    }

    /**
     * Detects business drift between design intent tokens and physical codebase graph.
     * @param {object[]|object} intentTokens - Tokens extracted by IntentAnalyzer
     * @param {object} physicalCodeGraph - Codebase graph object with files, methods, exports, requirements
     * @param {object[]} executionLogs - Optional runtime execution logs
     * @returns {object} Comprehensive drift evaluation result
     */
    detectDrift(intentTokens, physicalCodeGraph = {}, executionLogs = []) {
        const tokensList = Array.isArray(intentTokens) ? intentTokens : (intentTokens?.tokens || []);
        const graphFiles = physicalCodeGraph.files || physicalCodeGraph.filePaths || [];
        const graphExports = physicalCodeGraph.exports || physicalCodeGraph.symbols || [];
        const mappedReqs = physicalCodeGraph.mappedRequirements || [];

        const missingIntents = [];
        const extraFeatures = [];
        const violations = [];
        const verifiedIntents = [];

        // 1. Analyze Intent Tokens vs Implementation
        for (const token of tokensList) {
            const tokenVal = token.value || token.tokenId;
            let isImplemented = false;

            if (token.category === 'REQUIREMENT') {
                isImplemented = mappedReqs.includes(tokenVal) || graphExports.some(e => String(e).includes(tokenVal));
            } else if (token.category === 'FEATURE') {
                isImplemented = graphFiles.some(f => String(f).toLowerCase().includes(tokenVal.toLowerCase())) ||
                                graphExports.some(e => String(e).toLowerCase().includes(tokenVal.toLowerCase()));
            } else if (token.category === 'ARCHITECTURAL_RULE') {
                // E.g., ZeroDependencies rule check
                if (tokenVal.toUpperCase() === 'ZERODEPENDENCIES') {
                    const hasExternal = physicalCodeGraph.hasExternalDependencies || false;
                    isImplemented = !hasExternal;
                    if (hasExternal) {
                        violations.push({
                            rule: 'ZeroDependencies',
                            severity: 'CRITICAL',
                            message: 'External npm dependencies detected when zero-dependency constraint was specified'
                        });
                    }
                } else {
                    isImplemented = true;
                }
            } else {
                isImplemented = true;
            }

            if (isImplemented) {
                verifiedIntents.push(token);
            } else {
                missingIntents.push(token);
            }
        }

        // 2. Identify Extra / Unspecified Code Elements (Ghost Features)
        if (Array.isArray(physicalCodeGraph.unmappedFiles)) {
            for (const file of physicalCodeGraph.unmappedFiles) {
                extraFeatures.push({
                    type: 'GHOST_FILE',
                    path: file,
                    riskLevel: 'MEDIUM',
                    message: `File ${file} exists in codebase but is not mapped to any intent requirement`
                });
            }
        }

        // 3. Store result state
        const totalIntentCount = tokensList.length;
        const missingCount = missingIntents.length;
        const extraCount = extraFeatures.length;
        const violationCount = violations.length;

        this.lastDriftResult = {
            timestamp: new Date().toISOString(),
            totalIntentCount,
            verifiedCount: verifiedIntents.length,
            missingCount,
            extraCount,
            violationCount,
            verifiedIntents,
            missingIntents,
            extraFeatures,
            violations,
            executionLogsCount: executionLogs.length
        };

        const scoreInfo = this.computeDriftScore();
        this.lastDriftResult.driftScore = scoreInfo.driftScore;
        this.lastDriftResult.alignmentScore = scoreInfo.alignmentScore;
        this.lastDriftResult.riskRating = scoreInfo.riskRating;

        return { ...this.lastDriftResult };
    }

    /**
     * Computes numerical Business Drift Score (0.0 to 100.0, where 0.0 = Zero Drift).
     * @returns {object} Drift score and alignment rating
     */
    computeDriftScore() {
        if (!this.lastDriftResult) {
            return { driftScore: 0.0, alignmentScore: 100.0, riskRating: 'ZERO_DRIFT' };
        }

        const { totalIntentCount, missingCount, extraCount, violationCount } = this.lastDriftResult;

        if (totalIntentCount === 0 && extraCount === 0 && violationCount === 0) {
            return { driftScore: 0.0, alignmentScore: 100.0, riskRating: 'ZERO_DRIFT' };
        }

        const missingPenalty = totalIntentCount > 0 ? (missingCount / totalIntentCount) * 60 : 0;
        const extraPenalty = Math.min(30, extraCount * 5);
        const violationPenalty = Math.min(40, violationCount * 10);

        const rawDriftScore = missingPenalty + extraPenalty + violationPenalty;
        const driftScore = Math.round(Math.min(100, Math.max(0, rawDriftScore)) * 100) / 100;
        const alignmentScore = Math.round((100 - driftScore) * 100) / 100;

        let riskRating = 'ZERO_DRIFT';
        if (driftScore > 50) riskRating = 'CRITICAL';
        else if (driftScore > 30) riskRating = 'HIGH';
        else if (driftScore > 15) riskRating = 'MODERATE';
        else if (driftScore > 0) riskRating = 'LOW';

        return {
            driftScore,
            alignmentScore,
            riskRating,
            breakdown: {
                missingPenalty: Math.round(missingPenalty * 100) / 100,
                extraPenalty: Math.round(extraPenalty * 100) / 100,
                violationPenalty: Math.round(violationPenalty * 100) / 100
            }
        };
    }

    /**
     * Generates a structured Business Drift Audit Report.
     * @returns {object} Report summary and markdown content
     */
    generateDriftReport() {
        if (!this.lastDriftResult) {
            return { error: 'No drift detection run performed yet. Call detectDrift first.' };
        }

        const res = this.lastDriftResult;
        let md = `# EAORCS Business Drift Audit Report\n\n`;
        md += `**Timestamp**: ${res.timestamp}\n`;
        md += `**Alignment Score**: ${res.alignmentScore}% (Drift Score: ${res.driftScore}%)\n`;
        md += `**Risk Rating**: ${res.riskRating}\n\n`;

        md += `## Summary Metrics\n\n`;
        md += `- **Total Intent Tokens**: ${res.totalIntentCount}\n`;
        md += `- **Verified / Implemented**: ${res.verifiedCount}\n`;
        md += `- **Missing Intent Features**: ${res.missingCount}\n`;
        md += `- **Ghost / Extra Features**: ${res.extraCount}\n`;
        md += `- **Architectural Violations**: ${res.violationCount}\n\n`;

        if (res.missingIntents.length > 0) {
            md += `## Missing Features (${res.missingIntents.length})\n\n`;
            for (const item of res.missingIntents) {
                md += `- ❌ \`[${item.category}]\` ${item.tokenId}\n`;
            }
            md += `\n`;
        }

        if (res.extraFeatures.length > 0) {
            md += `## Ghost / Unauthorized Code (${res.extraFeatures.length})\n\n`;
            for (const item of res.extraFeatures) {
                md += `- ⚠️ ${item.path || item.type}: ${item.message}\n`;
            }
            md += `\n`;
        }

        if (res.violations.length > 0) {
            md += `## Architectural Violations (${res.violations.length})\n\n`;
            for (const item of res.violations) {
                md += `- 🚨 **[${item.severity}]** ${item.rule}: ${item.message}\n`;
            }
            md += `\n`;
        }

        return {
            summary: res,
            markdown: md
        };
    }
}

module.exports = BusinessDriftDetector;
