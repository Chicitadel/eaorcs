/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Universal Constitution Engine (Stream I)
 * File           : UniversalConstitutionEngine.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
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
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Built-in Node.js module set for dependency validation.
 */
const NODE_BUILTIN_MODULES = new Set([
    'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console',
    'constants', 'crypto', 'dgram', 'diagnostics_channel', 'dns', 'domain',
    'events', 'fs', 'fs/promises', 'http', 'http2', 'https', 'inspector',
    'module', 'net', 'os', 'path', 'path/posix', 'path/win32', 'perf_hooks',
    'process', 'punycode', 'querystring', 'readline', 'repl', 'stream',
    'stream/consumers', 'stream/promises', 'stream/web', 'string_decoder',
    'sys', 'timers', 'timers/promises', 'tls', 'trace_events', 'tty',
    'url', 'util', 'util/types', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib'
]);

/**
 * Default constitutional rules enforced if no custom rules are specified.
 */
const DEFAULT_CONSTITUTIONAL_RULES = [
    {
        id: 'CONST-001',
        name: 'NO_EXTERNAL_NPM_DEPS',
        category: 'DEPENDENCY',
        severity: 'CRITICAL',
        description: 'Zero external npm dependencies allowed; Node.js built-ins only.',
        evaluator: (fileContent, filePath) => {
            const violations = [];
            if (!filePath.endsWith('.js') && !filePath.endsWith('.cjs') && !filePath.endsWith('.mjs')) return violations;
            
            const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
            let match;
            while ((match = requireRegex.exec(fileContent)) !== null) {
                const modName = match[1];
                if (modName.startsWith('.') || modName.startsWith('/') || modName.startsWith('\\')) continue;
                
                const baseMod = modName.startsWith('node:') ? modName.slice(5) : modName.split('/')[0];
                if (!NODE_BUILTIN_MODULES.has(baseMod) && !NODE_BUILTIN_MODULES.has(modName)) {
                    violations.push({
                        line: fileContent.substring(0, match.index).split('\n').length,
                        description: `Forbidden external npm dependency detected: '${modName}'`,
                        remediationAdvice: `Replace '${modName}' with Node.js built-in core modules (fs, path, crypto, child_process, etc.).`
                    });
                }
            }
            return violations;
        }
    },
    {
        id: 'CONST-002',
        name: 'AUTHOR_HEADER_REQUIRED',
        category: 'GOVERNANCE',
        severity: 'HIGH',
        description: 'UAIGOS Corporate Author Header required on all JavaScript files.',
        evaluator: (fileContent, filePath) => {
            const violations = [];
            if (!filePath.endsWith('.js') && !filePath.endsWith('.cjs') && !filePath.endsWith('.mjs')) return violations;
            
            const hasHeader = fileContent.includes('Project') && fileContent.includes('Governance') && fileContent.includes('Copyright');
            if (!hasHeader) {
                violations.push({
                    line: 1,
                    description: `Missing UAIGOS Corporate Author Header in file: ${path.basename(filePath)}`,
                    remediationAdvice: `Prepend official UAIGOS Corporate Author Header block to file.`
                });
            }
            return violations;
        }
    },
    {
        id: 'CONST-003',
        name: 'NO_HARDCODED_SECRETS',
        category: 'SECURITY',
        severity: 'CRITICAL',
        description: 'Hardcoded credentials, secret keys, or private tokens strictly prohibited.',
        evaluator: (fileContent, filePath) => {
            const violations = [];
            const lines = fileContent.split('\n');
            const secretPatterns = [
                /BEGIN\s+(RSA|EC|DSA|OPENSSH)\s+PRIVATE\s+KEY/i,
                /aws_secret_access_key\s*=\s*['"][A-Za-z0-9/+=]{20,}['"]/i,
                /api[_-]?key\s*[:=]\s*['"](sk_[a-zA-Z0-9]{20,})['"]/i,
                /password\s*[:=]\s*['"](?!admin|test|dummy|password)[^'"]{8,}['"]/i
            ];
            
            lines.forEach((lineText, idx) => {
                for (const pattern of secretPatterns) {
                    if (pattern.test(lineText)) {
                        violations.push({
                            line: idx + 1,
                            description: `Potential hardcoded secret or key detected on line ${idx + 1}`,
                            remediationAdvice: `Remove hardcoded secret and inject via secure environment variables or vault.`
                        });
                        break;
                    }
                }
            });
            return violations;
        }
    },
    {
        id: 'CONST-004',
        name: 'BOUNDED_FILE_SIZE',
        category: 'ARCHITECTURE',
        severity: 'MEDIUM',
        description: 'Source code files must remain bounded (maximum 2500 lines).',
        evaluator: (fileContent, filePath) => {
            const violations = [];
            const lineCount = fileContent.split('\n').length;
            if (lineCount > 2500) {
                violations.push({
                    line: 2500,
                    description: `File exceeds maximum length limit (${lineCount} lines > 2500 limit)`,
                    remediationAdvice: `Decompose monolithic file into smaller, modular sub-components.`
                });
            }
            return violations;
        }
    }
];

/**
 * UniversalConstitutionEngine
 * Compiles and enforces immutable macro engineering constitutional rules across the platform codebase.
 */
class UniversalConstitutionEngine {
    constructor(options = {}) {
        this.options = options;
        this.compiledConstitution = null;
        this.violations = [];
        this.scanStats = null;
    }

    /**
     * Compiles the constitutional rules into an immutable macro constitution digest.
     * @param {Array|Object} rules - List of rules or object containing rules array.
     * @returns {Object} Compiled constitution object.
     */
    compileConstitution(rules = null) {
        let ruleList = DEFAULT_CONSTITUTIONAL_RULES;
        
        if (Array.isArray(rules) && rules.length > 0) {
            ruleList = rules;
        } else if (rules && Array.isArray(rules.rules) && rules.rules.length > 0) {
            ruleList = rules.rules;
        }

        // Normalize rule definitions
        const normalizedRules = ruleList.map((r, idx) => {
            return {
                id: r.id || r.ruleId || `RULE-${idx + 1}`,
                name: r.name || r.title || `Rule_${idx + 1}`,
                category: r.category || 'GOVERNANCE',
                severity: (r.severity || 'HIGH').toUpperCase(),
                description: r.description || 'Constitutional rule constraint',
                evaluator: typeof r.evaluator === 'function' ? r.evaluator : null,
                pattern: r.pattern ? (r.pattern instanceof RegExp ? r.pattern : new RegExp(r.pattern, 'i')) : null
            };
        });

        // Compute SHA-256 hash of compiled rule definitions
        const canonicalString = JSON.stringify(normalizedRules.map(r => ({
            id: r.id,
            name: r.name,
            category: r.category,
            severity: r.severity,
            description: r.description
        })));
        
        const constitutionHash = '0x' + crypto.createHash('sha256').update(canonicalString).digest('hex');

        this.compiledConstitution = Object.freeze({
            constitutionHash,
            compiledAt: new Date().toISOString(),
            rulesCount: normalizedRules.length,
            rules: normalizedRules,
            isFrozen: true
        });

        return this.compiledConstitution;
    }

    /**
     * Enforces the compiled constitution against a target codebase directory or file.
     * @param {string} codebasePath - Absolute or relative path to file or directory.
     * @returns {Object} Enforcement report containing compliance status and violations list.
     */
    enforceConstitution(codebasePath) {
        if (!this.compiledConstitution) {
            // Auto-compile default constitution if not explicitly compiled yet
            this.compileConstitution();
        }

        const startTime = Date.now();
        this.violations = [];
        let filesScannedCount = 0;

        const resolvedPath = path.resolve(codebasePath);

        if (!fs.existsSync(resolvedPath)) {
            throw new Error(`Target path does not exist: '${resolvedPath}'`);
        }

        const filesToScan = [];

        const collectFiles = (dirOrFile) => {
            const stat = fs.statSync(dirOrFile);
            if (stat.isFile()) {
                filesToScan.push(dirOrFile);
            } else if (stat.isDirectory()) {
                const entries = fs.readdirSync(dirOrFile);
                for (const entry of entries) {
                    if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'coverage') {
                        continue;
                    }
                    collectFiles(path.join(dirOrFile, entry));
                }
            }
        };

        collectFiles(resolvedPath);

        for (const filePath of filesToScan) {
            try {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                filesScannedCount++;

                for (const rule of this.compiledConstitution.rules) {
                    if (rule.evaluator) {
                        const ruleViolations = rule.evaluator(fileContent, filePath);
                        if (Array.isArray(ruleViolations)) {
                            ruleViolations.forEach(v => {
                                this.violations.push({
                                    ruleId: rule.id,
                                    ruleName: rule.name,
                                    category: rule.category,
                                    severity: rule.severity,
                                    file: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
                                    line: v.line || 1,
                                    description: v.description || rule.description,
                                    remediationAdvice: v.remediationAdvice || 'Update source code to conform to constitutional standard.'
                                });
                            });
                        }
                    } else if (rule.pattern) {
                        const lines = fileContent.split('\n');
                        lines.forEach((lineText, lineIdx) => {
                            if (rule.pattern.test(lineText)) {
                                this.violations.push({
                                    ruleId: rule.id,
                                    ruleName: rule.name,
                                    category: rule.category,
                                    severity: rule.severity,
                                    file: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
                                    line: lineIdx + 1,
                                    description: rule.description,
                                    remediationAdvice: 'Refactor code snippet to eliminate pattern match.'
                                });
                            }
                        });
                    }
                }
            } catch (err) {
                // Ignore binary or unreadable file errors gracefully
            }
        }

        const durationMs = Date.now() - startTime;
        this.scanStats = {
            filesScanned: filesScannedCount,
            durationMs,
            constitutionHash: this.compiledConstitution.constitutionHash
        };

        return {
            compliant: this.violations.length === 0,
            totalViolations: this.violations.length,
            violations: [...this.violations],
            scanStats: this.scanStats
        };
    }

    /**
     * Returns the array of detected violations from the last enforcement run.
     * @returns {Array<Object>} List of violation records.
     */
    getViolations() {
        return [...this.violations];
    }

    /**
     * Checks if a constitution is compiled.
     * @returns {boolean} True if compiled.
     */
    isCompiled() {
        return this.compiledConstitution !== null;
    }

    /**
     * Gets current compiled constitution object.
     * @returns {Object|null}
     */
    getCompiledConstitution() {
        return this.compiledConstitution;
    }
}

module.exports = UniversalConstitutionEngine;
