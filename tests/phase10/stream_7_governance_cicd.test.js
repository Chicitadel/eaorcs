/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 10 Stream 7 — Autonomous Governance CI/CD Test Suite
 * File           : tests/phase10/stream_7_governance_cicd.test.js
 * Version        : 2026.1.0-LTS
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { AutonomousGovernancePipeline } = require('../../ci/autonomous_governance_pipeline');

async function runStream7Tests() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 10 - STREAM 7: AUTONOMOUS GOVERNANCE CI/CD TEST SUITE');
  console.log('  Testing Blueprint Traceability, API Contract Compatibility, Zero-Trust Policies,');
  console.log('  Security SAST Scans, Pre-Certification Checks & PR Build Gate Evaluation');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  async function testStep(name, fn) {
    process.stdout.write(`[TEST] ${name.padEnd(65)} ... `);
    try {
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log(`❌ FAIL (${err.message})`);
      console.error(err.stack);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Pipeline Initialization & Configuration
  // ---------------------------------------------------------------------------
  await testStep('1. Pipeline Initialization & Workspace Verification', async () => {
    const pipeline = new AutonomousGovernancePipeline({ thresholdScore: 95.0 });
    assert.strictEqual(pipeline.thresholdScore, 95.0);
    assert.ok(fs.existsSync(pipeline.logsDir), 'Logs directory should be created.');
    assert.ok(pipeline.reportPath.endsWith('autonomous_governance_report.json'));
  });

  // ---------------------------------------------------------------------------
  // 2. Blueprint Traceability Verification Stage
  // ---------------------------------------------------------------------------
  await testStep('2. Blueprint Traceability Verification Stage', async () => {
    const pipeline = new AutonomousGovernancePipeline();

    // Passing case
    const cleanContext = {
      changedFiles: ['engine/kernel.js', 'api/routes.js', 'domains/trust.js'],
      adrReferences: ['ADR-001-Architecture-Freeze']
    };
    const resClean = pipeline.verifyBlueprintTraceability(cleanContext);
    assert.strictEqual(resClean.passed, true);
    assert.strictEqual(resClean.issues.length, 0);

    // Failing case (untraced files & missing ADR)
    const badContext = {
      changedFiles: ['unapproved_folder/rogue.js'],
      adrReferences: []
    };
    const resBad = pipeline.verifyBlueprintTraceability(badContext);
    assert.strictEqual(resBad.passed, false);
    assert.ok(resBad.issues.length >= 2, 'Should report untraced component and missing ADR.');
  });

  // ---------------------------------------------------------------------------
  // 3. API Contract Compatibility Stage
  // ---------------------------------------------------------------------------
  await testStep('3. API Contract Compatibility Stage', async () => {
    const pipeline = new AutonomousGovernancePipeline();

    // Passing case
    const cleanContext = { apiChanges: [] };
    const resClean = pipeline.verifyApiContractCompatibility(cleanContext);
    assert.strictEqual(resClean.passed, true);

    // Breaking change case
    const breakingContext = {
      apiChanges: [
        { endpoint: '/api/v1/trust/verify', removedField: 'signature', type: 'BREAKING_CHANGE' }
      ]
    };
    const resBreaking = pipeline.verifyApiContractCompatibility(breakingContext);
    assert.strictEqual(resBreaking.passed, false);
    assert.strictEqual(resBreaking.breakingChangesCount, 1);
    assert.ok(resBreaking.issues[0].includes('/api/v1/trust/verify'));
  });

  // ---------------------------------------------------------------------------
  // 4. Zero-Trust Policy Enforcement Stage
  // ---------------------------------------------------------------------------
  await testStep('4. Zero-Trust Policy Enforcement Stage', async () => {
    const pipeline = new AutonomousGovernancePipeline();

    // Valid Zero-Trust Posture
    const validZTContext = {
      policies: {
        denyByDefault: true,
        mTLSMandatory: true,
        rbacEnforced: true,
        secretsVaultIsolated: true,
        tokenAuthVerified: true
      }
    };
    const resValid = pipeline.verifyZeroTrustPolicies(validZTContext);
    assert.strictEqual(resValid.passed, true);
    assert.strictEqual(resValid.securityScore, 100.0);

    // Violating Zero-Trust Posture
    const invalidZTContext = {
      policies: {
        denyByDefault: false,
        mTLSMandatory: false,
        rbacEnforced: true,
        secretsVaultIsolated: false,
        tokenAuthVerified: true
      }
    };
    const resInvalid = pipeline.verifyZeroTrustPolicies(invalidZTContext);
    assert.strictEqual(resInvalid.passed, false);
    assert.strictEqual(resInvalid.violations.length, 3);
  });

  // ---------------------------------------------------------------------------
  // 5. Security Scans Stage (SAST & Vulnerability Scans)
  // ---------------------------------------------------------------------------
  await testStep('5. Security Scans Stage (SAST, Leaks, Cryptography)', async () => {
    const pipeline = new AutonomousGovernancePipeline();

    // Clean snippets
    const cleanSnippets = [
      { file: 'engine/safe.js', content: 'const crypto = require("crypto"); const hash = crypto.createHash("sha256");' }
    ];
    const resClean = pipeline.executeSecurityScans({ codeSnippets: cleanSnippets });
    assert.strictEqual(resClean.passed, true);

    // Leaky and unsafe snippets
    const unsafeSnippets = [
      { file: 'config/keys.js', content: 'const secret_key = "dGhpcyBpcyBhIHNlY3JldA==";' },
      { file: 'engine/unsafe.js', content: 'eval(userInput);' }
    ];
    const resUnsafe = pipeline.executeSecurityScans({ codeSnippets: unsafeSnippets });
    assert.strictEqual(resUnsafe.passed, false);
    assert.ok(resUnsafe.criticalLeaks > 0 || resUnsafe.threatCount > 0);
  });

  // ---------------------------------------------------------------------------
  // 6. Pre-Certification Checks & Build Gate Evaluations
  // ---------------------------------------------------------------------------
  await testStep('6. Pre-Certification Checks & Build Gate Evaluation', async () => {
    const pipeline = new AutonomousGovernancePipeline({ thresholdScore: 95.0 });

    const passingStages = [
      { stageName: 'Blueprint Traceability', passed: true, score: 100 },
      { stageName: 'API Contract Compatibility', passed: true, score: 100 },
      { stageName: 'Zero-Trust Policies', passed: true, securityScore: 100 },
      { stageName: 'Security Scans', passed: true, score: 100 }
    ];

    const gateApproved = pipeline.evaluatePreCertificationGate(passingStages);
    assert.strictEqual(gateApproved.gateDecision, 'APPROVED');
    assert.strictEqual(gateApproved.compositeGovernanceScore, 100.0);

    const failingStages = [
      { stageName: 'Blueprint Traceability', passed: true, score: 100 },
      { stageName: 'API Contract Compatibility', passed: false, score: 50 },
      { stageName: 'Zero-Trust Policies', passed: true, securityScore: 100 },
      { stageName: 'Security Scans', passed: true, score: 100 }
    ];

    const gateRejected = pipeline.evaluatePreCertificationGate(failingStages);
    assert.strictEqual(gateRejected.gateDecision, 'REJECTED');
  });

  // ---------------------------------------------------------------------------
  // 7. End-to-End Pipeline Execution & Report Artifact Generation
  // ---------------------------------------------------------------------------
  await testStep('7. End-to-End Governance Pipeline Execution & Report Generation', async () => {
    const customReportPath = path.join(process.cwd(), 'ci', 'logs', 'test_stream7_report.json');
    const pipeline = new AutonomousGovernancePipeline({
      reportPath: customReportPath,
      thresholdScore: 95.0
    });

    const prContext = {
      changedFiles: ['engine/saas/SaaSProductPlatform.js', 'api/routes.js'],
      adrReferences: ['ADR-001-Architecture-Freeze'],
      apiChanges: [],
      policies: {
        denyByDefault: true,
        mTLSMandatory: true,
        rbacEnforced: true,
        secretsVaultIsolated: true,
        tokenAuthVerified: true
      },
      codeSnippets: [
        { file: 'engine/saas/SaaSProductPlatform.js', content: 'const sha256 = crypto.createHash("sha256");' }
      ]
    };

    const report = pipeline.run(prContext);
    assert.strictEqual(report.overallPassed, true);
    assert.strictEqual(report.gateDecision, 'APPROVED');
    assert.ok(fs.existsSync(customReportPath), 'Report file must be saved on disk.');

    const savedContent = JSON.parse(fs.readFileSync(customReportPath, 'utf8'));
    assert.strictEqual(savedContent.gateDecision, 'APPROVED');
    assert.strictEqual(savedContent.compositeGovernanceScore, 100);

    // Clean up temporary test report
    if (fs.existsSync(customReportPath)) {
      fs.unlinkSync(customReportPath);
    }
  });

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log(`  STREAM 7 TEST SUITE SUMMARY: Passed: ${passed} | Failed: ${failed}`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  runStream7Tests();
}

module.exports = { runStream7Tests };
