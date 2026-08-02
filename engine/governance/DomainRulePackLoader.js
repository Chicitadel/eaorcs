/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Domain RulePack Loader (Stream I)
 * File           : DomainRulePackLoader.js
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
 * DomainRulePackLoader
 * Loads, validates, and applies domain-specific and sector-specific rulepacks against target execution contexts.
 */
class DomainRulePackLoader {
    constructor(options = {}) {
        this.options = options;
        this.loadedPacks = new Map();
    }

    /**
     * Loads a sector/domain rulepack from a file path or object reference.
     * @param {string|Object} packPathOrObject - Path to rulepack JSON/JS file, or rulepack object.
     * @returns {Object} Loaded and validated rulepack structure.
     */
    loadRulePack(packPathOrObject) {
        let rawPack = null;
        let sourcePath = null;

        if (typeof packPathOrObject === 'string') {
            sourcePath = path.resolve(packPathOrObject);
            if (!fs.existsSync(sourcePath)) {
                throw new Error(`Rulepack file not found: '${sourcePath}'`);
            }

            try {
                if (sourcePath.endsWith('.json')) {
                    const content = fs.readFileSync(sourcePath, 'utf8');
                    rawPack = JSON.parse(content);
                } else if (sourcePath.endsWith('.js') || sourcePath.endsWith('.cjs')) {
                    rawPack = require(sourcePath);
                } else {
                    // Try parsing as JSON fallback
                    const content = fs.readFileSync(sourcePath, 'utf8');
                    rawPack = JSON.parse(content);
                }
            } catch (err) {
                throw new Error(`Failed to read/parse rulepack from '${sourcePath}': ${err.message}`);
            }
        } else if (typeof packPathOrObject === 'object' && packPathOrObject !== null) {
            rawPack = packPathOrObject;
        } else {
            throw new Error('Invalid rulepack argument: expected file path or rulepack object');
        }

        const validation = this.validateRulePack(rawPack);
        if (!validation.valid) {
            throw new Error(`Rulepack validation failed: ${validation.errors.join('; ')}`);
        }

        const packId = rawPack.id || rawPack.packId || `RULEPACK-${Date.now()}`;
        const canonicalString = JSON.stringify(rawPack);
        const hash = '0x' + crypto.createHash('sha256').update(canonicalString).digest('hex');

        const normalizedPack = {
            id: packId,
            name: rawPack.name || packId,
            sector: rawPack.sector || 'GENERAL',
            domain: rawPack.domain || 'CORE',
            version: rawPack.version || '1.0.0',
            complianceFrameworks: Array.isArray(rawPack.complianceFrameworks) ? rawPack.complianceFrameworks : ['ISO27001', 'SOC2'],
            rules: rawPack.rules.map((r, idx) => ({
                ruleId: r.ruleId || r.id || `${packId}-R${idx + 1}`,
                name: r.name || `Rule_${idx + 1}`,
                severity: (r.severity || 'HIGH').toUpperCase(),
                description: r.description || '',
                evaluator: typeof r.evaluator === 'function' ? r.evaluator : null,
                pattern: r.pattern ? (r.pattern instanceof RegExp ? r.pattern : new RegExp(r.pattern, 'i')) : null,
                condition: r.condition || null
            })),
            sourcePath,
            hash,
            loadedAt: new Date().toISOString(),
            validated: true
        };

        this.loadedPacks.set(packId, normalizedPack);
        return normalizedPack;
    }

