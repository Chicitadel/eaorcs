/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Full Evidence Provenance Graph
 * File           : ProvenanceGraph.cjs
 * Version        : 2026.1-LTS (v8.1 Continuous Trust)
 * Author         : Architectural Governance Council & Provenance Working Group
 * Organization   : Air Roofers Platform Ecosystem / EAORCS
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

const crypto = require('crypto');

class ProvenanceGraph {
    constructor() {
        this.nodes = new Map();
        this.edges = [];
        this.initializeFullLineage();
    }

    addNode(nodeId, nodeType, data = {}, parentId = null) {
        if (this.nodes.has(nodeId)) {
            throw new Error(`Node ${nodeId} already exists in the graph.`);
        }
        const strContent = JSON.stringify({ nodeId, nodeType, data, parentId });
        const hash = crypto.createHash('sha256').update(strContent).digest('hex');
        const timestamp = new Date().toISOString();
        const signer = data.signer || 'EAORCS_PROVENANCE_AUTHORITY';

        const nodeObj = {
            id: nodeId,
            type: nodeType,
            hash,
            signer,
            timestamp,
            parent_id: parentId,
            data
        };

        this.nodes.set(nodeId, nodeObj);

        if (parentId && this.nodes.has(parentId)) {
            this.addEdge(parentId, nodeId, 'derivedFrom');
        }

        return nodeObj;
    }

    addEdge(sourceId, targetId, relationType) {
        if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
            throw new Error(`Both source ${sourceId} and target ${targetId} must exist.`);
        }
        this.edges.push({ source: sourceId, target: targetId, relation: relationType });
    }

    /**
     * Initializes the canonical end-to-end evidence lineage DAG.
     */
    initializeFullLineage() {
        const commit = this.addNode('node_commit', 'Commit', { commit_sha: 'v8.1-001', repo: 'airroofers.eu', author: 'Human Author' });
        const build = this.addNode('node_build', 'Build', { build_id: 'b_1001', status: 'SUCCESS' }, 'node_commit');
        const sbom = this.addNode('node_sbom', 'SBOM', { format: 'CycloneDX', package_count: 142 }, 'node_build');
        const container = this.addNode('node_container', 'Container', { image_digest: 'sha256:4a3b8c9d...' }, 'node_sbom');
        const deployment = this.addNode('node_deployment', 'Deployment', { env: 'production', cluster: 'eu-central-1' }, 'node_container');
        const runtime = this.addNode('node_runtime', 'Runtime', { uptime_sec: 86400, health: 'OPTIMAL' }, 'node_deployment');
        const telemetry = this.addNode('node_telemetry', 'Telemetry', { metrics_logged: 4820, error_rate: 0.00 }, 'node_runtime');
        const passport = this.addNode('node_passport', 'Passport', { osap_version: '2.0.0', status: 'CERTIFIED' }, 'node_telemetry');
    }

    getLineage(nodeId) {
        const ancestors = [];
        const queue = [nodeId];
        const visited = new Set();
        
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current)) continue;
            visited.add(current);
            
            const incomingEdges = this.edges.filter(e => e.target === current);
            for (const edge of incomingEdges) {
                const nodeData = this.nodes.get(edge.source);
                ancestors.push({ node: edge.source, relation: edge.relation, details: nodeData });
                queue.push(edge.source);
            }
        }
        
        return ancestors;
    }

    exportGraphSnapshot() {
        return {
            nodes: Array.from(this.nodes.values()),
            edges: this.edges,
            total_nodes: this.nodes.size,
            lineage_complete: this.nodes.has('node_commit') && this.nodes.has('node_passport')
        };
    }
}

module.exports = ProvenanceGraph;
