/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Universal Search Engine (Stream 5)
 * File           : UniversalSearchEngine.js
 * Version        : 1.0.0
 * Author         : Enterprise Architecture Team & Ujomor Engineering
 * Organization   : Enterprise Architecture & Governance
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
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

'use strict';

const crypto = require('crypto');

/**
 * UniversalSearchEngine
 * Command Palette (Ctrl+K) Universal Search Engine indexing 12 core EAORCS domains:
 * Projects, Requirements, Services, Architecture, Policies, Evidence,
 * Developers, Deployments, Logs, Standards, Certificates, Specs.
 */
class UniversalSearchEngine {
    constructor(options = {}) {
        this.version = '1.0.0';
        this.index = new Map();
        this.supportedTypes = [
            'Projects',
            'Requirements',
            'Services',
            'Architecture',
            'Policies',
            'Evidence',
            'Developers',
            'Deployments',
            'Logs',
            'Standards',
            'Certificates',
            'Specs'
        ];

        // Seed initial index with authentic enterprise metadata across all 12 types
        if (options.autoSeed !== false) {
            this._seedInitialIndex();
        }
    }

    /**
     * Static helper search method for backwards compatibility.
     * @param {string} queryStr - Query string.
     * @param {Object} options - Search options.
     * @returns {Object|Array} Result object.
     */
    static search(queryStr = '', options = {}) {
        const engine = new UniversalSearchEngine();
        const res = engine.search(queryStr, options);
        // If caller expects an array, add compatibility array items accessor or return full object
        return res;
    }

    /**
     * Get list of supported index categories/types.
     * @returns {string[]} Supported types array.
     */
    getSupportedTypes() {
        return [...this.supportedTypes];
    }

    /**
     * Index a single item.
     * @param {Object} item - Item object containing { id, type, title, description, category, tags, ... }.
     */
    indexItem(item) {
        if (!item || !item.id || !item.type || !item.title) {
            throw new Error('UniversalSearchEngine: Item must contain id, type, and title.');
        }

        if (!this.supportedTypes.includes(item.type)) {
            throw new Error(`UniversalSearchEngine: Unsupported item type "${item.type}". Must be one of: ${this.supportedTypes.join(', ')}`);
        }

        const normalizedItem = {
            id: String(item.id),
            type: item.type,
            title: String(item.title),
            description: String(item.description || ''),
            category: item.category || item.type,
            tags: Array.isArray(item.tags) ? item.tags.map(t => String(t).toLowerCase()) : [],
            shortcut: item.shortcut || null,
            quickActions: Array.isArray(item.quickActions) ? item.quickActions : [
                { id: 'view', label: 'View Details', action: 'VIEW' },
                { id: 'inspect', label: 'Inspect Subsystem', action: 'INSPECT' }
            ],
            metadata: item.metadata || {},
            indexedAt: new Date().toISOString()
        };

        this.index.set(normalizedItem.id, normalizedItem);
        return normalizedItem;
    }

    /**
     * Bulk index multiple items.
     * @param {Object[]} items - Array of items.
     * @returns {number} Count of successfully indexed items.
     */
    indexBulk(items) {
        if (!Array.isArray(items)) {
            throw new Error('UniversalSearchEngine: indexBulk expects an array of items.');
        }
        let count = 0;
        for (const item of items) {
            this.indexItem(item);
            count++;
        }
        return count;
    }

    /**
     * Remove an item from the index by ID.
     * @param {string} id - Item ID.
     * @returns {boolean} True if removed, false if not found.
     */
    removeFromIndex(id) {
        return this.index.delete(String(id));
    }

    /**
     * Clear the entire search index.
     */
    clearIndex() {
        this.index.clear();
    }

