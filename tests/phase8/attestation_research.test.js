/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 8 Attestation & Research Test Suite
 * File           : tests/phase8/attestation_research.test.js
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
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { ThirdPartyLabAttestationEngine } = require('../../engine/audit/ThirdPartyLabAttestationEngine');
const { ReproducibleResearchExporter } = require('../../engine/research/ReproducibleResearchExporter');

async function runTest() {
  console.log('================================================================');
  console.log('  EAORCS PHASE 8: LAB ATTESTATION & RESEARCH EXPORTER SUITE');
  console.log('================================================================\n');

  // 1. Lab Attestation
  console.log('[1/2] Testing ThirdPartyLabAttestationEngine...');
  const keyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  const engine = new ThirdPartyLabAttestationEngine();
  const lab = engine.registerAuditingLab('lab-tuv', { name: 'TÜV Rheinland Cyber Security Lab' }, keyPair.publicKey);
  assert(lab.labId === 'lab-tuv', 'labId mismatch');

  const attestationData = {
    artifactHash: '0167cc8c36a4fdb8bd78e2f9a19d6dcc2c92052a6a11f7f89c5af2e75115ab16',
    scope: 'ISO 27001 / SOC 2 Type II / DORA',
    verdict: 'PASSED_EXEMPLARY',
    metrics: { passRate: 100 }
  };

  const canonical = JSON.stringify(attestationData, Object.keys(attestationData).sort());
  const signer = crypto.createSign('SHA256');
  signer.update(canonical);
  const signature = signer.sign(keyPair.privateKey, 'hex');

  const record = engine.submitAttestation('lab-tuv', attestationData, signature);
  assert(record.attestationId.startsWith('ATTEST-'), 'Attestation ID prefix mismatch');

  const ver = engine.verifyAttestationSignature(record.attestationId);
  assert(ver.valid === true, 'Lab attestation signature should be valid');

  const list = engine.getLabAttestations('0167cc8c36a4fdb8bd78e2f9a19d6dcc2c92052a6a11f7f89c5af2e75115ab16');
  assert(list.length === 1, 'Attestations list should contain 1 item');
  console.log('      ✓ ThirdPartyLabAttestationEngine Passed (ISO/NIST lab attestation verified)');

  // 2. Research Exporter
  console.log('[2/2] Testing ReproducibleResearchExporter...');
  const tmpDir = path.join(process.cwd(), 'docs', 'research', 'tmp_test');
  const exporter = new ReproducibleResearchExporter(tmpDir);

  const paper = exporter.exportResearchPaper('EAORCS Architecture & Empirical Evaluation');
  assert(paper.paperId.startsWith('PAPER-'), 'Paper ID prefix mismatch');
  assert(fs.existsSync(paper.filePath), 'Paper Markdown file should exist');

  const texFile = exporter.generateLatexDocument(paper);
  assert(fs.existsSync(texFile), 'LaTeX file should exist');

  const jsonPkg = exporter.exportDataPackage();
  assert(fs.existsSync(jsonPkg), 'Data package JSON file should exist');

  const repro = exporter.verifyResearchReproducibility(paper.paperId);
  assert(repro.reproducible === true, 'Research should be verifiable and reproducible');
  console.log('      ✓ ReproducibleResearchExporter Passed (Paper, LaTeX & Data Package exported)');

  // Cleanup tmp dir
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log('\n================================================================');
  console.log('  LAB ATTESTATION & RESEARCH EXPORTER SUITE: ALL CHECKS PASSED');
  console.log('================================================================\n');
}

runTest().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
