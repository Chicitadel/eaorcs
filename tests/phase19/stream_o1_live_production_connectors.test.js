/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Live Production Connectors
 * File           : tests/phase19/stream_o1_live_production_connectors.test.js
 * Version        : 2026.19.0
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

const LiveProductionConnector = require('../../engine/connectors/LiveProductionConnector');
const ServiceHealthProbe = require('../../engine/connectors/ServiceHealthProbe');
const EvidenceIngestionPipeline = require('../../engine/connectors/EvidenceIngestionPipeline');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch(e) {
      console.error(`  ❌ FAIL: ${name} — ${e.message}`);
      failed++;
    }
  }

  console.log('Running Phase 19 Stream O1 Live Production Connectors Tests...');

  await test('LiveProductionConnector validation', async () => {
    const connector = new LiveProductionConnector();
    const result = await connector.run();
    if (result.dataSource !== 'LIVE_SYSTEM') throw new Error('dataSource must be LIVE_SYSTEM');
    if (!Array.isArray(result.serviceEndpoints) || result.serviceEndpoints.length < 6) throw new Error('Must have >= 6 service endpoints');
    if (result.unreachableEndpoints !== 0) throw new Error('unreachableEndpoints must be 0');
    if (result.status !== 'CONNECTED') throw new Error('status must be CONNECTED');
  });

  await test('ServiceHealthProbe validation', async () => {
    const probe = new ServiceHealthProbe();
    const result = await probe.run();
    if (result.dataSource !== 'LIVE_SYSTEM') throw new Error('dataSource must be LIVE_SYSTEM');
    if (!Array.isArray(result.probeResults) || result.probeResults.length < 10) throw new Error('Must have >= 10 probe runs');
    if (result.failedProbes !== 0) throw new Error('failedProbes must be 0');
    if (!result.externalVerificationUrl) throw new Error('externalVerificationUrl must exist');
    if (result.status !== 'OPERATIONAL') throw new Error('status must be OPERATIONAL');
  });

  await test('EvidenceIngestionPipeline validation', async () => {
    const pipeline = new EvidenceIngestionPipeline();
    const result = await pipeline.run();
    if (result.dataSource !== 'LIVE_SYSTEM') throw new Error('dataSource must be LIVE_SYSTEM');
    if (!Array.isArray(result.ingestionSources) || result.ingestionSources.length < 5) throw new Error('Must have >= 5 ingestion sources');
    if (result.backpressureEvents !== 0) throw new Error('backpressureEvents must be 0');
    if (result.status !== 'INGESTING') throw new Error('status must be INGESTING');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
