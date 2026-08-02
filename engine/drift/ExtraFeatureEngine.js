/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Business Drift Detector Engine (Stream D)
 * File           : ExtraFeatureEngine.js
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
 * ExtraFeatureEngine - Identifies unauthorized / un-specified code ("ghost features" or un-tracked code bloat).
 */
class ExtraFeatureEngine {
    constructor(options = {}) {
        this.options = {
            baseDir: options.baseDir || process.cwd(),
            ...options
        };

        this.ghostFeatures = [];
    }

    /**
     * Finds ghost features and unauthorized code by comparing physical codebase graph against spec requirements.
     * @param {object} codebaseGraph - Physical codebase graph (files, endpoints, exports, modules)
     * @param {object[]|object} specReqs - Specification requirements / allowed feature tokens list
     * @returns {object[]} Array of ghost/extra feature records
     */
    findExtraFeatures(codebaseGraph = {}, specReqs = []) {
        const reqList = Array.isArray(specReqs) ? specReqs : Object.values(specReqs || {});
        const filesList = codebaseGraph.files || codebaseGraph.filePaths || [];
        const endpointsList = codebaseGraph.endpoints || codebaseGraph.routes || [];
        const exportsList = codebaseGraph.exports || codebaseGraph.symbols || [];

        // Build set of allowed/specified tokens and file patterns
        const allowedTokens = new Set();
        const allowedFilePatterns = new Set();

        for (const req of reqList) {
            const reqId = req.reqId || req.id || req.tokenId;
            const name = req.name || req.title;
            const expectedFile = req.expectedFile || req.file;

            if (reqId) allowedTokens.add(String(reqId).toLowerCase());
            if (name) allowedTokens.add(String(name).toLowerCase());
            if (expectedFile) allowedFilePatterns.add(String(expectedFile).replace(/\\/g, '/').toLowerCase());
        }

        const ghostAcc = [];

        // 1. Scan physical code files for un-mapped / ghost files
        for (const filePath of filesList) {
            const normPath = String(filePath).replace(/\\/g, '/').toLowerCase();

            // Ignore standard system / infra files
            if (normPath.includes('package.json') || normPath.includes('.governance') || normPath.includes('certify.js') || normPath.includes('node_modules')) {
                continue;
            }

            let isAllowed = false;
            // Check direct pattern match
            if (allowedFilePatterns.has(normPath)) {
                isAllowed = true;
            } else {
                // Check if any allowed token is contained in file path
                for (const tok of allowedTokens) {
                    if (tok.length > 2 && normPath.includes(tok)) {
                        isAllowed = true;
                        break;
                    }
                }
            }

            if (!isAllowed) {
                ghostAcc.push({
                    type: 'GHOST_FILE',
                    path: filePath,
                    name: path.basename(filePath),
                    riskLevel: normPath.includes('secret') || normPath.includes('backdoor') || normPath.includes('debug') ? 'HIGH' : 'MEDIUM',
                    message: `File [${filePath}] has no matching requirement or intent token in specification`
                });
            }
        }

        // 2. Scan endpoints for unauthorized routes
        for (const endpoint of endpointsList) {
            const normEndpoint = String(endpoint).toLowerCase();
            let isAllowed = false;
            for (const tok of allowedTokens) {
                if (normEndpoint.includes(tok)) {
                    isAllowed = true;
                    break;
                }
            }
            if (!isAllowed) {
                ghostAcc.push({
                    type: 'UNAUTHORIZED_ENDPOINT',
                    endpoint,
                    riskLevel: 'HIGH',
                    message: `API Endpoint [${endpoint}] is active but not authorized in specification`
                });
            }
        }

        this.ghostFeatures = ghostAcc;
        return [...this.ghostFeatures];
    }

    /**
     * Returns cached array of identified ghost/extra features with summary count and risk breakdown.
     * @returns {object} Summary object and details list
     */
    getGhostFeatureList() {
        const total = this.ghostFeatures.length;
        const highRiskCount = this.ghostFeatures.filter(g => g.riskLevel === 'HIGH').length;

        return {
            ghostCount: total,
            highRiskCount,
            mediumRiskCount: total - highRiskCount,
            details: [...this.ghostFeatures]
        };
    }
}

module.exports = ExtraFeatureEngine;
