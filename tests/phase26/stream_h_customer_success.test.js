/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : CustomerSuccessOnboardingEngineTests
 * File           : tests/phase26/stream_h_customer_success.test.js
 * Version        : 2026.17.0
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const CustomerSuccessOnboardingEngine = require('../../engine/operations/CustomerSuccessOnboardingEngine');
const TrainingAndKnowledgeBasePublisher = require('../../engine/operations/TrainingAndKnowledgeBasePublisher');
const SupportSlaMonitoringEngine = require('../../engine/operations/SupportSlaMonitoringEngine');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('Running Phase 26 Stream H Tests...');

  await test('CustomerSuccessOnboardingEngine run() returns expected values', async () => {
    const engine = new CustomerSuccessOnboardingEngine();
    const result = await engine.run();
    if (result.engineType !== 'CUSTOMER_SUCCESS_ONBOARDING_ENGINE') throw new Error('Invalid engineType');
    if (result.status !== 'OPERATIONAL') throw new Error('Invalid status');
    if (result.onboardingPlaybooksCount !== 8) throw new Error('Invalid playbook count');
    if (result.knowledgeBaseArticlesCount !== 120) throw new Error('Invalid article count');
  });

  await test('TrainingAndKnowledgeBasePublisher run() returns expected values', async () => {
    const publisher = new TrainingAndKnowledgeBasePublisher();
    const result = await publisher.run();
    if (result.publisherType !== 'TRAINING_AND_KNOWLEDGE_BASE_PUBLISHER') throw new Error('Invalid publisherType');
    if (result.status !== 'PUBLISHED') throw new Error('Invalid status');
    if (result.publishedArticlesCount !== 120) throw new Error('Invalid article count');
    if (result.trainingVideosCount !== 16) throw new Error('Invalid video count');
  });

  await test('SupportSlaMonitoringEngine run() returns expected values', async () => {
    const engine = new SupportSlaMonitoringEngine();
    const result = await engine.run();
    if (result.engineType !== 'SUPPORT_SLA_MONITORING_ENGINE') throw new Error('Invalid engineType');
    if (result.status !== 'MEETING_SLA') throw new Error('Invalid status');
    if (result.ticketFirstResponseTimeMinutes !== 12) throw new Error('Invalid FRT');
    if (result.ticketResolutionTimeHours !== 2.4) throw new Error('Invalid resolution time');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