    /**
     * Execute search across indexed items with scoring, filtering, and categorization.
     * @param {string} query - Search query string.
     * @param {Object} options - Search options { type, limit, threshold, tags }.
     * @returns {Object} Search results object.
     */
    search(query = '', options = {}) {
        const startTime = process.hrtime();

        const rawQuery = String(query).trim();
        const normalizedQuery = rawQuery.toLowerCase();
        const targetType = options.type || options.category || 'all';
        const limit = options.limit || 50;
        const threshold = options.threshold || 0.1;

        const results = [];
        const categoriesFoundSet = new Set();

        for (const item of this.index.values()) {
            // Type filtering
            if (targetType !== 'all' && targetType !== 'ALL') {
                if (Array.isArray(targetType)) {
                    if (!targetType.includes(item.type)) continue;
                } else if (item.type.toLowerCase() !== targetType.toLowerCase()) {
                    continue;
                }
            }

            // Calculate relevance score
            const score = this._calculateScore(normalizedQuery, item);

            if (score >= threshold || normalizedQuery === '') {
                categoriesFoundSet.add(item.type);
                results.push({
                    ...item,
                    score: parseFloat(score.toFixed(4))
                });
            }
        }

        // Sort by score descending, then title ascending
        results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

        const slicedResults = results.slice(0, limit);
        const diff = process.hrtime(startTime);
        const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

        return {
            query: rawQuery,
            totalResults: slicedResults.length,
            totalIndexedItems: this.index.size,
            categoriesFound: Array.from(categoriesFoundSet),
            executionTimeMs: Number(executionTimeMs),
            results: slicedResults
        };
    }

    /**
     * Calculate search relevance score (0.0 to 1.0)
     */
    _calculateScore(query, item) {
        if (!query) return 1.0;

        let score = 0;
        const idLower = item.id.toLowerCase();
        const titleLower = item.title.toLowerCase();
        const descLower = item.description.toLowerCase();
        const typeLower = item.type.toLowerCase();
        const catLower = item.category.toLowerCase();

        // Exact ID match
        if (idLower === query) return 1.0;
        if (idLower.includes(query)) score += 0.4;

        // Exact Title match
        if (titleLower === query) return 0.95;
        if (titleLower.startsWith(query)) score += 0.5;
        else if (titleLower.includes(query)) score += 0.35;

        // Description match
        if (descLower.includes(query)) score += 0.2;

        // Type / Category match
        if (typeLower.includes(query) || catLower.includes(query)) score += 0.25;

        // Tags match
        for (const tag of item.tags) {
            if (tag === query) {
                score += 0.3;
                break;
            } else if (tag.includes(query)) {
                score += 0.15;
            }
        }

        // Tokenized word matching
        const queryTokens = query.split(/\s+/).filter(Boolean);
        if (queryTokens.length > 1) {
            let matchedTokens = 0;
            const fullText = `${idLower} ${titleLower} ${descLower} ${typeLower} ${catLower} ${item.tags.join(' ')}`;
            for (const token of queryTokens) {
                if (fullText.includes(token)) matchedTokens++;
            }
            const tokenScore = (matchedTokens / queryTokens.length) * 0.3;
            score += tokenScore;
        }

        return Math.min(score, 1.0);
    }

    /**
     * Return index statistics and summary per category.
     * @returns {Object} Index stats.
     */
    getStats() {
        const stats = {
            totalIndexed: this.index.size,
            byType: {}
        };

        for (const type of this.supportedTypes) {
            stats.byType[type] = 0;
        }

        for (const item of this.index.values()) {
            stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
        }

        return stats;
    }

