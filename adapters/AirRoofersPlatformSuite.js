/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Platform Adapter Layer / Platform Integration Suite
 * File           : AirRoofersPlatformSuite.js
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

const IdentityAdapter = require('./IdentityAdapter');
const BillingAdapter = require('./BillingAdapter');
const LicensingAdapter = require('./LicensingAdapter');
const StorageAdapter = require('./StorageAdapter');
const TelemetryAdapter = require('./TelemetryAdapter');
const SupportAdapter = require('./SupportAdapter');
const NotificationsAdapter = require('./NotificationsAdapter');
const SearchAdapter = require('./SearchAdapter');

class AirRoofersPlatformSuite {
  constructor(config = {}) {
    const offlineMode = config.offlineMode !== undefined ? config.offlineMode : false;
    const endpoints = config.endpoints || {};
    const adapterOptions = config.adapterOptions || {};

    this.offlineMode = offlineMode;

    this.identity = new IdentityAdapter(
      endpoints.identity || 'https://identity.airroofers.eu/api/v1',
      offlineMode,
      adapterOptions.identity
    );

    this.billing = new BillingAdapter(
      endpoints.billing || 'https://billing.airroofers.eu/api/v1',
      offlineMode,
      adapterOptions.billing
    );

    this.licensing = new LicensingAdapter(
      endpoints.licensing || 'https://licensing.airroofers.eu/api/v1',
      offlineMode,
      adapterOptions.licensing
    );

    this.storage = new StorageAdapter(
      endpoints.storage || 'https://storage.airroofers.eu/api/v1',
      offlineMode,
      adapterOptions.storage
    );

    this.telemetry = new TelemetryAdapter(
      endpoints.telemetry || 'https://telemetry.airroofers.eu/api/v1',
      offlineMode,
      adapterOptions.telemetry
    );

    this.support = new SupportAdapter(
      endpoints.support || 'https://support.airroofers.eu/api/v1',
      offlineMode,
      adapterOptions.support
    );

    this.notifications = new NotificationsAdapter(
      endpoints.notifications || 'https://notifications.airroofers.eu/api/v1',
      offlineMode,
      adapterOptions.notifications
    );

    this.search = new SearchAdapter(
      endpoints.search || 'https://search.airroofers.eu/api/v1',
      offlineMode,
      adapterOptions.search
    );
  }

  setOfflineMode(offline) {
    this.offlineMode = offline;
    this.identity.setOfflineMode(offline);
    this.billing.setOfflineMode(offline);
    this.licensing.setOfflineMode(offline);
    this.storage.setOfflineMode(offline);
    this.telemetry.setOfflineMode(offline);
    this.support.setOfflineMode(offline);
    this.notifications.setOfflineMode(offline);
    this.search.setOfflineMode(offline);
  }

  async checkHealth() {
    const results = {
      identity: await this.identity.isHealthy(),
      billing: await this.billing.isHealthy(),
      licensing: await this.licensing.isHealthy(),
      storage: await this.storage.isHealthy(),
      telemetry: await this.telemetry.isHealthy(),
      support: await this.support.isHealthy(),
      notifications: await this.notifications.isHealthy(),
      search: await this.search.isHealthy()
    };

    const healthyCount = Object.values(results).filter(Boolean).length;
    const overall = healthyCount === 8;

    return {
      overall,
      healthyCount,
      totalAdapters: 8,
      adapters: results
    };
  }

  getAdapters() {
    return {
      identity: this.identity,
      billing: this.billing,
      licensing: this.licensing,
      storage: this.storage,
      telemetry: this.telemetry,
      support: this.support,
      notifications: this.notifications,
      search: this.search
    };
  }

  async executeIntegrationSuiteTest() {
    const timestamp = new Date().toISOString();
    const adapterResults = {};

    try {
      // 1. Identity
      const authRes = await this.identity.authenticate('local-dev-token');
      const permsRes = await this.identity.getUserPermissions(authRes.user ? authRes.user.id : 'usr_local_admin');
      adapterResults.identity = { success: authRes.authenticated === true, permissionsCount: permsRes.length };

      // 2. Billing
      const billingRes = await this.billing.recordMeteredEvent('tenant_suite', 'audit_execution', 1);
      const usageRes = await this.billing.getUsageReport('tenant_suite');
      adapterResults.billing = { success: !!billingRes.status, usageEvents: usageRes.length };

      // 3. Licensing
      const licenseRes = await this.licensing.verifyLicenseKey('EAORCS-ENT-2026');
      adapterResults.licensing = { success: licenseRes.valid === true, edition: licenseRes.edition };

      // 4. Storage
      const writeRes = await this.storage.write('suite_test/probe.json', { probe: 'active', time: timestamp });
      const readRes = await this.storage.read('suite_test/probe.json');
      adapterResults.storage = { success: writeRes.status === 'written' && readRes && readRes.probe === 'active' };

      // 5. Telemetry
      const telemRes = await this.telemetry.sendAuditMetrics({ edition: 'Enterprise', trustScore: 100, nodesAudited: 42 });
      adapterResults.telemetry = { success: !!telemRes.status, score: telemRes.payload.score };

      // 6. Support
      const ticketRes = await this.support.createSupportTicket('Suite Integration Probe', 'Automated health verification');
      adapterResults.support = { success: !!ticketRes.status, ticketId: ticketRes.ticket ? ticketRes.ticket.id : null };

      // 7. Notifications
      const webhookRes = await this.notifications.sendWebhook('https://webhook.internal/test', { event: 'suite_init' });
      const emailRes = await this.notifications.sendEmailAlert('admin@ujomor.com', 'Suite Alert', 'Test email');
      const streamRes = await this.notifications.publishStreamEvent('suite_channel', { event: 'ping' });
      adapterResults.notifications = {
        success: !!webhookRes.status && !!emailRes.status && !!streamRes.status
      };

      // 8. Search
      const indexRes = await this.search.indexOsapPassport({ id: 'pass_suite_1', title: 'EAORCS Global Trust Passport', score: 100 });
      const searchRes = await this.search.globalSearch('EAORCS');
      adapterResults.search = { success: !!indexRes.status, matches: searchRes.length };

      const allSuccess = Object.values(adapterResults).every(r => r.success);

      return {
        success: allSuccess,
        timestamp,
        mode: this.offlineMode ? 'offline' : 'online',
        healthyCount: Object.keys(adapterResults).length,
        adapterResults
      };
    } catch (err) {
      return {
        success: false,
        timestamp,
        error: err.message,
        adapterResults
      };
    }
  }
}

module.exports = AirRoofersPlatformSuite;
