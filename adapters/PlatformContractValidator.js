/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Platform Adapter Layer / Platform Contract Validator
 * File           : PlatformContractValidator.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
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
 * Copyright (c) 2026 Ujomor Systems. All Rights Reserved.
 ******************************************************************************/

'use strict';

const AirRoofersPlatformSuite = require('./AirRoofersPlatformSuite');

class PlatformContractValidator {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Helper to check basic data types and presence
   */
  _validateType(val, expectedType) {
    if (expectedType === 'array') {
      return Array.isArray(val);
    }
    if (expectedType === 'object') {
      return val !== null && typeof val === 'object' && !Array.isArray(val);
    }
    return typeof val === expectedType;
  }

  /**
   * Validate Identity Adapter contract
   */
  async validateIdentityContract(adapter, mode = 'offline') {
    const checks = [];

    // Health check contract
    const healthy = await adapter.isHealthy();
    checks.push({
      name: 'isHealthy() returns boolean',
      passed: typeof healthy === 'boolean' && healthy === true
    });

    // Authenticate contract
    const authRes = await adapter.authenticate('test-token');
    const authValid = (
      this._validateType(authRes, 'object') &&
      typeof authRes.authenticated === 'boolean' &&
      this._validateType(authRes.user, 'object') &&
      typeof authRes.user.id === 'string' &&
      typeof authRes.user.role === 'string' &&
      typeof authRes.user.tenant === 'string' &&
      typeof authRes.source === 'string'
    );
    checks.push({
      name: 'authenticate() schema compliance',
      passed: authValid,
      details: authRes
    });

    // Offline fallback specific check
    if (mode === 'offline') {
      checks.push({
        name: 'authenticate() offline source fallback',
        passed: authRes.source === 'local_fallback'
      });
    }

    // Permissions contract
    const permsRes = await adapter.getUserPermissions('usr_test');
    const permsValid = Array.isArray(permsRes) && permsRes.every(p => typeof p === 'string');
    checks.push({
      name: 'getUserPermissions() schema compliance',
      passed: permsValid,
      details: permsRes
    });

    const allPassed = checks.every(c => c.passed);
    return { adapter: 'identity', passed: allPassed, checks };
  }

  /**
   * Validate Billing Adapter contract
   */
  async validateBillingContract(adapter, mode = 'offline') {
    const checks = [];

    // Health check contract
    const healthy = await adapter.isHealthy();
    checks.push({
      name: 'isHealthy() returns boolean',
      passed: typeof healthy === 'boolean' && healthy === true
    });

    // Record Metered Event contract
    const billRes = await adapter.recordMeteredEvent('tenant_val', 'audit_metric', 5);
    const billValid = (
      this._validateType(billRes, 'object') &&
      typeof billRes.status === 'string' &&
      this._validateType(billRes.event, 'object') &&
      billRes.event.tenantId === 'tenant_val' &&
      billRes.event.metric === 'audit_metric' &&
      billRes.event.value === 5 &&
      typeof billRes.event.timestamp === 'string'
    );
    checks.push({
      name: 'recordMeteredEvent() schema compliance',
      passed: billValid,
      details: billRes
    });

    // Offline mode status check
    if (mode === 'offline') {
      checks.push({
        name: 'recordMeteredEvent() offline status status === "queued_local"',
        passed: billRes.status === 'queued_local'
      });
    }

    // Usage Report contract
    const usageRes = await adapter.getUsageReport('tenant_val');
    const usageValid = Array.isArray(usageRes) && usageRes.some(e => e.metric === 'audit_metric');
    checks.push({
      name: 'getUsageReport() schema compliance',
      passed: usageValid,
      details: usageRes
    });

    const allPassed = checks.every(c => c.passed);
    return { adapter: 'billing', passed: allPassed, checks };
  }