    /**
     * Seed initial enterprise inventory across all 12 categories.
     */
    _seedInitialIndex() {
        const seedData = [
            // 1. Projects
            {
                id: 'PRJ-EAORCS-CORE',
                type: 'Projects',
                title: 'EAORCS Platform Core Engine',
                description: 'Enterprise Autonomous Operation & Regulatory Compliance System core trust engine.',
                category: 'Core Engineering',
                tags: ['eaorcs', 'core', 'trust', 'governance'],
                shortcut: 'Ctrl+Shift+P',
                quickActions: [{ id: 'open-proj', label: 'Open Project', action: 'NAVIGATE' }]
            },
            {
                id: 'PRJ-AIR-ROOFERS',
                type: 'Projects',
                title: 'Air Roofers Federated DRI Engine',
                description: 'Federated Delivery Readiness Index (DRI) monitoring and compliance project.',
                category: 'Federated Operations',
                tags: ['airroofers', 'dri', 'compliance', 'sasu'],
                shortcut: 'Ctrl+Shift+A'
            },

            // 2. Requirements
            {
                id: 'REQ-UAIGOS-001',
                type: 'Requirements',
                title: 'REQ-001: Zero-Trust Deny-by-Default Boundary',
                description: 'All inter-service invocations must enforce strict zero-trust identity verification.',
                category: 'Security Requirements',
                tags: ['srs', 'zero-trust', 'security', 'iso27001'],
                shortcut: 'Ctrl+Shift+R'
            },
            {
                id: 'REQ-UAIGOS-002',
                type: 'Requirements',
                title: 'REQ-002: Immutable Cryptographic Evidence Bundling',
                description: 'Audit traces must be signed via Ed25519 and sealed in level A evidence bundles.',
                category: 'Compliance Requirements',
                tags: ['evidence', 'crypto', 'soc2', 'audit']
            },

            // 3. Services
            {
                id: 'SVC-AUDIT-KERNEL',
                type: 'Services',
                title: 'AuditEngineKernel Service',
                description: 'Execution DAG runner for calculating readiness scores and finding violations.',
                category: 'Subsystems',
                tags: ['kernel', 'dag', 'audit', 'engine'],
                shortcut: 'Ctrl+Shift+S'
            },
            {
                id: 'SVC-AI-CMD-CENTER',
                type: 'Services',
                title: 'AiCommandCenter Engine Service',
                description: 'Autonomous natural language prompt handling, effort estimation, and recommendation service.',
                category: 'AI Services',
                tags: ['ai', 'command-center', 'nlp', 'automation']
            },

            // 4. Architecture
            {
                id: 'ADR-001',
                type: 'Architecture',
                title: 'ADR-001: Modular Monolith Topology Freeze',
                description: 'Architecture Decision Record freezing Level 2/3 modular monolith domain boundaries.',
                category: 'Architecture Decision Records',
                tags: ['adr', 'topology', 'modular-monolith', 'freeze'],
                shortcut: 'Ctrl+Shift+M'
            },
            {
                id: 'ADR-002',
                type: 'Architecture',
                title: 'ADR-002: Event Bus & Schema Protocol Freeze',
                description: 'Freezes standard OpenAPI specifications and state transition matrices across engine modules.',
                category: 'Protocol Architecture',
                tags: ['adr', 'openapi', 'protocol', 'schema']
            },

            // 5. Policies
            {
                id: 'POL-SEC-001',
                type: 'Policies',
                title: 'POL-SEC-001: Zero-Trust Access Control Policy',
                description: 'Mandatory least-privilege security policy for all production environments.',
                category: 'Security Policies',
                tags: ['policy', 'security', 'zero-trust', 'owasp']
            },
            {
                id: 'POL-GOV-002',
                type: 'Policies',
                title: 'POL-GOV-002: Architecture Freeze & Drift Prevention Policy',
                description: 'Prohibits un-governed modular refactoring and unauthorized inter-domain coupling.',
                category: 'Governance Policies',
                tags: ['policy', 'governance', 'architecture', 'drift']
            },

            // 6. Evidence
            {
                id: 'EVI-BND-2026-001',
                type: 'Evidence',
                title: 'EVI-BND-001: Level A Master Evidence Bundle',
                description: 'Cryptographically signed audit trail verification bundle for Q3 release.',
                category: 'Audit Evidence',
                tags: ['evidence', 'bundle', 'signature', 'hmac']
            },
            {
                id: 'EVI-TRC-042',
                type: 'Evidence',
                title: 'EVI-TRC-042: Traceability Matrix Verification Proof',
                description: '100% bi-directional requirement to test mapping verification payload.',
                category: 'Quality Evidence',
                tags: ['traceability', 'matrix', 'verification', 'proof']
            },

            // 7. Developers
            {
                id: 'DEV-ARCH-LEAD',
                type: 'Developers',
                title: 'Enterprise Systems Architect',
                description: 'Lead authority for macro architecture, topology freeze, and UAIGOS governance compliance.',
                category: 'Engineering Personnel',
                tags: ['author', 'architect', 'lead', 'governance']
            },
            {
                id: 'DEV-SEC-OFFICER',
                type: 'Developers',
                title: 'Chief Security Officer',
                description: 'Security reviewer for zero-trust boundary policies and cryptographic protocols.',
                category: 'Security Personnel',
                tags: ['security', 'cso', 'auditor', 'reviewer']
            },

            // 8. Deployments
            {
                id: 'DEP-PROD-EUR1',
                type: 'Deployments',
                title: 'DEP-PROD-EUR1: AWS Eu-Central-1 Sovereign Cluster',
                description: 'Production primary deployment environment operating in high-availability multi-AZ mode.',
                category: 'Production Environments',
                tags: ['deployment', 'production', 'aws', 'sovereign']
            },
            {
                id: 'DEP-STG-US1',
                type: 'Deployments',
                title: 'DEP-STG-US1: US Staging Qualification Sandbox',
                description: 'Isolated staging sandbox environment used for automated regression qualification.',
                category: 'Staging Environments',
                tags: ['deployment', 'staging', 'sandbox', 'ci']
            },

            // 9. Logs
            {
                id: 'LOG-AUD-20260806',
                type: 'Logs',
                title: 'LOG-AUD: Master Audit Execution Log',
                description: 'Structured telemetry log stream capturing all 12-node DAG execution metrics.',
                category: 'Audit Logs',
                tags: ['log', 'telemetry', 'audit', 'dag']
            },
            {
                id: 'LOG-POL-DENY-4091',
                type: 'Logs',
                title: 'LOG-POL: Policy Engine Violation Audit Log',
                description: 'Audit log entry detailing unauthorized attempt to bypass schema freeze validation.',
                category: 'Security Logs',
                tags: ['log', 'policy', 'deny', 'security']
            },

            // 10. Standards
            {
                id: 'STD-ISO-25010',
                type: 'Standards',
                title: 'ISO/IEC 25010:2023 Systems and Software Quality',
                description: 'International standard for evaluating software quality characteristics and performance efficiency.',
                category: 'International Standards',
                tags: ['standard', 'iso25010', 'quality', 'performance']
            },
            {
                id: 'STD-ISO-27001',
                type: 'Standards',
                title: 'ISO/IEC 27001:2022 Information Security Management',
                description: 'Global standard specifying requirements for establishing ISMS controls.',
                category: 'Security Standards',
                tags: ['standard', 'iso27001', 'security', 'isms']
            },

            // 11. Certificates
            {
                id: 'CRT-EAORCS-2026',
                type: 'Certificates',
                title: 'CRT-2026: EAORCS Master System Certificate',
                description: 'Official master platform qualification certificate issued by Enterprise Audit Authority.',
                category: 'System Certificates',
                tags: ['certificate', 'master', 'qualification', 'eaorcs']
            },
            {
                id: 'CRT-OSAP-PASSPORT',
                type: 'Certificates',
                title: 'CRT-OSAP: Sovereign AI Passport Certificate',
                description: 'Open Sovereign AI Platform passport granting distribution compliance status.',
                category: 'Sovereign Certificates',
                tags: ['certificate', 'osap', 'passport', 'sovereign']
            },

            // 12. Specs
            {
                id: 'SPEC-UTCF-v1.2',
                type: 'Specs',
                title: 'SPEC-UTCF-v1.2: Universal Trust Protocol Spec',
                description: 'Technical specification defining cryptographic attestation exchange formats.',
                category: 'Technical Specifications',
                tags: ['spec', 'utcf', 'protocol', 'trust']
            },
            {
                id: 'SPEC-EXEC-DAG-v2.0',
                type: 'Specs',
                title: 'SPEC-EXEC-DAG-v2.0: Directed Acyclic Graph Spec',
                description: 'Canonical graph spec hash definition for deterministic engine execution.',
                category: 'Engine Specifications',
                tags: ['spec', 'dag', 'execution', 'graph']
            }
        ];

        this.indexBulk(seedData);
    }
}

module.exports = UniversalSearchEngine;
