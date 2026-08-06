/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Air Roofers Platform Dependency Graph Engine
 * File           : PlatformDependencyGraphEngine.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Architecture & Graph Governance Council
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Air Roofers Ecosystem Macro-Dependency Visualizer
 * - Detects architectural drift and unapproved inter-product coupling
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * Air Roofers Ecosystem Node Types
 */
const NODE_TYPES = Object.freeze({
  PLATFORM_CORE: 'PLATFORM_CORE',
  CENTRAL_SERVICE: 'CENTRAL_SERVICE',
  PLATFORM_CAPABILITY: 'PLATFORM_CAPABILITY',
  PRODUCT_MODULE: 'PRODUCT_MODULE',
});

/**
 * PlatformDependencyGraphEngine
 *
 * Maps the macro-level Air Roofers platform graph and detects unapproved coupling or drift.
 */
class PlatformDependencyGraphEngine {
  constructor(options = {}) {
    this.options = options;
    this._nodes = new Map();
    this._edges = [];
    this._initializeDefaultGraph();
  }

  /**
   * Registers a node in the Air Roofers platform dependency graph.
   */
  registerNode(id, label, type, metadata = {}) {
    if (!id || !label || !type) throw new Error('PlatformDependencyGraphEngine: id, label, and type required.');
    const node = { id, label, type, metadata, registeredAt: new Date().toISOString() };
    this._nodes.set(id, node);
    return node;
  }

  /**
   * Registers a directed dependency edge.
   */
  registerDependency(fromId, toId, relationshipType, isApproved = true) {
    if (!this._nodes.has(fromId)) throw new Error(`Node '${fromId}' not found.`);
    if (!this._nodes.has(toId)) throw new Error(`Node '${toId}' not found.`);

    const edge = {
      edgeId: `edge-${crypto.randomBytes(4).toString('hex')}`,
      from: fromId,
      to: toId,
      relationshipType,
      isApproved,
      registeredAt: new Date().toISOString(),
    };

    this._edges.push(edge);
    return edge;
  }

  /**
   * Detects unapproved dependencies or circular coupling in the ecosystem.
   */
  detectArchitecturalDrift() {
    const unapprovedEdges = this._edges.filter(e => !e.isApproved);
    const circularDependencies = this._detectCycles();

    const isClean = unapprovedEdges.length === 0 && circularDependencies.length === 0;

    return {
      evaluatedAt: new Date().toISOString(),
      clean: isClean,
      unapprovedDependenciesCount: unapprovedEdges.length,
      circularDependenciesCount: circularDependencies.length,
      unapprovedEdges,
      circularDependencies,
      status: isClean ? 'GRAPH_HEALTHY' : 'DRIFT_DETECTED',
    };
  }

  /**
   * Generates the macro-level platform graph summary.
   */
  getGraphSummary() {
    return {
      generatedAt: new Date().toISOString(),
      totalNodes: this._nodes.size,
      totalEdges: this._edges.length,
      nodes: [...this._nodes.values()],
      edges: [...this._edges],
      driftStatus: this.detectArchitecturalDrift(),
    };
  }

  getEngineStatus() {
    return { initialized: true, nodeCount: this._nodes.size, edgeCount: this._edges.length };
  }

  _initializeDefaultGraph() {
    // Register Core & Central Services
    this.registerNode('air-roofers-platform', 'Air Roofers Unified Platform', NODE_TYPES.PLATFORM_CORE);
    this.registerNode('service-identity', 'Identity & Auth Service', NODE_TYPES.CENTRAL_SERVICE);
    this.registerNode('service-billing', 'Billing & Metering Subsystem', NODE_TYPES.CENTRAL_SERVICE);
    this.registerNode('service-licensing', 'Licensing Authority', NODE_TYPES.CENTRAL_SERVICE);
    this.registerNode('service-telemetry', 'Central Telemetry Hub', NODE_TYPES.CENTRAL_SERVICE);
    this.registerNode('service-marketplace', 'Central Marketplace Catalog', NODE_TYPES.CENTRAL_SERVICE);

    // Register Platform Capabilities
    this.registerNode('eaorcs-kernel', 'EAORCS Software Trust Substrate', NODE_TYPES.PLATFORM_CAPABILITY);
    this.registerNode('civiscore-capability', 'CiviScore Governance Subsystem', NODE_TYPES.PLATFORM_CAPABILITY);
    this.registerNode('akpati-capability', 'Akpati AI Subsystem', NODE_TYPES.PLATFORM_CAPABILITY);
    this.registerNode('mandatag-capability', 'Mandatag Metadata Subsystem', NODE_TYPES.PLATFORM_CAPABILITY);

    // Approved Top-Down Dependencies (Capabilities consume Central Services)
    this.registerDependency('eaorcs-kernel', 'air-roofers-platform', 'HOSTED_ON', true);
    this.registerDependency('eaorcs-kernel', 'service-identity', 'CONSUMES_AUTH', true);
    this.registerDependency('eaorcs-kernel', 'service-licensing', 'CONSUMES_LICENSING', true);
    this.registerDependency('eaorcs-kernel', 'service-telemetry', 'EMITS_TELEMETRY', true);
    this.registerDependency('eaorcs-kernel', 'service-marketplace', 'REGISTERS_PACKS', true);

    this.registerDependency('civiscore-capability', 'air-roofers-platform', 'HOSTED_ON', true);
    this.registerDependency('akpati-capability', 'air-roofers-platform', 'HOSTED_ON', true);
    this.registerDependency('mandatag-capability', 'air-roofers-platform', 'HOSTED_ON', true);
  }

  _detectCycles() {
    // DFS Cycle detection
    const adj = new Map();
    for (const node of this._nodes.keys()) adj.set(node, []);
    for (const edge of this._edges) {
      if (adj.has(edge.from)) adj.get(edge.from).push(edge.to);
    }

    const visited = new Set();
    const recStack = new Set();
    const cycles = [];

    const dfs = (node, path) => {
      visited.add(node);
      recStack.add(node);
      path.push(node);

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path]);
        } else if (recStack.has(neighbor)) {
          const cyclePath = path.slice(path.indexOf(neighbor));
          cyclePath.push(neighbor);
          cycles.push(cyclePath);
        }
      }

      recStack.delete(node);
    };

    for (const node of this._nodes.keys()) {
      if (!visited.has(node)) dfs(node, []);
    }

    return cycles;
  }
}

module.exports = PlatformDependencyGraphEngine;
module.exports.PlatformDependencyGraphEngine = PlatformDependencyGraphEngine;
module.exports.NODE_TYPES = NODE_TYPES;