    /**
     * Validates schema and structural integrity of a rulepack.
     * @param {Object} pack - Rulepack candidate object.
     * @returns {Object} Validation result { valid: boolean, errors: string[], warnings: string[] }
     */
    validateRulePack(pack) {
        const errors = [];
        const warnings = [];

        if (!pack || typeof pack !== 'object') {
            return { valid: false, errors: ['Rulepack must be a non-null object'], warnings: [] };
        }

        if (!pack.id && !pack.packId && !pack.name) {
            errors.push('Rulepack is missing required identification property (id or packId or name)');
        }

        if (!pack.sector) {
            warnings.push('Rulepack missing sector field; defaulting to GENERAL');
        }

        if (!pack.domain) {
            warnings.push('Rulepack missing domain field; defaulting to CORE');
        }

        if (!Array.isArray(pack.rules)) {
            errors.push("Rulepack must contain a 'rules' array");
        } else if (pack.rules.length === 0) {
            warnings.push('Rulepack contains an empty rules array');
        } else {
            pack.rules.forEach((rule, idx) => {
                if (!rule || typeof rule !== 'object') {
                    errors.push(`Rule at index ${idx} is not an object`);
                } else if (!rule.ruleId && !rule.id && !rule.name) {
                    errors.push(`Rule at index ${idx} is missing identifier (ruleId or id or name)`);
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Applies loaded rulepack against a target context (path string, file content, or object).
     * @param {Object|string} rulePack - Loaded rulepack object or pack ID.
     * @param {string|Object} targetContext - Codebase path, content string, or context object.
     * @returns {Object} Assessment result.
     */
    applyRules(rulePack, targetContext) {
        let pack = null;

        if (typeof rulePack === 'string' && this.loadedPacks.has(rulePack)) {
            pack = this.loadedPacks.get(rulePack);
        } else if (typeof rulePack === 'object' && rulePack !== null) {
            if (!rulePack.validated) {
                pack = this.loadRulePack(rulePack);
            } else {
                pack = rulePack;
            }
        } else {
            throw new Error('Invalid rulepack passed to applyRules');
        }

        const violations = [];
        let totalEvaluated = pack.rules.length;

        // Determine context type
        if (typeof targetContext === 'string') {
            const resolvedPath = path.resolve(targetContext);
            if (fs.existsSync(resolvedPath)) {
                const stat = fs.statSync(resolvedPath);
                if (stat.isFile()) {
                    const content = fs.readFileSync(resolvedPath, 'utf8');
                    this._evaluateContentAgainstPack(pack, content, resolvedPath, violations);
                } else if (stat.isDirectory()) {
                    this._evaluateDirectoryAgainstPack(pack, resolvedPath, violations);
                }
            } else {
                // Treat targetContext as inline file content string
                this._evaluateContentAgainstPack(pack, targetContext, 'memory_buffer.js', violations);
            }
        } else if (typeof targetContext === 'object' && targetContext !== null) {
            // Memory object evaluation
            for (const rule of pack.rules) {
                if (rule.evaluator) {
                    const res = rule.evaluator(targetContext);
                    if (Array.isArray(res)) {
                        violations.push(...res);
                    } else if (res === false) {
                        violations.push({
                            ruleId: rule.ruleId,
                            severity: rule.severity,
                            description: rule.description || `Rule ${rule.ruleId} failed evaluation`
                        });
                    }
                } else if (rule.condition && typeof targetContext[rule.condition] !== 'undefined') {
                    if (!targetContext[rule.condition]) {
                        violations.push({
                            ruleId: rule.ruleId,
                            severity: rule.severity,
                            description: `Condition '${rule.condition}' evaluated to false in context`
                        });
                    }
                }
            }
        }

        return {
            packId: pack.id,
            sector: pack.sector,
            domain: pack.domain,
            passed: violations.length === 0,
            totalRules: totalEvaluated,
            passedCount: Math.max(0, totalEvaluated - violations.length),
            failedCount: violations.length,
            violations
        };
    }

    _evaluateDirectoryAgainstPack(pack, dirPath, violations) {
        const entries = fs.readdirSync(dirPath);
        for (const entry of entries) {
            if (entry === 'node_modules' || entry === '.git' || entry === 'dist') continue;
            const fullPath = path.join(dirPath, entry);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                this._evaluateDirectoryAgainstPack(pack, fullPath, violations);
            } else if (stat.isFile()) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    this._evaluateContentAgainstPack(pack, content, fullPath, violations);
                } catch (e) {
                    // skip unreadable
                }
            }
        }
    }

    _evaluateContentAgainstPack(pack, content, filePath, violations) {
        for (const rule of pack.rules) {
            if (rule.evaluator) {
                const res = rule.evaluator(content, filePath);
                if (Array.isArray(res)) {
                    res.forEach(v => {
                        violations.push({
                            ruleId: rule.ruleId,
                            severity: rule.severity,
                            file: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
                            description: v.description || rule.description,
                            line: v.line || 1
                        });
                    });
                }
            } else if (rule.pattern) {
                if (rule.pattern.test(content)) {
                    violations.push({
                        ruleId: rule.ruleId,
                        severity: rule.severity,
                        file: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
                        description: rule.description || `Pattern matched rule ${rule.ruleId}`,
                        line: 1
                    });
                }
            }
        }
    }

    getLoadedPacks() {
        return Array.from(this.loadedPacks.values());
    }

    getPack(packId) {
        return this.loadedPacks.get(packId) || null;
    }
}

module.exports = DomainRulePackLoader;
