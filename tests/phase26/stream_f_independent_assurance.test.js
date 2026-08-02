/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Independent Assurance & Attestation
 * File           : tests/phase26/stream_f_independent_assurance.test.js
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

const IndependentAssuranceAttestationEngine = require('../../engine/operations/IndependentAssuranceAttestationEngine');
const ThirdPartyPenetrationTestBridge = require('../../engine/operations/ThirdPartyPenetrationTestBridge');
const Rfc3161TimestampIngestionEngine = require('../../engine/operations/Rfc3161TimestampIngestionEngine');

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

  console.log('Running Phase 26 Stream F Tests...');

  await test('IndependentAssuranceAttestationEngine executes correctly', async () => {
    const engine = new IndependentAssuranceAttestationEngine();
    const result = await engine.run();
    if (result.engineType !== 'INDEPENDENT_ASSURANCE_ATTESTATION_ENGINE') throw new Error('Invalid engineType');
    if (result.status !== 'ATTESTED') throw new Error('Invalid status');
    if (result.crestAttestationStatus !== 'VERIFIED') throw new Error('Invalid crestAttestationStatus');
  });

  await test('ThirdPartyPenetrationTestBridge executes correctly', async () => {
    const bridge = new ThirdPartyPenetrationTestBridge();
    const result = await bridge.run();
    if (result.bridgeType !== 'THIRD_PARTY_PENETRATION_TEST_BRIDGE') throw new Error('Invalid bridgeType');
    if (result.status !== 'CLEAN') throw new Error('Invalid status');
    if (result.criticalFindingsCount !== 0) throw new Error('Invalid criticalFindingsCount');
  });

  await test('Rfc3161TimestampIngestionEngine executes correctly', async () => {
    const engine = new Rfc3161TimestampIngestionEngine();
    const result = await engine.run();
    if (result.engineType !== 'RFC3161_TIMESTAMP_INGESTION_ENGINE') throw new Error('Invalid engineType');
    if (result.status !== 'INGESTED') throw new Error('Invalid status');
    if (result.tsaAuthority !== 'DigiCert Timestamp Authority') throw new Error('Invalid tsaAuthority');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
