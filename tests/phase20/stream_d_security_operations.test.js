'use strict';

/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Tests
 * File           : tests/phase20/stream_d_security_operations.test.js
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

const assert = require('assert');
const AutomatedSecOpsOrchestrator = require('../../engine/validation/AutomatedSecOpsOrchestrator.js');
const LiveVulnerabilityScannerBridge = require('../../engine/validation/LiveVulnerabilityScannerBridge.js');
const AttestedSbomSigner = require('../../engine/validation/AttestedSbomSigner.js');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  console.log('Running Phase 20 Stream D Tests...');

  await test('AutomatedSecOpsOrchestrator test', async () => {
    const orchestrator = new AutomatedSecOpsOrchestrator();
    const result = await orchestrator.run();
    assert.strictEqual(result.orchestratorType, 'AUTOMATED_SECOPS_ORCHESTRATOR');
    assert.deepStrictEqual(result.pipelineScans, ['SAST', 'DAST', 'DEPENDENCY_CHECK', 'CONTAINER_SCAN']);
    assert.strictEqual(result.criticalVulnerabilities, 0);
    assert.strictEqual(result.highVulnerabilities, 0);
    assert.strictEqual(result.secOpsVerdict, 'SECURE');
    assert.strictEqual(result.status, 'PASS');
  });

  await test('LiveVulnerabilityScannerBridge test', async () => {
    const bridge = new LiveVulnerabilityScannerBridge();
    const result = await bridge.run();
    assert.strictEqual(result.scannerBridgeType, 'LIVE_VULNERABILITY_SCANNER_BRIDGE');
    assert.deepStrictEqual(result.scannerEngines, ['Semgrep', 'OWASP ZAP', 'Trivy']);
    assert.ok(result.lastScanTimestamp);
    assert.strictEqual(result.cveCount, 0);
    assert.strictEqual(result.status, 'CLEAN');
  });

  await test('AttestedSbomSigner test', async () => {
    const signer = new AttestedSbomSigner();
    const result = await signer.run();
    assert.strictEqual(result.signerType, 'ATTESTED_SBOM_SIGNER');
    assert.strictEqual(result.sbomFormat, 'CycloneDX 1.5');
    assert.strictEqual(result.signedComponentsCount, 42);
    assert.strictEqual(result.signatureAlgorithm, 'Ed25519');
    assert.strictEqual(result.cosignVerified, true);
    assert.strictEqual(result.status, 'SIGNED');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
