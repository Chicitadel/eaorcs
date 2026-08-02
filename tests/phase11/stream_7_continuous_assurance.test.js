/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Phase 11 Stream 7 — Continuous Assurance & Autonomous Governance CI/CD Test Suite
 * File           : tests/phase11/stream_7_continuous_assurance.test.js
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
 * - Corporate Policy Governed
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 * - OSAP v1.1 / v2.0
 *
 * Signatures:
 * - Enterprise Architecture Authority
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
const { ContinuousAssurancePipeline } = require('../../ci/ContinuousAssurancePipeline');

async function runStream7Tests() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 11 - STREAM 7: CONTINUOUS ASSURANCE & AUTONOMOUS GOVERNANCE CI/CD');
  console.log('  Testing Blueprint Traceability, API Contract Compatibility, Zero-Trust Policies,');
  console.log('  Security SAST Scans, Composite Score Calculation & Build Gate Decisions');
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
  // 1. Pipeline Initialization & Configuration Verification
  // ---------------------------------------------------------------------------
  await testStep('1. Pipeline Initialization & Configuration Verification', async () => {
    const pipeline = new ContinuousAssurancePipeline({ thresholdScore: 95.0, strictMode: true });
    assert.strictEqual(pipeline.thresholdScore, 95.0);
    assert.strictEqual(pipeline.strictMode, true);
    assert.ok(fs.existsSync(pipeline.logsDir), 'Logs directory should be created.');
    assert.ok(pipeline.reportPath.endsWith('continuous_assurance_report.json'));
  });

  // ---------------------------------------------------------------------------
  // 2. Blueprint Traceability Verification Stage Tests
  // ---------------------------------------------------------------------------
  await testStep('2. Blueprint Traceability Verification Stage Tests', async () => {
    const pipeline = new ContinuousAssurancePipeline();

    // Passing case
    const cleanContext = {
      changedFiles: ['engine/kernel.js', 'api/routes.js', 'domains/trust.js'],
      adrReferences: ['ADR-001-Architecture-Freeze', 'ADR-004-Zero-Trust']
    };
    const resClean = pipeline.verifyBlueprintTraceability(cleanContext);
    assert.strictEqual(resClean.passed, true);
    assert.strictEqual(resClean.issues.length, 0);
    assert.strictEqual(resClean.coverage, 100);

    // Failing case (untraced files & missing ADR)
    const badContext = {
      changedFiles: ['unapproved_directory/rogue_code.js'],
      adrReferences: []
    };
    const resBad = pipeline.verifyBlueprintTraceability(badContext);
    assert.strictEqual(resBad.passed, false);
    assert.ok(resBad.issues.length >= 2, 'Should report untraced component and missing ADR.');
  });

  // ---------------------------------------------------------------------------
  // 3. API Contract Compatibility Stage Tests
  // ---------------------------------------------------------------------------
  await testStep('3. API Contract Compatibility Stage Tests', async () => {
    const pipeline = new ContinuousAssurancePipeline();

    // Passing case
    const cleanContext = { apiChanges: [] };
    const resClean = pipeline.verifyApiContractCompatibility(cleanContext);
    assert.strictEqual(resClean.passed, true);
    assert.strictEqual(resClean.breakingChangesCount, 0);

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

    // Unversioned mutation case
    const mutationContext = {
      apiChanges: [
        { schema: 'UserRoleSchema', type: 'UNVERSIONED_MUTATION' }
      ]
    };
    const resMutation = pipeline.verifyApiContractCompatibility(mutationContext);
    assert.strictEqual(resMutation.passed, false);
    assert.strictEqual(resMutation.breakingChangesCount, 1);
  });

  // ---------------------------------------------------------------------------
  // 4. Zero-Trust Policy Enforcement Stage Tests
  // ---------------------------------------------------------------------------
  await testStep('4. Zero-Trust Policy Enforcement Stage Tests', async () => {
    const pipeline = new ContinuousAssurancePipeline();

    // Valid Zero-Trust Posture
    const validZTContext = {
      policies: {
        denyByDefault: true,
        mTLSMandatory: true,
        rbacEnforced: true,
        secretsVaultIsolated: true,
        tokenAuthVerified: true,
        leastPrivilegeScope: true
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
        tokenAuthVerified: true,
        leastPrivilegeScope: false
      }
    };
    const resInvalid = pipeline.verifyZeroTrustPolicies(invalidZTContext);
    assert.strictEqual(resInvalid.passed, false);
    assert.strictEqual(resInvalid.violations.length, 4);
  });

  // ---------------------------------------------------------------------------
  // 5. Security Scans Stage Tests (SAST, Leaks, Cryptography)
  // ---------------------------------------------------------------------------
  await testStep('5. Security Scans Stage Tests (SAST, Leaks, Cryptography)', async () => {
    const pipeline = new ContinuousAssurancePipeline();

    // Clean snippets
    const cleanSnippets = [
      { file: 'engine/safe.js', content: 'const crypto = require("crypto"); const hash = crypto.createHash("sha256");' }
    ];
    const resClean = pipeline.executeSecurityScans({ codeSnippets: cleanSnippets });
    assert.strictEqual(resClean.passed, true);
    assert.strictEqual(resClean.criticalLeaks, 0);
    assert.strictEqual(resClean.threatCount, 0);

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
  // 6. Pre-Certification Checks & Build Gate Evaluation Tests
  // ---------------------------------------------------------------------------
  await testStep('6. Pre-Certification Checks & Build Gate Evaluation Tests', async () => {
    const pipeline = new ContinuousAssurancePipeline({ thresholdScore: 95.0 });

    const passingStages = [
      { stageName: 'Blueprint Traceability Verification', passed: true, score: 100 },
      { stageName: 'API Contract Compatibility', passed: true, score: 100 },
      { stageName: 'Zero-Trust Policy Checks', passed: true, securityScore: 100 },
      { stageName: 'Security Scans', passed: true, score: 100 }
    ];

    const gateApproved = pipeline.evaluatePreCertificationGate(passingStages);
    assert.strictEqual(gateApproved.gateDecision, 'APPROVED');
    assert.strictEqual(gateApproved.compositeGovernanceScore, 100.0);
    assert.strictEqual(gateApproved.passed, true);

    const failingStages = [
      { stageName: 'Blueprint Traceability Verification', passed: true, score: 100 },
      { stageName: 'API Contract Compatibility', passed: false, score: 50 },
      { stageName: 'Zero-Trust Policy Checks', passed: true, securityScore: 100 },
      { stageName: 'Security Scans', passed: true, score: 100 }
    ];

    const gateRejected = pipeline.evaluatePreCertificationGate(failingStages);
    assert.strictEqual(gateRejected.gateDecision, 'REJECTED');
    assert.strictEqual(gateRejected.passed, false);
  });

  // ---------------------------------------------------------------------------
  // 7. End-to-End Pipeline Execution & Report Artifact Generation Tests
  // ---------------------------------------------------------------------------
  await testStep('7. End-to-End Governance Pipeline Execution & Report Generation', async () => {
    const customReportPath = path.join(process.cwd(), 'ci', 'logs', 'test_continuous_assurance_report.json');
    const pipeline = new ContinuousAssurancePipeline({
      reportPath: customReportPath,
      thresholdScore: 95.0
    });

    const prContext = {
      changedFiles: ['engine/index.js', 'api/openapi.json'],
      adrReferences: ['ADR-001-Architecture-Freeze'],
      apiChanges: [],
      policies: {
        denyByDefault: true,
        mTLSMandatory: true,
        rbacEnforced: true,
        secretsVaultIsolated: true,
        tokenAuthVerified: true,
        leastPrivilegeScope: true
      },
      codeSnippets: [
        { file: 'engine/index.js', content: 'const sha256 = crypto.createHash("sha256");' }
      ]
    };

    const report = pipeline.run(prContext);
    assert.strictEqual(report.overallPassed, true);
    assert.strictEqual(report.gateDecision, 'APPROVED');
    assert.ok(fs.existsSync(customReportPath), 'Report file must be written to disk.');

    const savedContent = JSON.parse(fs.readFileSync(customReportPath, 'utf8'));
    assert.strictEqual(savedContent.gateDecision, 'APPROVED');
    assert.strictEqual(savedContent.compositeGovernanceScore, 100);

    // Clean up temporary test report artifact
    if (fs.existsSync(customReportPath)) {
      fs.unlinkSync(customReportPath);
    }
  });

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log(`  STREAM 7 CONTINUOUS ASSURANCE TEST SUITE SUMMARY: Passed: ${passed} | Failed: ${failed}`);
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
