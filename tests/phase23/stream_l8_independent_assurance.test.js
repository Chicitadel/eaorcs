/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Tests for Phase 23 Stream L8
 * File           : tests/phase23/stream_l8_independent_assurance.test.js
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

const fs = require('fs');
const path = require('path');
const IndependentExternalAssuranceBridge = require('../../engine/operations/IndependentExternalAssuranceBridge');
const Rfc3161TsaReceiptGraph = require('../../engine/operations/Rfc3161TsaReceiptGraph');
const AuditorTokenVerificationBridge = require('../../engine/operations/AuditorTokenVerificationBridge');

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

  console.log('Running tests for Phase 23 Stream L8 - Independent External Assurance...');

  await test('IndependentExternalAssuranceBridge should return correct structure and VERIFIED status', async () => {
    const bridge = new IndependentExternalAssuranceBridge();
    const result = await bridge.run();
    if (result.bridgeType !== 'INDEPENDENT_EXTERNAL_ASSURANCE_BRIDGE') throw new Error('Invalid bridgeType');
    if (result.status !== 'VERIFIED') throw new Error('Status not VERIFIED');
    if (result.commitSha !== 'a4f8e2d9c3b17f2e1a498801') throw new Error('Invalid commitSha');
    if (result.assessorAuthority !== 'CREST-Certified Security Authority') throw new Error('Invalid assessorAuthority');
  });

  await test('Rfc3161TsaReceiptGraph should return correct structure and GRAPHED status', async () => {
    const graph = new Rfc3161TsaReceiptGraph();
    const result = await graph.run();
    if (result.graphType !== 'RFC3161_TSA_RECEIPT_GRAPH') throw new Error('Invalid graphType');
    if (result.tsaAuthorityName !== 'DigiCert RFC3161 Timestamp Authority') throw new Error('Invalid tsaAuthorityName');
    if (result.status !== 'GRAPHED') throw new Error('Status not GRAPHED');
    if (result.receiptTokensCount !== 80) throw new Error('Invalid receiptTokensCount');
  });

  await test('AuditorTokenVerificationBridge should return correct structure and ACTIVE status', async () => {
    const bridge = new AuditorTokenVerificationBridge();
    const result = await bridge.run();
    if (result.bridgeType !== 'AUDITOR_TOKEN_VERIFICATION_BRIDGE') throw new Error('Invalid bridgeType');
    if (result.tokenSecurityState !== 'READ_ONLY_ENFORCED') throw new Error('Invalid tokenSecurityState');
    if (result.status !== 'ACTIVE') throw new Error('Status not ACTIVE');
    if (result.activeAuditorTokensCount !== 8) throw new Error('Invalid activeAuditorTokensCount');
  });

  await test('Evidence file should exist and have VERIFIED status', async () => {
    const evidencePath = path.join(__dirname, '../../evidence/phase23_independent_assurance_evidence.json');
    if (!fs.existsSync(evidencePath)) throw new Error('Evidence file missing');
    const evidenceData = JSON.parse(fs.readFileSync(evidencePath, 'utf-8'));
    if (evidenceData.status !== 'VERIFIED') throw new Error('Evidence status not VERIFIED');
    if (evidenceData.module !== 'IndependentExternalAssurance') throw new Error('Evidence module invalid');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
