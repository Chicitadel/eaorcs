/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Commercial Billing Engine
 * File           : BillingEngine.js
 * Version        : 2026.1-LTS
 * Author         : Commercialization & Enterprise Release Engineering
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2 Type II
 * - OWASP ASVS v4.0
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';
const crypto = require('crypto');

const PLAN_PRICING = Object.freeze({
  Community:  { monthly: 0,    annual: 0,     scanLimit: 500,   userLimit: 10,  repositoryLimit: 5 },
  Pro:        { monthly: 49,   annual: 470,   scanLimit: 5000,  userLimit: 25,  repositoryLimit: 50 },
  Business:   { monthly: 199,  annual: 1990,  scanLimit: 50000, userLimit: 100, repositoryLimit: 500 },
  Enterprise: { monthly: 999,  annual: 9990,  scanLimit: -1,    userLimit: -1,  repositoryLimit: -1 },
  Sovereign:  { monthly: 4999, annual: 49990, scanLimit: -1,    userLimit: -1,  repositoryLimit: -1, airGapped: true }
});

class BillingEngine {
  constructor(config = {}) {
    this.config = config;
    this.invoices = new Map();
    this.subscriptions = new Map();
    this.usageRecords = new Map();
  }

  createSubscription({ tenantId, plan, billingCycle = 'monthly', startDate }) {
    if (!tenantId || !plan) throw new Error('tenantId and plan are required');
    const pricing = PLAN_PRICING[plan];
    if (!pricing) throw new Error(`Unknown plan: ${plan}`);
    const amount = billingCycle === 'annual' ? pricing.annual : pricing.monthly;
    const start = new Date(startDate || Date.now());
    const next = new Date(start);
    billingCycle === 'annual' ? next.setFullYear(next.getFullYear()+1) : next.setMonth(next.getMonth()+1);
    const subscription = {
      subscriptionId: 'sub-' + crypto.randomBytes(8).toString('hex'),
      tenantId, plan, billingCycle, status: 'ACTIVE',
      startDate: start.toISOString(), nextBillingDate: next.toISOString(),
      amount, currency: 'USD'
    };
    this.subscriptions.set(tenantId, subscription);
    return subscription;
  }

  recordUsage(tenantId, metric, quantity) {
    if (!this.usageRecords.has(tenantId)) this.usageRecords.set(tenantId, {});
    const usage = this.usageRecords.get(tenantId);
    usage[metric] = (usage[metric] || 0) + quantity;
    return { tenantId, metric, quantity, total: usage[metric], recordedAt: new Date().toISOString() };
  }

  generateInvoice(tenantId, billingPeriod = {}) {
    const sub = this.subscriptions.get(tenantId);
    if (!sub) throw new Error(`No subscription for tenant: ${tenantId}`);
    const pricing = PLAN_PRICING[sub.plan] || { monthly: 0 };
    const baseAmount = sub.billingCycle === 'annual' ? pricing.annual : pricing.monthly;
    const usage = this.usageRecords.get(tenantId) || {};
    const lineItems = [{ description: `${sub.plan} Plan (${sub.billingCycle})`, amount: baseAmount }];
    const subtotal = baseAmount;
    const tax = parseFloat((subtotal * 0.20).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));
    const invoice = {
      invoiceId: 'inv-' + crypto.randomBytes(8).toString('hex'),
      tenantId, period: billingPeriod, lineItems, subtotal, tax, total, currency: 'USD',
      status: 'ISSUED', issuedAt: new Date().toISOString()
    };
    this.invoices.set(invoice.invoiceId, invoice);
    return invoice;
  }

  calculateProration({ tenantId, fromPlan, toPlan, changeDate }) {
    const from = PLAN_PRICING[fromPlan] || { monthly: 0 };
    const to = PLAN_PRICING[toPlan] || { monthly: 0 };
    const changeDay = changeDate ? new Date(changeDate).getDate() : 15;
    const daysInMonth = 30;
    const remainingDays = daysInMonth - changeDay;
    const credit = parseFloat(((from.monthly / daysInMonth) * changeDay).toFixed(2));
    const charge = parseFloat(((to.monthly / daysInMonth) * remainingDays).toFixed(2));
    const netAmount = parseFloat((charge - credit).toFixed(2));
    return { credit, charge, netAmount, fromPlan, toPlan, effectiveDate: changeDate || new Date().toISOString() };
  }

  detectOverage(tenantId, metric) {
    const sub = this.subscriptions.get(tenantId);
    if (!sub) throw new Error(`No subscription for tenant: ${tenantId}`);
    const pricing = PLAN_PRICING[sub.plan] || {};
    const limit = pricing[metric + 'Limit'] || pricing.scanLimit || 500;
    const usage = (this.usageRecords.get(tenantId) || {})[metric] || 0;
    const overage = Math.max(0, usage - (limit === -1 ? Infinity : limit));
    const overageCharge = parseFloat((overage * 0.01).toFixed(2));
    return { tenantId, metric, used: usage, limit: limit === -1 ? 'unlimited' : limit, overage, overageCharge };
  }

  upgradePlan(tenantId, newPlan) {
    const sub = this.subscriptions.get(tenantId);
    if (!sub) throw new Error(`No subscription for tenant: ${tenantId}`);
    const previousPlan = sub.plan;
    const proration = this.calculateProration({ tenantId, fromPlan: previousPlan, toPlan: newPlan, changeDate: new Date().toISOString() });
    sub.plan = newPlan;
    sub.amount = PLAN_PRICING[newPlan] ? PLAN_PRICING[newPlan].monthly : 0;
    return { tenantId, previousPlan, newPlan, proration, effectiveDate: new Date().toISOString() };
  }

  cancelSubscription(tenantId, reason = 'user_requested') {
    const sub = this.subscriptions.get(tenantId);
    if (!sub) throw new Error(`No subscription for tenant: ${tenantId}`);
    sub.status = 'CANCELLATION_SCHEDULED';
    const effectiveDate = new Date(sub.nextBillingDate || Date.now()).toISOString();
    return { tenantId, status: 'CANCELLATION_SCHEDULED', effectiveDate, reason };
  }

  reactivateSubscription(tenantId) {
    const sub = this.subscriptions.get(tenantId);
    if (!sub) throw new Error(`No subscription for tenant: ${tenantId}`);
    sub.status = 'ACTIVE';
    return { tenantId, status: 'ACTIVE', reactivatedAt: new Date().toISOString() };
  }
}

module.exports = { BillingEngine, PLAN_PRICING };
