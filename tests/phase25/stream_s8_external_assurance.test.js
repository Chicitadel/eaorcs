/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : StreamS8ExternalAssuranceTest
 * File           : tests/phase25/stream_s8_external_assurance.test.js
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

const ExternalAssuranceIngestionLake = require('../../engine/operations/ExternalAssuranceIngestionLake');
const Rfc3161TsaReceiptGraphV3 = require('../../engine/operations/Rfc3161TsaReceiptGraphV3');
const ExternalAuditorPortalBridgeV3 = require('../../engine/operations/ExternalAuditorPortalBridgeV3');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('Running Phase 25 Stream S8 Tests...');

  await test('ExternalAssuranceIngestionLake run() returns expected properties', async () => {
    const operation = new ExternalAssuranceIngestionLake();
    const result = await operation.run();
    if (result.lakeType !== 'EXTERNAL_ASSURANCE_INGESTION_LAKE') throw new Error('Invalid lakeType');
    if (result.verifiedThirdPartyAttestationsCount !== 28) throw new Error('Invalid attestations count');
    if (result.lakeStatus !== 'INGESTED') throw new Error('Invalid status');
  });

  await test('Rfc3161TsaReceiptGraphV3 run() returns expected properties', async () => {
    const operation = new Rfc3161TsaReceiptGraphV3();
    const result = await operation.run();
    if (result.graphType !== 'RFC3161_TSA_RECEIPT_GRAPH_V3') throw new Error('Invalid graphType');
    if (result.issuedTimestampTokensCount !== 160) throw new Error('Invalid token count');
    if (result.status !== 'GRAPHED') throw new Error('Invalid status');
  });

  await test('ExternalAuditorPortalBridgeV3 run() returns expected properties', async () => {
    const operation = new ExternalAuditorPortalBridgeV3();
    const result = await operation.run();
    if (result.bridgeType !== 'EXTERNAL_AUDITOR_PORTAL_BRIDGE_V3') throw new Error('Invalid bridgeType');
    if (result.tokenSecurityState !== 'READ_ONLY_ENFORCED') throw new Error('Invalid security state');
    if (result.status !== 'ACTIVE') throw new Error('Invalid status');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
