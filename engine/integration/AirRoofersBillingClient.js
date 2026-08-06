/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Air Roofers Platform Integration - Billing Client
 * File           : AirRoofersBillingClient.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Architectural Governance Council & Platform Engineering
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved & RATIFIED
 * - UAIGOS 3.0.0 & DPA/PDA v1.1.0-FROZEN Compliant
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161 / SLSA Level 4 Enforced
 *
 * Standards:
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161
 *
 * Signatures:
 * - Architectural Governance Council
 * - Security Authority
 * - Governance Authority
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const https = require('https');
const http = require('http');
const { URL } = require('url');

class AirRoofersBillingClient {
  constructor(config = {}) {
    this.endpoint = config.endpoint || process.env.AIRROOFERS_BILLING_ENDPOINT || 'https://billing.airroofers.eu/api/v1/meter';
    this.apiKey = config.apiKey || process.env.AIRROOFERS_BILLING_KEY || null;
    this.tenantId = config.tenantId || process.env.AIRROOFERS_TENANT_ID || 'default-tenant';
    this.offlineQueue = [];
    this.isOfflineMode = config.offlineMode || false;
  }

  /**
   * Report metered execution usage to billing platform
   */
  async reportUsage(metricType, value, metadata = {}) {
    const payload = {
      tenant_id: this.tenantId,
      metric_type: metricType,
      quantity: value,
      timestamp: new Date().toISOString(),
      metadata: {
        system: 'EAORCS',
        version: '2026.2-LTS',
        ...metadata
      }
    };

    if (this.isOfflineMode || !this.apiKey) {
      this.offlineQueue.push(payload);
      return {
        status: 'QUEUED_OFFLINE',
        metric_type: metricType,
        quantity: value,
        queued_count: this.offlineQueue.length
      };
    }

    try {
      const result = await this._postJson(this.endpoint, payload);
      return {
        status: 'REPORTED',
        transaction_id: result.transaction_id || `tx_${Date.now()}`,
        metric_type: metricType,
        quantity: value
      };
    } catch (err) {
      this.offlineQueue.push(payload);
      return {
        status: 'FALLBACK_QUEUED',
        error: err.message,
        queued_count: this.offlineQueue.length
      };
    }
  }

  /**
   * Flush queued offline usage metrics
   */
  async flushQueue() {
    if (this.offlineQueue.length === 0) return { flushed: 0, remaining: 0 };
    const itemsToFlush = [...this.offlineQueue];
    this.offlineQueue = [];
    let successCount = 0;

    for (const item of itemsToFlush) {
      try {
        await this._postJson(this.endpoint, item);
        successCount++;
      } catch (err) {
        this.offlineQueue.push(item);
      }
    }

    return { flushed: successCount, remaining: this.offlineQueue.length };
  }

  _postJson(targetUrl, data) {
    return new Promise((resolve, reject) => {
      try {
        const u = new URL(targetUrl);
        const protocol = u.protocol === 'https:' ? https : http;
        const postData = JSON.stringify(data);

        const req = protocol.request(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'X-Billing-Key': this.apiKey || '',
            'User-Agent': 'EAORCS-BillingClient/2026.2.0'
          },
          timeout: 5000
        }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try { resolve(JSON.parse(body)); } catch (e) { resolve({ status: 'OK' }); }
            } else {
              reject(new Error(`Billing HTTP ${res.statusCode}: ${body}`));
            }
          });
        });

        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Billing API timeout')); });
        req.write(postData);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = AirRoofersBillingClient;
