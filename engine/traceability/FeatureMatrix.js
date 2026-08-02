/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Traceability Engine (Stream C)
 * File           : FeatureMatrix.js
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
 * FeatureMatrix - Maps software features to physical code modules and requirements.
 */
class FeatureMatrix {
    constructor(options = {}) {
        this.options = {
            baseDir: options.baseDir || process.cwd(),
            ...options
        };

        // Map of featureId -> feature object
        this.features = new Map();
        // Reverse index: filePath -> Set of featureIds
        this.codeToFeatureMap = new Map();
    }

    /**
     * Normalizes input array or string
     */
    _normalizeArray(input) {
        if (!input) return [];
        if (Array.isArray(input)) {
            return input.map(item => String(item).trim()).filter(Boolean);
        }
        if (typeof input === 'string') {
            return [input.trim()].filter(Boolean);
        }
        return [String(input).trim()].filter(Boolean);
    }

    /**
     * Registers a feature with its name, linked requirements, and metadata.
     * @param {string} featureId - Unique Feature ID (e.g. 'FEAT-AUDIT-01')
     * @param {string} name - Feature Display Name
     * @param {string|string[]} reqIds - Associated Requirement ID(s)
     * @param {object} metadata - Additional metadata (domain, owner, status)
     * @returns {object} The registered feature record
     */
    registerFeature(featureId, name, reqIds = [], metadata = {}) {
        if (!featureId || typeof featureId !== 'string') {
            throw new TypeError('Feature ID must be a non-empty string');
        }

        const normalizedId = featureId.trim();
        const existing = this.features.get(normalizedId) || {
            featureId: normalizedId,
            name: name ? String(name).trim() : normalizedId,
            description: metadata.description || '',
            domain: metadata.domain || 'CORE',
            status: metadata.status || 'ACTIVE',
            reqIds: [],
            filePaths: [],
            createdAt: new Date().toISOString()
        };

        if (name) existing.name = String(name).trim();
        if (metadata.description) existing.description = metadata.description.trim();
        if (metadata.domain) existing.domain = metadata.domain.trim();
        if (metadata.status) existing.status = metadata.status.trim();

        const normalizedReqIds = this._normalizeArray(reqIds);
        existing.reqIds = Array.from(new Set([...existing.reqIds, ...normalizedReqIds]));
        existing.updatedAt = new Date().toISOString();

        this.features.set(normalizedId, existing);
        return { ...existing };
    }

    /**
     * Links physical codebase files to a registered feature.
     * @param {string} featureId - Feature ID
     * @param {string|string[]} filePaths - Code file path(s)
     * @returns {object} Updated feature record
     */
    linkCodeToFeature(featureId, filePaths = []) {
        if (!featureId || typeof featureId !== 'string') {
            throw new TypeError('Feature ID must be a non-empty string');
        }

        const normalizedId = featureId.trim();
        if (!this.features.has(normalizedId)) {
            // Auto-register feature with default name if not previously registered
            this.registerFeature(normalizedId, normalizedId);
        }

        const feature = this.features.get(normalizedId);
        const paths = this._normalizeArray(filePaths);

        for (const filePath of paths) {
            const normalizedPath = filePath.replace(/\\/g, '/');
            if (!feature.filePaths.includes(normalizedPath)) {
                feature.filePaths.push(normalizedPath);
            }

            // Update reverse index
            if (!this.codeToFeatureMap.has(normalizedPath)) {
                this.codeToFeatureMap.set(normalizedPath, new Set());
            }
            this.codeToFeatureMap.get(normalizedPath).add(normalizedId);
        }

        feature.updatedAt = new Date().toISOString();
        return { ...feature };
    }

    /**
     * Gets a registered feature record by ID.
     */
    getFeature(featureId) {
        if (!featureId) return null;
        const record = this.features.get(String(featureId).trim());
        return record ? { ...record } : null;
    }

