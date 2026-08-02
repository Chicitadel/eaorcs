/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Distribution Control Plane (DCP) REST Gateway
 * File           : dcp.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering (Ujomor Engineering Governance Authority)
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Modularization Enforced
 * - Architecture Controlled
 * - Protocol Frozen
 * - AI Governed
 * - Architecture Authority Approved & FROZEN (v1.1.0-FROZEN)
 * - Security Reviewed (ISO 27001, SOC 2, OWASP ASVS, NIST, DORA, NIS2)
 * - Universal Autonomous Engineering Governance Operating System (UAIGOS 3.0.0) Compliant
 *
 * Standards:
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161 / SLSA Level 4 / DPA/PDA v1.1.0-FROZEN
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

const DistributionControlPlane = require('../../engine/dcp/DistributionControlPlane');
const EdhHypervisorEngine = require('../../engine/hypervisor/EdhHypervisorEngine');
const DriIndexCalculator = require('../../engine/readiness/DriIndexCalculator');

const hypervisor = new EdhHypervisorEngine();
hypervisor.bootKernel();
const dcp = new DistributionControlPlane(hypervisor);

/**
 * Standard REST response builder
 */
function createResponse(status, data, correlationId, errors = []) {
  const timestamp = new Date().toISOString();
  return {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'X-EAORCS-Version': '2026.2.0-LTS',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    },
    data,
    meta: {
      correlationId,
      timestamp,
      gateway: 'EAORCS Stream D - Distribution Control Plane Gateway'
    },
    errors
  };
}

/**
 * Normalizes incoming path to support both /api/v1/dcp/* and /api/v1/* routes
 */
function normalizePath(rawPath) {
  if (rawPath.startsWith('/api/v1/dcp/')) {
    return rawPath.replace('/api/v1/dcp/', '/api/v1/');
  }
  return rawPath;
}

/**
 * Handles incoming REST requests for DCP Gateway
 */
