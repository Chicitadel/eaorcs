/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Security Supply Chain
 * File           : tests/phase25/stream_s4_security_supply_chain.test.js
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

const ExternalVulnerabilityFeedIngesterLake = require('../../engine/operations/ExternalVulnerabilityFeedIngesterLake.js');
const SignedSbomRegistryGraphV3 = require('../../engine/operations/SignedSbomRegistryGraphV3.js');
const LiveSecurityAttestationLedger = require('../../engine/operations/LiveSecurityAttestationLedger.js');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('ExternalVulnerabilityFeedIngesterLake should return CLEAN status', async () => {
    const lake = new ExternalVulnerabilityFeedIngesterLake();
    const result = await lake.run();
    if (result.status !== 'CLEAN') throw new Error(`Expected CLEAN, got ${result.status}`);
    if (result.lakeType !== 'EXTERNAL_VULNERABILITY_FEED_INGESTER_LAKE') throw new Error('Invalid lakeType');
  });

  await test('SignedSbomRegistryGraphV3 should return VERIFIED status', async () => {
    const sbom = new SignedSbomRegistryGraphV3();
    const result = await sbom.run();
    if (result.status !== 'VERIFIED') throw new Error(`Expected VERIFIED, got ${result.status}`);
    if (result.graphType !== 'SIGNED_SBOM_REGISTRY_GRAPH_V3') throw new Error('Invalid graphType');
  });

  await test('LiveSecurityAttestationLedger should return ATTESTED status', async () => {
    const ledger = new LiveSecurityAttestationLedger();
    const result = await ledger.run();
    if (result.status !== 'ATTESTED') throw new Error(`Expected ATTESTED, got ${result.status}`);
    if (result.ledgerType !== 'LIVE_SECURITY_ATTESTATION_LEDGER') throw new Error('Invalid ledgerType');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