    /**
     * Gets feature IDs linked to a specific code file path.
     */
    getFeaturesForCode(filePath) {
        if (!filePath) return [];
        const normalizedPath = String(filePath).trim().replace(/\\/g, '/');
        const set = this.codeToFeatureMap.get(normalizedPath);
        return set ? Array.from(set) : [];
    }

    /**
     * Computes feature coverage metrics across all registered features.
     * @returns {object} Feature coverage statistics and mappings
     */
    getFeatureCoverage() {
        const totalFeatures = this.features.size;
        if (totalFeatures === 0) {
            return {
                totalFeatures: 0,
                mappedFeatures: 0,
                unmappedFeatures: 0,
                featureCoveragePercent: 0,
                reqToFeatureMap: {},
                codeToFeatureMap: {},
                details: []
            };
        }

        let mappedCount = 0;
        let unmappedCount = 0;
        const details = [];
        const reqToFeatureMap = {};

        for (const [featureId, feat] of this.features) {
            const hasCode = feat.filePaths.length > 0;
            if (hasCode) {
                mappedCount++;
            } else {
                unmappedCount++;
            }

            // Build Req -> Features map
            for (const reqId of feat.reqIds) {
                if (!reqToFeatureMap[reqId]) {
                    reqToFeatureMap[reqId] = [];
                }
                if (!reqToFeatureMap[reqId].includes(featureId)) {
                    reqToFeatureMap[reqId].push(featureId);
                }
            }

            details.push({
                featureId: feat.featureId,
                name: feat.name,
                reqIds: [...feat.reqIds],
                codeCount: feat.filePaths.length,
                filePaths: [...feat.filePaths],
                isMapped: hasCode
            });
        }

        const featureCoveragePercent = Math.round((mappedCount / totalFeatures) * 10000) / 100;

        // Convert reverse index map to clean plain JS object
        const reverseCodeMap = {};
        for (const [filePath, featSet] of this.codeToFeatureMap) {
            reverseCodeMap[filePath] = Array.from(featSet);
        }

        return {
            totalFeatures,
            mappedFeatures: mappedCount,
            unmappedFeatures: unmappedCount,
            featureCoveragePercent,
            reqToFeatureMap,
            codeToFeatureMap: reverseCodeMap,
            details
        };
    }

    /**
     * Generates report summary of feature coverage
     */
    generateReport() {
        const coverage = this.getFeatureCoverage();
        let md = `# EAORCS Feature-to-Code Traceability Report\n\n`;
        md += `**Total Features**: ${coverage.totalFeatures}\n`;
        md += `**Mapped to Code**: ${coverage.mappedFeatures} (${coverage.featureCoveragePercent}%)\n`;
        md += `**Unmapped Features**: ${coverage.unmappedFeatures}\n\n`;

        md += `| Feature ID | Name | Requirements | Code Files | Status |\n`;
        md += `| :--- | :--- | :---: | :---: | :---: |\n`;
        for (const item of coverage.details) {
            const status = item.isMapped ? '✅ MAPPED' : '⚠️ UNMAPPED';
            md += `| **${item.featureId}** | ${item.name} | ${item.reqIds.length} | ${item.codeCount} | ${status} |\n`;
        }

        return {
            stats: coverage,
            markdown: md
        };
    }

    /**
     * Exports raw feature matrix state
     */
    exportMatrix() {
        const list = [];
        for (const [, feat] of this.features) {
            list.push({ ...feat });
        }
        return {
            version: '2026.1.0',
            exportedAt: new Date().toISOString(),
            features: list
        };
    }

    /**
     * Imports feature matrix state
     */
    importMatrix(data) {
        if (!data || !Array.isArray(data.features)) {
            throw new Error('Invalid import format: expected object with features array');
        }

        for (const feat of data.features) {
            if (feat && feat.featureId) {
                this.registerFeature(feat.featureId, feat.name, feat.reqIds || [], feat);
                if (Array.isArray(feat.filePaths)) {
                    this.linkCodeToFeature(feat.featureId, feat.filePaths);
                }
            }
        }
        return this.features.size;
    }
}

module.exports = FeatureMatrix;
