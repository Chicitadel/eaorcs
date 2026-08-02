/******************************************************************************
 * Project        : EAORCS (Enterprise Autonomous Operation & Regulatory Compliance System)
 * Module         : Local CI Simulation Engine
 * File           : CiOrchestrator.js
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

/**
 * README / OVERVIEW:
 * 
 * This module simulates a CI environment locally. 
 * The same logic is executed in `.github/workflows/eaorcs-certify.yml`.
 * 
 * It manages execution of qualification streams, capturing full stdout/stderr
 * logs into individual files inside `ci/logs/`, writing structured json reports,
 * and reporting pass/fail/skip statuses along with execution metrics.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const CI_STREAMS = [
  { name: 'Blueprint Traceability', script: 'tests/traceability/run_traceability.js' },
  { name: 'Integration Workflows', script: 'tests/integration/cross_module_workflow_suite.js' },
  { name: 'Enterprise Qualification', script: 'tests/enterprise/enterprise_qualification_suite.js' },
  { name: 'Security Qualification', script: 'tests/security/security_qualification_suite.js' },
  { name: 'Commercial Qualification', script: 'tests/commercial/commercial_qualification_suite.js' },
  { name: 'Platform Compliance', script: 'tests/integration/run_compliance.js' },
  { name: 'Lifecycle Verification', script: 'tests/lifecycle/run_lifecycle.js' },
  { name: 'API Governance', script: 'tests/governance/run_governance.js' },
  { name: 'Cross-Domain Validation', script: 'tests/cross-domain/run_cross_domain.js' },
  { name: 'Enterprise Expanded', script: 'tests/enterprise/run_enterprise_expanded.js' }
];

class CiOrchestrator {
  constructor(options = {}) {
    this.cwd = options.cwd || process.cwd();
    this.logsDir = options.logsDir || path.join(this.cwd, 'ci', 'logs');
    this.reportPath = options.reportPath || path.join(this.cwd, 'ci', 'ci_execution_report.json');
    this.streams = options.streams || CI_STREAMS;

    // Create required directories recursively
    fs.mkdirSync(this.logsDir, { recursive: true });
    fs.mkdirSync(path.dirname(this.reportPath), { recursive: true });
  }

  run() {
    const startTime = Date.now();
    const results = [];
    let totalPass = 0;
    let totalFail = 0;
    let totalSkip = 0;

    for (const stream of this.streams) {
      const safeName = stream.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const timestamp = Date.now();
      const logFileName = `${safeName}_${timestamp}.log`;
      const logPath = path.join(this.logsDir, logFileName);
      const fullScriptPath = path.resolve(this.cwd, stream.script);

      if (!fs.existsSync(fullScriptPath)) {
        console.log(`[SKIP] ${stream.name} - Script missing: ${stream.script}`);
        const skipOutput = `================================================================\nStream: ${stream.name}\nScript: ${stream.script}\nStatus: SKIP\nTimestamp: ${new Date().toISOString()}\n================================================================\nScript not found on filesystem at: ${stream.script}\n`;
        fs.writeFileSync(logPath, skipOutput, 'utf8');

        results.push({
          name: stream.name,
          script: stream.script,
          exitCode: null,
          durationMs: 0,
          logPath,
          status: 'SKIP'
        });
        totalSkip++;
        continue;
      }

      const streamStart = Date.now();
      const proc = spawnSync('node', [fullScriptPath], {
        cwd: this.cwd,
        stdio: 'pipe',
        encoding: 'utf8'
      });
      const durationMs = Date.now() - streamStart;

      let exitCode = proc.status;
      if (exitCode === null) {
        exitCode = proc.error ? 1 : 0;
      }

      const stdout = proc.stdout || '';
      const stderr = proc.stderr || '';
      const errorMsg = proc.error ? `\nProcess Error: ${proc.error.message}\n${proc.error.stack}` : '';
      const fullLogContent = `================================================================\nStream: ${stream.name}\nScript: ${stream.script}\nExit Code: ${exitCode}\nDuration: ${durationMs}ms\nTimestamp: ${new Date().toISOString()}\n================================================================\n\n--- STDOUT ---\n${stdout}\n\n--- STDERR ---\n${stderr}${errorMsg}\n`;

      fs.writeFileSync(logPath, fullLogContent, 'utf8');

      const status = exitCode === 0 ? 'PASS' : 'FAIL';
      if (status === 'PASS') {
        totalPass++;
      } else {
        totalFail++;
      }

      results.push({
        name: stream.name,
        script: stream.script,
        exitCode,
        durationMs,
        logPath,
        status
      });
    }

    const totalDurationMs = Date.now() - startTime;
    const reportData = {
      timestamp: new Date().toISOString(),
      totalDurationMs,
      totalPass,
      totalFail,
      totalSkip,
      streams: results
    };

    fs.writeFileSync(this.reportPath, JSON.stringify(reportData, null, 2), 'utf8');

    return {
      streams: results,
      totalPass,
      totalFail,
      totalSkip,
      totalDurationMs
    };
  }
}

module.exports = { CiOrchestrator, CI_STREAMS };
