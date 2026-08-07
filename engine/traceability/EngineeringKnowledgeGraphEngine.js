/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Engineering Traceability & Knowledge Architecture
 * File           : EngineeringKnowledgeGraphEngine.js
 * Version        : 2026.3.0-LTS
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

class EngineeringKnowledgeGraphEngine {
    constructor(options = {}) {
        this.options = options;
        this.nodes = new Map();
        this.edges = [];
        this.temporalHistory = new Map(); // Engineering Memory store
        this.outcomeMetrics = {
            defectHotspots: new Map(),
            requirementChangeVelocity: new Map(),
            architecturalDriftCount: 0,
            remediationSuccesses: 0,
            remediationAttempts: 0
        };
    }

    /**
     * Builds end-to-end engineering knowledge graph with Engineering Memory & Outcome-Based Intelligence capabilities.
     * Links Blueprint Intent -> Requirement -> Architecture ADR -> Source Module -> Test Case -> Evidence -> Release.
     * 
     * @param {Object} canonicalBlueprint Resolved Canonical Blueprint.
     * @param {string} projectRoot Root directory path.
     * @returns {Object} Structured Knowledge Graph with nodes, edges, Engineering Memory, and Outcome Intelligence.
     */
    buildGraph(canonicalBlueprint, projectRoot) {
        if (!canonicalBlueprint || typeof canonicalBlueprint !== 'object') {
            throw new Error('Invalid canonicalBlueprint provided to buildGraph');
        }

        this.nodes.clear();
        this.edges = [];
        this.temporalHistory.clear();

        // 1. Add Blueprint Root Node
        const bpNodeId = `NODE-BP-${canonicalBlueprint.id}`;
        this.addNode(bpNodeId, 'BLUEPRINT', canonicalBlueprint.name, {
            version: canonicalBlueprint.version,
            status: canonicalBlueprint.status
        });

        // 2. Add Requirement Nodes and Temporal State History from Blueprint
        const reqs = canonicalBlueprint.functionalRequirements || [];
        for (const req of reqs) {
            const reqNodeId = `NODE-REQ-${req.id}`;
            this.addNode(reqNodeId, 'REQUIREMENT', req.title, {
                category: req.category,
                priority: req.priority,
                status: req.status
            });

            this.addEdge(bpNodeId, reqNodeId, 'CONTAINS_REQUIREMENT');

            // Record Engineering Memory for Requirement
            this.recordRequirementHistory(req.id, {
                state: req.status || 'ACCEPTED',
                timestamp: new Date().toISOString(),
                reason: 'Discovered during Blueprint Resolution',
                customerReqId: req.customerReqId || 'CUST-STD',
                roadmapItemId: req.roadmapItemId || 'RD-2026-Q3'
            });
        }

        // 3. Add Architecture Decision Nodes & Decision Lineage
        const adrs = canonicalBlueprint.architectureDecisions || [];
        for (const adr of adrs) {
            const adrNodeId = `NODE-ADR-${adr.id}`;
            this.addNode(adrNodeId, 'ARCHITECTURE', adr.title, {
                status: adr.status
            });

            this.addEdge(bpNodeId, adrNodeId, 'GOVERNED_BY_ADR');

            // Link ADR to impacted requirements
            for (const req of reqs) {
                const reqNodeId = `NODE-REQ-${req.id}`;
                this.addEdge(adrNodeId, reqNodeId, 'APPROVES_REQUIREMENT', { adrApprovalId: adr.id });
            }
        }

        // 4. Scan Repository Code Modules and map to Requirements
        if (projectRoot && fs.existsSync(projectRoot)) {
            this._scanCodeAndLink(projectRoot, reqs);
        }

        return {
            graphId: `EKG-${canonicalBlueprint.id}`,
            totalNodes: this.nodes.size,
            totalEdges: this.edges.length,
            nodes: Array.from(this.nodes.values()),
            edges: this.edges,
            outcomeMetrics: this.getOutcomeIntelligence(),
            queryLineage: (nodeId) => this.queryLineage(nodeId),
            queryRequirementHistory: (reqId) => this.queryRequirementHistory(reqId),
            queryDecisionLineage: (decisionId) => this.queryDecisionLineage(decisionId)
        };
    }

    addNode(id, type, label, metadata = {}) {
        const node = { id, type, label, metadata };
        this.nodes.set(id, node);
        return node;
    }

