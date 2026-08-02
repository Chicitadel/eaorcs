/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Specification Intelligence Engine (Stream A)
 * File           : RequirementDsl.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

class RequirementDsl {
    constructor(options = {}) {
        this.options = options;
    }

    /**
     * Compiles EAORCS Specification DSL text into a formal AST and canonical JSON representation.
     * @param {string} dslText EAORCS Specification DSL statements text.
     * @returns {{ ast: { type: string, statements: Array<object> }, canonicalJson: Array<object> }}
     */
    compileDsl(dslText) {
        if (typeof dslText !== 'string' || !dslText.trim()) {
            return {
                ast: { type: 'RequirementDslAST', statements: [] },
                canonicalJson: []
            };
        }

        const lines = dslText.split(/\r?\n/);
        const statements = [];
        const canonicalJson = [];

        let currentStatement = null;

        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('//') || line.startsWith('#')) {
                continue;
            }

            if (line.toUpperCase().startsWith('REQUIREMENT ')) {
                if (currentStatement) {
                    const parsed = this._finalizeStatement(currentStatement);
                    statements.push(parsed.statement);
                    canonicalJson.push(parsed.canonical);
                }
                currentStatement = this._parseRequirementLine(line);
            } else if (currentStatement) {
                this._appendDslLine(currentStatement, line);
            }
        }

        if (currentStatement) {
            const parsed = this._finalizeStatement(currentStatement);
            statements.push(parsed.statement);
            canonicalJson.push(parsed.canonical);
        }

        return {
            ast: {
                type: 'RequirementDslAST',
                statements
            },
            canonicalJson
        };
    }

    /**
     * Static helper for direct invocation.
     */
    static compileDsl(dslText) {
        return new RequirementDsl().compileDsl(dslText);
    }

    _parseRequirementLine(line) {
        const state = {
            id: 'REQ-01',
            type: null,
            priority: null,
            modality: 'MUST',
            description: '',
            acceptanceCriteria: [],
            verification: ''
        };

        // Extract REQ- ID
        const idMatch = line.match(/^REQUIREMENT\s+([A-Z0-9_-]+)/i);
        if (idMatch) {
            state.id = idMatch[1].toUpperCase();
        }

        // Extract TYPE bracket/inline
        const typeMatch = line.match(/\[?TYPE[=\s]+([A-Z_]+)\]?/i);
        if (typeMatch) {
            state.type = typeMatch[1].toUpperCase();
        }

        // Extract PRIORITY bracket/inline
        const prioMatch = line.match(/\[?PRIORITY[=\s]+([A-Z_]+)\]?/i);
        if (prioMatch) {
            state.priority = prioMatch[1].toUpperCase();
        }

        // Extract MUST / SHALL / SHOULD / WILL modality and description
        const modalityMatch = line.match(/\b(MUST|SHALL|SHOULD|WILL|MAY)\b\s*(?:"([^"]+)"|'([^']+)'|([^\n\[\]]+?))(?=\s*(?:ACCEPTANCE|VERIFIED BY|VERIFIER|$))/i);
        if (modalityMatch) {
            state.modality = modalityMatch[1].toUpperCase();
            state.description = (modalityMatch[2] || modalityMatch[3] || modalityMatch[4] || '').trim();
        }

        // Extract ACCEPTANCE criteria
        const accMatch = line.match(/\bACCEPTANCE\s+(?:"([^"]+)"|'([^']+)'|([^\n]+?))(?=\s*(?:VERIFIED BY|VERIFIER|$))/i);
        if (accMatch) {
            const accText = (accMatch[1] || accMatch[2] || accMatch[3] || '').trim();
            if (accText) state.acceptanceCriteria.push(accText);
        }

        // Extract VERIFIED BY
        const verMatch = line.match(/\b(?:VERIFIED BY|VERIFIER)\s+(?:"([^"]+)"|'([^']+)'|(\S+))/i);
        if (verMatch) {
            state.verification = (verMatch[1] || verMatch[2] || verMatch[3] || '').trim();
        }

        return state;
    }

    _appendDslLine(state, line) {
        const accMatch = line.match(/^\bACCEPTANCE\s+(?:"([^"]+)"|'([^']+)'|([^\n]+))/i);
        if (accMatch) {
            const accText = (accMatch[1] || accMatch[2] || accMatch[3] || '').trim();
            if (accText) state.acceptanceCriteria.push(accText);
            return;
        }

        const verMatch = line.match(/^\b(?:VERIFIED BY|VERIFIER)\s+(?:"([^"]+)"|'([^']+)'|(\S+))/i);
        if (verMatch) {
            state.verification = (verMatch[1] || verMatch[2] || verMatch[3] || '').trim();
            return;
        }

        if (line.startsWith('- ') || line.startsWith('* ')) {
            state.acceptanceCriteria.push(line.replace(/^[-*]\s+/, '').trim());
        }
    }

    _finalizeStatement(state) {
        let type = state.type;
        if (!type) {
            const combined = (state.id + ' ' + state.description).toLowerCase();
            if (/security|auth|jwt|encrypt|crypto|token|zero-trust|permission/i.test(combined)) {
                type = 'SECURITY';
            } else if (/compliance|iso|soc2|gdpr|audit|policy|legal/i.test(combined)) {
                type = 'COMPLIANCE';
            } else if (/performance|latency|throughput|scale|speed/i.test(combined)) {
                type = 'NON_FUNCTIONAL';
            } else {
                type = 'FUNCTIONAL';
            }
        }

        let priority = state.priority;
        if (!priority) {
            if (state.modality === 'MUST' || state.modality === 'SHALL') {
                priority = 'HIGH';
            } else if (state.modality === 'SHOULD') {
                priority = 'MEDIUM';
            } else {
                priority = 'LOW';
            }
        }

        const title = state.description.split('.')[0] || state.id;

        const statement = {
            kind: 'RequirementStatement',
            id: state.id,
            modality: state.modality,
            type,
            priority,
            description: state.description,
            acceptanceCriteria: state.acceptanceCriteria,
            verification: state.verification
        };

        const canonical = {
            id: state.id,
            title,
            type,
            description: state.description,
            acceptanceCriteria: state.acceptanceCriteria.length > 0 ? state.acceptanceCriteria : [`Verified by ${state.verification || 'test'}`],
            priority,
            verification: state.verification
        };

        return { statement, canonical };
    }
}

module.exports = RequirementDsl;
