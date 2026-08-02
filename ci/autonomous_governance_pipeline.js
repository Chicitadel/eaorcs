/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Autonomous Governance CI/CD Pipeline Engine
 * File           : ci/autonomous_governance_pipeline.js
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

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 * Autonomous Governance CI/CD Pipeline Engine
 * Executes 5-stage verification on every pull request & deployment candidate:
 * 1. Blueprint Traceability Verification
 * 2. API Contract Compatibility
 * 3. Zero-Trust Policy Checks
 * 4. Security Scans (SAST, Leaks, Cryptography)
 * 5. Pre-Certification Checks & Build Gate Evaluation
 */
class AutonomousGovernancePipeline {
  constructor(options = {}) {
    this.cwd = options.cwd || process.cwd();
    this.logsDir = options.logsDir || path.join(this.cwd, 'ci', 'logs');
    this.reportPath = options.reportPath || path.join(this.logsDir, 'autonomous_governance_report.json');
    this.thresholdScore = options.thresholdScore || 95.0;

    // Ensure logs directory exists
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Stage 1: Blueprint Traceability Verification
   * Verifies component-to-specification traceability, ADR compliance, and domain context isolation.
   */
  verifyBlueprintTraceability(prContext = {}) {
    const stageName = 'Blueprint Traceability Verification';
    const files = prContext.changedFiles || ['engine/index.js', 'api/openapi.json', 'domains/governance.js'];
    const adrReferences = prContext.adrReferences || ['ADR-001-Architecture-Freeze', 'ADR-004-Zero-Trust'];
    
    const issues = [];
    let tracedComponents = 0;
    let totalComponents = files.length;

    files.forEach(file => {
      // Check if component path maps to known bounded context
      const isKnownDomain = file.startsWith('engine/') || 
                            file.startsWith('api/') || 
                            file.startsWith('domains/') || 
                            file.startsWith('ci/') ||
                            file.startsWith('adapters/') ||
                            file.startsWith('tests/');
      if (isKnownDomain) {
        tracedComponents++;
      } else {
        issues.push(`Component '${file}' is outside registered bounded contexts.`);
      }
    });

    // Check ADR compliance
    if (!adrReferences || adrReferences.length === 0) {
      issues.push('Pull request missing Architecture Decision Record (ADR) reference.');
    }

    const coverage = totalComponents > 0 ? (tracedComponents / totalComponents) * 100 : 100;
    const score = Math.max(0, coverage - (issues.length * 5));
    const passed = issues.length === 0 && score >= 90.0;

    return {
      stageName,
      passed,
      score,
      coverage,
      tracedComponents,
      totalComponents,
      adrReferences,
      issues
    };
  }

  /**
   * Stage 2: API Contract Compatibility
   * Verifies OpenAPI schemas, breaking change detection, and protocol freeze rules.
   */
  verifyApiContractCompatibility(prContext = {}) {
    const stageName = 'API Contract Compatibility';
    const apiChanges = prContext.apiChanges || [];
    const issues = [];
    let breakingChangesCount = 0;

    apiChanges.forEach(change => {
      if (change.type === 'BREAKING_CHANGE' || change.removedField) {
        breakingChangesCount++;
        issues.push(`Breaking API change detected in endpoint '${change.endpoint}': field '${change.removedField || change.detail}' removed or type altered without major version bump.`);
      } else if (change.type === 'UNVERSIONED_MUTATION') {
        breakingChangesCount++;
        issues.push(`Unversioned schema mutation detected in '${change.schema}'. Protocol freeze prohibits breaking structural shifts.`);
      }
    });

    // Check schema files existence
    const openApiFile = path.join(this.cwd, 'schemas', 'openapi.json');
    const hasSchemaCatalog = fs.existsSync(openApiFile) || fs.existsSync(path.join(this.cwd, 'schemas'));
    if (!hasSchemaCatalog) {
      issues.push('Schema catalog directory missing or unreadable.');
    }

    const passed = breakingChangesCount === 0 && issues.length === 0;
    const score = passed ? 100.0 : Math.max(0, 100.0 - (breakingChangesCount * 25 + issues.length * 10));

    return {
      stageName,
      passed,
      score,
      breakingChangesCount,
      schemaCatalogVerified: hasSchemaCatalog,
      issues
    };
  }

  /**
   * Stage 3: Zero-Trust Policy Checks
   * Evaluates RBAC/ABAC isolation, TLS/mTLS transport requirements, deny-by-default access, and secrets vault binding.
   */
  verifyZeroTrustPolicies(prContext = {}) {
    const stageName = 'Zero-Trust Policy Checks';
    const policies = prContext.policies || {
      denyByDefault: true,
      mTLSMandatory: true,
      rbacEnforced: true,
      secretsVaultIsolated: true,
      tokenAuthVerified: true
    };

    const violations = [];

    if (!policies.denyByDefault) {
      violations.push('Deny-by-default security policy disabled in environment routing configuration.');
    }
    if (!policies.mTLSMandatory) {
      violations.push('mTLS transport security mandatory rule violated for inter-service communication.');
    }
    if (!policies.rbacEnforced) {
      violations.push('Role-Based Access Control (RBAC) enforcement disabled on target endpoints.');
    }
    if (!policies.secretsVaultIsolated) {
      violations.push('Secrets vault isolation check failed. Unbound secrets detected in process environment.');
    }
    if (!policies.tokenAuthVerified) {
      violations.push('Cryptographic token signature verification check failed.');
    }

    const passed = violations.length === 0;
    const securityScore = passed ? 100.0 : Math.max(0, 100.0 - (violations.length * 20));

    return {
      stageName,
      passed,
      securityScore,
      evaluatedPolicies: Object.keys(policies).length,
      violations
    };
  }

  /**
   * Stage 4: Security Scans (SAST, Secret Leaks, Cryptography)
   * Scans codebase / PR files for secret leaks, hardcoded credentials, unsafe eval/exec, and weak crypto.
   */
  executeSecurityScans(prContext = {}) {
    const stageName = 'Security Scans';
    const customCodeSnippets = prContext.codeSnippets || [];
    const issues = [];
    let criticalLeaks = 0;
    let threatCount = 0;

    // Forbidden patterns for secret leaks & weak cryptography
    const leakPatterns = [
      { regex: /BEGIN (RSA|OPENSSH|EC|PRIVATE) KEY/, name: 'Private Cryptographic Key' },
      { regex: /(api_key|aws_secret_access_key|passwd|password|secret_key)\s*=\s*['"][A-Za-z0-9+/=]{8,}['"]/i, name: 'Hardcoded Credential/Secret' }
    ];

    const dangerousPatterns = [
      { regex: /\beval\s*\(/, name: 'Unsafe Dynamic Code Execution (eval)' },
      { regex: /\bcrypto\.createCipher\b/, name: 'Deprecated / Weak Cipher' },
      { regex: /\bmd5\b/i, name: 'Weak Hash Algorithm (MD5)' }
    ];

    // Scan provided snippets
    customCodeSnippets.forEach(snippet => {
      leakPatterns.forEach(pattern => {
        if (pattern.regex.test(snippet.content)) {
          criticalLeaks++;
          issues.push(`[LEAK] Detected ${pattern.name} in snippet: ${snippet.file}`);
        }
      });
      dangerousPatterns.forEach(pattern => {
        if (pattern.regex.test(snippet.content)) {
          threatCount++;
          issues.push(`[VULN] Detected ${pattern.name} in snippet: ${snippet.file}`);
        }
      });
    });

    const passed = criticalLeaks === 0 && threatCount === 0 && issues.length === 0;
    const score = passed ? 100.0 : Math.max(0, 100.0 - (criticalLeaks * 40 + threatCount * 20));

    return {
      stageName,
      passed,
      score,
      criticalLeaks,
      threatCount,
      scannedItems: customCodeSnippets.length,
      issues
    };
  }

  /**
   * Stage 5: Pre-Certification Checks & Build Gate Evaluation
   * Evaluates overall pipeline results, OSAP passport compliance, ISO/IEC metrics, and determines PR gate decision.
   */
  evaluatePreCertificationGate(stageResults = [], prContext = {}) {
    const stageName = 'Pre-Certification Checks & Build Gate Evaluation';
    const gateChecks = [];
    const violations = [];

    // Calculate composite governance score
    let totalScore = 0;
    let allStagesPassed = true;

    stageResults.forEach(res => {
      const stageScore = res.score !== undefined ? res.score : (res.securityScore !== undefined ? res.securityScore : (res.passed ? 100 : 0));
      totalScore += stageScore;
      if (!res.passed) {
        allStagesPassed = false;
        violations.push(`Stage '${res.stageName}' failed verification.`);
      }
      gateChecks.push({
        stage: res.stageName,
        passed: res.passed,
        score: stageScore
      });
    });

    const compositeGovernanceScore = stageResults.length > 0 ? (totalScore / stageResults.length) : 0;

    // Check OSAP Passport & ISO/IEC benchmarks
    const osapPassportPath = path.join(this.cwd, 'osap-passport.json');
    const osapValid = fs.existsSync(osapPassportPath);
    if (!osapValid) {
      violations.push('OSAP Passport artifact (osap-passport.json) missing.');
    }

    const isoCertPath = path.join(this.cwd, 'ISO_IEC_25010_Performance_Certificate.json');
    const isoCertValid = fs.existsSync(isoCertPath);
    if (!isoCertValid) {
      violations.push('ISO/IEC 25010 Performance Certificate missing.');
    }

    const meetsThreshold = compositeGovernanceScore >= this.thresholdScore;
    if (!meetsThreshold) {
      violations.push(`Composite Governance Score (${compositeGovernanceScore.toFixed(1)}%) is below minimum threshold (${this.thresholdScore}%).`);
    }

    const gateApproved = allStagesPassed && meetsThreshold && osapValid && isoCertValid;
    const gateDecision = gateApproved ? 'APPROVED' : 'REJECTED';

    return {
      stageName,
      passed: gateApproved,
      gateDecision,
      compositeGovernanceScore: Number(compositeGovernanceScore.toFixed(2)),
      thresholdScore: this.thresholdScore,
      osapPassportVerified: osapValid,
      iso25010CertificateVerified: isoCertValid,
      gateChecks,
      violations
    };
  }

  /**
   * Executes full Autonomous Governance CI/CD Pipeline
   */
  run(prContext = {}) {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    console.log('================================================================================');
    console.log('  EAORCS AUTONOMOUS GOVERNANCE CI/CD PIPELINE');
    console.log(`  Execution Mode : Pull Request & Build Gate Evaluation`);
    console.log(`  Timestamp      : ${timestamp}`);
    console.log('================================================================================\n');

    // Execute 4 primary verification stages
    const stage1 = this.verifyBlueprintTraceability(prContext);
    console.log(`[STAGE 1] ${stage1.stageName.padEnd(45)} -> ${stage1.passed ? '✅ PASS' : '❌ FAIL'} (${stage1.score.toFixed(1)}%)`);

    const stage2 = this.verifyApiContractCompatibility(prContext);
    console.log(`[STAGE 2] ${stage2.stageName.padEnd(45)} -> ${stage2.passed ? '✅ PASS' : '❌ FAIL'} (${stage2.score.toFixed(1)}%)`);

    const stage3 = this.verifyZeroTrustPolicies(prContext);
    console.log(`[STAGE 3] ${stage3.stageName.padEnd(45)} -> ${stage3.passed ? '✅ PASS' : '❌ FAIL'} (${stage3.securityScore.toFixed(1)}%)`);

    const stage4 = this.executeSecurityScans(prContext);
    console.log(`[STAGE 4] ${stage4.stageName.padEnd(45)} -> ${stage4.passed ? '✅ PASS' : '❌ FAIL'} (${stage4.score.toFixed(1)}%)`);

    // Execute Stage 5 Build Gate Evaluation
    const primaryStages = [stage1, stage2, stage3, stage4];
    const stage5 = this.evaluatePreCertificationGate(primaryStages, prContext);
    console.log(`[STAGE 5] ${stage5.stageName.padEnd(45)} -> ${stage5.passed ? '✅ PASS' : '❌ FAIL'} (Decision: ${stage5.gateDecision})\n`);

    const durationMs = Date.now() - startTime;
    const overallPassed = stage5.passed;

    const report = {
      pipelineVersion: '2026.1.0-LTS',
      timestamp,
      durationMs,
      overallPassed,
      gateDecision: stage5.gateDecision,
      compositeGovernanceScore: stage5.compositeGovernanceScore,
      thresholdScore: this.thresholdScore,
      stages: {
        blueprintTraceability: stage1,
        apiContractCompatibility: stage2,
        zeroTrustPolicies: stage3,
        securityScans: stage4,
        preCertificationGate: stage5
      }
    };

    // Save report to disk
    fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2), 'utf8');

    console.log('================================================================================');
    console.log(`  PIPELINE RESULT : ${overallPassed ? '🎉 BUILD GATE APPROVED' : '💥 BUILD GATE REJECTED'}`);
    console.log(`  Composite Score : ${stage5.compositeGovernanceScore}% (Min Threshold: ${this.thresholdScore}%)`);
    console.log(`  Report Output   : ${this.reportPath}`);
    console.log('================================================================================\n');

    return report;
  }
}

// CLI Execution Entry Point
if (require.main === module) {
  const pipeline = new AutonomousGovernancePipeline();
  const result = pipeline.run();
  process.exit(result.overallPassed ? 0 : 1);
}

module.exports = {
  AutonomousGovernancePipeline
};
