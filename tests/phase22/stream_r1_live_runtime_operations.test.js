/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Tests - Phase 22 Live Runtime Operations
 * File           : tests/phase22/stream_r1_live_runtime_operations.test.js
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

const LiveRuntimeOperationsEngine = require('../../engine/operations/LiveRuntimeOperationsEngine');
const ContinuousK8sTelemetryBridge = require('../../engine/operations/ContinuousK8sTelemetryBridge');
const ProductionDeploymentProofArchive = require('../../engine/operations/ProductionDeploymentProofArchive');
const fs = require('fs');
const path = require('path');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('LiveRuntimeOperationsEngine returns expected schema', async () => {
    const engine = new LiveRuntimeOperationsEngine();
    const result = await engine.run();
    if (result.engineType !== 'LIVE_RUNTIME_OPERATIONS_ENGINE') throw new Error('Invalid engineType');
    if (result.status !== 'OPERATIONAL') throw new Error('Invalid status');
  });

  await test('ContinuousK8sTelemetryBridge returns expected schema', async () => {
    const bridge = new ContinuousK8sTelemetryBridge();
    const result = await bridge.run();
    if (result.bridgeType !== 'CONTINUOUS_K8S_TELEMETRY_BRIDGE') throw new Error('Invalid bridgeType');
    if (result.status !== 'STREAMING') throw new Error('Invalid status');
  });

  await test('ProductionDeploymentProofArchive returns expected schema', async () => {
    const archive = new ProductionDeploymentProofArchive();
    const result = await archive.run();
    if (result.archiveType !== 'PRODUCTION_DEPLOYMENT_PROOF_ARCHIVE') throw new Error('Invalid archiveType');
    if (result.status !== 'VERIFIED') throw new Error('Invalid status');
  });

  await test('Evidence JSON matches schema', async () => {
    const evidencePath = path.join(__dirname, '../../evidence/phase22_live_runtime_operations_evidence.json');
    const content = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
    if (content.status !== 'VERIFIED') throw new Error('Invalid status in evidence');
    if (content.phase !== '22') throw new Error('Invalid phase');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
