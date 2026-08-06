/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : engine/knowledge
 * File           : ExpandedKnowledgeGraphEngine.js
 * Version        : 2026.2.0-LTS
 * Author         : Enterprise Architecture & Governance Team
 * Organization   : Ujomor Systems & Enterprise Governance Authority
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Enterprise Architecture Controlled
 * - Security Reviewed
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST SP 800-161
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance Authority.
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * 19 Domain Entity Types across Technical, Architectural, Organizational, & Governance domains.
 */
const ENTITY_TYPES = Object.freeze({
    // Technical & Architecture
    REQUIREMENT: 'Requirement',
    SPECIFICATION: 'Specification',
    ARCHITECTURE: 'Architecture',
    SOURCE_CODE: 'SourceCode',
    TESTS: 'Tests',
    EVIDENCE: 'Evidence',
    DEPLOYMENT: 'Deployment',
    API: 'API',

    // Organizational & Governance
    REGULATION: 'Regulation',
    CONTRACT: 'Contract',
    ADR: 'ADR',
    RISK: 'Risk',
    THREAT_MODEL: 'ThreatModel',
    BUSINESS_CAPABILITY: 'BusinessCapability',
    TEAM: 'Team',
    VENDOR: 'Vendor',
    ASSET: 'Asset',
    LICENSE: 'License',
    COST_CENTER: 'CostCenter'
});

/**
 * High-Level Domain Category Groupings
 */
const DOMAIN_CATEGORIES = Object.freeze({
    TECHNICAL_AND_ARCHITECTURE: [
        'Requirement', 'Specification', 'Architecture', 'SourceCode',
        'Tests', 'Evidence', 'Deployment', 'API'
    ],
    ORGANIZATIONAL_AND_GOVERNANCE: [
        'Regulation', 'Contract', 'ADR', 'Risk',
        'ThreatModel', 'BusinessCapability', 'Team', 'Vendor',
        'Asset', 'License', 'CostCenter'
    ]
});

/**
 * Canonical Cross-Domain Relationship Types
 */
const RELATIONSHIP_TYPES = Object.freeze({
    GOVERNS: 'GOVERNS',           // Regulation -> Contract / Risk
    SPECIFIES: 'SPECIFIES',         // Requirement -> Specification
    ARCHITECTS: 'ARCHITECTS',       // ADR / Spec -> Architecture
    IMPLEMENTS: 'IMPLEMENTS',       // Architecture -> SourceCode / API
    VERIFIES: 'VERIFIES',           // SourceCode / API -> Tests
    PROVES: 'PROVES',               // Tests -> Evidence
    DEPLOYS: 'DEPLOYS',             // Evidence / SourceCode -> Deployment
    EXPOSES: 'EXPOSES',             // SourceCode -> API
    MITIGATES: 'MITIGATES',         // Architecture / Requirement -> ThreatModel / Risk
    MODELS_THREAT: 'MODELS_THREAT', // ThreatModel -> SourceCode / Asset
    BOUND_TO: 'BOUND_TO',           // Contract -> Vendor / License
    OWNS: 'OWNS',                   // Team -> Asset / BusinessCapability
    SUPPLIES: 'SUPPLIES',           // Vendor -> SourceCode / Asset
    COSTS_TO: 'COSTS_TO',           // Asset / Team -> CostCenter
    LICENSES: 'LICENSES',           // License -> SourceCode / Vendor
    REFERENCES_ADR: 'REFERENCES_ADR' // Architecture -> ADR
});

/**
 * ExpandedKnowledgeGraphEngine
 * Manages an interconnected 13+ domain software knowledge graph spanning technical artifacts,
 * architectural decisions, organizational structures, and enterprise governance compliance models.
 */
class ExpandedKnowledgeGraphEngine {
    constructor(config = {}) {
        this.graphId = config.graphId || `EKG-${crypto.randomBytes(4).toString('hex')}`;
        this.version = '2026.2.0-LTS';
        this.nodes = new Map();
        this.edges = new Map();

        // Seed default 13+ domain graph structure
        this._initializeDefaultGraph();
    }

