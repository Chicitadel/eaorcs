/******************************************************************************
 * Project        : Air Roofers Platform Ecosystem
 * Module         : Decoupled Workspace Governance Runtime v3.0.0
 * File           : engine/governance/WorkspaceGovernanceRuntime.js
 * Version        : 2026.3.0-LTS (Governance Runtime v3.0.0)
 * Author         : Enterprise Architecture & Security Governance Board
 * Organization   : Air Roofers Governance Directorate
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE
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
 * - AR-STD-PKG-001 to AR-STD-PKG-020
 * - AR-STD-REP-001
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Air Roofers Governance Directorate
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const EvidenceGraphEngine = require('./EvidenceGraphEngine');

class WorkspaceGovernanceRuntime {
  constructor(options = {}) {
    this.options = options;
    this.runtimeVersion = 'v3.0.0';
  }

  /**
   * Resolve root path for airroofers.workspace.yaml
   */
  resolveWorkspaceManifestPath() {
    const candidatePaths = [
      path.join(__dirname, '../../../../airroofers.workspace.yaml'),
      path.join(process.cwd(), '../airroofers.workspace.yaml'),
      path.join(process.cwd(), 'airroofers.workspace.yaml')
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) return p;
    }
    return candidatePaths[0];
  }

  /**
   * Load authoritative workspace manifest at workspace root.
   * @returns {Object} Manifest data
   */
  loadWorkspaceManifest() {
    const rootPath = this.resolveWorkspaceManifestPath();
    if (!fs.existsSync(rootPath)) {
      throw new Error(`WorkspaceGovernanceRuntime Error: Missing airroofers.workspace.yaml at ${rootPath}`);
    }
    const content = fs.readFileSync(rootPath, 'utf8');
    return {
      runtimeVersion: this.runtimeVersion,
      manifestPath: rootPath,
      content
    };
  }

  /**
   * Resolve authoritative standards directory in 00_engineering_guide
   * @returns {string} Standards path
   */
  resolveStandardsDirectory() {
    const candidatePaths = [
      path.join(__dirname, '../../../../00_engineering_guide/Global_Product_Packaging'),
      path.join(process.cwd(), '../00_engineering_guide/Global_Product_Packaging'),
      path.join(process.cwd(), '00_engineering_guide/Global_Product_Packaging')
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) return p;
    }
    return candidatePaths[0];
  }

  /**
   * Execute governance cycle and emit end-to-end evidence graph
   * @param {Object} context 
   * @returns {Object} Governance execution summary & evidence graph
   */
  executeGovernanceCycle(context = {}) {
    const manifestInfo = this.loadWorkspaceManifest();
    const standardsDir = this.resolveStandardsDirectory();
    const evidenceGraph = EvidenceGraphEngine.buildEvidenceGraph(context);

    return {
      status: 'GOVERNANCE_CYCLE_SUCCESS',
      runtimeVersion: this.runtimeVersion,
      manifestInfo,
      standardsDir,
      evidenceGraph
    };
  }
}

module.exports = WorkspaceGovernanceRuntime;
