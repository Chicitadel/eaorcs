/******************************************************************************
 * Project        : Universal Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : EAORCS Commercial Packaging & Licensing Engine
 * File           : CommercialPackagingEngine.js
 * Version        : 2026.2.0-LTS
 * Author         : Enterprise Commercialization & Licensing Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
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
 * - SOC 2 Type II
 * - OWASP ASVS v4.0
 * - NIST SP 800-53
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Commercialization Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * 4 Commercial Editions Enum & Metadata Definition
 */
const COMMERCIAL_EDITIONS = Object.freeze({
  COMMUNITY: {
    id: 'COMMUNITY',
    name: 'Community',
    tier: 1,
    description: 'Base capabilities for open-source evaluation and small teams.',
    allowedDeployments: ['SELF_HOSTED', 'DOCKER_COMPOSE'],
    defaultLicensingModel: 'FEATURE_LICENSING',
    seatLimit: 5,
    apiMonthlyQuota: 10000,
    features: [
      'core_engine',
      'basic_auditing',
      'local_dashboard',
      'community_support'
    ]
  },
  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    name: 'Professional',
    tier: 2,
    description: 'Enhanced operational controls for growing engineering organizations.',
    allowedDeployments: ['SAAS', 'SELF_HOSTED', 'DOCKER_COMPOSE'],
    defaultLicensingModel: 'SEAT_LICENSING',
    seatLimit: 50,
    apiMonthlyQuota: 500000,
    features: [
      'core_engine',
      'basic_auditing',
      'local_dashboard',
      'advanced_analytics',
      'connector_pack',
      'custom_workflows',
      'api_access',
      'standard_support'
    ]
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    tier: 3,
    description: 'Full-scale governance, high availability, and multi-tenant capabilities for enterprises.',
    allowedDeployments: ['SAAS', 'SELF_HOSTED', 'KUBERNETES', 'CLOUD_MARKETPLACE'],
    defaultLicensingModel: 'USAGE_LICENSING',
    seatLimit: 1000,
    apiMonthlyQuota: 10000000,
    features: [
      'core_engine',
      'basic_auditing',
      'local_dashboard',
      'advanced_analytics',
      'connector_pack',
      'custom_workflows',
      'api_access',
      'sso_saml',
      'multi_tenant',
      'ai_council',
      'custom_compliance_packs',
      'sla_guarantee',
      'dedicated_support'
    ]
  },
  GOVERNMENT_SOVEREIGN: {
    id: 'GOVERNMENT_SOVEREIGN',
    name: 'Government Sovereign',
    tier: 4,
    description: 'Maximum security, air-gapped isolation, zero-trust attestation, and sovereign compliance.',
    allowedDeployments: ['AIR_GAPPED', 'SELF_HOSTED', 'KUBERNETES'],
    defaultLicensingModel: 'OEM_LICENSING',
    seatLimit: 5000,
    apiMonthlyQuota: 50000000,
    features: [
      'core_engine',
      'basic_auditing',
      'local_dashboard',
      'advanced_analytics',
      'connector_pack',
      'custom_workflows',
      'api_access',
      'sso_saml',
      'multi_tenant',
      'ai_council',
      'custom_compliance_packs',
      'airgap_vault',
      'fips_crypto',
      'sovereign_audit_ledger',
      'custom_jurisdiction_policies',
      'zero_trust_attestation',
      '24_7_sovereign_support'
    ]
  }
});

/**
 * 6 Deployment Targets Enum & Metadata Definition
 */
const DEPLOYMENT_TARGETS = Object.freeze({
  SAAS: {
    id: 'SAAS',
    name: 'SaaS',
    description: 'Fully managed cloud-native SaaS environment.'
  },
  SELF_HOSTED: {
    id: 'SELF_HOSTED',
    name: 'Self-hosted',
    description: 'On-premises or private cloud customer-managed installation.'
  },
  AIR_GAPPED: {
    id: 'AIR_GAPPED',
    name: 'Air-gapped',
    description: 'Isolated network environment without internet connectivity.'
  },
  KUBERNETES: {
    id: 'KUBERNETES',
    name: 'Kubernetes',
    description: 'Cloud-native Kubernetes cluster deployment via Helm / Operator.'
  },
  DOCKER_COMPOSE: {
    id: 'DOCKER_COMPOSE',
    name: 'Docker Compose',
    description: 'Lightweight container composition for local/on-prem environments.'
  },
  CLOUD_MARKETPLACE: {
    id: 'CLOUD_MARKETPLACE',
    name: 'Cloud Marketplace',
    description: 'AWS / Azure / GCP Cloud Marketplace AMI / App image.'
  }
});

/**
 * 5 Licensing Models Enum & Metadata Definition
 */
