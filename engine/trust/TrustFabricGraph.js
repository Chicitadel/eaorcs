/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Trust Fabric Graph Engine
 * File           : TrustFabricGraph.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Authority & Systems Engineering
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
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

/**
 * TrustFabricGraph
 * In-memory graph database and multi-domain relationship engine for EAORCS.
 * 
 * Supports 4 specialized graph domains / views:
 * 1. Provenance Graph (source artifacts, commits, authors, builds, signatures, repositories)
 * 2. Evidence Graph (test results, security scans, telemetry observations, attestation proofs, audit records)
 * 3. Business Graph (domain capabilities, policies, compliance requirements, SLA/SLOs, organizational units)
 * 4. Dependency Graph (module relationships, service dependencies, API specs, package dependencies)
 */
class TrustFabricGraph {
    constructor(options = {}) {
        this.graphId = options.graphId || `tfg_${Date.now()}`;
        this.nodes = new Map();
        this.edges = [];
        this.domains = ['PROVENANCE', 'EVIDENCE', 'BUSINESS', 'DEPENDENCY'];

        if (options.autoInitialize !== false) {
            this.initializeDefaultFabric();
        }
    }

    /**
     * Seeds initial enterprise trust fabric nodes and relationships for EAORCS platform
     */
    initializeDefaultFabric() {
        // Business Domain Nodes
        this.addNode({
            id: 'biz_governance_constitution',
            domain: 'BUSINESS',
            type: 'Policy',
            label: 'UAIGOS Core Constitution',
            trustWeight: 1.0,
            metadata: { level: 'IMMUTABLE_LAW' }
        });
        this.addNode({
            id: 'biz_arch_spec',
            domain: 'BUSINESS',
            type: 'Specification',
            label: 'EAORCS 15-Domain Assurance Model',
            trustWeight: 1.0,
            metadata: { maturity: 'LEVEL_5' }
        });

        // Provenance Domain Nodes
        this.addNode({
            id: 'prov_core_repo',
            domain: 'PROVENANCE',
            type: 'Repository',
            label: 'd:/ujomor-platform/products/eaorcs',
            trustWeight: 1.0,
            metadata: { branch: 'main', commit: 'HEAD' }
        });
        this.addNode({
            id: 'prov_build_kernel',
            domain: 'PROVENANCE',
            type: 'BuildArtifact',
            label: 'EAORCS Core Audit Kernel Build',
            trustWeight: 0.98,
            metadata: { buildId: 'BUILD-2026.1' }
        });

        // Evidence Domain Nodes
        this.addNode({
            id: 'evid_sec_verifier',
            domain: 'EVIDENCE',
            type: 'Verifier',
            label: 'Security & Zero-Trust Verifier',
            trustWeight: 0.99,
            metadata: { status: 'VERIFIED' }
        });
        this.addNode({
            id: 'evid_test_suite',
            domain: 'EVIDENCE',
            type: 'Observation',
            label: 'Automated Test & Audit Evidence Suite',
            trustWeight: 0.96,
            metadata: { coverage: '98.5%' }
        });

        // Dependency Domain Nodes
        this.addNode({
            id: 'dep_osap_engine',
            domain: 'DEPENDENCY',
            type: 'Subsystem',
            label: 'OSAP v2.0 Protocol Engine',
            trustWeight: 1.0,
            metadata: { spec: 'OSAP-2.0.0' }
        });
        this.addNode({
            id: 'dep_crypto_signer',
            domain: 'DEPENDENCY',
            type: 'CryptoModule',
            label: 'Ed25519 Cryptographic Signer',
            trustWeight: 1.0,
            metadata: { algorithm: 'Ed25519' }
        });

        // Edges & Relationships
        this.addEdge('evid_sec_verifier', 'biz_arch_spec', 'VERIFIES', 0.98);
        this.addEdge('evid_test_suite', 'evid_sec_verifier', 'SUPPORTS', 0.96);
        this.addEdge('evid_sec_verifier', 'biz_governance_constitution', 'VALIDATES', 1.0);
        this.addEdge('prov_build_kernel', 'prov_core_repo', 'BUILT_FROM', 1.0);
        this.addEdge('evid_test_suite', 'prov_build_kernel', 'ATTESTS', 0.95);
        this.addEdge('dep_osap_engine', 'dep_crypto_signer', 'USES_CRYPTO', 1.0);
        this.addEdge('dep_osap_engine', 'evid_sec_verifier', 'EXPORTS_PROOF', 0.99);
    }

