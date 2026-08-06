/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Architecture Decision Registry Engine
 * File           : ArchitectureDecisionRegistryEngine.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Governance & Architecture Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Air Roofers Architecture Decision Registry (ADR) Standard
 * - First-Class Engine Managing ADR-001 through ADR-007
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const ADR_CATALOG = Object.freeze([
  {
    id: 'ADR-001',
    title: 'Software Trust Kernel Microkernel Substrate',
    status: 'RATIFIED_AND_FROZEN',
    rationale: 'Decouples core platform execution from modular engine plugins',
    implementedBy: 'SoftwareTrustKernel.js',
    verifiedBy: 'phase4_product_polish.test.js',
    release: '2026.3.0-LTS',
  },
  {
    id: 'ADR-002',
    title: 'Air Roofers Native Ecosystem Boot Handshake Substrate',
    status: 'RATIFIED_AND_FROZEN',
    rationale: 'Enforces mandatory 8-step boot sequence before runtime start',
    implementedBy: 'NativePlatformBootSubstrate.js',
    verifiedBy: 'phase46_ecosystem_native.test.js',
    release: '2026.3.0-LTS',
  },
  {
    id: 'ADR-003',
    title: 'Central Platform Contract Registry & Breaking Change Detector',
    status: 'RATIFIED_AND_FROZEN',
    rationale: 'Prevents unannounced API drift and schema mutations',
    implementedBy: 'PlatformContractRegistry.js',
    verifiedBy: 'phase47_contract_registry.test.js',
    release: '2026.3.0-LTS',
  },
  {
    id: 'ADR-004',
    title: 'Ecosystem Conformance & Dependency Graph Auditor',
    status: 'RATIFIED_AND_FROZEN',
    rationale: 'Maintains zero circular dependencies and 100% ecosystem alignment',
    implementedBy: 'EcosystemConformanceEngine.js',
    verifiedBy: 'ecosystem_conformance.test.js',
    release: '2026.3.0-LTS',
  },
  {
    id: 'ADR-005',
    title: 'Platform Evolution Policy & Mutation Gate',
    status: 'RATIFIED_AND_FROZEN',
    rationale: 'Prevents prohibited architectural additions without ARB approval',
    implementedBy: 'PlatformEvolutionPolicyValidator.js',
    verifiedBy: 'phase5_evolution_policy.test.js',
    release: '2026.3.0-LTS',
  },
  {
    id: 'ADR-006',
    title: 'Cryptographic Release Evidence Manifest Generator',
    status: 'RATIFIED_AND_FROZEN',
    rationale: 'Emits signed provenance manifest for all RC/LTS releases',
    implementedBy: 'ReleaseEvidenceGenerator.js',
    verifiedBy: 'phase5_release_evidence.test.js',
    release: '2026.3.0-LTS',
  },
  {
    id: 'ADR-007',
    title: 'Specification Registry & Specification Drift Detector',
    status: 'RATIFIED_AND_FROZEN',
    rationale: 'Machine-verifies engine versions against master specifications',
    implementedBy: 'SpecificationRegistry.js',
    verifiedBy: 'phase5_specification_drift.test.js',
    release: '2026.3.0-LTS',
  },
]);

/**
 * ArchitectureDecisionRegistryEngine
 *
 * First-class ADR engine managing architectural decisions and traceability metadata.
 */
class ArchitectureDecisionRegistryEngine {
  constructor(options = {}) {
    this.options = options;
  }

  getAdr(adrId) {
    const match = ADR_CATALOG.find(a => a.id === adrId.toUpperCase());
    if (!match) throw new Error(`ArchitectureDecisionRegistryEngine: Unknown ADR '${adrId}'.`);
    return { ...match };
  }

  getAllAdrs() {
    return ADR_CATALOG.map(a => ({ ...a }));
  }

  verifyAdrCompliance() {
    const allFrozen = ADR_CATALOG.every(a => a.status === 'RATIFIED_AND_FROZEN');
    return {
      status: allFrozen ? 'ALL_ADRS_RATIFIED_AND_FROZEN' : 'ADR_RATIFICATION_PENDING',
      totalAdrs: ADR_CATALOG.length,
      allFrozen,
    };
  }

  getEngineStatus() {
    return { initialized: true, totalAdrsTracked: ADR_CATALOG.length };
  }
}

module.exports = ArchitectureDecisionRegistryEngine;
module.exports.ArchitectureDecisionRegistryEngine = ArchitectureDecisionRegistryEngine;
module.exports.ADR_CATALOG = ADR_CATALOG;