  /**
   * Validate Licensing Adapter contract
   */
  async validateLicensingContract(adapter, mode = 'offline') {
    const checks = [];

    // Health check contract
    const healthy = await adapter.isHealthy();
    checks.push({
      name: 'isHealthy() returns boolean',
      passed: typeof healthy === 'boolean' && healthy === true
    });

    // Verify License Key contract (Enterprise)
    const entRes = await adapter.verifyLicenseKey('EAORCS-ENT-VALIDATOR-KEY');
    const entValid = (
      this._validateType(entRes, 'object') &&
      entRes.valid === true &&
      entRes.edition === 'Enterprise' &&
      typeof entRes.maxNodes === 'number' &&
      Array.isArray(entRes.features)
    );
    checks.push({
      name: 'verifyLicenseKey() Enterprise schema compliance',
      passed: entValid,
      details: entRes
    });

    // Verify License Key contract (Community)
    const commRes = await adapter.verifyLicenseKey('COMMUNITY-FREE');
    const commValid = (
      this._validateType(commRes, 'object') &&
      commRes.valid === true &&
      commRes.edition === 'Community'
    );
    checks.push({
      name: 'verifyLicenseKey() Community schema compliance',
      passed: commValid,
      details: commRes
    });

    const allPassed = checks.every(c => c.passed);
    return { adapter: 'licensing', passed: allPassed, checks };
  }

  /**
   * Validate Storage Adapter contract
   */
  async validateStorageContract(adapter, mode = 'offline') {
    const checks = [];

    // Health check contract
    const healthy = await adapter.isHealthy();
    checks.push({
      name: 'isHealthy() returns boolean',
      passed: typeof healthy === 'boolean' && healthy === true
    });

    // Write contract
    const testPath = `validator_probe_${Date.now()}.json`;
    const payload = { probe: 'contract_validation', timestamp: new Date().toISOString() };
    const writeRes = await adapter.write(testPath, payload);
    const writeValid = (
      this._validateType(writeRes, 'object') &&
      writeRes.status === 'written' &&
      writeRes.path === testPath &&
      typeof writeRes.fullPath === 'string' &&
      typeof writeRes.bytes === 'number'
    );
    checks.push({
      name: 'write() schema compliance',
      passed: writeValid,
      details: writeRes
    });

    // Exists contract
    const existsBefore = await adapter.exists(testPath);
    checks.push({
      name: 'exists() returns true after write',
      passed: existsBefore === true
    });

    // Read contract
    const readRes = await adapter.read(testPath);
    const readValid = (
      this._validateType(readRes, 'object') &&
      readRes.probe === 'contract_validation'
    );
    checks.push({
      name: 'read() schema compliance',
      passed: readValid,
      details: readRes
    });

    // Delete contract
    const deleteRes = await adapter.delete(testPath);
    const existsAfter = await adapter.exists(testPath);
    checks.push({
      name: 'delete() contract compliance',
      passed: deleteRes === true && existsAfter === false
    });

    const allPassed = checks.every(c => c.passed);
    return { adapter: 'storage', passed: allPassed, checks };
  }

  /**
   * Validate Telemetry Adapter contract
   */
  async validateTelemetryContract(adapter, mode = 'offline') {
    const checks = [];

    // Health check contract
    const healthy = await adapter.isHealthy();
    checks.push({
      name: 'isHealthy() returns boolean',
      passed: typeof healthy === 'boolean' && healthy === true
    });

    // Send Audit Metrics contract
    const metricsPayload = { edition: 'Enterprise', trustScore: 98, nodesAudited: 120, violations: 0 };
    const telemRes = await adapter.sendAuditMetrics(metricsPayload);
    const telemValid = (
      this._validateType(telemRes, 'object') &&
      typeof telemRes.status === 'string' &&
      this._validateType(telemRes.payload, 'object') &&
      typeof telemRes.payload.timestamp === 'string' &&
      telemRes.payload.edition === 'Enterprise' &&
      telemRes.payload.score === 98 &&
      telemRes.payload.nodesAudited === 120
    );
    checks.push({
      name: 'sendAuditMetrics() schema compliance',
      passed: telemValid,
      details: telemRes
    });

    if (mode === 'offline') {
      checks.push({
        name: 'sendAuditMetrics() offline status status === "recorded_offline"',
        passed: telemRes.status === 'recorded_offline'
      });
    }

    const allPassed = checks.every(c => c.passed);
    return { adapter: 'telemetry', passed: allPassed, checks };
  }

