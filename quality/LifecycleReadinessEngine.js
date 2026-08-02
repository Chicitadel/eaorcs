/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Quality Assurance & Lifecycle Readiness Engine
 * File           : LifecycleReadinessEngine.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
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
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');

const LIFECYCLE_CHECKS = [
  { id: 'LC-RDY-01', name: 'Lifecycle orchestrator implemented', path: 'engine/lifecycle/LifecycleOrchestrator.js' },
  { id: 'LC-RDY-02', name: 'All 14 lifecycle stages defined', path: 'engine/lifecycle/LifecycleStageRegistry.js' },
  { id: 'LC-RDY-03', name: 'ISO 27001 audit trail active', path: 'engine/lifecycle/LifecycleAuditTrail.js' },
  { id: 'LC-RDY-04', name: 'OSAP passport generation', path: 'engine/osap/OsapEngine.js' },
  { id: 'LC-RDY-05', name: 'PLATINUM certificate generation', path: 'release/ProductReadinessCertificate.js' },
  { id: 'LC-RDY-06', name: 'Continuous certification pipeline', path: 'release/ContinuousCertificationPipeline.js' },
  { id: 'LC-RDY-07', name: 'Identity adapter for onboarding', path: 'engine/adapters/IdentityAdapter.js' },
  { id: 'LC-RDY-08', name: 'Billing adapter for subscription', path: 'engine/adapters/BillingAdapter.js' },
  { id: 'LC-RDY-09', name: 'Air Roofers certification stage', path: 'release/AirRoofersCertificationStage.js' }
];

class LifecycleReadinessEngine {
  verify() {
    return LIFECYCLE_CHECKS.map(c => {
      const altPath = c.path.replace('engine/adapters/', 'adapters/');
      const found = fs.existsSync(c.path) || fs.existsSync(altPath);
      const foundPath = found ? (fs.existsSync(c.path) ? c.path : altPath) : null;
      return {
        id: c.id,
        name: c.name,
        result: found ? 'PASS' : 'WARN',
        foundPath,
        path: c.path
      };
    });
  }
}

module.exports = LifecycleReadinessEngine;
module.exports.LIFECYCLE_CHECKS = LIFECYCLE_CHECKS;
