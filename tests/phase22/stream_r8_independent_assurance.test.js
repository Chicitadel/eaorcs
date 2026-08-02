/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Independent Assurance Tests
 * File           : d:\ujomor-platform\products\eaorcs\tests\phase22\stream_r8_independent_assurance.test.js
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

const ContinuousIndependentAssuranceEngine = require('../../engine/operations/ContinuousIndependentAssuranceEngine.js');
const Rfc3161TsaReceiptTokenBridge = require('../../engine/operations/Rfc3161TsaReceiptTokenBridge.js');
const ExternalAuditorPortalBridge = require('../../engine/operations/ExternalAuditorPortalBridge.js');
const fs = require('fs');
const path = require('path');

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

  console.log('Running Phase 22 Stream R8 Tests...');

  await test('ContinuousIndependentAssuranceEngine execution', async () => {
    const engine = new ContinuousIndependentAssuranceEngine();
    const result = await engine.run();
    if (result.engineType !== 'CONTINUOUS_INDEPENDENT_ASSURANCE_ENGINE') throw new Error('Invalid engine type');
    if (result.status !== 'VERIFIED') throw new Error('Invalid status');
    if (result.assuranceVerdict !== 'PASSED') throw new Error('Invalid verdict');
  });

  await test('Rfc3161TsaReceiptTokenBridge execution', async () => {
    const engine = new Rfc3161TsaReceiptTokenBridge();
    const result = await engine.run();
    if (result.bridgeType !== 'RFC3161_TSA_RECEIPT_TOKEN_BRIDGE') throw new Error('Invalid bridge type');
    if (result.status !== 'BRIDGED') throw new Error('Invalid status');
    if (result.tsaAuthorityName !== 'DigiCert RFC3161 Timestamp Authority') throw new Error('Invalid authority');
  });

  await test('ExternalAuditorPortalBridge execution', async () => {
    const engine = new ExternalAuditorPortalBridge();
    const result = await engine.run();
    if (result.bridgeType !== 'EXTERNAL_AUDITOR_PORTAL_BRIDGE') throw new Error('Invalid bridge type');
    if (result.status !== 'ACTIVE') throw new Error('Invalid status');
    if (result.tokenSecurityState !== 'READ_ONLY_ENFORCED') throw new Error('Invalid token security state');
  });

  await test('Evidence file existence and structure', async () => {
    const evidencePath = path.join(__dirname, '../../evidence/phase22_independent_assurance_evidence.json');
    const content = fs.readFileSync(evidencePath, 'utf8');
    const data = JSON.parse(content);
    if (data.status !== 'VERIFIED') throw new Error('Invalid evidence status');
    if (data.phase !== 'Phase 22') throw new Error('Invalid phase');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