  /**
   * Validate Support Adapter contract
   */
  async validateSupportContract(adapter, mode = 'offline') {
    const checks = [];

    // Health check contract
    const healthy = await adapter.isHealthy();
    checks.push({
      name: 'isHealthy() returns boolean',
      passed: typeof healthy === 'boolean' && healthy === true
    });

    // Create Support Ticket contract
    const ticketRes = await adapter.createSupportTicket('Contract Validation Ticket', 'System health probe', { probe: true });
    const ticketValid = (
      this._validateType(ticketRes, 'object') &&
      typeof ticketRes.status === 'string' &&
      this._validateType(ticketRes.ticket, 'object') &&
      typeof ticketRes.ticket.id === 'string' &&
      ticketRes.ticket.subject === 'Contract Validation Ticket' &&
      ticketRes.ticket.status === 'OPEN' &&
      typeof ticketRes.ticket.createdAt === 'string'
    );
    checks.push({
      name: 'createSupportTicket() schema compliance',
      passed: ticketValid,
      details: ticketRes
    });

    // Get Ticket contract
    const fetchedTicket = await adapter.getTicket(ticketRes.ticket.id);
    checks.push({
      name: 'getTicket() schema compliance',
      passed: fetchedTicket !== null && fetchedTicket.id === ticketRes.ticket.id
    });

    // Upload Diagnostics contract
    const diagRes = await adapter.uploadDiagnostics({ id: 'diag_bundle_001', logLines: 42 });
    const diagValid = (
      this._validateType(diagRes, 'object') &&
      typeof diagRes.status === 'string' &&
      diagRes.bundleId === 'diag_bundle_001'
    );
    checks.push({
      name: 'uploadDiagnostics() schema compliance',
      passed: diagValid,
      details: diagRes
    });

    const allPassed = checks.every(c => c.passed);
    return { adapter: 'support', passed: allPassed, checks };
  }

  /**
   * Validate Notifications Adapter contract
   */
  async validateNotificationsContract(adapter, mode = 'offline') {
    const checks = [];

    // Health check contract
    const healthy = await adapter.isHealthy();
    checks.push({
      name: 'isHealthy() returns boolean',
      passed: typeof healthy === 'boolean' && healthy === true
    });

    // Webhook contract
    const webhookRes = await adapter.sendWebhook('https://hooks.internal/validator', { event: 'validate' });
    const webhookValid = (
      this._validateType(webhookRes, 'object') &&
      typeof webhookRes.status === 'string' &&
      this._validateType(webhookRes.notification, 'object') &&
      webhookRes.notification.type === 'webhook' &&
      webhookRes.notification.url === 'https://hooks.internal/validator'
    );
    checks.push({
      name: 'sendWebhook() schema compliance',
      passed: webhookValid,
      details: webhookRes
    });

    // Email Alert contract
    const emailRes = await adapter.sendEmailAlert('admin@ujomor.com', 'Contract Alert', 'Validation Probe');
    const emailValid = (
      this._validateType(emailRes, 'object') &&
      typeof emailRes.status === 'string' &&
      this._validateType(emailRes.notification, 'object') &&
      emailRes.notification.type === 'email' &&
      emailRes.notification.recipient === 'admin@ujomor.com'
    );
    checks.push({
      name: 'sendEmailAlert() schema compliance',
      passed: emailValid,
      details: emailRes
    });

    // Stream Event contract
    const streamRes = await adapter.publishStreamEvent('governance_channel', { event: 'probe' });
    const streamValid = (
      this._validateType(streamRes, 'object') &&
      typeof streamRes.status === 'string' &&
      this._validateType(streamRes.notification, 'object') &&
      streamRes.notification.type === 'stream' &&
      streamRes.notification.channel === 'governance_channel'
    );
    checks.push({
      name: 'publishStreamEvent() schema compliance',
      passed: streamValid,
      details: streamRes
    });

    // History contract
    const historyRes = await adapter.getNotificationHistory({ type: 'webhook' });
    checks.push({
      name: 'getNotificationHistory() schema compliance',
      passed: Array.isArray(historyRes) && historyRes.some(n => n.type === 'webhook')
    });

    const allPassed = checks.every(c => c.passed);
    return { adapter: 'notifications', passed: allPassed, checks };
  }

