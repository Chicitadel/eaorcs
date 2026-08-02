/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Microservice Federation Engine
 * File           : MicroserviceFederationEngine.js
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class MicroserviceFederationEngine {
    constructor() {
        this.services = new Map(); // serviceName -> { serviceName, repoPath, metadata }
        this.topologyGraph = {
            nodes: new Map(),
            edges: new Map(),
            services: [],
            metadata: {
                federatedAt: null,
                merkleHash: null,
                totalServices: 0,
                totalNodes: 0,
                totalEdges: 0
            }
        };
    }

    /**
     * Registers a microservice repository in the federation engine.
     * @param {string} serviceName Unique name of the microservice.
     * @param {string} repoPath Local or relative file system path to the codebase.
     * @param {object} [metadata={}] Additional service metadata (version, domain, endpoints, dependencies, requirements, codeModules, testSuites, evidence).
     * @returns {object} Registered service record.
     */
    registerServiceRepository(serviceName, repoPath, metadata = {}) {
        if (!serviceName || typeof serviceName !== 'string') {
            throw new Error('serviceName must be a non-empty string');
        }
        if (!repoPath || typeof repoPath !== 'string') {
            throw new Error('repoPath must be a non-empty string');
        }

        const normalizedPath = path.normalize(repoPath).replace(/\\/g, '/');
        const serviceRecord = {
            serviceName,
            repoPath: normalizedPath,
            metadata: {
                version: metadata.version || '1.0.0',
                domain: metadata.domain || 'default-domain',
                owner: metadata.owner || 'unassigned',
                dependencies: Array.isArray(metadata.dependencies) ? metadata.dependencies : [],
                endpoints: Array.isArray(metadata.endpoints) ? metadata.endpoints : [],
                requirements: Array.isArray(metadata.requirements) ? metadata.requirements : [],
                codeModules: Array.isArray(metadata.codeModules) ? metadata.codeModules : [],
                testSuites: Array.isArray(metadata.testSuites) ? metadata.testSuites : [],
                evidence: Array.isArray(metadata.evidence) ? metadata.evidence : [],
                ...metadata
            },
            registeredAt: new Date().toISOString()
        };

        this.services.set(serviceName, serviceRecord);
        return serviceRecord;
    }

    /**
     * Constructs a federated multi-repository microservice topology graph across distributed codebases.
     * @returns {object} Federated topology graph containing nodes, edges, services, and metadata.
     */
    federateRepositories() {
        const nodes = new Map();
        const edges = new Map();

        const addNode = (node) => {
            if (!node || !node.id) return;
            if (!nodes.has(node.id)) {
                nodes.set(node.id, { ...node });
            } else {
                // Merge properties
                const existing = nodes.get(node.id);
                nodes.set(node.id, { ...existing, ...node });
            }
        };

        const addEdge = (source, target, type, metadata = {}) => {
            if (!source || !target || !type) return;
            const edgeId = `${source}->${type}->${target}`;
            if (!edges.has(edgeId)) {
                edges.set(edgeId, {
                    id: edgeId,
                    source,
                    target,
                    type,
                    metadata,
                    createdTime: new Date().toISOString()
                });
            }
        };

        // 1. Process Service Nodes and Sub-elements
        for (const [serviceName, serviceRecord] of this.services.entries()) {
            const { repoPath, metadata } = serviceRecord;
            const serviceNodeId = `service:${serviceName}`;

            // Add Service Node
            addNode({
                id: serviceNodeId,
                type: 'SERVICE',
                name: serviceName,
                repoPath,
                domain: metadata.domain,
                version: metadata.version,
                owner: metadata.owner
            });

            // Process Endpoints
            for (const ep of metadata.endpoints) {
                const epId = ep.id || `${ep.method || 'GET'}:${ep.path || '/ API'}`;
                const epNodeId = `endpoint:${serviceName}:${epId}`;
                addNode({
                    id: epNodeId,
                    type: 'ENDPOINT',
                    service: serviceName,
                    endpointId: epId,
                    method: ep.method || 'GET',
                    path: ep.path || epId,
                    reqId: ep.reqId || null,
                    calls: Array.isArray(ep.calls) ? ep.calls : []
                });
                addEdge(serviceNodeId, epNodeId, 'EXPOSES_ENDPOINT');

                if (ep.reqId) {
                    const reqNodeId = `req:${ep.reqId}`;
                    addNode({ id: reqNodeId, type: 'REQUIREMENT', reqId: ep.reqId });
                    addEdge(epNodeId, reqNodeId, 'IMPLEMENTS_REQUIREMENT');
                }

                // If endpoint explicitly references cross-service calls
                if (Array.isArray(ep.calls)) {
                    for (const callTarget of ep.calls) {
                        // callTarget can be serviceName or endpoint ID
                        if (this.services.has(callTarget)) {
                            addEdge(epNodeId, `service:${callTarget}`, 'CALLS_SERVICE');
                            addEdge(serviceNodeId, `service:${callTarget}`, 'CROSS_SERVICE_DEPENDENCY');
                        } else if (callTarget.includes(':')) {
                            addEdge(epNodeId, callTarget, 'CALLS_ENDPOINT');
                        }
                    }
                }
            }

            // Process Requirements declared at service level
            for (const req of metadata.requirements) {
                const reqId = typeof req === 'string' ? req : req.id;
                if (reqId) {
                    const reqNodeId = `req:${reqId}`;
                    addNode({
                        id: reqNodeId,
                        type: 'REQUIREMENT',
                        reqId,
                        title: typeof req === 'object' ? req.title : reqId
                    });
                    addEdge(serviceNodeId, reqNodeId, 'IMPLEMENTS_REQUIREMENT');
                }
            }

            // Process Code Modules
            for (const mod of metadata.codeModules) {
                const modPath = typeof mod === 'string' ? mod : mod.path;
                const modNodeId = `code:${serviceName}:${modPath}`;
                addNode({
                    id: modNodeId,
                    type: 'CODE_MODULE',
                    service: serviceName,
                    path: modPath,
                    exports: typeof mod === 'object' && Array.isArray(mod.exports) ? mod.exports : []
                });
                addEdge(serviceNodeId, modNodeId, 'CONTAINS_MODULE');

                const reqId = typeof mod === 'object' ? mod.reqId : null;
                if (reqId) {
                    const reqNodeId = `req:${reqId}`;
                    addNode({ id: reqNodeId, type: 'REQUIREMENT', reqId });
                    addEdge(modNodeId, reqNodeId, 'IMPLEMENTS_REQUIREMENT');
                }
            }

            // Process Test Suites
            for (const test of metadata.testSuites) {
                const testName = typeof test === 'string' ? test : (test.name || test.id);
                const testNodeId = `test:${serviceName}:${testName}`;
                addNode({
                    id: testNodeId,
                    type: 'TEST_SUITE',
                    service: serviceName,
                    name: testName
                });
                addEdge(serviceNodeId, testNodeId, 'CONTAINS_TEST');

                const reqs = typeof test === 'object' ? (test.testsReq || test.reqId || []) : [];
                const reqList = Array.isArray(reqs) ? reqs : [reqs];
                for (const rId of reqList) {
                    const reqNodeId = `req:${rId}`;
                    addNode({ id: reqNodeId, type: 'REQUIREMENT', reqId: rId });
                    addEdge(testNodeId, reqNodeId, 'VERIFIES_REQUIREMENT');
                }
            }

            // Process Evidence
            for (const ev of metadata.evidence) {
                const evId = typeof ev === 'string' ? ev : ev.id;
                const evNodeId = `evidence:${serviceName}:${evId}`;
                addNode({
                    id: evNodeId,
                    type: 'EVIDENCE',
                    service: serviceName,
                    evidenceId: evId,
                    hash: typeof ev === 'object' ? ev.hash : null
                });
                addEdge(serviceNodeId, evNodeId, 'PRODUCES_EVIDENCE');

                const reqId = typeof ev === 'object' ? ev.reqId : null;
                if (reqId) {
                    const reqNodeId = `req:${reqId}`;
                    addNode({ id: reqNodeId, type: 'REQUIREMENT', reqId });
                    addEdge(evNodeId, reqNodeId, 'ATTESTS_REQUIREMENT');
                }
            }

            // Process Explicit Service-to-Service Dependencies
            for (const depService of metadata.dependencies) {
                const targetServiceNodeId = `service:${depService}`;
                addEdge(serviceNodeId, targetServiceNodeId, 'CROSS_SERVICE_DEPENDENCY');
            }
        }

        // Calculate Merkle Hash of Topology Graph
        const merkleHash = this._computeTopologyMerkleHash(nodes, edges);

        this.topologyGraph = {
            nodes,
            edges,
            services: Array.from(this.services.keys()),
            metadata: {
                federatedAt: new Date().toISOString(),
                merkleHash,
                totalServices: this.services.size,
                totalNodes: nodes.size,
                totalEdges: edges.size
            }
        };

        return this.getFederatedTopology();
    }

    /**
     * Calculates deterministic Merkle root hash for topology graph nodes and edges.
     * @private
     */
    _computeTopologyMerkleHash(nodesMap, edgesMap) {
        const sortedNodeKeys = Array.from(nodesMap.keys()).sort();
        const sortedEdgeKeys = Array.from(edgesMap.keys()).sort();

        const nodeHashes = sortedNodeKeys.map(k => {
            return crypto.createHash('sha256').update(JSON.stringify(nodesMap.get(k))).digest('hex');
        });

        const edgeHashes = sortedEdgeKeys.map(k => {
            return crypto.createHash('sha256').update(JSON.stringify(edgesMap.get(k))).digest('hex');
        });

        const combined = nodeHashes.join('') + edgeHashes.join('');
        return crypto.createHash('sha256').update(combined).digest('hex');
    }

    /**
     * Returns current federated topology graph representation.
     * @returns {object} Topology graph object containing services, nodes, edges, and metadata.
     */
    getFederatedTopology() {
        return {
            services: Array.from(this.services.keys()),
            nodes: Array.from(this.topologyGraph.nodes.values()),
            edges: Array.from(this.topologyGraph.edges.values()),
            metadata: { ...this.topologyGraph.metadata }
        };
    }

    /**
     * Finds cross-service end-to-end traceability paths for a given requirement ID across distributed services.
     * @param {string} reqId Requirement identifier (e.g., REQ-AUTH-001).
     * @returns {object} Detailed cross-service traceability result.
     */
    findCrossServiceTraceability(reqId) {
        if (!reqId || typeof reqId !== 'string') {
            throw new Error('reqId must be a non-empty string');
        }

        const targetReqNodeId = `req:${reqId}`;
        const topology = this.getFederatedTopology();
        const nodes = topology.nodes;
        const edges = topology.edges;

        const reqNode = nodes.find(n => n.id === targetReqNodeId || n.reqId === reqId);
        
        // Find all edges connected directly or indirectly to this requirement
        const relatedEdges = edges.filter(e => e.source === targetReqNodeId || e.target === targetReqNodeId);
        const relatedNodeIds = new Set([targetReqNodeId]);

        for (const e of relatedEdges) {
            relatedNodeIds.add(e.source);
            relatedNodeIds.add(e.target);
        }

        // Trace multi-hop connections (e.g. Code -> Requirement, Service -> Code, Service -> Endpoint -> Service)
        let addedNew = true;
        while (addedNew) {
            addedNew = false;
            for (const e of edges) {
                if (relatedNodeIds.has(e.source) && !relatedNodeIds.has(e.target)) {
                    relatedNodeIds.add(e.target);
                    addedNew = true;
                } else if (relatedNodeIds.has(e.target) && !relatedNodeIds.has(e.source)) {
                    relatedNodeIds.add(e.source);
                    addedNew = true;
                }
            }
        }

        const matchedNodes = nodes.filter(n => relatedNodeIds.has(n.id));
        const matchedEdges = edges.filter(e => relatedNodeIds.has(e.source) && relatedNodeIds.has(e.target));

        const participatingServices = new Set();
        let hasCode = false;
        let hasTest = false;
        let hasEvidence = false;

        for (const n of matchedNodes) {
            if (n.service) participatingServices.add(n.service);
            if (n.type === 'SERVICE') participatingServices.add(n.name);
            if (n.type === 'CODE_MODULE') hasCode = true;
            if (n.type === 'TEST_SUITE') hasTest = true;
            if (n.type === 'EVIDENCE') hasEvidence = true;
        }

        // Also check service metadata directly as fallback
        for (const [sName, sRecord] of this.services.entries()) {
            const hasReq = sRecord.metadata.requirements.some(r => (typeof r === 'string' ? r : r.id) === reqId);
            const hasCodeReq = sRecord.metadata.codeModules.some(m => typeof m === 'object' && m.reqId === reqId);
            const hasTestReq = sRecord.metadata.testSuites.some(t => typeof t === 'object' && ((t.testsReq && t.testsReq.includes(reqId)) || t.reqId === reqId));
            const hasEvidReq = sRecord.metadata.evidence.some(e => typeof e === 'object' && e.reqId === reqId);

            if (hasReq || hasCodeReq || hasTestReq || hasEvidReq) {
                participatingServices.add(sName);
                if (hasCodeReq) hasCode = true;
                if (hasTestReq) hasTest = true;
                if (hasEvidReq) hasEvidence = true;
            }
        }

        const isFullyTraced = hasCode && hasTest && hasEvidence;

        return {
            reqId,
            requirementNode: reqNode || null,
            participatingServices: Array.from(participatingServices),
            nodes: matchedNodes,
            edges: matchedEdges,
            isFullyTraced,
            coverage: {
                hasCode,
                hasTest,
                hasEvidence,
                score: (hasCode ? 0.4 : 0) + (hasTest ? 0.3 : 0) + (hasEvidence ? 0.3 : 0)
            }
        };
    }

    /**
     * Exports the federated graph topology into a serializable object for database snapshot persistence.
     * @returns {object} Serializable federated graph structure.
     */
    exportFederatedGraph() {
        const topology = this.getFederatedTopology();
        return {
            version: '2026.1-LTS',
            exportedAt: new Date().toISOString(),
            merkleHash: topology.metadata.merkleHash,
            services: Array.from(this.services.entries()).map(([name, record]) => ({
                serviceName: name,
                repoPath: record.repoPath,
                metadata: record.metadata
            })),
            nodes: topology.nodes,
            edges: topology.edges,
            metadata: topology.metadata
        };
    }
}

module.exports = MicroserviceFederationEngine;
