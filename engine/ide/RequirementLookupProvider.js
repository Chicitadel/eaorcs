/******************************************************************************
 * Project        : Universal Autonomous Engineering System (EAORCS)
 * Module         : IDE Spec Integration
 * File           : RequirementLookupProvider.js
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
 * RequirementLookupProvider
 * IDE Language Server Protocol (LSP) hover & position requirement lookup provider.
 */
class RequirementLookupProvider {
    constructor(options = {}) {
        this.options = options;
        this.requirementsMap = new Map();
        this.documentBuffers = new Map();
    }

    /**
     * Registers requirement definitions into the lookup provider.
     * @param {Array|Object|Map} requirements - Requirement array, object map, or Map
     */
    registerRequirements(requirements) {
        if (Array.isArray(requirements)) {
            requirements.forEach(req => {
                if (req && req.id) {
                    this.requirementsMap.set(req.id, req);
                }
            });
        } else if (requirements instanceof Map) {
            requirements.forEach((val, key) => {
                this.requirementsMap.set(key, val);
            });
        } else if (typeof requirements === 'object' && requirements !== null) {
            Object.keys(requirements).forEach(id => {
                this.requirementsMap.set(id, requirements[id]);
            });
        }
    }

    /**
     * Sets virtual buffer content for a file path (for unsaved IDE buffers).
     * @param {string} filePath - Absolute file path
     * @param {string} content - Buffer text content
     */
    setVirtualBuffer(filePath, content) {
        const normPath = path.normalize(filePath);
        this.documentBuffers.set(normPath, content);
    }

    /**
     * Looks up requirement identifier at a specific file position (line, column).
     * @param {string} filePath - File path
     * @param {number} line - 1-based line number
     * @param {number} column - 1-based column number
     * @returns {Object|null} Requirement match details or null if not found
     */
    getRequirementAtPosition(filePath, line = 1, column = 1) {
        const content = this._getFileContent(filePath);
        if (!content) return null;

        const lines = content.split(/\r?\n/);
        const lineIdx = Math.max(0, line - 1);
        if (lineIdx >= lines.length) return null;

        const lineText = lines[lineIdx];
        const reqRegex = /(?:@req|@requirement|REQUIREMENT|REQ)[\s:-]*([A-Z0-9_-]+)/gi;
        
        let match;
        while ((match = reqRegex.exec(lineText)) !== null) {
            const matchStart = match.index + 1;
            const matchEnd = matchStart + match[0].length;

            // If column is within match or column not strictly specified
            if (column >= matchStart - 5 && column <= matchEnd + 10) {
                const rawId = match[1];
                const fullId = rawId.startsWith('REQ-') ? rawId : `REQ-${rawId}`;
                const reqMeta = this.requirementsMap.get(fullId) || this.requirementsMap.get(rawId) || null;

                return {
                    reqId: fullId,
                    rawMatch: match[0],
                    filePath,
                    line,
                    column,
                    snippet: lineText.trim(),
                    requirement: reqMeta
                };
            }
        }

        // Fallback simple search if regex cursor didn't match column bounds tightly
        const simpleMatch = lineText.match(/REQ-[A-Z0-9_-]+/i);
        if (simpleMatch) {
            const reqId = simpleMatch[0].toUpperCase();
            const reqMeta = this.requirementsMap.get(reqId) || null;
            return {
                reqId,
                rawMatch: simpleMatch[0],
                filePath,
                line,
                column,
                snippet: lineText.trim(),
                requirement: reqMeta
            };
        }

        return null;
    }

    /**
     * Generates LSP Hover response object for a requirement ID.
     * @param {string} reqId - Requirement ID
     * @returns {Object} LSP Hover object
     */
    getRequirementHover(reqId) {
        const req = this.requirementsMap.get(reqId) || {
            id: reqId,
            title: `Requirement ${reqId}`,
            description: `Specification requirement ${reqId}`,
            status: 'ACTIVE',
            priority: 'HIGH',
            category: 'SPECIFICATION'
        };

        const markdownValue = [
            `### Requirement Specification: \`${req.id || reqId}\``,
            `**Title**: ${req.title || 'N/A'}`,
            `**Status**: \`${req.status || 'ACTIVE'}\` | **Priority**: \`${req.priority || 'NORMAL'}\``,
            req.category ? `**Category**: ${req.category}` : '',
            '',
            `**Description**:`,
            req.description || 'No detailed description provided.'
        ].filter(Boolean).join('\n');

        return {
            contents: {
                kind: 'markdown',
                value: markdownValue
            },
            reqId: req.id || reqId,
            title: req.title || `Requirement ${reqId}`,
            description: req.description || '',
            status: req.status || 'ACTIVE',
            priority: req.priority || 'NORMAL',
            category: req.category || 'SPECIFICATION'
        };
    }

    /**
     * Reads file content from virtual buffer or disk.
     * @private
     */
    _getFileContent(filePath) {
        const normPath = path.normalize(filePath);
        if (this.documentBuffers.has(normPath)) {
            return this.documentBuffers.get(normPath);
        }
        try {
            if (fs.existsSync(normPath)) {
                return fs.readFileSync(normPath, 'utf8');
            }
        } catch (e) {
            // Read error fallback
        }
        return null;
    }
}

module.exports = {
    RequirementLookupProvider
};
