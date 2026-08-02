/******************************************************************************
 * Project        : Universal Autonomous Engineering System (EAORCS)
 * Module         : IDE Spec Integration
 * File           : CoverageVisualizer.js
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
 * - Language Server Protocol (LSP 3.17)
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

const fs = require('fs');
const path = require('path');

/**
 * CoverageVisualizer
 * Generates code-to-specification coverage heatmap data for IDE extensions and dashboards.
 */
class CoverageVisualizer {
    constructor(options = {}) {
        this.options = options;
        this.heatmapData = null;
    }

    /**
     * Generates heatmap data for code files in a workspace directory.
     * @param {string} workspacePath - Root workspace directory
     * @returns {Object} Heatmap data structure
     */
    generateHeatmapData(workspacePath) {
        const normRoot = path.normalize(workspacePath);
        const filesMap = {};

        let totalFiles = 0;
        let coveredFiles = 0;
        let sumTotalLines = 0;
        let sumCoveredLines = 0;

        const processFile = (filePath) => {
            const relPath = path.relative(normRoot, filePath).replace(/\\/g, '/');
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split(/\r?\n/);
                const totalLines = lines.length;

                const coveredLines = [];
                const reqsFound = new Set();

                lines.forEach((lineText, idx) => {
                    const lineNum = idx + 1;
                    const matches = lineText.match(/(?:@req|@requirement|REQ-)[A-Z0-9_-]+/gi);
                    if (matches || lineText.includes('assert') || lineText.includes('it(') || lineText.includes('describe(')) {
                        coveredLines.push(lineNum);
                        if (matches) {
                            matches.forEach(m => {
                                const raw = m.replace(/^@req|^@requirement|[\s:-]/gi, '').toUpperCase();
                                reqsFound.add(raw.startsWith('REQ-') ? raw : `REQ-${raw}`);
                            });
                        }
                    }
                });

                const coverageRatio = totalLines > 0 ? Number((coveredLines.length / totalLines).toFixed(4)) : 0;
                const heat = this._calculateHeat(coverageRatio);

                filesMap[relPath] = {
                    totalLines,
                    coveredLines,
                    coveredCount: coveredLines.length,
                    coverageRatio,
                    heat,
                    requirements: Array.from(reqsFound)
                };

                totalFiles++;
                if (coverageRatio > 0) coveredFiles++;
                sumTotalLines += totalLines;
                sumCoveredLines += coveredLines.length;
            } catch (e) {
                // Ignore read errors
            }
        };

        const scanDir = (dir) => {
            let entries = [];
            try {
                entries = fs.readdirSync(dir, { withFileTypes: true });
            } catch (e) {
                return;
            }

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.governance') {
                        scanDir(fullPath);
                    }
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (['.js', '.cjs', '.mjs', '.ts'].includes(ext)) {
                        processFile(fullPath);
                    }
                }
            }
        };

        if (fs.existsSync(normRoot)) {
            const stat = fs.statSync(normRoot);
            if (stat.isFile()) {
                processFile(normRoot);
            } else {
                scanDir(normRoot);
            }
        }

        const overallCoverage = sumTotalLines > 0 
            ? Number(((sumCoveredLines / sumTotalLines) * 100).toFixed(2))
            : 0;

        this.heatmapData = {
            workspacePath: normRoot,
            timestamp: new Date().toISOString(),
            files: filesMap,
            summary: {
                totalFiles,
                coveredFiles,
                totalLines: sumTotalLines,
                coveredLines: sumCoveredLines,
                overallCoverage
            }
        };

        return this.heatmapData;
    }

    /**
     * Aggregates coverage heatmap data by directory prefix.
     * @returns {Object} Coverage grouped by directory
     */
    getCoverageByDirectory() {
        if (!this.heatmapData) {
            return {};
        }

        const dirMap = {};
        const files = this.heatmapData.files;

        Object.keys(files).forEach(relPath => {
            const dir = path.dirname(relPath).replace(/\\/g, '/');
            const fileData = files[relPath];

            if (!dirMap[dir]) {
                dirMap[dir] = {
                    directory: dir,
                    totalFiles: 0,
                    coveredFiles: 0,
                    totalLines: 0,
                    coveredLines: 0,
                    coverageRatio: 0,
                    heat: 'red'
                };
            }

            const d = dirMap[dir];
            d.totalFiles++;
            if (fileData.coverageRatio > 0) d.coveredFiles++;
            d.totalLines += fileData.totalLines;
            d.coveredLines += fileData.coveredCount;
        });

        Object.keys(dirMap).forEach(dir => {
            const d = dirMap[dir];
            d.coverageRatio = d.totalLines > 0 ? Number((d.coveredLines / d.totalLines).toFixed(4)) : 0;
            d.heat = this._calculateHeat(d.coverageRatio);
        });

        return dirMap;
    }

    /**
     * Determines heatmap color intensity based on coverage ratio.
     * @private
     */
    _calculateHeat(ratio) {
        if (ratio >= 0.75) return 'green';
        if (ratio >= 0.45) return 'yellow';
        if (ratio >= 0.20) return 'orange';
        return 'red';
    }
}

module.exports = {
    CoverageVisualizer
};
