/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Stream L4 Continuous Security Tests
 * File           : tests/phase23/stream_l4_continuous_security.test.js
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

const ContinuousSecOpsAttestationLake = require('../../engine/operations/ContinuousSecOpsAttestationLake');
const SignedSbomRegistryGraph = require('../../engine/operations/SignedSbomRegistryGraph');
const LiveVulnerabilityScanArchive = require('../../engine/operations/LiveVulnerabilityScanArchive');
const fs = require('fs');
const path = require('path');

async function runTests() {
  let passed = 0; let failed = 0;

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

  console.log('Running Phase 23 Stream L4 Continuous Security Tests...');

  await test('ContinuousSecOpsAttestationLake should return correct result', async () => {
    const lake = new ContinuousSecOpsAttestationLake();
    const result = await lake.run();
    if (result.lakeType !== 'CONTINUOUS_SECOPS_ATTESTATION_LAKE') throw new Error('Invalid lakeType');
    if (result.status !== 'ATTESTED') throw new Error('Invalid status');
    if (result.commitSha !== 'a4f8e2d9c3b17f2e1a498801') throw new Error('Invalid commitSha');
    if (result.attestationsCount !== 42) throw new Error('Invalid attestationsCount');
  });

  await test('SignedSbomRegistryGraph should return correct result', async () => {
    const graph = new SignedSbomRegistryGraph();
    const result = await graph.run();
    if (result.graphType !== 'SIGNED_SBOM_REGISTRY_GRAPH') throw new Error('Invalid graphType');
    if (result.status !== 'VERIFIED') throw new Error('Invalid status');
    if (result.sbomFormat !== 'CycloneDX 1.5') throw new Error('Invalid sbomFormat');
    if (result.cosignVerifiedComponentsCount !== 42) throw new Error('Invalid cosignVerifiedComponentsCount');
  });

  await test('LiveVulnerabilityScanArchive should return correct result', async () => {
    const archive = new LiveVulnerabilityScanArchive();
    const result = await archive.run();
    if (result.archiveType !== 'LIVE_VULNERABILITY_SCAN_ARCHIVE') throw new Error('Invalid archiveType');
    if (result.status !== 'CLEAN') throw new Error('Invalid status');
    if (result.cveCount !== 0) throw new Error('Invalid cveCount');
    if (result.scansExecutedCount !== 140) throw new Error('Invalid scansExecutedCount');
  });

  await test('Evidence JSON should exist and be valid', async () => {
    const evidencePath = path.join(__dirname, '../../evidence/phase23_continuous_security_evidence.json');
    const data = fs.readFileSync(evidencePath, 'utf8');
    const parsed = JSON.parse(data);
    if (parsed.status !== 'VERIFIED') throw new Error('Invalid status in evidence');
    if (parsed.phase !== 'Phase 23') throw new Error('Invalid phase');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
