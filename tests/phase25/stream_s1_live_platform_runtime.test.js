/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase25StreamS1Tests
 * File           : tests/phase25/stream_s1_live_platform_runtime.test.js
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

const LivePlatformRuntimeIngestionEngine = require('../../engine/operations/LivePlatformRuntimeIngestionEngine');
const KubernetesEventProvenanceGraphV2 = require('../../engine/operations/KubernetesEventProvenanceGraphV2');
const ImmutableDeploymentProvenanceLedgerV2 = require('../../engine/operations/ImmutableDeploymentProvenanceLedgerV2');

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${name} — ${e.message}`);
      failed++;
    }
  }

  console.log('Running Phase 25 Stream S1 Tests...\n');

  await test('LivePlatformRuntimeIngestionEngine should return correct provenance tuple', async () => {
    const engine = new LivePlatformRuntimeIngestionEngine();
    const result = await engine.run();
    if (result.engineType !== 'LIVE_PLATFORM_RUNTIME_INGESTION_ENGINE') throw new Error('Incorrect engineType');
    if (result.provenanceTuple.commitSha !== 'c8d4190f8e12b40974819201') throw new Error('Incorrect commitSha');
    if (result.clusterHealthScorePercent !== 100) throw new Error('Incorrect health score');
    if (result.status !== 'INGESTING_LIVE_SIGNALS') throw new Error('Incorrect status');
  });

  await test('KubernetesEventProvenanceGraphV2 should return correct event graph data', async () => {
    const graph = new KubernetesEventProvenanceGraphV2();
    const result = await graph.run();
    if (result.graphType !== 'KUBERNETES_EVENT_PROVENANCE_GRAPH_V2') throw new Error('Incorrect graphType');
    if (result.gitCommitBinding !== 'c8d4190f8e12b40974819201') throw new Error('Incorrect gitCommitBinding');
    if (result.status !== 'CONNECTED') throw new Error('Incorrect status');
  });

  await test('ImmutableDeploymentProvenanceLedgerV2 should return correct deployment ledger data', async () => {
    const ledger = new ImmutableDeploymentProvenanceLedgerV2();
    const result = await ledger.run();
    if (result.ledgerType !== 'IMMUTABLE_DEPLOYMENT_PROVENANCE_LEDGER_V2') throw new Error('Incorrect ledgerType');
    if (result.ledgerIntegrityStatus !== 'VERIFIED') throw new Error('Incorrect integrity status');
    if (result.status !== 'IMMUTABLE') throw new Error('Incorrect status');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