    /**
     * Retrieves the complete 13+ Domain Knowledge Graph representation.
     * Guaranteed to return entityTypesCount >= 13.
     * 
     * @returns {Object} Graph representation containing node & edge collections and category metrics
     */
    get13DomainGraph() {
        const nodeList = Array.from(this.nodes.values());
        const edgeList = Array.from(this.edges.values());

        const entityTypeSet = new Set(nodeList.map(n => n.type));
        const entityTypesCount = entityTypeSet.size;

        const summaryByCategory = {
            technicalAndArchitecture: nodeList.filter(n => DOMAIN_CATEGORIES.TECHNICAL_AND_ARCHITECTURE.includes(n.type)).length,
            organizationalAndGovernance: nodeList.filter(n => DOMAIN_CATEGORIES.ORGANIZATIONAL_AND_GOVERNANCE.includes(n.type)).length
        };

        const entityTypeBreakdown = {};
        Object.values(ENTITY_TYPES).forEach(type => {
            entityTypeBreakdown[type] = nodeList.filter(n => n.type === type).length;
        });

        return {
            graphId: this.graphId,
            timestamp: new Date().toISOString(),
            version: this.version,
            entityTypesCount,
            totalEntityTypesAvailable: Object.keys(ENTITY_TYPES).length,
            categories: DOMAIN_CATEGORIES,
            nodeCount: nodeList.length,
            edgeCount: edgeList.length,
            summaryByCategory,
            entityTypeBreakdown,
            nodes: nodeList,
            edges: edgeList
        };
    }