    /**
     * Add a node to the graph
     * @param {Object} node - { id, domain, type, label, trustWeight, metadata }
     * @returns {Object} Added node object
     */
    addNode(node) {
        if (!node || !node.id || !node.label) {
            throw new Error('TrustFabricGraph: Node id and label are required');
        }

        const domain = (node.domain || 'BUSINESS').toUpperCase();
        const nodeObj = {
            id: String(node.id),
            domain: this.domains.includes(domain) ? domain : 'BUSINESS',
            type: node.type || 'GenericNode',
            label: String(node.label),
            trustWeight: Math.max(0.0, Math.min(1.0, Number(node.trustWeight ?? 0.8))),
            metadata: node.metadata || {},
            createdAt: node.createdAt || new Date().toISOString()
        };

        this.nodes.set(nodeObj.id, nodeObj);
        return nodeObj;
    }

    /**
     * Remove a node and associated edges
     * @param {string} id
     * @returns {boolean} True if removed
     */
    removeNode(id) {
        if (!this.nodes.has(id)) return false;
        this.nodes.delete(id);
        this.edges = this.edges.filter(e => e.source !== id && e.target !== id);
        return true;
    }

    /**
     * Retrieve a node by ID
     * @param {string} id
     * @returns {Object|null}
     */
    getNode(id) {
        return this.nodes.get(id) || null;
    }

    /**
     * Check if node exists
     * @param {string} id
     * @returns {boolean}
     */
    hasNode(id) {
        return this.nodes.has(id);
    }

    /**
     * Add a directed edge between nodes
     * @param {string} source - Source node ID
     * @param {string} target - Target node ID
     * @param {string} relationship - Edge relationship type (e.g., 'VERIFIES', 'DEPENDS_ON')
     * @param {number} [weight=1.0] - Relationship weight factor (0.0 to 1.0)
     * @param {Object} [metadata={}] - Edge metadata
     * @returns {Object} Edge record
     */
    addEdge(source, target, relationship = 'RELATED_TO', weight = 1.0, metadata = {}) {
        if (!this.nodes.has(source)) {
            throw new Error(`TrustFabricGraph: Source node '${source}' does not exist in graph`);
        }
        if (!this.nodes.has(target)) {
            throw new Error(`TrustFabricGraph: Target node '${target}' does not exist in graph`);
        }

        const edgeObj = {
            id: `edge_${source}_${target}_${relationship}`,
            source: String(source),
            target: String(target),
            relationship: String(relationship).toUpperCase(),
            weight: Math.max(0.0, Math.min(1.0, Number(weight))),
            metadata: metadata || {}
        };

        // Prevent exact duplicate edge
        const existingIdx = this.edges.findIndex(e => e.source === source && e.target === target && e.relationship === edgeObj.relationship);
        if (existingIdx >= 0) {
            this.edges[existingIdx] = edgeObj;
        } else {
            this.edges.push(edgeObj);
        }

        return edgeObj;
    }

    /**
     * Remove an edge
     * @param {string} source
     * @param {string} target
     * @param {string} [relationship]
     * @returns {boolean} True if removed
     */
    removeEdge(source, target, relationship = null) {
        const initialLen = this.edges.length;
        this.edges = this.edges.filter(e => {
            if (e.source === source && e.target === target) {
                if (relationship) return e.relationship !== relationship.toUpperCase();
                return false;
            }
            return true;
        });
        return this.edges.length < initialLen;
    }

    /**
     * Get edges connected to a node
     * @param {string} nodeId
     * @param {string} [direction='both'] - 'outgoing' | 'incoming' | 'both'
     * @returns {Array<Object>}
     */
    getEdges(nodeId, direction = 'both') {
        return this.edges.filter(e => {
            if (direction === 'outgoing') return e.source === nodeId;
            if (direction === 'incoming') return e.target === nodeId;
            return e.source === nodeId || e.target === nodeId;
        });
    }

