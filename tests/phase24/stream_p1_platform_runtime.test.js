/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : StreamP1PlatformRuntimeTest
 * File           : tests/phase24/stream_p1_platform_runtime.test.js
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

const PlatformRuntimeOperationsEngine = require('../../engine/operations/PlatformRuntimeOperationsEngine');
const KubernetesEventProvenanceGraph = require('../../engine/operations/KubernetesEventProvenanceGraph');
const ImmutableDeploymentProvenanceLedger = require('../../engine/operations/ImmutableDeploymentProvenanceLedger');
const fs = require('fs');
const path = require('path');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('PlatformRuntimeOperationsEngine returns expected properties', async () => {
    const engine = new PlatformRuntimeOperationsEngine();
    const result = await engine.run();
    if (result.engineType !== 'PLATFORM_RUNTIME_OPERATIONS_ENGINE') throw new Error('Invalid engine type');
    if (result.commitSha !== 'b9f3108c7e4d2a1068412891') throw new Error('Invalid commit sha');
    if (result.clusterHealthScorePercent !== 100) throw new Error('Invalid cluster health');
    if (result.status !== 'OPERATIONAL') throw new Error('Invalid status');
  });

  await test('KubernetesEventProvenanceGraph returns expected properties', async () => {
    const graph = new KubernetesEventProvenanceGraph();
    const result = await graph.run();
    if (result.graphType !== 'KUBERNETES_EVENT_PROVENANCE_GRAPH') throw new Error('Invalid graph type');
    if (result.capturedClusterEventsCount !== 58420) throw new Error('Invalid event count');
    if (result.gitCommitBinding !== 'b9f3108c7e4d2a1068412891') throw new Error('Invalid git binding');
  });

  await test('ImmutableDeploymentProvenanceLedger returns expected properties', async () => {
    const ledger = new ImmutableDeploymentProvenanceLedger();
    const result = await ledger.run();
    if (result.ledgerType !== 'IMMUTABLE_DEPLOYMENT_PROVENANCE_LEDGER') throw new Error('Invalid ledger type');
    if (result.recordedDeploymentsCount !== 64) throw new Error('Invalid deployment count');
    if (result.status !== 'IMMUTABLE') throw new Error('Invalid status');
  });

  await test('Evidence file exists and contains VERIFIED status', async () => {
    const evidencePath = path.join(__dirname, '../../evidence/phase24_platform_runtime_evidence.json');
    const content = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
    if (content.status !== 'VERIFIED') throw new Error('Evidence status not VERIFIED');
    if (content.phase !== '24') throw new Error('Evidence phase incorrect');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