const LICENSING_MODELS = Object.freeze({
  FEATURE_LICENSING: {
    id: 'FEATURE_LICENSING',
    name: 'Feature licensing',
    description: 'Access controlled by enabled module and feature flags.'
  },
  SEAT_LICENSING: {
    id: 'SEAT_LICENSING',
    name: 'Seat licensing',
    description: 'Pricing and access controlled by named user accounts / active seats.'
  },
  USAGE_LICENSING: {
    id: 'USAGE_LICENSING',
    name: 'Usage licensing',
    description: 'Consumption-based pricing based on transactions or compute units.'
  },
  API_LICENSING: {
    id: 'API_LICENSING',
    name: 'API licensing',
    description: 'Tiered access based on API request rate limits and monthly call volume.'
  },
  OEM_LICENSING: {
    id: 'OEM_LICENSING',
    name: 'OEM licensing',
    description: 'Embedded platform licensing for OEM partners and white-label distributions.'
  }
});

class CommercialPackagingEngine {
  constructor(options = {}) {
    this.secretKey = options.secretKey || 'EAORCS-GOVERNANCE-SECRET-KEY-2026';
    this.usageLedger = new Map();
    this.activeLicenses = new Map();
  }

  /**
   * Returns list of all 4 commercial editions
   */
  getCommercialEditions() {
    return Object.values(COMMERCIAL_EDITIONS);
  }

  /**
   * Returns details for a given edition key/id
   */
  getEditionDetails(editionId) {
    if (!editionId) return null;
    const normalizedKey = String(editionId).toUpperCase().replace(/\s+/g, '_');
    return COMMERCIAL_EDITIONS[normalizedKey] || null;
  }

  /**
   * Returns list of all 6 deployment targets
   */
  getDeploymentTargets() {
    return Object.values(DEPLOYMENT_TARGETS);
  }

  /**
   * Returns list of all 5 licensing models
   */
  getLicensingModels() {
    return Object.values(LICENSING_MODELS);
  }

