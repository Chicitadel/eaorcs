/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Air Roofers Platform Integration - Support Client
 * File           : AirRoofersSupportClient.js
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

class AirRoofersSupportClient {
  constructor(config = {}) {
    this.endpoint = config.endpoint || process.env.AIRROOFERS_SUPPORT_ENDPOINT || 'https://support.airroofers.eu/api/v1/tickets';
    this.apiKey = config.apiKey || process.env.AIRROOFERS_SUPPORT_KEY || null;
    this.isOfflineMode = config.offlineMode || false;
    this.localTickets = [];
  }

  /**
   * Register error event or diagnostic ticket with support platform
   */
  async createTicket(subject, description, severity = 'MEDIUM', diagnostics = {}) {
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const payload = {
      ticket_id: ticketId,
      subject: subject,
      description: description,
      severity: severity,
      diagnostics: {
        system: 'EAORCS',
        node: require('os').hostname(),
        timestamp: new Date().toISOString(),
        ...diagnostics
      }
    };

    if (this.isOfflineMode || !this.apiKey) {
      this.localTickets.push(payload);
      return {
        status: 'CREATED_OFFLINE',
        ticket_id: ticketId,
        subject: subject,
        local_store_count: this.localTickets.length
      };
    }

    try {
      const result = await this._postJson(this.endpoint, payload);
      return {
        status: 'SUBMITTED',
        ticket_id: result.ticket_id || ticketId,
        subject: subject
      };
    } catch (err) {
      this.localTickets.push(payload);
      return {
        status: 'FALLBACK_LOCAL',
        ticket_id: ticketId,
        error: err.message
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
            'X-Support-Key': this.apiKey || '',
            'User-Agent': 'EAORCS-SupportClient/2026.2.0'
          },
          timeout: 5000
        }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try { resolve(JSON.parse(body)); } catch (e) { resolve({ status: 'OK' }); }
            } else {
              reject(new Error(`Support HTTP ${res.statusCode}: ${body}`));
            }
          });
        });

        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Support API timeout')); });
        req.write(postData);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = AirRoofersSupportClient;
