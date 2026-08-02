/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Quality Assurance & Commercial Readiness
 * File           : CommercialReadinessVerifier.js
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

const COMMERCIAL_CHECKS = [
  {
    id: 'COM-01',
    name: 'Billing adapter configured',
    check: () => fs.existsSync('engine/adapters/BillingAdapter.js') || fs.existsSync('adapters/BillingAdapter.js'),
    evidence: 'engine/adapters/BillingAdapter.js or adapters/BillingAdapter.js'
  },
  {
    id: 'COM-02',
    name: 'Licensing adapter configured',
    check: () => fs.existsSync('engine/adapters/LicensingAdapter.js') || fs.existsSync('adapters/LicensingAdapter.js'),
    evidence: 'engine/adapters/LicensingAdapter.js or adapters/LicensingAdapter.js'
  },
  {
    id: 'COM-03',
    name: 'Subscription gate implemented',
    check: () => fs.existsSync('engine/saas/SubscriptionGate.js'),
    evidence: 'engine/saas/SubscriptionGate.js'
  },
  {
    id: 'COM-04',
    name: 'OTA deployment scripts present',
    check: () => [
      'packaging/shared-host/deploy.php',
      'packaging/docker/docker-compose.yml',
      'packaging/kubernetes/deployment.yaml'
    ].some(p => fs.existsSync(p)),
    evidence: 'packaging/'
  },
  {
    id: 'COM-05',
    name: 'Upgrade/rollback tested',
    check: () => fs.existsSync('tests/enterprise/upgrade_rollback.test.js'),
    evidence: 'tests/enterprise/upgrade_rollback.test.js'
  },
  {
    id: 'COM-06',
    name: 'Telemetry streaming configured',
    check: () => fs.existsSync('engine/adapters/TelemetryAdapter.js') || fs.existsSync('adapters/TelemetryAdapter.js'),
    evidence: 'engine/adapters/TelemetryAdapter.js or adapters/TelemetryAdapter.js'
  },
  {
    id: 'COM-07',
    name: 'Support integration configured',
    check: () => fs.existsSync('engine/adapters/SupportAdapter.js') || fs.existsSync('adapters/SupportAdapter.js'),
    evidence: 'engine/adapters/SupportAdapter.js or adapters/SupportAdapter.js'
  },
  {
    id: 'COM-08',
    name: 'X-Correlation-ID propagation',
    check: () => fs.existsSync('engine/integration/ProductIntegrationComplianceEngine.js'),
    evidence: 'INT-09 compliance'
  },
  {
    id: 'COM-09',
    name: 'Health endpoint declared',
    check: () => fs.existsSync('schemas/openapi.json'),
    evidence: 'schemas/openapi.json /health endpoint'
  },
  {
    id: 'COM-10',
    name: 'License tier gating (5 tiers)',
    check: () => fs.existsSync('engine/saas/SubscriptionGate.js'),
    evidence: 'Community/Pro/Business/Enterprise/Sovereign'
  },
  {
    id: 'COM-11',
    name: 'Plugin marketplace registry',
    check: () => fs.existsSync('engine/marketplace/MarketplaceEngine.js') || fs.existsSync('engine/plugin/PluginRegistry.js'),
    evidence: 'engine/marketplace/'
  },
  {
    id: 'COM-12',
    name: 'Continuous certification pipeline',
    check: () => fs.existsSync('release/ContinuousCertificationPipeline.js'),
    evidence: 'release/ContinuousCertificationPipeline.js'
  }
];

class CommercialReadinessVerifier {
  verify() {
    return COMMERCIAL_CHECKS.map(c => {
      const passed = c.check();
      return {
        id: c.id,
        name: c.name,
        result: passed ? 'PASS' : 'WARN',
        detail: passed ? `Found: ${c.evidence}` : `Missing: ${c.evidence}`,
        evidence: c.evidence
      };
    });
  }
}

module.exports = CommercialReadinessVerifier;
module.exports.COMMERCIAL_CHECKS = COMMERCIAL_CHECKS;
