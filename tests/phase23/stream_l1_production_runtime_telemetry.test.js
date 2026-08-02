/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Stream L1 Production Runtime Telemetry Test
 * File           : tests/phase23/stream_l1_production_runtime_telemetry.test.js
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

const LiveRuntimeTelemetryLakeEngine = require('../../engine/operations/LiveRuntimeTelemetryLakeEngine');
const K8sClusterEventProvenanceGraph = require('../../engine/operations/K8sClusterEventProvenanceGraph');
const ImmutableDeploymentLedger = require('../../engine/operations/ImmutableDeploymentLedger');
const fs = require('fs');
const path = require('path');

async function runTests() {
  let passed = 0; let failed = 0;
  
  async function test(name, fn) {
    try { 
      await fn(); 
      console.log(`  ✅ PASS: ${name}`); 
      passed++; 
    }
    catch(e) { 
      console.error(`  ❌ FAIL: ${name} — ${e.message}`); 
      failed++; 
    }
  }

  await test('LiveRuntimeTelemetryLakeEngine returns valid structure', async () => {
    const engine = new LiveRuntimeTelemetryLakeEngine();
    const result = await engine.run();
    if (result.engineType !== 'LIVE_RUNTIME_TELEMETRY_LAKE_ENGINE') throw new Error('Invalid engineType');
    if (result.commitSha !== 'a4f8e2d9c3b17f2e1a498801') throw new Error('Invalid commitSha');
    if (result.status !== 'STREAMING') throw new Error('Invalid status');
  });

  await test('K8sClusterEventProvenanceGraph returns valid structure', async () => {
    const engine = new K8sClusterEventProvenanceGraph();
    const result = await engine.run();
    if (result.graphType !== 'K8S_CLUSTER_EVENT_PROVENANCE_GRAPH') throw new Error('Invalid graphType');
    if (result.nodesCount !== 14820) throw new Error('Invalid nodesCount');
    if (result.gitCommitBinding !== 'a4f8e2d9c3b17f2e1a498801') throw new Error('Invalid gitCommitBinding');
  });

  await test('ImmutableDeploymentLedger returns valid structure', async () => {
    const engine = new ImmutableDeploymentLedger();
    const result = await engine.run();
    if (result.ledgerType !== 'IMMUTABLE_DEPLOYMENT_LEDGER') throw new Error('Invalid ledgerType');
    if (result.provenanceBoundDeploymentsCount !== 52) throw new Error('Invalid deployments count');
    if (result.status !== 'IMMUTABLE') throw new Error('Invalid status');
  });

  await test('Evidence JSON validation', async () => {
    const evidencePath = path.join(__dirname, '../../evidence/phase23_production_runtime_telemetry_evidence.json');
    const data = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
    if (data.status !== 'VERIFIED') throw new Error('Evidence status not VERIFIED');
    if (data.phase !== '23') throw new Error('Invalid phase');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
