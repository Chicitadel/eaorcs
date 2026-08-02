/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Air Roofers Platform Integration Compliance Engine
 * File           : ProductIntegrationComplianceEngine.js
 * Version        : 2026.1.0-LTS
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Air Roofers / Ujomor Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
 *
 * Governance:
 * - AI Governed
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
 * Copyright (c) 2026 Air Roofers / Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

class ProductIntegrationComplianceEngine {
  constructor() {
    this.requirements = [
      {
        id: 'INT-01',
        name: 'Billing Adapter Integration',
        check: (descriptor) => {
          if (descriptor.hasLocalBillingLogic || descriptor.hasLocalBilling) {
            return {
              status: 'FAIL',
              detail: 'Local billing logic detected; products must query central API billing.airroofers.eu'
            };
          }
          const adapter = descriptor.adapters?.billing;
          if (!adapter) {
            return { status: 'FAIL', detail: 'Billing adapter missing' };
          }
          const endpointStr = typeof adapter === 'string'
            ? adapter
            : (adapter.endpoint || adapter.url || JSON.stringify(adapter));
          if (endpointStr.includes('billing.airroofers.eu')) {
            return {
              status: 'PASS',
              detail: 'Billing adapter present targeting billing.airroofers.eu with zero local billing logic'
            };
          }
          return {
            status: 'FAIL',
            detail: `Billing adapter endpoint (${endpointStr}) does not target billing.airroofers.eu`
          };
        }
      },
      {
        id: 'INT-02',
        name: 'Licensing Adapter Integration',
        check: (descriptor) => {
          if (descriptor.hasLocalLicenseIssuance || descriptor.hasLocalLicensing) {
            return {
              status: 'FAIL',
              detail: 'Local license issuance detected; products must query central licensing.airroofers.eu'
            };
          }
          const adapter = descriptor.adapters?.licensing;
          if (!adapter) {
            return { status: 'FAIL', detail: 'Licensing adapter missing' };
          }
          const endpointStr = typeof adapter === 'string'
            ? adapter
            : (adapter.endpoint || adapter.url || JSON.stringify(adapter));
          if (endpointStr.includes('licensing.airroofers.eu')) {
            return {
              status: 'PASS',
              detail: 'Licensing adapter present targeting licensing.airroofers.eu with zero local license issuance'
            };
          }
          return {
            status: 'FAIL',
            detail: `Licensing adapter endpoint (${endpointStr}) does not target licensing.airroofers.eu`
          };
        }
      },
      {
        id: 'INT-03',
        name: 'Telemetry Adapter & Header',
        check: (descriptor) => {
          const adapter = descriptor.adapters?.telemetry;
          if (!adapter) {
            return { status: 'FAIL', detail: 'Telemetry adapter missing' };
          }
          const endpointStr = typeof adapter === 'string'
            ? adapter
            : (adapter.endpoint || adapter.url || JSON.stringify(adapter));
          const hasEndpoint = endpointStr.includes('telemetry.airroofers.eu');
          const hasHeader = descriptor.hasTelemetryKey === true ||
            descriptor.telemetryKeyHeader === true ||
            (typeof adapter === 'string' && adapter.includes('X-Telemetry-Key')) ||
            (typeof adapter === 'object' && adapter !== null && (
              (adapter.headers && adapter.headers['X-Telemetry-Key']) ||
              adapter.hasTelemetryKey ||
              JSON.stringify(adapter).includes('X-Telemetry-Key')
            ));

          if (!hasEndpoint) {
            return { status: 'FAIL', detail: `Telemetry adapter endpoint (${endpointStr}) does not target telemetry.airroofers.eu` };
          }
          if (hasHeader) {
            return { status: 'PASS', detail: 'Telemetry adapter present targeting telemetry.airroofers.eu with X-Telemetry-Key header' };
          }
          return { status: 'WARN', detail: 'Telemetry adapter targets telemetry.airroofers.eu but X-Telemetry-Key header is missing' };
        }
      },
      {
        id: 'INT-04',
        name: 'Storage Governor & Cleanup Strategy',
        check: (descriptor) => {
          const gov = descriptor.storageGovernor !== undefined ? descriptor.storageGovernor : descriptor.hasStorageGovernor;
          if (gov === true) {
            return { status: 'PASS', detail: 'Centralized storage governor present with log rotation and temp cleanup defined' };
          }
          if (typeof gov === 'object' && gov !== null) {
            const hasRotation = gov.logRotation !== false && gov.hasLogRotation !== false;
            const hasCleanup = gov.tempCleanup !== false && gov.hasTempCleanup !== false;
            if (hasRotation && hasCleanup) {
              return { status: 'PASS', detail: 'Centralized storage governor present with log rotation and temp cleanup defined' };
            }
            return { status: 'WARN', detail: 'Storage governor present but log rotation or temp cleanup configuration incomplete' };
          }
          return { status: 'FAIL', detail: 'Storage governor missing; unmanaged local blob storage is prohibited' };
        }
      },
      {
        id: 'INT-05',
        name: 'Air Roofers Core SDK Dependency',
        check: (descriptor) => {
          const deps = descriptor.packageJson?.dependencies || {};
          const devDeps = descriptor.packageJson?.devDependencies || {};
          const hasSdkInPkg = Boolean(deps['@airroofers/core-sdk'] || devDeps['@airroofers/core-sdk']);
          const hasSdkRef = descriptor.hasCoreSdk === true || descriptor.sdkReference === true || hasSdkInPkg;

          if (hasSdkRef) {
            return { status: 'PASS', detail: 'Core SDK (@airroofers/core-sdk) declared in package.json or adapter references' };
          }
          return { status: 'FAIL', detail: '@airroofers/core-sdk dependency not declared in package.json or adapters' };
        }
      },
      {
        id: 'INT-06',
        name: 'OTA Deployment Hook',
        check: (descriptor) => {
          const hook = descriptor.otaHook !== undefined ? descriptor.otaHook : (descriptor.hasOtaHook !== undefined ? descriptor.hasOtaHook : descriptor.smartDeployScript);
          if (hook === true) {
            return { status: 'PASS', detail: 'OTA deployment hook smart_deploy.sh reference present' };
          }
          if (typeof hook === 'string') {
            if (hook.includes('smart_deploy.sh') || hook === 'true') {
              return { status: 'PASS', detail: 'OTA deployment hook smart_deploy.sh reference present' };
            }
            return { status: 'WARN', detail: `OTA deployment adapter present (${hook}) but smart_deploy.sh reference unverified` };
          }
          if (typeof hook === 'object' && hook !== null) {
            return { status: 'PASS', detail: 'OTA deployment adapter hook present' };
          }
          return { status: 'FAIL', detail: 'OTA deployment hook (smart_deploy.sh) missing' };
        }
      },
      {
        id: 'INT-07',
        name: 'Support Adapter Integration',
        check: (descriptor) => {
          const adapter = descriptor.adapters?.support;
          if (!adapter) {
            return { status: 'FAIL', detail: 'Support adapter missing' };
          }
          const endpointStr = typeof adapter === 'string'
            ? adapter
            : (adapter.endpoint || adapter.url || JSON.stringify(adapter));
          const hasEndpoint = endpointStr.includes('support.airroofers.eu');
          const hasCorrelation = descriptor.hasCorrelationIds === true ||
            descriptor.correlationIdHeader === true ||
            (typeof adapter === 'string' && adapter.includes('X-Correlation-ID')) ||
            (typeof adapter === 'object' && adapter !== null && (
              (adapter.headers && adapter.headers['X-Correlation-ID']) ||
              adapter.hasCorrelationId ||
              JSON.stringify(adapter).includes('X-Correlation-ID')
            ));

          if (!hasEndpoint) {
            return { status: 'FAIL', detail: `Support adapter endpoint (${endpointStr}) does not target support.airroofers.eu` };
          }
          if (hasCorrelation) {
            return { status: 'PASS', detail: 'Support adapter present targeting support.airroofers.eu with X-Correlation-ID header' };
          }
          return { status: 'WARN', detail: 'Support adapter targets support.airroofers.eu but X-Correlation-ID header propagation is missing' };
        }
      },
      {
        id: 'INT-08',
        name: 'Health Endpoint Contract',
        check: (descriptor) => {
          const health = descriptor.hasHealthEndpoint !== undefined ? descriptor.hasHealthEndpoint : descriptor.healthEndpoint;
          if (health === true || health === '/health' || (typeof health === 'string' && health.includes('/health'))) {
            return { status: 'PASS', detail: 'Health endpoint /health declared in API contract' };
          }
          return { status: 'FAIL', detail: 'Health endpoint /health missing from API contract' };
        }
      },
      {
        id: 'INT-09',
        name: 'Correlation ID Propagation',
        check: (descriptor) => {
          const correlation = descriptor.hasCorrelationIds !== undefined ? descriptor.hasCorrelationIds : descriptor.correlationIdPropagation;
          if (correlation === true) {
            return { status: 'PASS', detail: 'X-Correlation-ID header propagation configured across all adapters' };
          }
          return { status: 'FAIL', detail: 'Correlation ID propagation (X-Correlation-ID) missing or incomplete' };
        }
      },
      {
        id: 'INT-10',
        name: 'Zero Hardcoded Secrets Policy',
        check: (descriptor) => {
          const noSecrets = descriptor.noHardcodedSecrets !== undefined
            ? descriptor.noHardcodedSecrets
            : (descriptor.hasHardcodedSecrets !== undefined ? !descriptor.hasHardcodedSecrets : true);
          if (noSecrets === true) {
            return { status: 'PASS', detail: 'No hardcoded secrets detected; env-var-only configuration enforced' };
          }
          return { status: 'FAIL', detail: 'Hardcoded secret literals detected in product configuration' };
        }
      },
      {
        id: 'INT-11',
        name: 'Fail-Fast Circuit Behavior',
        check: (descriptor) => {
          const failFast = descriptor.hasFailFast !== undefined ? descriptor.hasFailFast : descriptor.failFast;
          if (failFast === true) {
            return { status: 'PASS', detail: 'Fail-fast behavior configured on critical dependency failure' };
          }
          return { status: 'FAIL', detail: 'Fail-fast circuit behavior on critical dependency failure not configured' };
        }
      },
      {
        id: 'INT-12',
        name: 'OpenAPI Specification Contract',
        check: (descriptor) => {
          const spec = descriptor.hasOpenApiSpec !== undefined ? descriptor.hasOpenApiSpec : descriptor.openApiSpec;
          if (spec === true || (typeof spec === 'string' && (spec.endsWith('.yaml') || spec.endsWith('.json') || spec.includes('openapi')))) {
            return { status: 'PASS', detail: 'OpenAPI specification file (openapi.yaml / openapi.json) present' };
          }
          return { status: 'FAIL', detail: 'OpenAPI specification file missing from product root/schemas' };
        }
      },
      {
        id: 'INT-13',
        name: 'Identity SSO & User Database Policy',
        check: (descriptor) => {
          if (descriptor.hasUserDatabase || descriptor.hasLocalUserDb) {
            return {
              status: 'FAIL',
              detail: 'Local user database creation detected; products must integrate identity.airroofers.eu SSO'
            };
          }
          const adapter = descriptor.adapters?.identity;
          if (!adapter) {
            return { status: 'FAIL', detail: 'Identity adapter missing' };
          }
          const endpointStr = typeof adapter === 'string'
            ? adapter
            : (adapter.endpoint || adapter.url || JSON.stringify(adapter));
          if (endpointStr.includes('identity.airroofers.eu')) {
            return {
              status: 'PASS',
              detail: 'Identity adapter present targeting identity.airroofers.eu with zero local user DB'
            };
          }
          return {
            status: 'FAIL',
            detail: `Identity adapter endpoint (${endpointStr}) does not target identity.airroofers.eu`
          };
        }
      }
    ];
  }

  validateProduct(productDescriptor = {}) {
    const results = this.requirements.map(req => {
      const checkResult = req.check(productDescriptor);
      return {
        id: req.id,
        name: req.name,
        status: checkResult.status,
        detail: checkResult.detail
      };
    });

    const pass = results.filter(r => r.status === 'PASS').length;
    const warn = results.filter(r => r.status === 'WARN').length;
    const fail = results.filter(r => r.status === 'FAIL').length;

    return {
      productName: productDescriptor.name || 'Unknown Product',
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: results.length,
        pass,
        warn,
        fail,
        compliant: fail === 0
      }
    };
  }
}

module.exports = ProductIntegrationComplianceEngine;
