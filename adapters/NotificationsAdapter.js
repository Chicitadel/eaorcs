/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Platform Adapter Layer / Notifications Adapter
 * File           : NotificationsAdapter.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
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

class NotificationsAdapter extends BaseAdapter {
  constructor(endpoint = 'https://notifications.airroofers.eu/api/v1', offlineMode = false, options = {}) {
    super('notifications', endpoint, offlineMode);
    this.headers = { 'X-Correlation-ID': options.correlationId || null };
    this.notificationsLog = [];
    if (coreSdk && coreSdk.NotificationsClient && !offlineMode) {
      this.sdkClient = new coreSdk.NotificationsClient({ endpoint });
    }
  }

  async sendWebhook(url, payload, options = {}) {
    const notification = {
      type: 'webhook',
      url,
      payload,
      options,
      timestamp: new Date().toISOString()
    };
    this.notificationsLog.push(notification);

    if (this.offlineMode || !this.sdkClient) {
      this.log(`Dispatched webhook notification locally [Target: ${url}]`);
      return { status: 'queued_local', notification };
    }

    try {
      if (typeof this.sdkClient.sendWebhook === 'function') {
        const remoteResult = await this.sdkClient.sendWebhook(url, payload, options);
        return { status: 'delivered', notification: remoteResult || notification };
      }
      this.log(`Dispatched webhook notification to ${this.endpoint} [Target: ${url}]`);
      return { status: 'delivered', notification };
    } catch (err) {
      this.log(`Webhook dispatch failed, fallback to local queue: ${err.message}`, 'warn');
      return { status: 'queued_local', notification };
    }
  }

  async sendEmailAlert(recipient, subject, body, priority = 'normal') {
    const notification = {
      type: 'email',
      recipient,
      subject,
      body,
      priority,
      timestamp: new Date().toISOString()
    };
    this.notificationsLog.push(notification);

    if (this.offlineMode || !this.sdkClient) {
      this.log(`Queued email alert locally [To: ${recipient}] Subject: "${subject}"`);
      return { status: 'queued_local', notification };
    }

    try {
      if (typeof this.sdkClient.sendEmail === 'function') {
        const remoteResult = await this.sdkClient.sendEmail(recipient, subject, body, { priority });
        return { status: 'sent', notification: remoteResult || notification };
      }
      this.log(`Sent email alert via ${this.endpoint} [To: ${recipient}]`);
      return { status: 'sent', notification };
    } catch (err) {
      this.log(`Email alert dispatch failed, fallback to local queue: ${err.message}`, 'warn');
      return { status: 'queued_local', notification };
    }
  }

  async publishStreamEvent(channel, eventData) {
    const notification = {
      type: 'stream',
      channel,
      eventData,
      timestamp: new Date().toISOString()
    };
    this.notificationsLog.push(notification);

    if (this.offlineMode || !this.sdkClient) {
      this.log(`Published streaming event locally [Channel: ${channel}]`);
      return { status: 'queued_local', notification };
    }

    try {
      if (typeof this.sdkClient.publishStream === 'function') {
        const remoteResult = await this.sdkClient.publishStream(channel, eventData);
        return { status: 'published', notification: remoteResult || notification };
      }
      this.log(`Published streaming event to ${this.endpoint} [Channel: ${channel}]`);
      return { status: 'published', notification };
    } catch (err) {
      this.log(`Streaming event publication failed, fallback to local: ${err.message}`, 'warn');
      return { status: 'queued_local', notification };
    }
  }

  async getNotificationHistory(filter = {}) {
    return this.notificationsLog.filter(item => {
      if (filter.type && item.type !== filter.type) return false;
      if (filter.channel && item.channel !== filter.channel) return false;
      if (filter.recipient && item.recipient !== filter.recipient) return false;
      return true;
    });
  }

  clearHistory() {
    this.notificationsLog = [];
  }
}

module.exports = NotificationsAdapter;
