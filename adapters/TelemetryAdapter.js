/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Platform Adapter Layer / Telemetry Adapter
 * File           : TelemetryAdapter.js
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

class TelemetryAdapter extends BaseAdapter {
  constructor(endpoint = 'https://telemetry.airroofers.eu/api/v1', offlineMode = false, options = {}) {
    super('telemetry', endpoint, offlineMode);
    this.headers = { 'X-Telemetry-Key': options.telemetryKey || null };
    if (coreSdk && coreSdk.TelemetryClient && !offlineMode) {
      this.sdkClient = new coreSdk.TelemetryClient({ endpoint });
    }
  }

  async sendAuditMetrics(metrics) {
    const payload = {
      timestamp: new Date().toISOString(),
      edition: metrics.edition || 'Enterprise',
      score: metrics.trustScore || 100,
      nodesAudited: metrics.nodesAudited || 0,
      violations: metrics.violations || 0
    };

    if (this.offlineMode || !this.sdkClient) {
      this.log('Telemetry payload recorded offline (no remote transmission)');
      return { status: 'recorded_offline', payload };
    }

    try {
      if (typeof this.sdkClient.sendMetrics === 'function') {
        await this.sdkClient.sendMetrics(payload);
      }
      this.log(`Transmitting telemetry metrics to ${this.endpoint}`);
      return { status: 'sent', payload };
    } catch (err) {
      this.log(`Telemetry transmission failed: ${err.message}`, 'warn');
      return { status: 'recorded_offline', payload };
    }
  }
}

module.exports = TelemetryAdapter;