  /**
   * Validate Search Adapter contract
   */
  async validateSearchContract(adapter, mode = 'offline') {
    const checks = [];

    // Health check contract
    const healthy = await adapter.isHealthy();
    checks.push({
      name: 'isHealthy() returns boolean',
      passed: typeof healthy === 'boolean' && healthy === true
    });

    // Index OSAP Passport contract
    const passportData = { id: 'pass_val_100', title: 'Contract Validator Passport', trustScore: 100 };
    const indexRes = await adapter.indexOsapPassport(passportData);
    const indexValid = (
      this._validateType(indexRes, 'object') &&
      typeof indexRes.status === 'string' &&
      this._validateType(indexRes.item, 'object') &&
      indexRes.item.id === 'pass_val_100' &&
      indexRes.item.collection === 'osap_passports' &&
      typeof indexRes.item.indexedAt === 'string'
    );
    checks.push({
      name: 'indexOsapPassport() schema compliance',
      passed: indexValid,
      details: indexRes
    });

    // Global Search contract
    const searchRes = await adapter.globalSearch('Contract Validator');
    const searchValid = Array.isArray(searchRes) && searchRes.some(i => i.id === 'pass_val_100');
    checks.push({
      name: 'globalSearch() schema compliance',
      passed: searchValid,
      details: searchRes
    });

    const allPassed = checks.every(c => c.passed);
    return { adapter: 'search', passed: allPassed, checks };
  }

  /**
   * Validate all 8 platform adapters in a suite instance against live/offline schema contracts
   */
  async validateAllContracts(suiteInstance, mode = 'offline') {
    if (!suiteInstance || typeof suiteInstance.getAdapters !== 'function') {
      throw new Error('Invalid AirRoofersPlatformSuite instance provided to validator');
    }

    const adapters = suiteInstance.getAdapters();
    const results = {
      identity: await this.validateIdentityContract(adapters.identity, mode),
      billing: await this.validateBillingContract(adapters.billing, mode),
      licensing: await this.validateLicensingContract(adapters.licensing, mode),
      storage: await this.validateStorageContract(adapters.storage, mode),
      telemetry: await this.validateTelemetryContract(adapters.telemetry, mode),
      support: await this.validateSupportContract(adapters.support, mode),
      notifications: await this.validateNotificationsContract(adapters.notifications, mode),
      search: await this.validateSearchContract(adapters.search, mode)
    };

    const passedAdapters = Object.values(results).filter(r => r.passed).length;
    const overallSuccess = passedAdapters === 8;

    return {
      success: overallSuccess,
      totalAdapters: 8,
      passedAdapters,
      mode,
      timestamp: new Date().toISOString(),
      results
    };
  }

  /**
   * Verify fallback state transitions across all 8 adapters
   */
  async verifyFallbackStateTransition(suiteInstance) {
    if (!suiteInstance) {
      suiteInstance = new AirRoofersPlatformSuite({ offlineMode: false });
    }

    // 1. Force offline mode
    suiteInstance.setOfflineMode(true);
    const offlineValidation = await this.validateAllContracts(suiteInstance, 'offline');
    if (!offlineValidation.success) {
      return {
        success: false,
        stage: 'offline_validation_failed',
        offlineValidation
      };
    }

    // 2. Toggle to online mode (mock/live SDK evaluation)
    suiteInstance.setOfflineMode(false);
    const onlineValidation = await this.validateAllContracts(suiteInstance, 'online');
    if (!onlineValidation.success) {
      return {
        success: false,
        stage: 'online_validation_failed',
        onlineValidation
      };
    }

    // 3. Return back to offline mode to verify idempotent state restoration
    suiteInstance.setOfflineMode(true);
    const restoredOfflineValidation = await this.validateAllContracts(suiteInstance, 'offline');
    if (!restoredOfflineValidation.success) {
      return {
        success: false,
        stage: 'restored_offline_validation_failed',
        restoredOfflineValidation
      };
    }

    return {
      success: true,
      transitionVerified: true,
      offlinePassed: offlineValidation.passedAdapters === 8,
      onlinePassed: onlineValidation.passedAdapters === 8,
      restoredOfflinePassed: restoredOfflineValidation.passedAdapters === 8,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = PlatformContractValidator;