    /**
     * Get neighboring nodes
     * @param {string} nodeId
     * @param {string} [direction='both']
     * @returns {Array<Object>} Neighboring nodes
     */
    getNeighbors(nodeId, direction = 'both') {
        const connectedEdges = this.getEdges(nodeId, direction);
        const neighborIds = new Set();

        connectedEdges.forEach(e => {
            if (e.source === nodeId) neighborIds.add(e.target);
            if (e.target === nodeId) neighborIds.add(e.source);
        });

        return Array.from(neighborIds).map(id => this.nodes.get(id)).filter(Boolean);
    }

    /**
     * Finds paths between two nodes using Breadth-First Search (BFS)
     * @param {string} startNodeId
     * @param {string} endNodeId
     * @param {number} [maxDepth=10]
     * @returns {Array<Array<string>>} Array of paths (each path is an array of node IDs)
     */
    findPaths(startNodeId, endNodeId, maxDepth = 10) {
        if (!this.nodes.has(startNodeId) || !this.nodes.has(endNodeId)) return [];
        if (startNodeId === endNodeId) return [[startNodeId]];

        const paths = [];
        const queue = [[startNodeId]];

        while (queue.length > 0) {
            const currentPath = queue.shift();
            if (currentPath.length > maxDepth) continue;

            const lastNode = currentPath[currentPath.length - 1];
            if (lastNode === endNodeId) {
                paths.push(currentPath);
                continue;
            }

            const outgoingEdges = this.getEdges(lastNode, 'outgoing');
            for (const edge of outgoingEdges) {
                if (!currentPath.includes(edge.target)) {
                    queue.push([...currentPath, edge.target]);
                }
            }
        }

        return paths;
    }

    /**
     * Traverses graph starting from a node using visitor function
     * @param {string} startNodeId
     * @param {Function} visitorFn - (node, depth, path) => void
     * @param {Object} [options] - { maxDepth, direction }
     */
    traverse(startNodeId, visitorFn, options = {}) {
        if (!this.nodes.has(startNodeId) || typeof visitorFn !== 'function') return;

        const maxDepth = options.maxDepth || 10;
        const direction = options.direction || 'outgoing';
        const visited = new Set();

        const dfs = (nodeId, depth, pathArr) => {
            if (depth > maxDepth || visited.has(nodeId)) return;
            visited.add(nodeId);

            const node = this.nodes.get(nodeId);
            visitorFn(node, depth, pathArr);

            const edges = this.getEdges(nodeId, direction);
            for (const edge of edges) {
                const nextId = edge.source === nodeId ? edge.target : edge.source;
                dfs(nextId, depth + 1, [...pathArr, nodeId]);
            }
        };

        dfs(startNodeId, 0, []);
    }

    /**
     * Subgraph query filtered by domain, type, or predicate function
     * @param {Function|Object} criteria - Filter function or criteria object { domain, type, minTrust }
     * @returns {TrustFabricGraph} A new TrustFabricGraph instance containing the matching subgraph
     */
    querySubGraph(criteria) {
        const subGraph = new TrustFabricGraph({ autoInitialize: false });

        let predicate;
        if (typeof criteria === 'function') {
            predicate = criteria;
        } else if (typeof criteria === 'object') {
            predicate = (node) => {
                if (criteria.domain && node.domain !== criteria.domain.toUpperCase()) return false;
                if (criteria.type && node.type !== criteria.type) return false;
                if (criteria.minTrust && node.trustWeight < criteria.minTrust) return false;
                return true;
            };
        } else {
            predicate = () => true;
        }

        for (const [id, node] of this.nodes.entries()) {
            if (predicate(node)) {
                subGraph.addNode(node);
            }
        }

        for (const edge of this.edges) {
            if (subGraph.hasNode(edge.source) && subGraph.hasNode(edge.target)) {
                subGraph.addEdge(edge.source, edge.target, edge.relationship, edge.weight, edge.metadata);
            }
        }

        return subGraph;
    }

    /**
     * Gets Provenance Graph projection (source code, builds, commits, artifacts)
     * @returns {TrustFabricGraph}
     */
    getProvenanceGraph() {
        return this.querySubGraph({ domain: 'PROVENANCE' });
    }

    /**
     * Gets Evidence Graph projection (test results, security scans, audit proofs)
     * @returns {TrustFabricGraph}
     */
    getEvidenceGraph() {
        return this.querySubGraph({ domain: 'EVIDENCE' });
    }

