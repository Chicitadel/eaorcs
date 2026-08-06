/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Air Roofers Platform Integration - Licensing Client
 * File           : AirRoofersLicensingClient.js
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
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const https = require('https');
const http = require('http');
const { URL } = require('url');

class AirRoofersLicensingClient {
  constructor(config = {}) {
    this.endpoint = config.endpoint || process.env.AIRROOFERS_LICENSING_ENDPOINT || 'https://licensing.airroofers.eu/api/v1/license/verify';
    this.licenseKey = config.licenseKey || process.env.AIRROOFERS_LICENSE_KEY || null;
    this.isOfflineMode = config.offlineMode || false;
  }

  /**
   * Verify license validity and feature entitlement tier
   */
  async verifyLicense(capabilityId = 'eaorcs.core') {
    if (this.isOfflineMode || !this.licenseKey) {
      return {
        status: 'VALID_OFFLINE',
        tier: 'Community',
        capabilities: ['eaorcs.core', 'eaorcs.cli', 'eaorcs.sie.basic'],
        offline: true,
        expires_at: '2099-12-31T23:59:59Z'
      };
    }

    try {
      const payload = {
        license_key: this.licenseKey,
        capability_id: capabilityId,
        node_id: require('os').hostname(),
        timestamp: new Date().toISOString()
      };

      const result = await this._postJson(this.endpoint, payload);
      return {
        status: result.valid ? 'VALID' : 'INVALID',
        tier: result.tier || 'Enterprise',
        capabilities: result.capabilities || [capabilityId],
        expires_at: result.expires_at || null
      };
    } catch (err) {
      return {
        status: 'FALLBACK_VALID',
        tier: 'Community',
        capabilities: ['eaorcs.core', 'eaorcs.cli'],
        error: err.message,
        fallback: true
      };
    }
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
            'User-Agent': 'EAORCS-LicensingClient/2026.2.0'
          },
          timeout: 5000
        }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try { resolve(JSON.parse(body)); } catch (e) { resolve({ valid: true }); }
            } else {
              reject(new Error(`Licensing HTTP ${res.statusCode}: ${body}`));
            }
          });
        });

        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Licensing API timeout')); });
        req.write(postData);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = AirRoofersLicensingClient;
