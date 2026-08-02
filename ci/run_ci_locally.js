/******************************************************************************
 * Project        : EAORCS (Enterprise Autonomous Operation & Regulatory Compliance System)
 * Module         : Local CI CLI Execution Entrypoint
 * File           : run_ci_locally.js
 * Version        : 2026.1.0-lts
 * Author         : Human Author / Software Governance Authority
 * Organization   : EAORCS Core Team
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE
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
 * Copyright (c) 2026 EAORCS Core Team
 * All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const { CiOrchestrator } = require('./CiOrchestrator');

function runCiLocally() {
  console.log('================================================================');
  console.log('  EAORCS LOCAL CI SIMULATION ENGINE');
  console.log('================================================================\n');

  const orchestrator = new CiOrchestrator();
  const summary = orchestrator.run();

  // Print CI summary table
  console.log('------------------------------------------------------------------------------------------------------------------');
  console.log('| Stream Name                 | Status | Exit Code | Duration (ms) | Log Path                                   |');
  console.log('------------------------------------------------------------------------------------------------------------------');

  summary.streams.forEach(stream => {
    const namePadded = stream.name.padEnd(27, ' ');
    const statusPadded = stream.status.padEnd(6, ' ');
    const codePadded = (stream.exitCode !== null ? String(stream.exitCode) : 'N/A').padEnd(9, ' ');
    const durationPadded = String(stream.durationMs).padEnd(13, ' ');
    const relativeLogPath = path.relative(process.cwd(), stream.logPath).replace(/\\/g, '/');
    const logPadded = relativeLogPath.padEnd(42, ' ');
    console.log(`| ${namePadded} | ${statusPadded} | ${codePadded} | ${durationPadded} | ${logPadded} |`);
  });

  console.log('------------------------------------------------------------------------------------------------------------------');
  console.log(`\nSUMMARY:`);
  console.log(`  Passed   : ${summary.totalPass}`);
  console.log(`  Failed   : ${summary.totalFail}`);
  console.log(`  Skipped  : ${summary.totalSkip}`);
  console.log(`  Duration : ${(summary.totalDurationMs / 1000).toFixed(2)}s (${summary.totalDurationMs} ms)\n`);

  // Write markdown report to docs/ci_execution_log.md
  const docsDir = path.join(process.cwd(), 'docs');
  fs.mkdirSync(docsDir, { recursive: true });

  const mdReportPath = path.join(docsDir, 'ci_execution_log.md');
  const timestamp = new Date().toISOString();

  let markdown = `# EAORCS CI Execution Log\n\n`;
  markdown += `**Execution Time:** ${timestamp}  \n`;
  markdown += `**Total Streams:** ${summary.streams.length} | **Passed:** ${summary.totalPass} | **Failed:** ${summary.totalFail} | **Skipped:** ${summary.totalSkip}  \n`;
  markdown += `**Total Duration:** ${(summary.totalDurationMs / 1000).toFixed(2)}s (${summary.totalDurationMs} ms)\n\n`;
  markdown += `## Stream Execution Results\n\n`;
  markdown += `| Stream Name | Script | Status | Exit Code | Duration (ms) | Log Artifact |\n`;
  markdown += `| :--- | :--- | :---: | :---: | :---: | :--- |\n`;

  summary.streams.forEach(s => {
    const relLog = path.relative(process.cwd(), s.logPath).replace(/\\/g, '/');
    const statusIcon = s.status === 'PASS' ? '✅ PASS' : (s.status === 'FAIL' ? '❌ FAIL' : '⚠️ SKIP');
    markdown += `| **${s.name}** | \`${s.script}\` | ${statusIcon} | \`${s.exitCode !== null ? s.exitCode : 'N/A'}\` | ${s.durationMs} | [\`${path.basename(s.logPath)}\`](../${relLog}) |\n`;
  });

  markdown += `\n---\n*Report generated automatically by EAORCS Local CI Orchestrator*\n`;

  fs.writeFileSync(mdReportPath, markdown, 'utf8');
  console.log(`[REPORT] Markdown summary saved to ${path.relative(process.cwd(), mdReportPath).replace(/\\/g, '/')}`);

  if (summary.totalFail > 0) {
    console.error(`\n[FAILURE] ${summary.totalFail} stream(s) failed validation.`);
    if (require.main === module) {
      process.exit(1);
    }
  } else {
    console.log(`\n[SUCCESS] All streams qualified successfully.`);
    if (require.main === module) {
      process.exit(0);
    }
  }
}

if (require.main === module) {
  runCiLocally();
}

module.exports = { runCiLocally };
