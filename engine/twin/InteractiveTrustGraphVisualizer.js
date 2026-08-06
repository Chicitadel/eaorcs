/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Interactive Trust Graph Visualizer
 * File           : InteractiveTrustGraphVisualizer.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers UX & Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Air Roofers Interactive Visual Trust Explorer Standard
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const GovernanceKnowledgeGraphEngine = require('../governance/GovernanceKnowledgeGraphEngine');

/**
 * InteractiveTrustGraphVisualizer
 *
 * Transforms the Governance Knowledge Graph into interactive visual rendering payloads
 * for executive demos and customer portals.
 */
class InteractiveTrustGraphVisualizer {
  constructor(options = {}) {
    this.options = options;
    this.graphEngine = options.graphEngine || new GovernanceKnowledgeGraphEngine();
  }

  /**
   * Generates interactive visual graph rendering payload.
   */
  generateVisualGraphPayload() {
    const rawGraph = this.graphEngine.generateGovernanceGraph();

    const formattedNodes = rawGraph.nodes.map(n => ({
      id: n.id,
      label: n.name,
      group: n.type,
      color: n.type === 'EXTERNAL_AUDIT' ? '#f39c12' : n.type === 'ADR' ? '#3498db' : '#2ecc71',
      clickable: true,
    }));

    return {
      visualizerVersion: '2026.3.0-LTS',
      totalNodes: formattedNodes.length,
      totalEdges: rawGraph.edges.length,
      nodes: formattedNodes,
      edges: rawGraph.edges,
      interactiveFeatures: ['NodeZoom', 'EdgeHighlighting', 'ClickProvenanceDrilldown', 'HeatmapFiltering'],
      timestamp: new Date().toISOString(),
    };
  }

  getEngineStatus() {
    return { initialized: true };
  }
}

module.exports = InteractiveTrustGraphVisualizer;
module.exports.InteractiveTrustGraphVisualizer = InteractiveTrustGraphVisualizer;