  /**
   * Cryptographic License Key Generator
   * Generates cryptographically signed license keys containing entitlement metadata
   */
  generateLicenseKey(params = {}, secretKeyOverride = null) { // domain-authority-allowed
    const keySecret = secretKeyOverride || this.secretKey;
    const rawEdition = String(params.edition || 'ENTERPRISE').toUpperCase().replace(/\s+/g, '_');
    const editionMeta = COMMERCIAL_EDITIONS[rawEdition] || COMMERCIAL_EDITIONS.ENTERPRISE;

    const customer = params.customer || params.tenantId || 'DEFAULT_CUSTOMER';
    const tenantId = params.tenantId || params.customer || 'DEFAULT_TENANT';
    const seats = params.seats !== undefined ? Number(params.seats) : editionMeta.seatLimit;
    const deploymentTarget = String(params.deploymentTarget || editionMeta.allowedDeployments[0]).toUpperCase().replace(/\s+/g, '_');
    const licensingModel = String(params.licensingModel || editionMeta.defaultLicensingModel).toUpperCase().replace(/\s+/g, '_');

    const durationDays = params.durationDays || 365;
    const issuedAt = params.issuedAt || new Date().toISOString();
    const expiresAt = params.expiresAt || new Date(Date.now() + durationDays * 86400000).toISOString();

    const licenseId = 'LIC-' + crypto.randomBytes(8).toString('hex').toUpperCase();

    const payload = {
      licenseId,
      edition: editionMeta.id,
      editionName: editionMeta.name,
      customer,
      tenantId,
      seats,
      deploymentTarget,
      licensingModel,
      features: params.features || editionMeta.features,
      apiMonthlyQuota: params.apiMonthlyQuota || editionMeta.apiMonthlyQuota,
      issuedAt,
      expiresAt,
      nonce: crypto.randomBytes(4).toString('hex')
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', keySecret).update(encodedPayload).digest('hex');

    const licenseKey = `EAORCS-V1.${encodedPayload}.${signature}`;

    const licenseRecord = {
      licenseId,
      licenseKey,
      payload,
      signature,
      issuedAt,
      expiresAt,
      valid: true
    };

    this.activeLicenses.set(licenseId, licenseRecord);
    this.activeLicenses.set(licenseKey, licenseRecord);

    return licenseRecord;
  }

  /**
   * License Key Verifier
   * Verifies cryptographic signature, structural integrity, and expiration
   */
  verifyLicenseKey(licenseKeyInput, secretKeyOverride = null) {
    if (!licenseKeyInput) {
      return { valid: false, reason: 'License key input is empty or null.' };
    }

    const keySecret = secretKeyOverride || this.secretKey;
    let licenseKeyStr = typeof licenseKeyInput === 'object' ? licenseKeyInput.licenseKey : String(licenseKeyInput);

    // Direct registry cache check
    if (this.activeLicenses.has(licenseKeyStr)) {
      const cached = this.activeLicenses.get(licenseKeyStr);
      const isExpired = new Date(cached.expiresAt).getTime() < Date.now();
      if (isExpired) {
        return { valid: false, payload: cached.payload, reason: 'License has expired.' };
      }
      return {
        valid: true,
        licenseId: cached.licenseId,
        payload: cached.payload,
        edition: cached.payload.edition,
        customer: cached.payload.customer,
        seats: cached.payload.seats,
        expiresAt: cached.expiresAt,
        reason: null
      };
    }

    // Token parsing
    const parts = licenseKeyStr.split('.');
    if (parts.length !== 3 || parts[0] !== 'EAORCS-V1') {
      return { valid: false, reason: 'Invalid license key format or signature header.' };
    }

    const [header, encodedPayload, providedSignature] = parts;
    const expectedSignature = crypto.createHmac('sha256', keySecret).update(encodedPayload).digest('hex');

    if (providedSignature !== expectedSignature) {
      return { valid: false, reason: 'Cryptographic signature verification failed (tampered key).' };
    }

    try {
      const payloadStr = Buffer.from(encodedPayload, 'base64url').toString('utf8');
      const payload = JSON.parse(payloadStr);

      const isExpired = new Date(payload.expiresAt).getTime() < Date.now();
      if (isExpired) {
        return { valid: false, payload, reason: 'License key has expired.' };
      }

      return {
        valid: true,
        licenseId: payload.licenseId,
        payload,
        edition: payload.edition,
        customer: payload.customer,
        seats: payload.seats,
        expiresAt: payload.expiresAt,
        reason: null
      };
    } catch (err) {
      return { valid: false, reason: `Failed to parse license key payload: ${err.message}` };
    }
  }

  /**
   * Feature Entitlement Evaluator
   * Evaluates if a given feature is enabled for an active license / edition
   */
  evaluateEntitlement(licenseOrEdition, featureKey) {
    if (!featureKey) {
      return { allowed: false, reason: 'Feature key not specified.' };
    }

    let activeFeatures = [];
    let editionName = 'UNKNOWN';

    if (typeof licenseOrEdition === 'string') {
      const verifyRes = this.verifyLicenseKey(licenseOrEdition);
      if (verifyRes.valid && verifyRes.payload) {
        activeFeatures = verifyRes.payload.features || [];
        editionName = verifyRes.payload.edition;
      } else {
        const editionMeta = this.getEditionDetails(licenseOrEdition);
        if (editionMeta) {
          activeFeatures = editionMeta.features;
          editionName = editionMeta.id;
        }
      }
    } else if (typeof licenseOrEdition === 'object' && licenseOrEdition !== null) {
      const payload = licenseOrEdition.payload || licenseOrEdition;
      activeFeatures = payload.features || [];
      editionName = payload.edition || 'CUSTOM';
    }

    const hasFeature = activeFeatures.includes(featureKey);
    return {
      allowed: hasFeature,
      feature: featureKey,
      edition: editionName,
      reason: hasFeature ? 'Feature entitled under active license.' : `Feature '${featureKey}' not granted for edition '${editionName}'.`
    };
  }

  /**
   * Usage Metering Governor: Record Consumption
   */
  recordUsage(tenantId, metricName = 'api_calls', amount = 1) {
    if (!tenantId) throw new Error('tenantId is required for usage metering.');
    const tenantKey = String(tenantId);
    if (!this.usageLedger.has(tenantKey)) {
      this.usageLedger.set(tenantKey, {
        tenantId: tenantKey,
        metrics: {},
        updatedAt: new Date().toISOString()
      });
    }

    const tenantRecord = this.usageLedger.get(tenantKey);
    tenantRecord.metrics[metricName] = (tenantRecord.metrics[metricName] || 0) + Number(amount);
    tenantRecord.updatedAt = new Date().toISOString();
    return tenantRecord;
  }

  /**
   * Usage Metering Governor: Check Quota
   */
  checkQuota(tenantId, metricName = 'api_calls', maxQuota = 10000) {
    const tenantKey = String(tenantId);
    const tenantRecord = this.usageLedger.get(tenantKey);
    const currentUsage = tenantRecord && tenantRecord.metrics[metricName] ? tenantRecord.metrics[metricName] : 0;
    const remaining = Math.max(0, maxQuota - currentUsage);
    const allowed = currentUsage < maxQuota;

    return {
      allowed,
      tenantId: tenantKey,
      metricName,
      currentUsage,
      maxQuota,
      remaining,
      reason: allowed ? 'Usage within permitted quota.' : `Quota exceeded for metric '${metricName}'.`
    };
  }

  /**
   * Usage Metering Governor: Get Metered Usage
   */
  getMeteredUsage(tenantId) {
    const tenantKey = String(tenantId);
    return this.usageLedger.get(tenantKey) || { tenantId: tenantKey, metrics: {}, updatedAt: new Date().toISOString() };
  }

  /**
   * Usage Metering Governor: Reset Meter
   */
  resetMeter(tenantId, metricName = null) {
    const tenantKey = String(tenantId);
    if (this.usageLedger.has(tenantKey)) {
      const record = this.usageLedger.get(tenantKey);
      if (metricName) {
        delete record.metrics[metricName];
      } else {
        record.metrics = {};
      }
      record.updatedAt = new Date().toISOString();
    }
    return { success: true, tenantId: tenantKey };
  }
}

module.exports = CommercialPackagingEngine;
