/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Requirement Traceability Graph Engine
 * File           : engine/traceability/RequirementGraphEngine.js
 * Version        : 2026.1.0-LTS
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Ujomor Systems Ecosystem
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

'use strict';

const fs = require('fs');
const path = require('path');
const RequirementRegistry = require('./RequirementRegistry');
const CapabilityRegistry = require('../registry/CapabilityRegistry');

/**
 * RequirementGraphEngine
 * Builds and queries the 10-layer Requirement Traceability Graph:
 * Product -> Capabilities -> Requirements -> Modules -> Tests -> Evidence -> Deployments -> Support -> Telemetry -> Commercial Editions
 */
class RequirementGraphEngine {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.reqRegistry = new RequirementRegistry(options.requirementRegistryPath);
    this.capRegistry = new CapabilityRegistry(options.capabilityRegistryPath);
    this.evidenceDir = options.evidenceDir || path.join(this.rootDir, 'evidence');
  }

  /**
   * Generates full 10-layer traceability graph for a given requirement ID.
   * @param {string} reqId Requirement ID (e.g. REQ-BP-001)
   * @returns {Object} Complete traceability node graph
   */
  generateTraceabilityGraph(reqId) {
    const req = this.reqRegistry.getRequirement(reqId);
    if (!req) {
      throw new Error(`Requirement '${reqId}' not found in registry.`);
    }

    const mappedCaps = (req.mappedCapabilities || []).map(cid => this.capRegistry.getCapability(cid)).filter(Boolean);

    return {
      requirementId: req.id,
      name: req.name,
      category: req.category,
      status: req.status,
      graphNode: {
        layer1_Product: 'eaorcs (Software Trust Platform)',
        layer2_Capabilities: mappedCaps.map(c => c.name),
        layer3_Requirements: [req.id, req.name],
        layer4_Modules: req.implementationModules || [],
        layer5_TestSuites: req.testSuites || [],
        layer6_Evidence: req.evidenceArtifacts || [],
        layer7_Deployments: ['production', 'staging', 'demo-sandbox'],
        layer8_Support: mappedCaps.map(c => c.supportArticle).filter(Boolean),
        layer9_Telemetry: mappedCaps.flatMap(c => c.telemetrySignals || []),
        layer10_CommercialEditions: mappedCaps.flatMap(c => c.commercialEditions || [])
      },
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Evaluates graph completeness across all blueprint requirements and writes evidence artifact.
   * @returns {Object} Graph evaluation summary
   */
  evaluateGraphCompleteness() {
    const allReqs = this.reqRegistry.getAllRequirements();
    const graphs = allReqs.map(r => this.generateTraceabilityGraph(r.id));
    const isComplete = graphs.every(g => g.graphNode.layer4_Modules.length > 0 && g.graphNode.layer5_TestSuites.length > 0);

    // Detect orphaned capabilities
    const allCaps = this.capRegistry.getAllCapabilities();
    const mappedCapIds = new Set(allReqs.flatMap(r => r.mappedCapabilities || []));
    const orphanedCaps = allCaps.filter(c => !mappedCapIds.has(c.id));

    const payload = {
      totalRequirementsMapped: allReqs.length,
      totalGraphNodes: graphs.length,
      orphanedCapabilitiesCount: orphanedCaps.length,
      isGraphComplete: isComplete && orphanedCaps.length === 0,
      graphSummary: graphs.map(g => ({ reqId: g.requirementId, name: g.name, modulesCount: g.graphNode.layer4_Modules.length })),
      evaluatedAt: new Date().toISOString()
    };

    if (!fs.existsSync(this.evidenceDir)) {
      fs.mkdirSync(this.evidenceDir, { recursive: true });
    }
    const outPath = path.join(this.evidenceDir, 'evidence_traceability_graph.json');
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');

    const govPath = path.join(this.evidenceDir, 'blueprint_governance_report.json');
    fs.writeFileSync(govPath, JSON.stringify(payload, null, 2), 'utf8');

    return payload;
  }
}

module.exports = RequirementGraphEngine;