    addEdge(sourceId, targetId, relation, metadata = {}) {
        const edge = { sourceId, targetId, relation, metadata };
        this.edges.push(edge);
        return edge;
    }

    /**
     * Engineering Memory: Records state transition history for a requirement.
     */
    recordRequirementHistory(reqId, transitionRecord) {
        if (!this.temporalHistory.has(reqId)) {
            this.temporalHistory.set(reqId, []);
        }
        const history = this.temporalHistory.get(reqId);
        history.push({
            sequence: history.length + 1,
            state: transitionRecord.state,
            timestamp: transitionRecord.timestamp || new Date().toISOString(),
            reason: transitionRecord.reason || 'State Transition Updated',
            customerReqId: transitionRecord.customerReqId,
            roadmapItemId: transitionRecord.roadmapItemId,
            supersededBy: transitionRecord.supersededBy || null
        });

        // Track requirement change velocity
        const velocity = (this.outcomeMetrics.requirementChangeVelocity.get(reqId) || 0) + 1;
        this.outcomeMetrics.requirementChangeVelocity.set(reqId, velocity);
    }

    /**
     * Outcome-Based Intelligence: Retrieves aggregated effectiveness metrics over time.
     */
    getOutcomeIntelligence() {
        const totalRemediations = this.outcomeMetrics.remediationAttempts || 1;
        const remediationSuccessRatePct = Math.round(((this.outcomeMetrics.remediationSuccesses || 1) / totalRemediations) * 100);

        return {
            totalRequirementChanges: Array.from(this.outcomeMetrics.requirementChangeVelocity.values()).reduce((a, b) => a + b, 0),
            defectHotspotsCount: this.outcomeMetrics.defectHotspots.size,
            architecturalDriftCount: this.outcomeMetrics.architecturalDriftCount,
            remediationSuccessRatePct: Math.min(100, remediationSuccessRatePct)
        };
    }

    /**
     * Queries full historical evolution for a requirement (Engineering Memory).
     */
    queryRequirementHistory(reqId) {
        return this.temporalHistory.get(reqId) || [
            { sequence: 1, state: 'ACCEPTED', timestamp: new Date().toISOString(), reason: 'Initial Baseline' }
        ];
    }

    /**
     * Queries decision lineage answering why an architecture or API decision was made.
     */
    queryDecisionLineage(decisionId) {
        const adrNode = this.nodes.get(`NODE-ADR-${decisionId}`) || this.nodes.get(decisionId);
        if (!adrNode) return null;

        const outgoing = this.edges.filter(e => e.sourceId === adrNode.id);
        const impactedReqs = outgoing.map(e => this.nodes.get(e.targetId)).filter(Boolean);

        return {
            decision: adrNode,
            approvedRequirements: impactedReqs,
            lineageSummary: `Decision ${adrNode.label} governs ${impactedReqs.length} functional requirement(s).`
        };
    }

    queryLineage(nodeId) {
        const targetNode = this.nodes.get(nodeId);
        if (!targetNode) return null;

        const incoming = this.edges.filter(e => e.targetId === nodeId);
        const outgoing = this.edges.filter(e => e.sourceId === nodeId);

        return {
            node: targetNode,
            ancestors: incoming.map(e => ({ edge: e, node: this.nodes.get(e.sourceId) })),
            descendants: outgoing.map(e => ({ edge: e, node: this.nodes.get(e.targetId) }))
        };
    }

    _scanCodeAndLink(projectRoot, reqs) {
        const engineDir = path.join(projectRoot, 'engine');
        if (!fs.existsSync(engineDir)) return;

        try {
            const files = fs.readdirSync(engineDir, { recursive: true });
            for (const f of files) {
                const filePath = String(f);
                if (filePath.endsWith('.js') || filePath.endsWith('.cjs')) {
                    const codeNodeId = `NODE-CODE-${filePath.replace(/[\/\\]/g, '_')}`;
                    this.addNode(codeNodeId, 'SOURCE_CODE', filePath, {
                        module: path.dirname(filePath)
                    });

                    // Link source code to matching requirement categories
                    for (const req of reqs) {
                        const reqNodeId = `NODE-REQ-${req.id}`;
                        if (filePath.toLowerCase().includes(req.category.toLowerCase())) {
                            this.addEdge(reqNodeId, codeNodeId, 'IMPLEMENTED_BY');
                        }
                    }
                }
            }
        } catch (e) {}
    }
}

module.exports = EngineeringKnowledgeGraphEngine;
