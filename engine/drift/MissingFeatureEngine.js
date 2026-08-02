/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Business Drift Detector Engine (Stream D)
 * File           : MissingFeatureEngine.js
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
 * MissingFeatureEngine - Identifies requirements present in specs but missing in physical implementation code.
 */
class MissingFeatureEngine {
    constructor(options = {}) {
        this.options = {
            baseDir: options.baseDir || process.cwd(),
            ...options
        };

        this.missingFeatures = [];
    }

    /**
     * Finds missing features by comparing specified requirements against physical codebase graph.
     * @param {object[]|object} specReqs - Specified requirements list or map
     * @param {object} codebaseGraph - Physical codebase graph (files, classes, methods, exports)
     * @returns {object[]} Array of missing feature records
     */
    findMissingFeatures(specReqs, codebaseGraph = {}) {
        const reqList = Array.isArray(specReqs) ? specReqs : Object.values(specReqs || {});
        const filesList = (codebaseGraph.files || codebaseGraph.filePaths || []).map(f => String(f).replace(/\\/g, '/'));
        const exportsList = (codebaseGraph.exports || codebaseGraph.symbols || []).map(e => String(e));
        const methodsList = (codebaseGraph.methods || []).map(m => String(m));

        const missingAcc = [];

        for (const req of reqList) {
            const reqId = req.reqId || req.id || req.tokenId;
            const name = req.name || req.title || reqId;
            const expectedFile = req.expectedFile || req.file;
            const requiredMethods = req.requiredMethods || req.methods || [];

            let missingType = null;
            let details = '';

            // Check file presence if expected file specified
            if (expectedFile) {
                const normExpected = String(expectedFile).replace(/\\/g, '/');
                const fileExists = filesList.some(f => f.endsWith(normExpected));
                if (!fileExists) {
                    missingType = 'MISSING_FILE';
                    details = `Expected implementation file [${expectedFile}] not found in codebase`;
                }
            }

            // Check requirement mapping presence if no specific file expected
            if (!missingType) {
                const isMappedInExports = exportsList.some(e => e.includes(reqId) || (name && e.includes(name)));
                const isMappedInFiles = filesList.some(f => f.includes(reqId) || (name && f.toLowerCase().includes(name.toLowerCase())));
                
                if (!isMappedInExports && !isMappedInFiles && !expectedFile) {
                    missingType = 'MISSING_REQUIREMENT_MAPPING';
                    details = `Requirement [${reqId}] (${name}) has no corresponding source file or export in codebase`;
                }
            }

            // Check required methods/functions
            if (!missingType && requiredMethods.length > 0) {
                const missingMethods = [];
                for (const method of requiredMethods) {
                    const methodFound = methodsList.includes(method) || exportsList.includes(method);
                    if (!methodFound) {
                        missingMethods.push(method);
                    }
                }
                if (missingMethods.length > 0) {
                    missingType = 'MISSING_METHOD';
                    details = `Requirement [${reqId}] missing required method(s): ${missingMethods.join(', ')}`;
                }
            }

            if (missingType) {
                missingAcc.push({
                    reqId,
                    name,
                    missingType,
                    details,
                    severity: req.priority === 'P1' || missingType === 'MISSING_FILE' ? 'HIGH' : 'MEDIUM',
                    specItem: req
                });
            }
        }

        this.missingFeatures = missingAcc;
        return [...this.missingFeatures];
    }

    /**
     * Returns cached array of identified missing features with summary statistics.
     * @returns {object} Summary object and details list
     */
    getMissingFeatureList() {
        const total = this.missingFeatures.length;
        const highSeverityCount = this.missingFeatures.filter(m => m.severity === 'HIGH').length;

        return {
            missingCount: total,
            highSeverityCount,
            mediumSeverityCount: total - highSeverityCount,
            details: [...this.missingFeatures]
        };
    }
}

module.exports = MissingFeatureEngine;
