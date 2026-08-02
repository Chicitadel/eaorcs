'use strict';

const crypto = require('crypto');

class MockPartnerManager {
  constructor() {
    this.partners = new Map();
    this.apiKeys = new Map();
    this.webhooks = new Map();
  }

  registerPartner(partnerData) {
    if (!partnerData || !partnerData.partnerId || !partnerData.companyName) {
      throw new Error('partnerId and companyName are required');
    }
    const partner = { ...partnerData, registeredAt: new Date().toISOString() };
    this.partners.set(partnerData.partnerId, partner);
    return partner;
  }

  generateApiKey(partnerId) {
    if (!this.partners.has(partnerId)) throw new Error(`Partner [${partnerId}] not found`);
    const key = crypto.randomBytes(32).toString('hex');
    this.apiKeys.set(key, partnerId);
    return key;
  }

  validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') return false;
    return this.apiKeys.has(apiKey);
  }

  registerWebhook(partnerId, webhookConfig) {
    if (!this.partners.has(partnerId)) throw new Error(`Partner [${partnerId}] not found`);
    if (!webhookConfig || !webhookConfig.url || !Array.isArray(webhookConfig.events)) {
      throw new Error('Valid webhook URL and events array are required');
    }
    const webhook = { webhookId: 'wh-' + crypto.randomBytes(6).toString('hex'), partnerId, ...webhookConfig };
    this.webhooks.set(webhook.webhookId, webhook);
    return webhook;
  }

  dispatchWebhookEvent(event, payload, handlerFn) {
    const matchedWebhooks = Array.from(this.webhooks.values()).filter(w => w.events.includes(event));
    const results = [];
    for (const wh of matchedWebhooks) {
      if (typeof handlerFn === 'function') {
        const res = handlerFn(wh.url, event, payload);
        results.push(res);
      }
    }
    return results;
  }
}

async function runPartnerApiTest() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      passed++;
    } else {
      failed++;
      console.error(`  ❌ Assertion failed: ${message}`);
    }
  }

  const pm = new MockPartnerManager();

  // Step 1: Simulate partner registration
  let partner;
  try {
    partner = pm.registerPartner({
      partnerId: 'partner-001',
      companyName: 'Acme Security',
      contactEmail: 'api@acme.com',
      tier: 'Reseller'
    });
    assert(partner && partner.partnerId === 'partner-001', 'Step 1: Partner registered successfully');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 1 failed: ${err.message}`);
  }

  // Step 2: Generate API key
  let apiKey;
  try {
    apiKey = pm.generateApiKey('partner-001');
    assert(apiKey && apiKey.length >= 32, 'Step 2: API key generated with length >= 32');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 2 failed: ${err.message}`);
  }

  // Step 3: Validate API key
  try {
    const isValid = pm.validateApiKey(apiKey);
    const isInvalid = pm.validateApiKey(null);
    assert(isValid === true && isInvalid === false, 'Step 3: API key validation correctly accepts valid key and rejects null');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 3 failed: ${err.message}`);
  }

  // Step 4: Webhook registration
  let webhook;
  try {
    webhook = pm.registerWebhook('partner-001', {
      url: 'https://acme.com/webhook',
      events: ['audit.completed', 'cert.issued']
    });
    assert(webhook && webhook.url === 'https://acme.com/webhook', 'Step 4: Webhook registered');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 4 failed: ${err.message}`);
  }

  // Step 5: Webhook delivery simulation
  try {
    let handlerCalled = false;
    let receivedEvent = null;
    const results = pm.dispatchWebhookEvent('audit.completed', { auditId: 'aud-99' }, (url, event, data) => {
      handlerCalled = true;
      receivedEvent = event;
      return { status: 200, delivered: true };
    });
    assert(handlerCalled === true && receivedEvent === 'audit.completed' && results.length > 0, 'Step 5: Webhook event dispatched and received');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 5 failed: ${err.message}`);
  }

  return { passed, failed };
}

module.exports = { runPartnerApiTest };
