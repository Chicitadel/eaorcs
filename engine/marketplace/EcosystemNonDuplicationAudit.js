/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Ecosystem Non-Duplication Audit Engine
 * File           : engine/marketplace/EcosystemNonDuplicationAudit.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * The 8 Canonical Air Roofers Platform Domains & Integration Contracts
 */
const PLATFORM_DOMAINS = {
  identity: {
    id: 'identity',
    name: 'Authentication & Identity Domain',
    serviceKey: 'auth',
    contractEndpoint: 'https://auth.airroofers.eu',
    standardService: 'Air Roofers Unified SSO / OIDC Auth Provider',
    prohibitedDuplication: 'Custom authentication, proprietary JWT signers, local user credentials database'
  },
  billing: {
    id: 'billing',
    name: 'Billing & Commercial Metering Domain',
    serviceKey: 'billing',
    contractEndpoint: 'https://billing.airroofers.eu',
    standardService: 'Air Roofers Central Billing & Usage Metering Service',
    prohibitedDuplication: 'Custom payment gateways, local subscription tracking, standalone invoicing engine'
  },
  licensing: {
    id: 'licensing',
    name: 'Licensing & Entitlements Domain',
    serviceKey: 'licensing',
    contractEndpoint: 'https://licensing.airroofers.eu',
    standardService: 'Air Roofers License Entitlement & Verification Engine',
    prohibitedDuplication: 'Custom license key generators, local offline key validation algorithms'
  },
  storage: {
    id: 'storage',
    name: 'Storage & Immutable Vault Domain',
    serviceKey: 'storage',
    contractEndpoint: 'https://storage.airroofers.eu',
    standardService: 'Air Roofers Shared Object Storage & Evidence Vault',
    prohibitedDuplication: 'Custom un-audited blob storage, direct unencrypted disk writing'
  },
  telemetry: {
    id: 'telemetry',
    name: 'Telemetry, Audit & Observability Domain',
    serviceKey: 'telemetry',
    contractEndpoint: 'https://telemetry.airroofers.eu',
    standardService: 'Air Roofers Central Telemetry & Audit Log Aggregator',
    prohibitedDuplication: 'Local non-standard log files, bypassed audit tracing, un-aggregated metrics'
  },
  support: {
    id: 'support',
    name: 'Customer Support & Knowledge Routing Domain',
    serviceKey: 'support',
    contractEndpoint: 'https://support.airroofers.eu',
    standardService: 'Air Roofers Support Portal & Enterprise SLA Router',
    prohibitedDuplication: 'Standalone contact forms, disconnected ticketing backends'
  },
  notifications: {
    id: 'notifications',
    name: 'Notification & Alert Router Domain',
    serviceKey: 'notifications',
    contractEndpoint: 'https://notifications.airroofers.eu',
    standardService: 'Air Roofers Multi-Channel Notification Router',
    prohibitedDuplication: 'Direct SMTP relays, custom un-throttled webhook dispatchers'
  },
  search: {
    id: 'search',
    name: 'Search & Catalog Indexing Domain',
    serviceKey: 'search',
    contractEndpoint: 'https://search.airroofers.eu',
    standardService: 'Air Roofers Platform Catalog & Search Index',
    prohibitedDuplication: 'Custom standalone search indexing, local ad-hoc discovery APIs'
  }
};

/**
 * Ecosystem Non-Duplication Audit Engine
 * Evaluates feature-by-feature reuse vs duplication across the 8 Air Roofers platform domains
 * and generates non-duplication compliance certificates.
 */
class EcosystemNonDuplicationAudit {
  /**
   * Constructs the Ecosystem Non-Duplication Audit Engine.
   * @param {Object} options Configuration options
   * @param {string} [options.signingSecret] Secret key for HMAC certificate signing
   * @param {string} [options.descriptorPath] Path to airroofers-product-descriptor.json
   */
  constructor(options = {}) {
    this.signingSecret = options.signingSecret || 'EAORCS_ECOSYSTEM_AUDIT_SIGNING_SECRET_2026_LTS';
    this.descriptorPath = options.descriptorPath || path.resolve(__dirname, '../../config/airroofers-product-descriptor.json');
    this.descriptor = this.loadProductDescriptor();
  }

