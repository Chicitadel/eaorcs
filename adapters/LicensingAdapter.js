/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Platform Adapter Layer / Licensing Adapter
 * File           : LicensingAdapter.js
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

const BaseAdapter = require('./BaseAdapter');

let coreSdk = null;
try {
  coreSdk = require('@airroofers/core-sdk');
} catch (e) {
  coreSdk = null;
}

class LicensingAdapter extends BaseAdapter {
  constructor(endpoint = 'https://licensing.airroofers.eu/api/v1', offlineMode = false, options = {}) {
    super('licensing', endpoint, offlineMode);
    this.headers = { 'X-Correlation-ID': options.correlationId || null };
    if (coreSdk && coreSdk.LicensingClient && !offlineMode) {
      this.sdkClient = new coreSdk.LicensingClient({ endpoint });
    }
  }

  async verifyLicenseKey(licenseKey) {
    if (!this.offlineMode && this.sdkClient && typeof this.sdkClient.verifyKey === 'function') {
      try {
        return await this.sdkClient.verifyKey(licenseKey);
      } catch (err) {
        this.log(`Remote license verification failed, falling back to local evaluation: ${err.message}`, 'warn');
      }
    }

    if (!licenseKey || licenseKey === 'COMMUNITY-FREE') {
      return {
        valid: true,
        edition: 'Community',
        maxNodes: 10,
        features: ['basic_audit', 'osap_passport', 'local_cli']
      };
    }

    if (licenseKey.startsWith('EAORCS-ENT-')) {
      return {
        valid: true,
        edition: 'Enterprise',
        maxNodes: 10000,
        features: ['full_audit', 'trust_graph', 'digital_twin', 'ai_council', 'multi_host']
      };
    }

    return {
      valid: true,
      edition: 'Professional',
      maxNodes: 100,
      features: ['full_audit', 'trust_graph', 'osap_passport']
    };
  }
}

module.exports = LicensingAdapter;
