/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Requirement Generator (Stream G)
 * File           : RequirementGenerator.js
 * Version        : 1.1.0
 * Author         : Enterprise Architecture Team & Ujomor Engineering
 * Organization   : Enterprise Architecture & Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Enterprise Architecture & Governance
 * All Rights Reserved.
 ******************************************************************************/

const crypto = require('crypto');

class RequirementGenerator {
    constructor() {
        this.requirementList = [];
    }

    /**
     * Synthesize granular functional and technical requirements from a high-level vision statement.
     * @param {string|Array<string>} visionStatement - Vision statement or array of statements.
     * @param {Object} [context={}] - Additional domain or context flags.
     * @returns {Array<Object>} List of synthesized requirement objects.
     */
    synthesizeRequirements(visionStatement, context = {}) {
        if (!visionStatement) {
            throw new Error("Vision statement must be provided to synthesize requirements.");
        }

        const statements = Array.isArray(visionStatement) 
            ? visionStatement 
            : String(visionStatement).split(/[.\n]+/).map(s => s.trim()).filter(Boolean);

        const fullText = (Array.isArray(visionStatement) ? visionStatement.join(' ') : String(visionStatement)).toLowerCase();
        
        this.requirementList = [];

        // Synthesize Functional Requirements (FR)
        let frIndex = 1;
        statements.forEach((stmt) => {
            if (stmt.length < 5) return;
            const frId = `FR-${String(frIndex++).padStart(3, '0')}`;
            this.requirementList.push({
                id: frId,
                type: 'FUNCTIONAL',
                title: this._createTitleFromStatement(stmt),
                description: `The system shall support: ${stmt}.`,
                priority: frIndex <= 3 ? 'MUST' : 'SHOULD',
                boundedContext: this._inferBoundedContext(stmt),
                acceptanceCriteria: [
                    `Verification test case executes for "${stmt}" without error.`,
                    `State transitions and input validations strictly adhere to domain rules.`,
                    `Audit logs capture execution of ${frId}.`
                ]
            });
        });

        // Always ensure baseline Functional Requirements if statement list was short
        if (this.requirementList.filter(r => r.type === 'FUNCTIONAL').length === 0) {
            this.requirementList.push({
                id: 'FR-001',
                type: 'FUNCTIONAL',
                title: 'Core Business Domain Execution',
                description: `The system shall execute primary domain capabilities as defined in user vision: ${fullText}`,
                priority: 'MUST',
                boundedContext: 'Core Engine',
                acceptanceCriteria: ['Primary workflow executes end-to-end successfully.']
            });
        }

        // Synthesize Technical Requirements (TR)
        let trIndex = 1;

        // Security / Auth Technical Requirement
        this.requirementList.push({
            id: `TR-${String(trIndex++).padStart(3, '0')}`,
            type: 'TECHNICAL',
            title: 'Role-Based Authentication & Authorization',
            description: 'The platform must enforce Zero-Trust RBAC authentication using JSON Web Tokens (JWT) / OAuth2 with cryptographically signed tokens.',
            priority: 'MUST',
            boundedContext: 'Security & Auth',
            acceptanceCriteria: [
                'Unauthenticated requests return 401 Unauthorized.',
                'Access attempts without required role return 403 Forbidden.',
                'Tokens expire after configured TTL.'
            ]
        });

        // Data Storage & Cryptography
        this.requirementList.push({
            id: `TR-${String(trIndex++).padStart(3, '0')}`,
            type: 'TECHNICAL',
            title: 'Data Persistence & Cryptographic Isolation',
            description: 'All sensitive data entities must be encrypted at rest using AES-256-GCM and stored with column-level or document-level isolation.',
            priority: 'MUST',
            boundedContext: 'Data Layer',
            acceptanceCriteria: [
                'Encryption keys are loaded dynamically from secure environment/vault.',
                'Plaintext sensitive values never appear in raw database storage or logs.'
            ]
        });

        // Telemetry & Audit Logging
        this.requirementList.push({
            id: `TR-${String(trIndex++).padStart(3, '0')}`,
            type: 'TECHNICAL',
            title: 'Structured Audit Telemetry & Observability',
            description: 'The platform must record structured JSON audit logs for every API call and state mutation with correlation IDs.',
            priority: 'MUST',
            boundedContext: 'Observability',
            acceptanceCriteria: [
                'Log entries contain correlation ID, timestamp, actor ID, action, and result status.',
                'Audit logs are written to immutable storage target.'
            ]
        });

        // Specialized domain technical requirements based on keywords
        if (fullText.includes('video') || fullText.includes('stream') || fullText.includes('realtime') || fullText.includes('real-time')) {
            this.requirementList.push({
                id: `TR-${String(trIndex++).padStart(3, '0')}`,
                type: 'TECHNICAL',
                title: 'Real-Time Communication Media Pipeline',
                description: 'The infrastructure must provide sub-100ms latency streaming via WebRTC/WebSocket protocols with fallback relay support.',
                priority: 'MUST',
                boundedContext: 'Media Engine',
                acceptanceCriteria: [
                    'P95 latency remains below 100ms under standard network conditions.',
                    'Automatic reconnection logic triggers upon disconnect.'
                ]
            });
        }

        if (fullText.includes('multi-tenant') || fullText.includes('tenant') || fullText.includes('saas')) {
            this.requirementList.push({
                id: `TR-${String(trIndex++).padStart(3, '0')}`,
                type: 'TECHNICAL',
                title: 'Multi-Tenant Data & Resource Isolation',
                description: 'Strict tenant-id filtering and query scoping must prevent cross-tenant data leakage across all APIs.',
                priority: 'MUST',
                boundedContext: 'Tenancy Engine',
                acceptanceCriteria: [
                    'Every database query automatically appends tenant isolation scope.',
                    'Cross-tenant resource request returns 403 Forbidden.'
                ]
            });
        }

        return [...this.requirementList];
    }

    /**
     * Get the synthesized requirement list.
     * @returns {Array<Object>} List of requirements.
     */
    getRequirementList() {
        return [...this.requirementList];
    }

    /**
     * Infer bounded context from statement text.
     * @private
     */
    _inferBoundedContext(statement) {
        const text = statement.toLowerCase();
        if (text.includes('user') || text.includes('auth') || text.includes('login') || text.includes('role')) return 'Identity & Access';
        if (text.includes('patient') || text.includes('record') || text.includes('consult') || text.includes('medical')) return 'Clinical Services';
        if (text.includes('pay') || text.includes('billing') || text.includes('invoice') || text.includes('card')) return 'Billing & Financials';
        if (text.includes('report') || text.includes('analytics') || text.includes('metric')) return 'Analytics & Reporting';
        return 'Core System Engine';
    }

    /**
     * Format a clean title from a requirement statement.
     * @private
     */
    _createTitleFromStatement(statement) {
        let title = statement.replace(/^(build|create|implement|provide|support|allow|enable)\s+/i, '');
        title = title.charAt(0).toUpperCase() + title.slice(1);
        if (title.length > 50) {
            title = title.substring(0, 47) + '...';
        }
        return title;
    }
}

module.exports = RequirementGenerator;
