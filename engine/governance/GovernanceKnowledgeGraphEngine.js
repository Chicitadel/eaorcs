/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Governance Knowledge Graph
 * File           : GovernanceKnowledgeGraphEngine.js
 * Version        : 2026.3.1-LTS
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
 * CORP: Stream S2
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

class GovernanceKnowledgeGraphEngine {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.metadata = {};
        this.buildGraph();
    }

    buildGraph() {
        this.nodes = [
            { id: 'GOV-L1', title: 'Constitution', tier: 1 },
            { id: 'GOV-L2', title: 'Policies', tier: 2 },
            { id: 'GOV-L3', title: 'Standards', tier: 3 },
            { id: 'GOV-L4', title: 'ADRs', tier: 4 },
            { id: 'GOV-L5', title: 'ARRs', tier: 5 },
            { id: 'GOV-L6', title: 'Contracts', tier: 6 },
            { id: 'GOV-L7', title: 'Evidence', tier: 7 }
        ];

        this.edges = [
            { from: 'GOV-L2', to: 'GOV-L1', type: 'depends_on' },
            { from: 'GOV-L3', to: 'GOV-L2', type: 'depends_on' },
            { from: 'GOV-L4', to: 'GOV-L3', type: 'depends_on' },
            { from: 'GOV-L5', to: 'GOV-L4', type: 'depends_on' },
            { from: 'GOV-L6', to: 'GOV-L5', type: 'depends_on' },
            { from: 'GOV-L7', to: 'GOV-L6', type: 'depends_on' }
        ];

        this.metadata = { builtAt: Date.now(), totalNodes: 7, totalEdges: 6 };

        return { nodes: this.nodes, edges: this.edges, metadata: this.metadata };
    }

    findDependencies(artifactId) {
        const deps = new Set();
        const stack = [artifactId];
        while (stack.length > 0) {
            const current = stack.pop();
            for (const edge of this.edges) {
                if (edge.from === current && !deps.has(edge.to)) {
                    deps.add(edge.to);
                    stack.push(edge.to);
                }
            }
        }
        return Array.from(deps);
    }

    computeImpact(artifactId) {
        const impacts = new Set();
        const stack = [artifactId];
        while (stack.length > 0) {
            const current = stack.pop();
            for (const edge of this.edges) {
                if (edge.to === current && !impacts.has(edge.from)) {
                    impacts.add(edge.from);
                    stack.push(edge.from);
                }
            }
        }
        return Array.from(impacts);
    }

    exportGraph(format) {
        const data = { nodes: this.nodes, edges: this.edges, metadata: this.metadata };
        if (format === 'json') return JSON.stringify(data, null, 2);
        if (format === 'text') {
            return `Nodes: ${this.nodes.map(n => n.id).join(', ')}\nEdges: ${this.edges.map(e => `${e.from}->${e.to}`).join(', ')}`;
        }
        return data;
    }

    searchArtifacts(query) {
        const q = query.toLowerCase();
        return this.nodes.filter(n => n.title.toLowerCase().includes(q) || n.id.toLowerCase().includes(q));
    }

    diffGraphs(snapshotA, snapshotB) {
        const diff = {
            addedNodes: [],
            removedNodes: [],
            changedNodes: []
        };
        const nodesA = new Map(snapshotA.nodes.map(n => [n.id, n]));
        const nodesB = new Map(snapshotB.nodes.map(n => [n.id, n]));

        for (const [id, node] of nodesB) {
            if (!nodesA.has(id)) diff.addedNodes.push(node);
            else {
                if (JSON.stringify(node) !== JSON.stringify(nodesA.get(id))) {
                    diff.changedNodes.push(node);
                }
            }
        }
        for (const [id, node] of nodesA) {
            if (!nodesB.has(id)) diff.removedNodes.push(node);
        }
        return diff;
    }
}

module.exports = GovernanceKnowledgeGraphEngine;
