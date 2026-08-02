/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Business Drift Detector Engine (Stream D)
 * File           : IntentAnalyzer.js
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
 * IntentAnalyzer - Parses specification documents and AST structures to extract design & business intent tokens.
 */
class IntentAnalyzer {
    constructor(options = {}) {
        this.options = {
            baseDir: options.baseDir || process.cwd(),
            ...options
        };

        // Extracted intent tokens
        this.tokens = [];
    }

    /**
     * Parses specification content (string, object AST, or file path) and extracts architectural/business intent tokens.
     * @param {string|object|array} specInput - Specification text, markdown, AST object, or file path
     * @returns {object} Extracted intent token analysis summary
     */
    analyzeIntent(specInput) {
        if (!specInput) {
            throw new TypeError('specInput must be provided');
        }

        let specText = '';
        let specAst = null;

        if (typeof specInput === 'string') {
            // Check if string is a file path
            if (specInput.includes('/') || specInput.includes('\\') || specInput.endsWith('.md') || specInput.endsWith('.json')) {
                const resolvedPath = path.isAbsolute(specInput) ? specInput : path.resolve(this.options.baseDir, specInput);
                if (fs.existsSync(resolvedPath)) {
                    specText = fs.readFileSync(resolvedPath, 'utf8');
                } else {
                    specText = specInput;
                }
            } else {
                specText = specInput;
            }
        } else if (typeof specInput === 'object') {
            specAst = specInput;
            specText = JSON.stringify(specInput);
        }

        const extractedTokens = [];

        // 1. Extract bracketed intent tokens e.g. [TOKEN:REQUIREMENT_01], [REQ:REQ-001], [FEATURE:NWayMatrix]
        const tokenRegex = /\[(TOKEN|REQ|FEATURE|ARCH|SECURITY|DOMAIN|AC|API|CONTRACT):([A-Za-z0-9_\-:]+)\]/g;
        let match;
        while ((match = tokenRegex.exec(specText)) !== null) {
            extractedTokens.push({
                tokenId: `${match[1]}:${match[2]}`,
                category: this._mapCategory(match[1]),
                rawType: match[1],
                value: match[2],
                source: 'REGEX_PATTERN',
                metadata: {}
            });
        }

        // 2. Extract requirement headings (e.g., `# Requirement 1: ...`, `## REQ-001: ...`)
        const reqHeadingRegex = /(?:^|\n)#+\s*(?:REQ-([A-Za-z0-9_\-]+)|Requirement\s+([A-Za-z0-9_\-]+)):\s*([^\n]+)/gi;
        while ((match = reqHeadingRegex.exec(specText)) !== null) {
            const reqId = match[1] || match[2];
            const title = match[3].trim();
            extractedTokens.push({
                tokenId: `REQ:${reqId}`,
                category: 'REQUIREMENT',
                rawType: 'REQ',
                value: reqId,
                title,
                source: 'MARKDOWN_HEADING',
                metadata: { title }
            });
        }

        // 3. Extract AST structured node intents if AST object passed
        if (specAst && typeof specAst === 'object') {
            this._extractFromAst(specAst, extractedTokens);
        }

        // Deduplicate tokens by tokenId
        const tokenMap = new Map();
        for (const tok of extractedTokens) {
            if (!tokenMap.has(tok.tokenId)) {
                tokenMap.set(tok.tokenId, tok);
            } else {
                // Merge metadata
                const existing = tokenMap.get(tok.tokenId);
                existing.metadata = { ...existing.metadata, ...tok.metadata };
            }
        }

        this.tokens = Array.from(tokenMap.values());

        const categories = {
            REQUIREMENT: 0,
            FEATURE: 0,
            ARCHITECTURAL_RULE: 0,
            SECURITY_POLICY: 0,
            DOMAIN: 0,
            ACCEPTANCE_CRITERIA: 0,
            API_CONTRACT: 0,
            OTHER: 0
        };

        for (const t of this.tokens) {
            categories[t.category] = (categories[t.category] || 0) + 1;
        }

        return {
            totalTokens: this.tokens.length,
            categories,
            tokens: [...this.tokens]
        };
    }

    _mapCategory(prefix) {
        switch (prefix.toUpperCase()) {
            case 'REQ': return 'REQUIREMENT';
            case 'FEATURE': return 'FEATURE';
            case 'ARCH': return 'ARCHITECTURAL_RULE';
            case 'SECURITY': return 'SECURITY_POLICY';
            case 'DOMAIN': return 'DOMAIN';
            case 'AC': return 'ACCEPTANCE_CRITERIA';
            case 'API':
            case 'CONTRACT': return 'API_CONTRACT';
            default: return 'OTHER';
        }
    }

    _extractFromAst(node, tokenAcc) {
        if (!node || typeof node !== 'object') return;

        if (node.reqId) {
            tokenAcc.push({
                tokenId: `REQ:${node.reqId}`,
                category: 'REQUIREMENT',
                rawType: 'REQ',
                value: node.reqId,
                source: 'AST_NODE',
                metadata: { name: node.name || node.title }
            });
        }

        if (node.featureId) {
            tokenAcc.push({
                tokenId: `FEATURE:${node.featureId}`,
                category: 'FEATURE',
                rawType: 'FEATURE',
                value: node.featureId,
                source: 'AST_NODE',
                metadata: { name: node.name }
            });
        }

        if (Array.isArray(node.requirements)) {
            for (const req of node.requirements) {
                this._extractFromAst(req, tokenAcc);
            }
        }

        if (Array.isArray(node.features)) {
            for (const feat of node.features) {
                this._extractFromAst(feat, tokenAcc);
            }
        }
    }

    /**
     * Returns array of all extracted design intent tokens.
     * @returns {object[]} Intent tokens array
     */
    getDesignIntentTokens() {
        return [...this.tokens];
    }

    /**
     * Filters extracted tokens by category.
     */
    findTokensByCategory(category) {
        const normCat = String(category).toUpperCase().trim();
        return this.tokens.filter(t => t.category === normCat);
    }
}

module.exports = IntentAnalyzer;
