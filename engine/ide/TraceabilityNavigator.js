/******************************************************************************
 * Project        : Universal Autonomous Engineering System (EAORCS)
 * Module         : IDE Spec Integration
 * File           : TraceabilityNavigator.js
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
 * TraceabilityNavigator
 * Bidirectional navigation engine between code files and blueprint requirements.
 */
class TraceabilityNavigator {
    constructor(options = {}) {
        this.options = options;
        this.codeToReqMap = new Map(); // normalizedFilePath -> Map(line -> Array of reqIds)
        this.reqToCodeMap = new Map(); // reqId -> Array of { filePath, line, text, context }
    }

    /**
     * Registers a bidirectional link between a requirement and a code location.
     * @param {string} reqId - Requirement ID
     * @param {string} filePath - Absolute or relative file path
     * @param {number} line - Line number (1-based)
     * @param {string} [text] - Snippet or comment text
     */
    registerLink(reqId, filePath, line, text = '') {
        const normPath = path.normalize(filePath);
        const normId = reqId.toUpperCase();

        // 1. Code -> Req Mapping
        if (!this.codeToReqMap.has(normPath)) {
            this.codeToReqMap.set(normPath, new Map());
        }
        const lineMap = this.codeToReqMap.get(normPath);
        if (!lineMap.has(line)) {
            lineMap.set(line, []);
        }
        const reqList = lineMap.get(line);
        if (!reqList.includes(normId)) {
            reqList.push(normId);
        }

        // 2. Req -> Code Mapping
        if (!this.reqToCodeMap.has(normId)) {
            this.reqToCodeMap.set(normId, []);
        }
        const locations = this.reqToCodeMap.get(normId);
        const exists = locations.some(loc => loc.filePath === normPath && loc.line === line);
        if (!exists) {
            locations.push({
                reqId: normId,
                filePath: normPath,
                line,
                text: text.trim(),
                context: text.trim()
            });
        }
    }

    /**
     * Finds requirement(s) associated with a code file and line.
     * @param {string} filePath - File path
     * @param {number} line - 1-based line number
     * @returns {Array<Object>} List of associated requirement links
     */
    findRequirementForCode(filePath, line) {
        const normPath = path.normalize(filePath);
        const results = [];

        if (this.codeToReqMap.has(normPath)) {
            const lineMap = this.codeToReqMap.get(normPath);
            if (lineMap.has(line)) {
                const reqIds = lineMap.get(line);
                reqIds.forEach(reqId => {
                    results.push({
                        reqId,
                        filePath: normPath,
                        line
                    });
                });
            }
        }

        // On-demand scan if not found in pre-built map
        if (results.length === 0 && fs.existsSync(normPath)) {
            try {
                const content = fs.readFileSync(normPath, 'utf8');
                const lines = content.split(/\r?\n/);
                const lineIdx = Math.max(0, line - 1);
                if (lineIdx < lines.length) {
                    const lineText = lines[lineIdx];
                    const matches = lineText.match(/(?:@req|@requirement|REQ-)[\s:-]*([A-Z0-9_-]+)/gi);
                    if (matches) {
                        matches.forEach(m => {
                            const rawId = m.replace(/^@req|^@requirement|[\s:-]/gi, '');
                            const reqId = rawId.startsWith('REQ-') ? rawId.toUpperCase() : `REQ-${rawId.toUpperCase()}`;
                            this.registerLink(reqId, normPath, line, lineText);
                            results.push({
                                reqId,
                                filePath: normPath,
                                line,
                                text: lineText.trim()
                            });
                        });
                    }
                }
            } catch (e) {
                // Ignore read errors
            }
        }

        return results;
    }

    /**
     * Finds code location(s) referencing a requirement ID.
     * @param {string} reqId - Requirement ID (e.g. REQ-001)
     * @returns {Array<Object>} Array of code locations
     */
    findCodeForRequirement(reqId) {
        const normId = reqId.toUpperCase();
        if (this.reqToCodeMap.has(normId)) {
            return this.reqToCodeMap.get(normId);
        }
        return [];
    }

    /**
     * Recursively indexes workspace files for requirement references.
     * @param {string} workspacePath - Root workspace path
     * @returns {Object} Indexing summary stats
     */
    indexWorkspace(workspacePath) {
        const normRoot = path.normalize(workspacePath);
        let filesIndexed = 0;
        let linksFound = 0;

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
                    if (['.js', '.cjs', '.mjs', '.ts', '.json', '.yaml', '.yml', '.md'].includes(ext)) {
                        filesIndexed++;
                        try {
                            const content = fs.readFileSync(fullPath, 'utf8');
                            const lines = content.split(/\r?\n/);
                            lines.forEach((lineText, idx) => {
                                const lineNum = idx + 1;
                                const matches = lineText.match(/(?:@req|@requirement|REQ-)[A-Z0-9_-]+/gi);
                                if (matches) {
                                    matches.forEach(m => {
                                        let rawId = m.replace(/^@req|^@requirement|[\s:-]/gi, '');
                                        if (!rawId.toUpperCase().startsWith('REQ-')) {
                                            rawId = `REQ-${rawId}`;
                                        }
                                        const reqId = rawId.toUpperCase();
                                        this.registerLink(reqId, fullPath, lineNum, lineText);
                                        linksFound++;
                                    });
                                }
                            });
                        } catch (err) {
                            // File read skip
                        }
                    }
                }
            }
        };

        scanDir(normRoot);

        return {
            workspacePath: normRoot,
            filesIndexed,
            linksFound,
            uniqueRequirements: this.reqToCodeMap.size
        };
    }
}

module.exports = {
    TraceabilityNavigator
};
