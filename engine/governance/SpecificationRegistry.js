/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Specification Registry Engine
 * File           : SpecificationRegistry.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Architecture & Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Air Roofers Architecture Standards Index & Master Blueprint Standard
 * - Single Machine-Readable Source of Truth for Architecture Specifications
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const SPECIFICATIONS = Object.freeze({
  BLUEPRINT: {
    id: 'eaorcs-master-blueprint',
    name: 'EAORCS Master Architecture Blueprint',
    version: '2026.3.0-LTS',
    authority: 'FROZEN',
    status: 'RATIFIED',
  },
  STANDARDS: {
    id: 'airroofers-architecture-standards-index',
    name: 'Air Roofers Architecture Standards Index',
    version: '1.0.0',
    authority: 'RATIFIED',
    status: 'ACTIVE',
  },
  DISTRIBUTION: {
    id: 'airroofers-distribution-protection-architecture',
    name: 'Air Roofers Distribution Protection Architecture',
    version: '1.1.0',
    authority: 'FROZEN',
    status: 'RATIFIED',
  },
  PLATFORM_EVOLUTION: {
    id: 'airroofers-platform-evolution-policy',
    name: 'Air Roofers Platform Evolution Policy',
    version: '1.0.0',
    authority: 'FROZEN',
    status: 'RATIFIED',
  },
});

/**
 * SpecificationRegistry
 *
 * Central registry providing authoritative specification metadata for runtime validation
 * and CI/CD drift detection.
 */
class SpecificationRegistry {
  constructor(options = {}) {
    this.options = options;
  }

  getSpecification(specId) {
    const key = specId.toUpperCase().replace(/-/g, '_');
    const match = SPECIFICATIONS[key] || Object.values(SPECIFICATIONS).find(s => s.id === specId);
    if (!match) throw new Error(`SpecificationRegistry: Unknown specification '${specId}'.`);
    return { ...match };
  }

  getAllSpecifications() {
    return Object.values(SPECIFICATIONS).map(s => ({ ...s }));
  }

  getFoundationStatus() {
    return {
      foundationFrozen: true,
      capabilityExtensionsActive: true,
      commercialEvolutionActive: true,
      masterVersion: '2026.3.0-LTS',
    };
  }

  getEngineStatus() {
    return { initialized: true, totalSpecifications: Object.keys(SPECIFICATIONS).length };
  }
}

module.exports = SpecificationRegistry;
module.exports.SpecificationRegistry = SpecificationRegistry;
module.exports.SPECIFICATIONS = SPECIFICATIONS;
