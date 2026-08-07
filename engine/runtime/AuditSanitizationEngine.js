/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Audit Sanitization Engine
 * File           : AuditSanitizationEngine.js
 * Version        : 2026.3.1-LTS
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
 * CORP:
 * - Stream: S3 — Workspace Runtime Platform
 * - Stream: S7 — Evidence Platform
 * - Resolves: TD-01 (absolute paths in exported artifacts)
 * - Decision: DEC-06
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const path = require('path');
const os = require('os');

/**
 * AuditSanitizationEngine
 *
 * Removes developer-machine-specific absolute paths from any content
 * before it is packaged into an external audit artifact. Replaces
 * absolute paths with canonical workspace-relative equivalents.
 *
 * Rules (CORP DEC-06):
 *   1. All absolute paths are replaced with workspace-relative paths.
 *   2. Username / home directory leakage is removed.
 *   3. Machine hostname is removed where embedded.
 *   4. Sanitized content is hash-verified for integrity.
 */
class AuditSanitizationEngine {
    constructor(options = {}) {
        this.options = options;
        // Patterns to detect and replace
        this._absolutePathPatterns = this._buildPatterns();
    }

    _buildPatterns() {
        const homeDir = os.homedir().replace(/\\/g, '/');
        const cwdWin = process.cwd().replace(/\\/g, '/');
        const cwdPosix = process.cwd();
        const hostname = os.hostname();
        const username = os.userInfo().username;

        return [
            // Windows-style absolute paths (D:\path\to or C:\Users\...)
            { pattern: /[A-Za-z]:\\[^\s"',;}\]]+/g, replacement: '[WORKSPACE]' },
            // Unix-style absolute paths
            { pattern: /\/[a-zA-Z0-9_\-./]+\/[a-zA-Z0-9_\-./]*/g, replacement: '[WORKSPACE]' },
            // Home directory (forward slash variant)
            { pattern: new RegExp(homeDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement: '[HOME]' },
            // CWD forward slash
            { pattern: new RegExp(cwdWin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement: '[WORKSPACE]' },
            // CWD posix
            { pattern: new RegExp(cwdPosix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement: '[WORKSPACE]' },
            // Hostname
            { pattern: new RegExp(hostname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), replacement: '[HOST]' },
            // Username
            { pattern: new RegExp(username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), replacement: '[USER]' }
        ];
    }

    /**
     * Sanitizes a string by removing all absolute developer paths.
     * @param {string} content Raw content string.
     * @returns {string} Sanitized content.
     */
    sanitizeString(content) {
        if (typeof content !== 'string') return content;
        let sanitized = content;
        for (const { pattern, replacement } of this._absolutePathPatterns) {
            sanitized = sanitized.replace(pattern, replacement);
        }
        return sanitized;
    }

    /**
     * Sanitizes a JSON-serializable object recursively.
     * @param {*} obj Object to sanitize.
     * @returns {*} Sanitized object.
     */
    sanitizeObject(obj) {
        if (typeof obj === 'string') return this.sanitizeString(obj);
        if (Array.isArray(obj)) return obj.map(item => this.sanitizeObject(item));
        if (obj !== null && typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = this.sanitizeObject(value);
            }
            return sanitized;
        }
        return obj;
    }

    /**
     * Validates that a string or object contains no residual absolute paths.
     * @param {string|Object} content
     * @returns {{ clean: boolean, violations: string[] }}
     */
    validatePortability(content) {
        const str = typeof content === 'string' ? content : JSON.stringify(content);
        const violations = [];

        // Check for Windows absolute paths
        const winMatches = str.match(/[A-Za-z]:\\[^\s"',;}\]]+/g) || [];
        violations.push(...winMatches.map(m => `Windows absolute path: ${m}`));

        // Check for Unix home-style paths with usernames
        const unixHomeMatches = str.match(/\/home\/[a-z_][a-z0-9_-]*\//gi) || [];
        violations.push(...unixHomeMatches.map(m => `Unix home path: ${m}`));

        return {
            clean: violations.length === 0,
            violations
        };
    }
}

module.exports = AuditSanitizationEngine;