    /**
     * Adds an entity node to the knowledge graph.
     * 
     * @param {Object} node - Entity node definition
     * @returns {Object} Added node
     */
    addNode(node = {}) {
        if (!node.id || !node.type || !node.name) {
            throw new Error('Node must have valid id, type, and name properties.');
        }

        const validTypes = Object.values(ENTITY_TYPES);
        if (!validTypes.includes(node.type)) {
            throw new Error(`Invalid entity type '${node.type}'. Supported types: ${validTypes.join(', ')}`);
        }

        const category = DOMAIN_CATEGORIES.TECHNICAL_AND_ARCHITECTURE.includes(node.type)
            ? 'TECHNICAL_AND_ARCHITECTURE'
            : 'ORGANIZATIONAL_AND_GOVERNANCE';

        const storedNode = {
            id: node.id,
            type: node.type,
            name: node.name,
            category,
            properties: node.properties || {},
            createdAt: node.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.nodes.set(storedNode.id, storedNode);
        return storedNode;
    }

    /**
     * Adds a directed relationship edge between two entity nodes.
     * 
     * @param {Object} edge - Edge definition
     * @returns {Object} Added edge
     */
    addEdge(edge = {}) {
        if (!edge.id || !edge.sourceId || !edge.targetId || !edge.relationship) {
            throw new Error('Edge must contain id, sourceId, targetId, and relationship.');
        }
        if (!this.nodes.has(edge.sourceId)) {
            throw new Error(`Source node '${edge.sourceId}' does not exist in graph.`);
        }
        if (!this.nodes.has(edge.targetId)) {
            throw new Error(`Target node '${edge.targetId}' does not exist in graph.`);
        }

        const storedEdge = {
            id: edge.id,
            sourceId: edge.sourceId,
            targetId: edge.targetId,
            relationship: edge.relationship,
            metadata: edge.metadata || {},
            createdAt: edge.createdAt || new Date().toISOString()
        };

        this.edges.set(storedEdge.id, storedEdge);
        return storedEdge;
    }

    /**
     * Retrieves a node by ID.
     * 
     * @param {string} nodeId 
     * @returns {Object|null} Node object or null if not found
     */
    getNode(nodeId) {
        return this.nodes.get(nodeId) || null;
    }

    /**
     * Queries nodes based on category, type, or search properties.
     * 
     * @param {Object} filter - Query parameters
     * @returns {Array<Object>} Matching nodes
     */
    queryGraph(filter = {}) {
        let results = Array.from(this.nodes.values());

        if (filter.category) {
            results = results.filter(n => n.category === filter.category);
        }
        if (filter.type) {
            results = results.filter(n => n.type === filter.type);
        }
        if (filter.nameContains) {
            const q = filter.nameContains.toLowerCase();
            results = results.filter(n => n.name.toLowerCase().includes(q));
        }

        return results;
    }

    /**
     * Traces upstream/downstream lineage starting from a target node.
     * 
     * @param {string} startNodeId - Root node ID for trace
     * @param {string} direction - 'FORWARD' (downstream) or 'BACKWARD' (upstream)
     * @returns {Object} Lineage chain & connected paths
     */
    traceLineage(startNodeId, direction = 'FORWARD') {
        const root = this.getNode(startNodeId);
        if (!root) {
            throw new Error(`Node '${startNodeId}' not found.`);
        }

        const visitedNodes = new Set();
        const traceEdges = [];
        const queue = [startNodeId];

        while (queue.length > 0) {
            const currentId = queue.shift();
            if (visitedNodes.has(currentId)) continue;
            visitedNodes.add(currentId);

            for (const edge of this.edges.values()) {
                if (direction === 'FORWARD' && edge.sourceId === currentId) {
                    traceEdges.push(edge);
                    if (!visitedNodes.has(edge.targetId)) queue.push(edge.targetId);
                } else if (direction === 'BACKWARD' && edge.targetId === currentId) {
                    traceEdges.push(edge);
                    if (!visitedNodes.has(edge.sourceId)) queue.push(edge.sourceId);
                }
            }
        }

        const traceNodes = Array.from(visitedNodes).map(id => this.getNode(id));

        return {
            startNodeId,
            direction,
            nodeCount: traceNodes.length,
            edgeCount: traceEdges.length,
            nodes: traceNodes,
            edges: traceEdges
        };
    }

    /**
     * Internal seed populating a default 19-domain graph instance.
     * @private
     */
    _initializeDefaultGraph() {
        // Technical & Architecture Nodes (8 types)
        this.addNode({ id: 'REQ-101', type: ENTITY_TYPES.REQUIREMENT, name: 'Zero-Trust Token Propagation Requirement', properties: { priority: 'P0' } });
        this.addNode({ id: 'SPEC-201', type: ENTITY_TYPES.SPECIFICATION, name: 'mTLS Authentication Protocol Spec', properties: { status: 'APPROVED' } });
        this.addNode({ id: 'ARCH-301', type: ENTITY_TYPES.ARCHITECTURE, name: 'Decoupled API Gateway Microservices', properties: { tier: 'Tier-1' } });
        this.addNode({ id: 'SRC-401', type: ENTITY_TYPES.SOURCE_CODE, name: 'engine/ai/PredictiveTrustIntelligenceEngine.js', properties: { lines: 250 } });
        this.addNode({ id: 'TST-501', type: ENTITY_TYPES.TESTS, name: 'tests/runtime/category_leading_platform.test.js', properties: { coverage: 96.5 } });
        this.addNode({ id: 'EVD-601', type: ENTITY_TYPES.EVIDENCE, name: 'Cryptographic Provenance Attestation Bundle', properties: { signatureAlg: 'Ed25519' } });
        this.addNode({ id: 'DEP-701', type: ENTITY_TYPES.DEPLOYMENT, name: 'Prod Region EU-West Kubernetes Cluster', properties: { replicas: 6 } });
        this.addNode({ id: 'API-801', type: ENTITY_TYPES.API, name: 'REST /api/v1/predictive-trust', properties: { rateLimit: '1000/min' } });

        // Organizational & Governance Nodes (11 types)
        this.addNode({ id: 'REG-901', type: ENTITY_TYPES.REGULATION, name: 'EU Cyber Resiliency Act (CRA)', properties: { mandatoryYear: 2026 } });
        this.addNode({ id: 'CTR-902', type: ENTITY_TYPES.CONTRACT, name: 'Enterprise Cloud Infrastructure SLA Contract', properties: { uptimeSla: '99.99%' } });
        this.addNode({ id: 'ADR-903', type: ENTITY_TYPES.ADR, name: 'ADR-DEC-2026-081 Async Event Replication', properties: { status: 'ACCEPTED' } });
        this.addNode({ id: 'RSK-904', type: ENTITY_TYPES.RISK, name: 'Third-Party Dependency Transitive Vulnerability', properties: { score: 'HIGH' } });
        this.addNode({ id: 'TM-905', type: ENTITY_TYPES.THREAT_MODEL, name: 'STRIDE Threat Model for API Ingress', properties: { verified: true } });
        this.addNode({ id: 'CAP-906', type: ENTITY_TYPES.BUSINESS_CAPABILITY, name: 'Automated Trust & Readiness Certification', properties: { domain: 'Governance' } });
        this.addNode({ id: 'TM-907', type: ENTITY_TYPES.TEAM, name: 'Platform Engineering & Architecture Governance', properties: { members: 12 } });
        this.addNode({ id: 'VND-908', type: ENTITY_TYPES.VENDOR, name: 'Cloud Infrastructure Services Corp', properties: { riskTier: 'LOW' } });
        this.addNode({ id: 'AST-909', type: ENTITY_TYPES.ASSET, name: 'Primary Storage Cluster DB-PRD-01', properties: { encrypted: true } });
        this.addNode({ id: 'LIC-910', type: ENTITY_TYPES.LICENSE, name: 'Apache 2.0 Open Source License', properties: { permissive: true } });
        this.addNode({ id: 'CC-911', type: ENTITY_TYPES.COST_CENTER, name: 'CC-ENGR-8400 Platform Operations', properties: { budgetAllocatedUSD: 500000 } });

        // Edges connecting across technical & governance domains
        this.addEdge({ id: 'EDG-01', sourceId: 'REG-901', targetId: 'CTR-902', relationship: RELATIONSHIP_TYPES.GOVERNS });
        this.addEdge({ id: 'EDG-02', sourceId: 'CTR-902', targetId: 'REQ-101', relationship: RELATIONSHIP_TYPES.SPECIFIES });
        this.addEdge({ id: 'EDG-03', sourceId: 'REQ-101', targetId: 'SPEC-201', relationship: RELATIONSHIP_TYPES.SPECIFIES });
        this.addEdge({ id: 'EDG-04', sourceId: 'SPEC-201', targetId: 'ADR-903', relationship: RELATIONSHIP_TYPES.REFERENCES_ADR });
        this.addEdge({ id: 'EDG-05', sourceId: 'ADR-903', targetId: 'ARCH-301', relationship: RELATIONSHIP_TYPES.ARCHITECTS });
        this.addEdge({ id: 'EDG-06', sourceId: 'ARCH-301', targetId: 'API-801', relationship: RELATIONSHIP_TYPES.EXPOSES });
        this.addEdge({ id: 'EDG-07', sourceId: 'ARCH-301', targetId: 'SRC-401', relationship: RELATIONSHIP_TYPES.IMPLEMENTS });
        this.addEdge({ id: 'EDG-08', sourceId: 'SRC-401', targetId: 'TST-501', relationship: RELATIONSHIP_TYPES.VERIFIES });
        this.addEdge({ id: 'EDG-09', sourceId: 'TST-501', targetId: 'EVD-601', relationship: RELATIONSHIP_TYPES.PROVES });
        this.addEdge({ id: 'EDG-10', sourceId: 'EVD-601', targetId: 'DEP-701', relationship: RELATIONSHIP_TYPES.DEPLOYS });
        this.addEdge({ id: 'EDG-11', sourceId: 'TM-907', targetId: 'CAP-906', relationship: RELATIONSHIP_TYPES.OWNS });
        this.addEdge({ id: 'EDG-12', sourceId: 'VND-908', targetId: 'AST-909', relationship: RELATIONSHIP_TYPES.SUPPLIES });
        this.addEdge({ id: 'EDG-13', sourceId: 'AST-909', targetId: 'CC-911', relationship: RELATIONSHIP_TYPES.COSTS_TO });
        this.addEdge({ id: 'EDG-14', sourceId: 'LIC-910', targetId: 'SRC-401', relationship: RELATIONSHIP_TYPES.LICENSES });
        this.addEdge({ id: 'EDG-15', sourceId: 'TM-905', targetId: 'RSK-904', relationship: RELATIONSHIP_TYPES.MITIGATES });
    }
}

module.exports = ExpandedKnowledgeGraphEngine;
