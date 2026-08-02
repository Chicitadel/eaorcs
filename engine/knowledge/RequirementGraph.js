/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Requirement Knowledge Graph Engine (Stream B)
 * File           : RequirementGraph.js
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

class RequirementGraph {
    constructor() {
        this.nodes = new Map(); // reqId -> requirementObject
        this.adjacency = new Map(); // reqId -> Map(targetId -> relation)
        this.reverseAdjacency = new Map(); // targetId -> Map(sourceId -> relation)
    }

    /**
     * Adds a requirement node to the graph.
     * @param {object} req Requirement object containing at least an id property.
     */
    addRequirement(req) {
        if (!req || typeof req !== 'object' || !req.id) {
            throw new Error('Requirement must be an object with a valid id property');
        }

        const reqId = req.id;
        this.nodes.set(reqId, { ...req });

        if (!this.adjacency.has(reqId)) {
            this.adjacency.set(reqId, new Map());
        }
        if (!this.reverseAdjacency.has(reqId)) {
            this.reverseAdjacency.set(reqId, new Map());
        }

        return this.nodes.get(reqId);
    }

    /**
     * Retrieves a requirement node by ID.
     * @param {string} id Requirement ID.
     * @returns {object|null} Requirement object or null.
     */
    getRequirement(id) {
        if (!id) return null;
        return this.nodes.get(id) || null;
    }

    /**
     * Connects sourceId requirement to targetId requirement with a directed relation edge.
     * @param {string} sourceId Source requirement ID.
     * @param {string} targetId Target requirement ID.
     * @param {string} [relation='DEPENDS_ON'] Relation type string.
     */
    connectRequirements(sourceId, targetId, relation = 'DEPENDS_ON') {
        if (!sourceId || !targetId) {
            throw new Error('sourceId and targetId are required to connect requirements');
        }

        if (!this.nodes.has(sourceId)) {
            this.addRequirement({ id: sourceId, title: sourceId, type: 'FUNCTIONAL' });
        }
        if (!this.nodes.has(targetId)) {
            this.addRequirement({ id: targetId, title: targetId, type: 'FUNCTIONAL' });
        }

        this.adjacency.get(sourceId).set(targetId, relation);
        this.reverseAdjacency.get(targetId).set(sourceId, relation);

        return { sourceId, targetId, relation };
    }

    /**
     * Finds direct dependencies (outgoing connections) for a given requirement ID.
     * @param {string} id Requirement ID.
     * @returns {Array<object>} Array of requirement objects that id depends on.
     */
    findDependencies(id) {
        if (!this.nodes.has(id)) return [];

        const deps = [];
        const targets = this.adjacency.get(id);

        if (targets) {
            for (const [targetId, relation] of targets.entries()) {
                const reqNode = this.nodes.get(targetId);
                deps.push({
                    ...reqNode,
                    relation
                });
            }
        }

        return deps;
    }

    /**
     * Finds requirements that depend on this requirement ID (incoming connections).
     * @param {string} id Requirement ID.
     * @returns {Array<object>} Array of requirement objects that depend on id.
     */
    findDependents(id) {
        if (!this.nodes.has(id)) return [];

        const dependents = [];
        const sources = this.reverseAdjacency.get(id);

        if (sources) {
            for (const [sourceId, relation] of sources.entries()) {
                const reqNode = this.nodes.get(sourceId);
                dependents.push({
                    ...reqNode,
                    relation
                });
            }
        }

        return dependents;
    }

    /**
     * Returns array of all requirement nodes in graph.
     */
    getAllRequirements() {
        return Array.from(this.nodes.values());
    }

    /**
     * Exports full graph structure.
     * @returns {{ nodes: Array<object>, edges: Array<{ source: string, target: string, relation: string }> }}
     */
    exportGraph() {
        const edges = [];
        for (const [sourceId, targets] of this.adjacency.entries()) {
            for (const [targetId, relation] of targets.entries()) {
                edges.push({
                    source: sourceId,
                    target: targetId,
                    relation
                });
            }
        }

        return {
            nodes: this.getAllRequirements(),
            edges
        };
    }
}

module.exports = RequirementGraph;
