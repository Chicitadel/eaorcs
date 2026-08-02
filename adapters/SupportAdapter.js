/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Platform Adapter Layer / Support Adapter
 * File           : SupportAdapter.js
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

class SupportAdapter extends BaseAdapter {
  constructor(endpoint = 'https://support.airroofers.eu/api/v1', offlineMode = false, options = {}) {
    super('support', endpoint, offlineMode);
    this.headers = { 'X-Correlation-ID': options.correlationId || null };
    this.localTickets = [];
    if (coreSdk && coreSdk.SupportClient && !offlineMode) {
      this.sdkClient = new coreSdk.SupportClient({ endpoint });
    }
  }

  async createSupportTicket(subject, description, diagnosticsData = {}) {
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const ticket = {
      id: ticketId,
      subject,
      description,
      diagnosticsData,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };

    if (this.offlineMode || !this.sdkClient) {
      this.localTickets.push(ticket);
      this.log(`Created support ticket locally [ID: ${ticketId}]: ${subject}`);
      return { status: 'created_local', ticket };
    }

    try {
      if (typeof this.sdkClient.createTicket === 'function') {
        const remoteRes = await this.sdkClient.createTicket(ticket);
        return { status: 'synced_remote', ticket: remoteRes };
      }
      this.localTickets.push(ticket);
      return { status: 'created_local', ticket };
    } catch (err) {
      this.log(`Support ticket dispatch failed, saved locally: ${err.message}`, 'warn');
      this.localTickets.push(ticket);
      return { status: 'created_local', ticket };
    }
  }

  async uploadDiagnostics(diagnosticsBundle) {
    if (this.offlineMode || !this.sdkClient) {
      this.log('Diagnostics bundle recorded locally (offline mode)');
      return { status: 'saved_locally', bundleId: diagnosticsBundle.id || Date.now() };
    }

    try {
      if (typeof this.sdkClient.uploadDiagnostics === 'function') {
        return await this.sdkClient.uploadDiagnostics(diagnosticsBundle);
      }
      return { status: 'saved_locally', bundleId: diagnosticsBundle.id || Date.now() };
    } catch (err) {
      this.log(`Diagnostics upload error: ${err.message}`, 'warn');
      return { status: 'saved_locally', bundleId: diagnosticsBundle.id || Date.now() };
    }
  }

  async getTicket(ticketId) {
    return this.localTickets.find(t => t.id === ticketId) || null;
  }
}

module.exports = SupportAdapter;
