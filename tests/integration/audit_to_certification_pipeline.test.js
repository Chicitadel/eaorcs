/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS System Integration Hardening Test Suite
 * File           : audit_to_certification_pipeline.test.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Authority & Verification Team
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
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

const _mTrust = require('../../engine/trust/TrustScoreCalculator');
const TrustScoreCalculator = typeof _mTrust === 'function' ? _mTrust : (_mTrust.TrustScoreCalculator || _mTrust);

const _mEvid = require('../../engine/trust/EvidenceEngine');
const EvidenceEngine = typeof _mEvid === 'function' ? _mEvid : (_mEvid.EvidenceEngine || _mEvid);

const _mCert = require('../../engine/trust/CertificationEngine');
const CertificationEngine = typeof _mCert === 'function' ? _mCert : (_mCert.CertificationEngine || _mCert);

const _mOsap = require('../../engine/osap/OsapEngine');
const OsapEngine = typeof _mOsap === 'function' ? _mOsap : (_mOsap.OsapEngine || _mOsap);

const _mSign = require('../../engine/osap/CryptoSigner');
const CryptoSigner = typeof _mSign === 'function' ? _mSign : (_mSign.CryptoSigner || _mSign);

async function runPipeline() {
  let passed = 0, failed = 0;
  const errors = [];

  async function step(name, fn) {
    try {
      const r = await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
      return r;
    } catch(e) {
      console.error(`  [FAIL] ${name}: ${e.message}`);
      failed++;
      errors.push(name);
      return null;
    }
  }

  console.log('--- Pipeline: Audit → Certification ---');

  // Step 1: Generate 50 mock findings
  const findings = Array.from({ length: 50 }, (_, i) => ({
    finding: `Finding-${i}`,
    severity: i < 5 ? 'CRITICAL' : i < 15 ? 'HIGH' : i < 30 ? 'MEDIUM' : 'LOW',
    domain: ['security', 'architecture', 'compliance', 'performance', 'reliability'][i % 5]
  }));

  // Step 2: Build evidence bundle
  let evidenceBundle;
  await step('EvidenceEngine builds Merkle bundle from 50 findings', async () => {
    const engine = new EvidenceEngine();
    evidenceBundle = engine.collectEvidence ? engine.collectEvidence(findings) : engine.buildMerkleTree(findings);
    const root = evidenceBundle.merkleRoot || evidenceBundle.root || evidenceBundle.hash;
    assert.ok(root, 'Merkle root hash must exist');
    return evidenceBundle;
  });

  // Step 3: Calculate trust score
  let trustResult;
  await step('TrustScoreCalculator computes score from evidence', async () => {
    const calculator = new TrustScoreCalculator();
    trustResult = calculator.calculateTrustScore({
      readinessScore: 90,
      evidenceScore: 90,
      confidenceScore: 88,
      criticalFailures: 0,
      findings
    });
    assert.ok(trustResult, 'Trust score calculation result must not be null');
    assert.ok(typeof trustResult.trustScore === 'number', 'trustScore must be a number');
    return trustResult;
  });

  // Step 4: Issue certificate
  let certificate;
  await step('CertificationEngine issues certificate', async () => {
    const certEngine = new CertificationEngine();
    certificate = await certEngine.issueCertificate({
      artifactId: 'pipeline-artifact-001',
      trustScore: trustResult ? trustResult.trustScore : 90,
      readinessScore: 90,
      criticalFailures: 0
    }, { name: 'pipeline-artifact-001' });
    assert.ok(certificate, 'Issued certificate must not be null');
    return certificate;
  });

  // Step 5: Compile OSAP passport
  let passport;
  await step('OsapEngine compiles OSAP v2.0 passport', async () => {
    const osapEngine = new OsapEngine();
    passport = await osapEngine.compilePassport({
      artifactId: 'pipeline-artifact-001',
      trustScore: trustResult ? trustResult.trustScore : 90,
      readinessScore: 90,
      criticalFailures: 0,
      tier: 'Gold',
      trustReport: trustResult,
      certification: certificate
    });
    assert.ok(passport, 'Compiled OSAP passport must not be null');
    return passport;
  });

  // Step 6: Sign with Ed25519
  let signature, keypair;
  await step('CryptoSigner signs passport with Ed25519', async () => {
    const signer = new CryptoSigner();
    keypair = await signer.generateKeyPair();
    const sigRes = await signer.signPayload(passport, keypair.privateKey);
    signature = sigRes.signature || sigRes;
    assert.ok(signature, 'Ed25519 signature must not be null');
    return signature;
  });

  // Step 7: Verify signature
  await step('CryptoSigner verifies passport signature', async () => {
    const signer = new CryptoSigner();
    const isValid = await signer.verifySignature(passport, signature, keypair.publicKey);
    assert.strictEqual(isValid, true, 'Passport signature must be cryptographically valid');
    return isValid;
  });

  // Step 8: Chain integrity
  await step('Full pipeline chain is unbroken', async () => {
    assert.ok(evidenceBundle, 'Evidence bundle must be valid');
    assert.ok(trustResult, 'Trust result must be valid');
    assert.ok(certificate, 'Certificate must be valid');
    assert.ok(passport, 'Passport must be valid');
    assert.ok(signature, 'Signature must be valid');
    return true;
  });

  return { passed, failed, errors };
}

module.exports = { runPipeline };
if (require.main === module) {
  runPipeline().then(r => { if (r.failed > 0) process.exit(1); }).catch(e => { console.error(e); process.exit(1); });
}
