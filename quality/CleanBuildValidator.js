/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Clean Build & Deterministic Release Audit
 * File           : CleanBuildValidator.js
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
const { spawnSync } = require('child_process');

class CleanBuildValidator {
  constructor(cwd) {
    this.cwd = cwd || process.cwd();
  }

  /**
   * Remove regenerable artifacts to simulate a clean state:
   * - ci/logs/*.log
   * - docs/certify_run_output.json
   * - docs/ci_execution_log.md
   * - docs/reproducibility_report.md
   *
   * Stable release artifacts (docs/product_readiness_certificate.json,
   * evidence/signed_evidence_bundle.json, etc.) are NOT removed.
   */
  cleanArtifacts() {
    const ciLogsDir = path.join(this.cwd, 'ci', 'logs');
    if (fs.existsSync(ciLogsDir)) {
      try {
        const files = fs.readdirSync(ciLogsDir);
        for (const file of files) {
          if (file.endsWith('.log')) {
            try {
              fs.unlinkSync(path.join(ciLogsDir, file));
            } catch (e) {
              // ignore deletion error if locked
            }
          }
        }
      } catch (e) {
        // ignore dir read error
      }
    }

    const filesToRemove = [
      path.join(this.cwd, 'docs', 'certify_run_output.json'),
      path.join(this.cwd, 'docs', 'ci_execution_log.md'),
      path.join(this.cwd, 'docs', 'reproducibility_report.md')
    ];

    for (const filePath of filesToRemove) {
      try {
        if (fs.existsSync(filePath)) {
          fs.rmSync(filePath, { force: true });
        }
      } catch (e) {
        // ignore force deletion error
      }
    }

    const qualityLogsDir = path.join(this.cwd, 'quality', 'logs');
    if (!fs.existsSync(qualityLogsDir)) {
      fs.mkdirSync(qualityLogsDir, { recursive: true });
    }
  }

  /**
   * Spawns node certify.js, logs stdout/stderr to quality/logs/clean_build_{runId}.log,
   * and returns process execution summary metrics.
   *
   * @param {string|number} runId
   * @returns {Object} { exitCode, stdout, stderr, durationMs, logPath, passCount, failCount, totalStreams }
   */
  runCertifyPipeline(runId) {
    const qualityLogsDir = path.join(this.cwd, 'quality', 'logs');
    if (!fs.existsSync(qualityLogsDir)) {
      fs.mkdirSync(qualityLogsDir, { recursive: true });
    }

    const startTime = Date.now();
    const result = spawnSync('node', ['certify.js'], {
      cwd: this.cwd,
      stdio: 'pipe',
      encoding: 'utf8'
    });
    const durationMs = Date.now() - startTime;

    const logPath = path.join(qualityLogsDir, `clean_build_${runId}.log`);
    const logHeader = `=== EAORCS CLEAN BUILD RUN ${runId} ===\nDate: ${new Date().toISOString()}\nExit Code: ${result.status}\nDuration: ${durationMs}ms\n\n`;
    const logContent = logHeader + `--- STDOUT ---\n${result.stdout || ''}\n\n--- STDERR ---\n${result.stderr || ''}\n`;
    fs.writeFileSync(logPath, logContent, 'utf8');

    let passCount = 0;
    let failCount = 0;
    let totalStreams = 0;

    const certifyOutputJsonPath = path.join(this.cwd, 'docs', 'certify_run_output.json');
    if (fs.existsSync(certifyOutputJsonPath)) {
      try {
        const outputData = JSON.parse(fs.readFileSync(certifyOutputJsonPath, 'utf8'));
        if (outputData && outputData.summary) {
          passCount = outputData.summary.passCount || 0;
          failCount = outputData.summary.failCount || 0;
          totalStreams = outputData.summary.totalStreams || 0;
        }
      } catch (e) {
        // fallback to stdout regex matching
      }
    }

    if (totalStreams === 0 && result.stdout) {
      const passMatch = result.stdout.match(/Pass Count:\s*(\d+)/i) || result.stdout.match(/Passed:\s*(\d+)/i) || result.stdout.match(/(\d+)\s+passed/i);
      const failMatch = result.stdout.match(/Fail Count:\s*(\d+)/i) || result.stdout.match(/Failed:\s*(\d+)/i) || result.stdout.match(/(\d+)\s+failed/i);
      if (passMatch) passCount = parseInt(passMatch[1], 10);
      if (failMatch) failCount = parseInt(failMatch[1], 10);
    }

    return {
      exitCode: result.status !== null ? result.status : 1,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      durationMs,
      logPath,
      passCount,
      failCount,
      totalStreams
    };
  }

  /**
   * Runs clean build validation by executing certify twice from clean state.
   * Compares exit codes and stream pass counts to determine consistency.
   *
   * @returns {Object} { run1, run2, bothPassed: boolean, consistent: boolean }
   */
  validateCleanBuild() {
    this.cleanArtifacts();
    const run1 = this.runCertifyPipeline('1');

    this.cleanArtifacts();
    const run2 = this.runCertifyPipeline('2');

    const bothPassed = (run1.exitCode === 0) && (run2.exitCode === 0);
    const consistent = bothPassed && (run1.exitCode === run2.exitCode) && (run1.passCount === run2.passCount);

    return {
      run1,
      run2,
      bothPassed,
      consistent
    };
  }
}

module.exports = CleanBuildValidator;
module.exports.CleanBuildValidator = CleanBuildValidator;