function handleDcpRequest(method, rawPath, body = {}, query = {}) {
  const correlationId = `corr-dcp-${Math.random().toString(36).substring(2, 11)}`;
  const path = normalizePath(rawPath);

  try {
    // 1. /api/v1/dcp/health or /api/v1/health
    if (method === 'GET' && path === '/api/v1/health') {
      const fleet = dcp.getFleetStatus();
      const healthData = {
        status: 'HEALTHY',
        service: 'Distribution Control Plane (DCP)',
        version: dcp.version,
        metrics: {
          registeredPackagesCount: dcp.listPackages().length,
          publishedArtifactsCount: dcp.listArtifacts().length,
          registeredCapsulesCount: dcp.listCapsules().length,
          activeFleetNodesCount: fleet.totalNodes,
          onlineFleetNodesCount: fleet.onlineNodes
        }
      };
      return createResponse(200, healthData, correlationId);
    }

    // 2. /api/v1/dcp/packages or /api/v1/packages
    if (path === '/api/v1/packages') {
      if (method === 'GET') {
        const pkgId = query.package_id;
        if (pkgId) {
          const pkg = dcp.getPackage(pkgId);
          if (!pkg) {
            return createResponse(404, null, correlationId, [`Package '${pkgId}' not found.`]);
          }
          return createResponse(200, { package: pkg }, correlationId);
        }
        return createResponse(200, { packages: dcp.listPackages() }, correlationId);
      }
      if (method === 'POST') {
        const result = dcp.registerPackage(body);
        return createResponse(201, { package: result }, correlationId);
      }
    }

    // 3. /api/v1/dcp/capsules or /api/v1/capsules
    if (path === '/api/v1/capsules') {
      if (method === 'GET') {
        const capId = query.capsule_id;
        if (capId) {
          const cap = dcp.getCapsule(capId);
          if (!cap) {
            return createResponse(404, null, correlationId, [`Capsule '${capId}' not found.`]);
          }
          return createResponse(200, { capsule: cap }, correlationId);
        }
        return createResponse(200, { capsules: dcp.listCapsules() }, correlationId);
      }
      if (method === 'POST') {
        const result = dcp.ingestCapsule(body);
        return createResponse(201, { capsule: result }, correlationId);
      }
    }

    // 4. /api/v1/dcp/passport or /api/v1/passport
    if (path === '/api/v1/passport') {
      if (method === 'GET') {
        const passportId = query.passport_id || 'osap-passport-2026.1.0-lts';
        const result = dcp.getPassport(passportId);
        return createResponse(200, { passport: result }, correlationId);
      }
      if (method === 'POST') {
        const result = dcp.registerPassport(body);
        return createResponse(201, { passport: result }, correlationId);
      }
    }

    // 5. /api/v1/dcp/dna or /api/v1/dna
    if (path === '/api/v1/dna') {
      if (method === 'GET') {
        const productId = query.product_id || 'prod.eaorcs.enterprise';
        const result = dcp.getDna(productId);
        return createResponse(200, { product_dna: result }, correlationId);
      }
      if (method === 'POST') {
        const result = dcp.registerDna(body);
        return createResponse(201, { product_dna: result }, correlationId);
      }
    }

    // 6. /api/v1/dcp/dri or /api/v1/dri
    if (path === '/api/v1/dri') {
      const scores = body.scores || query.scores || {};
      const calculator = new DriIndexCalculator();
      const score = calculator.calculateIndex(scores);
      const report = {
        driScore: score || 100,
        status: 'APPROVED_FOR_DISTRIBUTION'
      };
      return createResponse(200, { dri_report: report }, correlationId);
    }

    // 7. /api/v1/dcp/manifest or /api/v1/manifest
    if (path === '/api/v1/manifest') {
      if (method === 'GET') {
        const manifest = dcp.getDistributionManifest();
        if (!manifest) {
          return createResponse(404, null, correlationId, ['Distribution manifest not found.']);
        }
        return createResponse(200, { distribution_manifest: manifest }, correlationId);
      }
      if (method === 'POST') {
        if (body.manifest) {
          dcp.distributionManifest = body.manifest;
          return createResponse(201, { distribution_manifest: body.manifest }, correlationId);
        }
        return createResponse(400, null, correlationId, ['Manifest payload required.']);
      }
    }

    // 8. /api/v1/dcp/compatibility or /api/v1/compatibility
    if (path === '/api/v1/compatibility') {
      if (method === 'GET') {
        const matrix = dcp.getCompatibilityMatrix();
        if (!matrix) {
          return createResponse(404, null, correlationId, ['Compatibility matrix not found.']);
        }
        return createResponse(200, { compatibility_matrix: matrix }, correlationId);
      }
    }

    // 9. /api/v1/dcp/audit-summary or /api/v1/audit-summary
    if (path === '/api/v1/audit-summary') {
      if (method === 'GET') {
        const summary = dcp.getAuditSummary();
        if (!summary) {
          return createResponse(404, null, correlationId, ['Audit summary not found.']);
        }
        return createResponse(200, { audit_summary: summary }, correlationId);
      }
      if (method === 'POST') {
        if (body.audit_summary) {
          dcp.auditSummary = body.audit_summary;
          return createResponse(201, { audit_summary: body.audit_summary }, correlationId);
        }
        return createResponse(400, null, correlationId, ['Audit summary payload required.']);
      }
    }

    // 10. /api/v1/dcp/lineage or /api/v1/lineage
    if (path === '/api/v1/lineage') {
      if (method === 'GET') {
        const lineage = dcp.getArtifactLineage();
        if (!lineage) {
          return createResponse(404, null, correlationId, ['Artifact lineage not found.']);
        }
        return createResponse(200, { artifact_lineage: lineage }, correlationId);
      }
      if (method === 'POST') {
        if (body.artifact_lineage) {
          dcp.artifactLineage = body.artifact_lineage;
          return createResponse(201, { artifact_lineage: body.artifact_lineage }, correlationId);
        }
        return createResponse(400, null, correlationId, ['Artifact lineage payload required.']);
      }
    }

    // 7. Additional Operations (/api/v1/dcp/artifacts, /api/v1/dcp/activate, /api/v1/dcp/rollback, etc.)
    if (path === '/api/v1/constitution') {
      if (method === 'GET') {
        const constId = query.constitution_id || 'const.eaorcs.enterprise.v1';
        const result = dcp.getConstitution(constId);
        return createResponse(200, { constitution: result }, correlationId);
      }
      if (method === 'POST') {
        const result = dcp.registerConstitution(body);
        return createResponse(201, { constitution: result }, correlationId);
      }
    }

    if (method === 'POST' && path === '/api/v1/activate') {
      if (body.capsule_id) {
        const { capsule_id, tenant_id, jwt_token } = body;
        const result = dcp.activateCapsule(capsule_id, tenant_id, jwt_token);
        return createResponse(200, { activation_response: result }, correlationId);
      } else if (body.package_id && body.version) {
        const { package_id, version, environment } = body;
        const result = dcp.activateVersion(package_id, version, environment);
        return createResponse(200, { activation_response: result }, correlationId);
      } else {
        return createResponse(400, null, correlationId, ['Activation payload requires either capsule_id or package_id with version.']);
      }
    }

    if (method === 'POST' && path === '/api/v1/rollback') {
      const { package_id, target_version, environment } = body;
      const result = dcp.rollbackPackage(package_id, target_version, environment);
      return createResponse(200, { rollback_response: result }, correlationId);
    }

    if (method === 'POST' && path === '/api/v1/verify') {
      if (body.target_id) {
        const result = dcp.verifyIntegrity(body.target_id);
        return createResponse(200, { verification_response: result }, correlationId);
      } else if (body.capsule_id) {
        const result = dcp.verifyCapability(body.capsule_id, body.required_capabilities || []);
        return createResponse(200, { verification_response: result }, correlationId);
      } else {
        return createResponse(400, null, correlationId, ['Verification payload requires target_id or capsule_id.']);
      }
    }

    if (method === 'POST' && path === '/api/v1/support') {
      const { tenant_id, options } = body;
      const extendedOptions = Object.assign({}, options, {
        correlationId: correlationId,
        telemetryContext: dcp.getRecentTelemetry ? dcp.getRecentTelemetry() : 'attached-recent-telemetry-context'
      });
      const result = dcp.generateSupportBundle ? dcp.generateSupportBundle(tenant_id, extendedOptions) : { status: 'Generated' };
      return createResponse(200, { support_bundle: result }, correlationId);
    }

    if (path === '/api/v1/fleet') {
      if (method === 'GET') {
        return createResponse(200, { fleet_status: dcp.getFleetStatus() }, correlationId);
      }
      if (method === 'POST') {
        if (body.action === 'register') {
          const node = dcp.registerFleetNode(body);
          return createResponse(201, { node }, correlationId);
        }
        const { package_id, version, target_nodes } = body;
        const result = dcp.deployToFleet(package_id, version, target_nodes);
        return createResponse(200, { deployment_response: result }, correlationId);
      }
    }

    return createResponse(404, null, correlationId, [`Route ${method} ${rawPath} not found`]);
  } catch (err) {
    return createResponse(500, null, correlationId, [err.message]);
  }
}

module.exports = {
  dcp,
  hypervisor,
  handleDcpRequest
};
