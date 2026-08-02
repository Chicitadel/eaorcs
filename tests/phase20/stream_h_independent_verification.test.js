/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Validation Tests
 * File           : tests/phase20/stream_h_independent_verification.test.js
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

const ExternalAttestationBridge = require('../../engine/validation/ExternalAttestationBridge');
const Rfc3161TimestampingEngine = require('../../engine/validation/Rfc3161TimestampingEngine');
const ZeroKnowledgeEvidenceProofEngine = require('../../engine/validation/ZeroKnowledgeEvidenceProofEngine');

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

  console.log('Running Phase 20 Stream H Tests...\n');

  await test('ExternalAttestationBridge returns valid VERIFIED status', async () => {
    const engine = new ExternalAttestationBridge();
    const result = await engine.run();
    if (result.status !== 'VERIFIED') throw new Error('Status should be VERIFIED');
    if (result.verifiedSignaturesCount !== 8) throw new Error('Verified signatures count should be 8');
  });

  await test('Rfc3161TimestampingEngine returns valid TIMESTAMPED status', async () => {
    const engine = new Rfc3161TimestampingEngine();
    const result = await engine.run();
    if (result.status !== 'TIMESTAMPED') throw new Error('Status should be TIMESTAMPED');
    if (result.tokenVerified !== true) throw new Error('Token should be verified');
  });

  await test('ZeroKnowledgeEvidenceProofEngine returns valid PROVED status', async () => {
    const engine = new ZeroKnowledgeEvidenceProofEngine();
    const result = await engine.run();
    if (result.status !== 'PROVED') throw new Error('Status should be PROVED');
    if (result.zeroDataExposed !== true) throw new Error('Zero data exposed should be true');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
