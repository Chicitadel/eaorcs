/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Trust Fabric Graph Engine (CJS Adapter)
 * File           : TrustGraphEngine.cjs
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Authority & Systems Engineering
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-07-31
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

const TrustFabricGraph = require('./TrustFabricGraph');

class TrustGraphEngine {
    constructor(baseDir) {
        this.graph = new TrustFabricGraph();
    }

    addNode(node) {
        return this.graph.addNode({
            id: node.id,
            domain: node.domain || 'BUSINESS',
            type: node.type,
            label: node.label,
            trustWeight: node.trust_weight || node.trustWeight || 0.5,
            metadata: node.metadata || {}
        });
    }

    addEdge(source, target, relationship, weight = 1.0) {
        return this.graph.addEdge(source, target, relationship, weight);
    }

    queryTrustScores() {
        const report = this.graph.computeGraphTrustScore();
        return {
            trust_graph_id: report.graphId,
            composite_trust_score: report.compositeTrustScore,
            node_count: report.nodeCount,
            edge_count: report.edgeCount,
            trust_projections: report.projections,
            timestamp: report.calculatedAt
        };
    }

    exportGraphSnapshot() {
        const snap = this.graph.exportSnapshot();
        return {
            version: snap.version,
            graph_id: snap.graphId,
            timestamp: snap.exportedAt,
            nodes: snap.nodes,
            edges: snap.edges
        };
    }
}

module.exports = TrustGraphEngine;
