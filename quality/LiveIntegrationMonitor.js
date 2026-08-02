/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Quality Assurance & Integration Health Monitor
 * File           : LiveIntegrationMonitor.js
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

const PLATFORM_SERVICES = [
  {
    id: 'billing',
    name: 'Billing Service',
    endpoint: 'billing.airroofers.eu',
    adapterPaths: ['engine/adapters/BillingAdapter.js', 'adapters/BillingAdapter.js'],
    requiredHeaders: ['X-Correlation-ID'],
    prohibitedPatterns: ['createInvoice', 'chargeCard', 'processPayment', 'createBillingRecord'],
    requiredEndpointRef: 'billing.airroofers.eu'
  },
  {
    id: 'licensing',
    name: 'Licensing Service',
    endpoint: 'licensing.airroofers.eu',
    adapterPaths: ['engine/adapters/LicensingAdapter.js', 'adapters/LicensingAdapter.js'],
    requiredHeaders: ['X-Correlation-ID'],
    prohibitedPatterns: ['issueLicense', 'generateLicenseKey', 'renewLicenseKey'],
    requiredEndpointRef: 'licensing.airroofers.eu'
  },
  {
    id: 'identity',
    name: 'Identity/SSO Service',
    endpoint: 'identity.airroofers.eu',
    adapterPaths: ['engine/adapters/IdentityAdapter.js', 'adapters/IdentityAdapter.js'],
    requiredHeaders: ['Authorization'],
    prohibitedPatterns: ['createUser', 'storePassword', 'createUserRecord'],
    requiredEndpointRef: 'identity.airroofers.eu'
  },
  {
    id: 'telemetry',
    name: 'Telemetry Service',
    endpoint: 'telemetry.airroofers.eu',
    adapterPaths: ['engine/adapters/TelemetryAdapter.js', 'adapters/TelemetryAdapter.js'],
    requiredHeaders: ['X-Telemetry-Key'],
    prohibitedPatterns: ['scrapeMetrics', 'collectNodeMetrics', 'configurePrometheus'],
    requiredEndpointRef: 'telemetry.airroofers.eu'
  },
  {
    id: 'support',
    name: 'Support Service',
    endpoint: 'support.airroofers.eu',
    adapterPaths: ['engine/adapters/SupportAdapter.js', 'adapters/SupportAdapter.js'],
    requiredHeaders: ['X-Correlation-ID'],
    prohibitedPatterns: ['configureSmtp', 'sendRawEmail', 'openRawTicket'],
    requiredEndpointRef: 'support.airroofers.eu'
  }
];

class LiveIntegrationMonitor {
  checkAdapterExists(service) {
    for (const p of service.adapterPaths) {
      if (fs.existsSync(p)) {
        return { found: true, path: p };
      }
    }
    return { found: false, path: null };
  }

  checkAdapterCompliance(service, adapterPath) {
    if (!adapterPath || !fs.existsSync(adapterPath)) {
      return { endpointConfigured: false, violations: [], complianceScore: 0 };
    }

    const content = fs.readFileSync(adapterPath, 'utf8');
    const endpointConfigured = content.includes(service.requiredEndpointRef);
    const violations = service.prohibitedPatterns.filter(pattern => content.includes(pattern));

    let score = 100;
    if (!endpointConfigured) score -= 40;
    score -= (violations.length * 20);

    const headers = this.checkAdapterHeaders(service, adapterPath);
    if (headers.headersMissing.length > 0) {
      score -= (headers.headersMissing.length * 15);
    }

    const complianceScore = Math.max(0, Math.min(100, score));

    return {
      endpointConfigured,
      violations,
      complianceScore
    };
  }

  checkAdapterHeaders(service, adapterPath) {
    if (!adapterPath || !fs.existsSync(adapterPath)) {
      return { headersPresent: [], headersMissing: service.requiredHeaders.slice() };
    }

    const content = fs.readFileSync(adapterPath, 'utf8');
    const headersPresent = [];
    const headersMissing = [];

    for (const h of service.requiredHeaders) {
      if (content.includes(h)) {
        headersPresent.push(h);
      } else {
        headersMissing.push(h);
      }
    }

    return { headersPresent, headersMissing };
  }

  checkService(service) {
    const existence = this.checkAdapterExists(service);
    if (!existence.found) {
      return {
        service: service.id,
        name: service.name,
        status: 'WARN',
        detail: 'Adapter file not found',
        path: null,
        endpointConfigured: false,
        violations: [],
        headersPresent: [],
        headersMissing: service.requiredHeaders.slice(),
        complianceScore: 0
      };
    }

    const compliance = this.checkAdapterCompliance(service, existence.path);
    const headers = this.checkAdapterHeaders(service, existence.path);
    const status = (compliance.violations.length === 0 && compliance.endpointConfigured) ? 'PASS' : 'WARN';

    return {
      service: service.id,
      name: service.name,
      status,
      path: existence.path,
      endpointConfigured: compliance.endpointConfigured,
      violations: compliance.violations,
      headersPresent: headers.headersPresent,
      headersMissing: headers.headersMissing,
      complianceScore: compliance.complianceScore
    };
  }

  checkOtaReadiness() {
    const paths = [
      'packaging/shared-host/deploy.php',
      'packaging/docker/docker-compose.yml',
      'packaging/kubernetes/deployment.yaml'
    ];
    const found = paths.filter(p => fs.existsSync(p));
    return {
      ready: found.length >= 2,
      foundArtifacts: found,
      missingArtifacts: paths.filter(p => !found.includes(p))
    };
  }

  checkAllServices() {
    return PLATFORM_SERVICES.map(s => this.checkService(s));
  }
}

module.exports = LiveIntegrationMonitor;
module.exports.PLATFORM_SERVICES = PLATFORM_SERVICES;
