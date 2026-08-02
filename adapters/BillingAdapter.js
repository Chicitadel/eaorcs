/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Platform Adapter Layer / Billing Adapter
 * File           : BillingAdapter.js
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

class BillingAdapter extends BaseAdapter {
  constructor(endpoint = 'https://billing.airroofers.eu/api/v1', offlineMode = false, options = {}) {
    super('billing', endpoint, offlineMode);
    this.headers = { 'X-Correlation-ID': options.correlationId || null };
    this.meteredUsage = [];
    if (coreSdk && coreSdk.BillingClient && !offlineMode) {
      this.sdkClient = new coreSdk.BillingClient({ endpoint });
    }
  }

  async recordMeteredEvent(tenantId, metric, value = 1) {
    const event = {
      tenantId,
      metric,
      value,
      timestamp: new Date().toISOString()
    };
    this.meteredUsage.push(event);

    if (this.offlineMode || !this.sdkClient) {
      this.log(`Queued billing event locally: ${metric}=${value}`);
      return { status: 'queued_local', event };
    }

    try {
      if (typeof this.sdkClient.recordEvent === 'function') {
        await this.sdkClient.recordEvent(event);
      }
      this.log(`Reported metered event to ${this.endpoint}: ${metric}=${value}`);
      return { status: 'synced', event };
    } catch (err) {
      this.log(`Billing sync failed, fallback to local: ${err.message}`, 'warn');
      return { status: 'queued_local', event };
    }
  }

  async getUsageReport(tenantId) {
    return this.meteredUsage.filter(e => e.tenantId === tenantId);
  }
}

module.exports = BillingAdapter;