    /**
     * Gets Business Graph projection (policies, standards, capability SLA/SLOs)
     * @returns {TrustFabricGraph}
     */
    getBusinessGraph() {
        return this.querySubGraph({ domain: 'BUSINESS' });
    }

    /**
     * Gets Dependency Graph projection (module dependencies, service topology, API contracts)
     * @returns {TrustFabricGraph}
     */
    getDependencyGraph() {
        return this.querySubGraph({ domain: 'DEPENDENCY' });
    }

    /**
     * Calculate Degree Centrality for a given node
     * @param {string} nodeId
     * @returns {Object} Centrality metrics
     */
    calculateCentrality(nodeId) {
        if (!this.nodes.has(nodeId)) return { inDegree: 0, outDegree: 0, totalDegree: 0, normalized: 0.0 };

        const inDegree = this.edges.filter(e => e.target === nodeId).length;
        const outDegree = this.edges.filter(e => e.source === nodeId).length;
        const totalDegree = inDegree + outDegree;
        const maxPossible = Math.max(1, (this.nodes.size - 1) * 2);

        return {
            inDegree,
            outDegree,
            totalDegree,
            normalized: Number((totalDegree / maxPossible).toFixed(4))
        };
    }

    /**
     * Computes dynamically projected Trust Score from graph topology and node weights
     * @param {string} [domainFilter] - Optional domain filter ('PROVENANCE', 'EVIDENCE', etc.)
     * @returns {Object} Graph trust report
     */
    computeGraphTrustScore(domainFilter = null) {
        const targetNodes = domainFilter
            ? Array.from(this.nodes.values()).filter(n => n.domain === domainFilter.toUpperCase())
            : Array.from(this.nodes.values());

        if (targetNodes.length === 0) {
            return {
                compositeTrustScore: 100.0,
                nodeCount: 0,
                edgeCount: 0,
                domainFilter,
                projections: {}
            };
        }

        let totalScoreSum = 0;
        const projections = {};

        for (const node of targetNodes) {
            const incomingEdges = this.edges.filter(e => e.target === node.id);
            let edgeMultiplier = 1.0;
            if (incomingEdges.length > 0) {
                edgeMultiplier = Math.max(...incomingEdges.map(e => e.weight));
            }

            const projectedScore = Number((node.trustWeight * edgeMultiplier * 100.0).toFixed(2));
            projections[node.id] = {
                label: node.label,
                domain: node.domain,
                type: node.type,
                baseWeight: node.trustWeight,
                edgeMultiplier,
                projectedScore
            };

            totalScoreSum += projectedScore;
        }

        const compositeTrustScore = Number((totalScoreSum / targetNodes.length).toFixed(2));

        return {
            graphId: this.graphId,
            compositeTrustScore,
            nodeCount: targetNodes.length,
            edgeCount: this.edges.length,
            domainFilter,
            projections,
            calculatedAt: new Date().toISOString()
        };
    }

    /**
     * Exports full graph state snapshot object
     * @returns {Object}
     */
    exportSnapshot() {
        return {
            version: '2026.1-LTS',
            graphId: this.graphId,
            exportedAt: new Date().toISOString(),
            domains: this.domains.slice(),
            nodes: Array.from(this.nodes.values()),
            edges: this.edges.slice()
        };
    }

    /**
     * Exports graph state snapshot as formatted JSON string
     * @returns {string}
     */
    exportSnapshotJson() {
        return JSON.stringify(this.exportSnapshot(), null, 2);
    }

    /**
     * Imports graph state from a snapshot object or JSON string
     * @param {Object|string} snapshotData
     */
    importSnapshot(snapshotData) {
        let snapshot = snapshotData;
        if (typeof snapshotData === 'string') {
            snapshot = JSON.parse(snapshotData);
        }

        if (!snapshot || !Array.isArray(snapshot.nodes)) {
            throw new Error('TrustFabricGraph: Invalid snapshot structure');
        }

        this.nodes.clear();
        this.edges = [];

        if (snapshot.graphId) this.graphId = snapshot.graphId;

        snapshot.nodes.forEach(n => this.addNode(n));

        if (Array.isArray(snapshot.edges)) {
            snapshot.edges.forEach(e => {
                if (this.hasNode(e.source) && this.hasNode(e.target)) {
                    this.addEdge(e.source, e.target, e.relationship, e.weight, e.metadata);
                }
            });
        }
    }
}

module.exports = TrustFabricGraph;
