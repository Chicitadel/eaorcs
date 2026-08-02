/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Clean Build & Deterministic Release Audit
 * File           : run_clean_build.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems / Air Roofers Architecture Authority
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
const CleanBuildValidator = require('./CleanBuildValidator');
const DeterministicReleaseAuditor = require('./DeterministicReleaseAuditor');

function main() {
  const cwd = process.cwd();
  const qualityLogsDir = path.join(cwd, 'quality', 'logs');
  const docsDir = path.join(cwd, 'docs');

  if (!fs.existsSync(qualityLogsDir)) {
    fs.mkdirSync(qualityLogsDir, { recursive: true });
  }
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  console.log('\n================================================================');
  console.log('  [EAORCS CLEAN BUILD & DETERMINISTIC RELEASE AUDIT]');
  console.log('  Authority: Ujomor Systems / Air Roofers Architecture Authority');
  console.log('================================================================\n');

  // Step 1: Audit existing release artifacts
  console.log('[1/3] Auditing existing release artifacts...');
  const auditor = new DeterministicReleaseAuditor(cwd);
  const auditResults = auditor.auditAllArtifacts();

  console.log('\nRelease Artifact Audit Table:');
  console.log('-'.repeat(80));
  console.log(
    'Artifact Path'.padEnd(45) +
    'Exists'.padEnd(10) +
    'SHA-256 (16)'.padEnd(18) +
    'Valid'
  );
  console.log('-'.repeat(80));

  let allArtifactsValid = true;
  for (const r of auditResults) {
    const existsStr = r.exists ? 'YES' : 'NO';
    const shaShort = r.sha256 ? r.sha256.substring(0, 16) : 'N/A';
    const validStr = r.valid ? 'PASS' : 'FAIL';
    if (!r.valid || !r.exists) {
      allArtifactsValid = false;
    }
    console.log(
      r.path.padEnd(45) +
      existsStr.padEnd(10) +
      shaShort.padEnd(18) +
      validStr
    );
  }
  console.log('-'.repeat(80) + '\n');

  // Step 2: Running clean build validation
  console.log('[2/3] Running clean build validation...');
  const validator = new CleanBuildValidator(cwd);
  const buildResult = validator.validateCleanBuild();

  console.log(`\nClean Build Results:`);
  console.log(`  Run 1: Exit Code ${buildResult.run1.exitCode}, Streams Passed ${buildResult.run1.passCount}`);
  console.log(`  Run 2: Exit Code ${buildResult.run2.exitCode}, Streams Passed ${buildResult.run2.passCount}`);

  const consistencyVerdict = buildResult.consistent ? 'CONSISTENT' : 'INCONSISTENT';
  console.log(`  Consistency: ${consistencyVerdict}\n`);

  // Step 3: Generating deterministic audit report
  console.log('[3/3] Generating deterministic audit report...');
  const reportData = auditor.generateAuditReport(auditResults);

  let fullMarkdown = reportData.markdown;
  fullMarkdown += '## 4. Clean Build & Byte-for-Byte Reproducibility Verdict\n\n';
  fullMarkdown += `| Build Run | Exit Code | Streams Passed | Total Streams | Duration | Log Output |\n`;
  fullMarkdown += `| --- | --- | --- | --- | --- | --- |\n`;
  fullMarkdown += `| Run 1 | \`${buildResult.run1.exitCode}\` | ${buildResult.run1.passCount} | ${buildResult.run1.totalStreams} | ${buildResult.run1.durationMs}ms | \`quality/logs/clean_build_1.log\` |\n`;
  fullMarkdown += `| Run 2 | \`${buildResult.run2.exitCode}\` | ${buildResult.run2.passCount} | ${buildResult.run2.totalStreams} | ${buildResult.run2.durationMs}ms | \`quality/logs/clean_build_2.log\` |\n\n`;

  fullMarkdown += `### Clean Build Consistency Verdict: **${consistencyVerdict}**\n\n`;
  if (buildResult.consistent) {
    fullMarkdown += `✅ Executing \`npm run certify\` twice from a clean state produces identical stream execution exit codes and pass counts.\n`;
    fullMarkdown += `✅ Regenerable log artifacts were successfully purged prior to each run and deterministically reconstituted.\n`;
  } else {
    fullMarkdown += `❌ Inconsistency detected between clean build runs. Review logs in \`quality/logs/\` for details.\n`;
  }

  const reportFilePath = path.join(docsDir, 'clean_build_report.md');
  fs.writeFileSync(reportFilePath, fullMarkdown, 'utf8');
  console.log(`Audit report written to: docs/clean_build_report.md\n`);

  // Summary and Exit
  const overallSuccess = allArtifactsValid && buildResult.consistent;
  console.log('================================================================');
  if (overallSuccess) {
    console.log('  FINAL VERDICT: 🟢 CLEAN BUILD & DETERMINISTIC RELEASE AUDIT PASSED');
    console.log('  All 7 release artifacts hashed, verified, and clean builds consistent.');
    console.log('================================================================\n');
    process.exit(0);
  } else {
    console.log('  FINAL VERDICT: 🔴 AUDIT FAILED');
    console.log(`  Artifacts Valid: ${allArtifactsValid}, Build Consistency: ${consistencyVerdict}`);
    console.log('================================================================\n');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