  /**
   * Loads product descriptor if available.
   * @returns {Object} Loaded product descriptor or default fallback
   */
  loadProductDescriptor() {
    try {
      if (fs.existsSync(this.descriptorPath)) {
        const raw = fs.readFileSync(this.descriptorPath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err) {
      // Fallback if missing
    }
    return {
      productId: 'eaorcs',
      name: 'EAORCS Enterprise System',
      platformDomain: 'airroofers.eu',
      version: '2026.1.0-LTS',
      platformIntegrationContracts: {
        identity: 'https://auth.airroofers.eu',
        billing: 'https://billing.airroofers.eu',
        licensing: 'https://licensing.airroofers.eu',
        storage: 'https://storage.airroofers.eu',
        telemetry: 'https://telemetry.airroofers.eu',
        support: 'https://support.airroofers.eu',
        notifications: 'https://notifications.airroofers.eu',
        search: 'https://search.airroofers.eu'
      }
    };
  }

  /**
   * Returns list of standard 8 platform domains.
   * @returns {Object} Platform domain catalog
   */
  getPlatformDomains() {
    return PLATFORM_DOMAINS;
  }

  /**
   * Audits feature reuse vs duplication for a single domain.
   * @param {string} domainKey Key of target domain (identity, billing, licensing, etc.)
   * @param {Object} domainConfig Feature configuration for target domain
   * @returns {Object} Domain audit result
   */
  auditDomainFeature(domainKey, domainConfig = {}) {
    const domainMeta = PLATFORM_DOMAINS[domainKey];
    if (!domainMeta) {
      throw new Error(`Unknown platform domain key: ${domainKey}`);
    }

    const findings = [];
    const recommendations = [];
    let isReused = false;
    let duplicationDetected = false;
    let reuseScore = 0;

    const reusesPlatformService = domainConfig.reusesPlatformService !== undefined 
      ? Boolean(domainConfig.reusesPlatformService)
      : (domainConfig.reused !== false && !domainConfig.customImplementation);

    const hasCustomImplementation = Boolean(domainConfig.customImplementation || domainConfig.duplicateService);

    if (reusesPlatformService && !hasCustomImplementation) {
      isReused = true;
      duplicationDetected = false;
      reuseScore = 100;
      findings.push({
        type: 'COMPLIANT_REUSE',
        severity: 'INFO',
        message: `Feature successfully reuses standard platform domain '${domainMeta.name}' at endpoint ${domainMeta.contractEndpoint}.`
      });
    } else if (reusesPlatformService && hasCustomImplementation) {
      isReused = true;
      duplicationDetected = true;
      reuseScore = 50;
      findings.push({
        type: 'PARTIAL_DUPLICATION',
        severity: 'WARNING',
        message: `Feature references platform domain '${domainMeta.name}', but retains custom duplicate logic.`
      });
      recommendations.push(`Decommission custom ${domainKey} modules and delegate 100% functionality to ${domainMeta.standardService}.`);
    } else {
      isReused = false;
      duplicationDetected = true;
      reuseScore = 0;
      findings.push({
        type: 'PROHIBITED_DUPLICATION',
        severity: 'HIGH',
        message: `Feature duplicates '${domainMeta.name}' (${domainMeta.prohibitedDuplication}) without reusing central platform service.`
      });
      recommendations.push(`Refactor subsystem to consume standard platform service ${domainMeta.standardService} at ${domainMeta.contractEndpoint}.`);
    }

    return {
      domainId: domainMeta.id,
      domainName: domainMeta.name,
      serviceKey: domainMeta.serviceKey,
      contractEndpoint: domainMeta.contractEndpoint,
      standardService: domainMeta.standardService,
      isReused,
      duplicationDetected,
      reuseScore,
      findings,
      recommendations
    };
  }

  /**
   * Audits a subsystem or product feature matrix across all 8 Air Roofers platform domains.
   * @param {Object} [subsystemDescriptor] Optional subsystem descriptor object
   * @returns {Object} Comprehensive audit results
   */
  auditSubsystem(subsystemDescriptor = {}) {
    const subsystemId = subsystemDescriptor.id || subsystemDescriptor.productId || this.descriptor.productId || 'eaorcs';
    const subsystemName = subsystemDescriptor.name || this.descriptor.name || 'EAORCS Subsystem';

    const domainOverrides = subsystemDescriptor.domainFeatures || subsystemDescriptor.domains || {};
    const domainResults = {};
    const prohibitedDuplications = [];

    let totalScore = 0;
    let compliantCount = 0;
    let partialCount = 0;
    let duplicatedCount = 0;

    const keys = Object.keys(PLATFORM_DOMAINS);
    for (const key of keys) {
      const featureConfig = domainOverrides[key] || { reusesPlatformService: true };
      const res = this.auditDomainFeature(key, featureConfig);
      domainResults[key] = res;

      totalScore += res.reuseScore;
      if (res.reuseScore === 100) {
        compliantCount++;
      } else if (res.reuseScore > 0) {
        partialCount++;
      } else {
        duplicatedCount++;
      }

      if (res.duplicationDetected) {
        prohibitedDuplications.push({
          domain: key,
          domainName: res.domainName,
          score: res.reuseScore,
          prohibitedPattern: PLATFORM_DOMAINS[key].prohibitedDuplication,
          recommendation: res.recommendations[0] || 'Refactor to standard platform service.'
        });
      }
    }

    const domainCount = keys.length;
    const nonDuplicationScore = Math.round((totalScore / domainCount) * 100) / 100;
    const reuseComplianceIndex = (nonDuplicationScore / 100).toFixed(2);

    let complianceStatus = 'COMPLIANT';
    if (nonDuplicationScore < 70 || duplicatedCount > 2) {
      complianceStatus = 'NON_COMPLIANT';
    } else if (nonDuplicationScore < 95 || partialCount > 0 || duplicatedCount > 0) {
      complianceStatus = 'NEEDS_REFACTOR';
    }

    return {
      subsystemId,
      subsystemName,
      auditedAt: new Date().toISOString(),
      governanceFramework: 'UAIGOS-PEP-STREAM-D',
      totalDomainsEvaluated: domainCount,
      compliantDomainsCount: compliantCount,
      partialDomainsCount: partialCount,
      duplicatedDomainsCount: duplicatedCount,
      nonDuplicationScore,
      reuseComplianceIndex: parseFloat(reuseComplianceIndex),
      complianceStatus,
      prohibitedDuplicationsCount: prohibitedDuplications.length,
      prohibitedDuplications,
      domainResults
    };
  }

  /**
   * Audits a batch of ecosystem plugins or platform subsystems.
   * @param {Array<Object>} subsystems List of subsystem descriptors
   * @returns {Object} Batch audit results summary
   */
  auditEcosystem(subsystems = []) {
    if (!Array.isArray(subsystems) || subsystems.length === 0) {
      subsystems = [{ id: 'eaorcs-core', name: 'EAORCS Core Platform' }];
    }

    const subsystemAudits = subsystems.map(s => this.auditSubsystem(s));
    const totalSubsystems = subsystemAudits.length;
    const averageScore = Math.round(
      (subsystemAudits.reduce((acc, curr) => acc + curr.nonDuplicationScore, 0) / totalSubsystems) * 100
    ) / 100;

    const allCompliant = subsystemAudits.every(s => s.complianceStatus === 'COMPLIANT');

    return {
      ecosystemAuditId: `AUDIT-ECO-${Date.now()}`,
      totalSubsystemsAudited: totalSubsystems,
      averageEcosystemScore: averageScore,
      allSubsystemsCompliant: allCompliant,
      subsystems: subsystemAudits,
      auditedAt: new Date().toISOString()
    };
  }

  /**
   * Generates a signed Non-Duplication Compliance Certificate.
   * @param {Object} auditResults Audit results from auditSubsystem or auditEcosystem
   * @param {Object} [options] Custom certificate metadata options
   * @returns {Object} Cryptographically signed Non-Duplication Compliance Certificate
   */
  generateNonDuplicationCertificate(auditResults = null, options = {}) {
    if (!auditResults) {
      auditResults = this.auditSubsystem();
    }

    const certificateId = options.certificateId || `CERT-ND-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    const issuedAt = new Date().toISOString();
    const validUntil = options.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const payloadToSign = {
      certificateId,
      productId: options.productId || auditResults.subsystemId || 'eaorcs',
      productName: options.productName || auditResults.subsystemName || 'EAORCS Enterprise System',
      issuer: 'Ujomor Systems Engineering & Governance Authority',
      organization: 'Ujomor Systems & Enterprise Governance',
      issuedAt,
      validUntil,
      nonDuplicationScore: auditResults.nonDuplicationScore,
      reuseComplianceIndex: auditResults.reuseComplianceIndex,
      complianceStatus: auditResults.complianceStatus,
      totalDomainsEvaluated: auditResults.totalDomainsEvaluated || 8,
      compliantDomainsCount: auditResults.compliantDomainsCount,
      prohibitedDuplicationsCount: auditResults.prohibitedDuplicationsCount || 0,
      domainsCovered: Object.keys(PLATFORM_DOMAINS),
      governanceStandard: 'UAIGOS-PEP-STREAM-D'
    };

    const canonicalPayloadJson = JSON.stringify(payloadToSign);
    const certificateHash = crypto.createHash('sha256').update(canonicalPayloadJson).digest('hex');
    const signature = crypto.createHmac('sha256', this.signingSecret).update(certificateHash).digest('hex');

    const certificate = {
      certificate: payloadToSign,
      evidenceSummary: {
        prohibitedDuplications: auditResults.prohibitedDuplications || [],
        domainResults: auditResults.domainResults || {}
      },
      verification: {
        hashAlgorithm: 'SHA256',
        signatureAlgorithm: 'HMAC-SHA256',
        certificateHash,
        signature
      }
    };

    return certificate;
  }

  /**
   * Verifies the integrity and authenticity of a Non-Duplication Compliance Certificate.
   * @param {Object} certificate Certificate object to verify
   * @param {string} [signingSecret] Secret key for verification (defaults to instance secret)
   * @returns {Object} Verification result object
   */
  verifyCertificate(certificate, signingSecret = null) {
    if (!certificate || !certificate.certificate || !certificate.verification) {
      return { valid: false, reason: 'Invalid certificate format: Missing certificate or verification fields' };
    }

    const secret = signingSecret || this.signingSecret;
    const canonicalPayloadJson = JSON.stringify(certificate.certificate);
    const expectedHash = crypto.createHash('sha256').update(canonicalPayloadJson).digest('hex');

    if (expectedHash !== certificate.verification.certificateHash) {
      return { valid: false, reason: 'Certificate payload hash mismatch — content may have been tampered with' };
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(expectedHash).digest('hex');
    if (expectedSignature !== certificate.verification.signature) {
      return { valid: false, reason: 'Invalid cryptographic signature — issuer secret mismatch' };
    }

    return {
      valid: true,
      certificateId: certificate.certificate.certificateId,
      productId: certificate.certificate.productId,
      issuer: certificate.certificate.issuer,
      nonDuplicationScore: certificate.certificate.nonDuplicationScore,
      complianceStatus: certificate.certificate.complianceStatus,
      verifiedAt: new Date().toISOString()
    };
  }

  /**
   * Formats a human-readable Markdown Ecosystem Audit Report.
   * @param {Object} auditResults Audit results from auditSubsystem
   * @returns {string} Formatted Markdown audit report
   */
  generateAuditReport(auditResults) {
    const res = auditResults || this.auditSubsystem();

    let report = `# Ecosystem Non-Duplication Audit Report\n\n`;
    report += `**Subsystem ID:** ${res.subsystemId}\n`;
    report += `**Subsystem Name:** ${res.subsystemName}\n`;
    report += `**Audited At:** ${res.auditedAt}\n`;
    report += `**Governance Standard:** ${res.governanceFramework}\n`;
    report += `**Non-Duplication Score:** ${res.nonDuplicationScore}/100\n`;
    report += `**Reuse Compliance Index:** ${res.reuseComplianceIndex}\n`;
    report += `**Compliance Status:** ${res.complianceStatus}\n\n`;

    report += `## 8 Air Roofers Platform Domains Audit\n\n`;
    report += `| Domain | Standard Platform Service | Endpoint | Reuse Status | Score |\n`;
    report += `|---|---|---|---|---|\n`;

    for (const key of Object.keys(res.domainResults)) {
      const d = res.domainResults[key];
      const statusIcon = d.reuseScore === 100 ? '✅ REUSED' : (d.reuseScore > 0 ? '⚠️ PARTIAL' : '❌ DUPLICATED');
      report += `| ${d.domainName} | ${d.standardService} | ${d.contractEndpoint} | ${statusIcon} | ${d.reuseScore}% |\n`;
    }

    if (res.prohibitedDuplicationsCount > 0) {
      report += `\n## Prohibited Duplications & Refactoring Actions\n\n`;
      for (const p of res.prohibitedDuplications) {
        report += `- **${p.domainName}**: ${p.prohibitedPattern}\n  *Recommendation:* ${p.recommendation}\n`;
      }
    } else {
      report += `\n## Prohibited Duplications\n\nNo prohibited service duplications detected across all 8 platform domains.\n`;
    }

    return report;
  }
}

module.exports = EcosystemNonDuplicationAudit;
