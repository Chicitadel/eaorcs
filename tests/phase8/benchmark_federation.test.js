/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 8 Benchmark Vault & Federation Test Suite
 * File           : tests/phase8/benchmark_federation.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Systems Engineering & Governance Authority
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

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { OpenBenchmarkCorpusVault } = require('../../evidence/public_benchmark_corpus/OpenBenchmarkCorpusVault');
const { FederatedTrustNetworkNode } = require('../../engine/trust/FederatedTrustNetworkNode');

async function runTest() {
  console.log('================================================================');
  console.log('  EAORCS PHASE 8: BENCHMARK VAULT & FEDERATED TRUST SUITE');
  console.log('================================================================\n');

  // 1. Vault
  console.log('[1/2] Testing OpenBenchmarkCorpusVault...');
  const tmpVaultDir = path.join(process.cwd(), 'evidence', 'public_benchmark_corpus', 'tmp_vault');
  const vault = new OpenBenchmarkCorpusVault(tmpVaultDir);

  const entry = vault.storeBenchmarkDataset('express-rest', {
    repoName: 'express-rest',
    sampleCount: 100,
    repoType: 'NodeJS/REST',
    metrics: { p95Ms: 1.2, passRatePct: 100 }
  });
  assert(entry.repoId === 'express-rest', 'repoId mismatch');
  assert(typeof entry.contentHash === 'string', 'contentHash string expected');

  const retrieved = vault.getBenchmarkDataset('express-rest');
  assert(retrieved !== null, 'dataset should be retrieved');
  assert(retrieved.payload.repoName === 'express-rest', 'payload content mismatch');

  const integrity = vault.verifyVaultIntegrity();
  assert(integrity.valid === true, 'vault integrity should be valid');

  const archive = vault.exportVaultArchive();
  assert(archive.totalDatasets >= 1, 'archive should contain datasets');
  console.log('      ✓ OpenBenchmarkCorpusVault Passed (Vault verified & archived)');

  // Cleanup tmp vault
  fs.rmSync(tmpVaultDir, { recursive: true, force: true });

  // 2. Federation Node
  console.log('[2/2] Testing FederatedTrustNetworkNode...');
  const nodeA = new FederatedTrustNetworkNode('node-alpha');
  const nodeB = new FederatedTrustNetworkNode('node-beta');

  const peerReg = nodeA.registerPeerNode('node-beta', 'https://beta.trust.network', nodeB.keyPair.publicKey);
  assert(peerReg.nodeId === 'node-beta', 'peer nodeId mismatch');

  const attestation = nodeA.broadcastTrustAttestation({
    subject: 'EAORCS-PLATINUM-CERT',
    trustScore: 99.8,
    status: 'VALIDATED'
  });
  assert(attestation.issuerNodeId === 'node-alpha', 'issuer mismatch');

  const verification = nodeB.verifyPeerAttestation(attestation);
  assert(verification.valid === true, 'attestation signature should be valid');

  const topology = nodeA.getFederatedNetworkTopology();
  assert(topology.peerCount === 1, 'topology peer count should be 1');
  console.log('      ✓ FederatedTrustNetworkNode Passed (P2P trust broadcast & verification clean)');

  console.log('\n================================================================');
  console.log('  BENCHMARK VAULT & FEDERATION SUITE: ALL CHECKS PASSED');
  console.log('================================================================\n');
}

runTest().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
