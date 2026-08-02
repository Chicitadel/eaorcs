/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Single-Command Certification Pipeline
 * File           : certify.js
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

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const os = require('os');

const TARGET_VERSION = '2026.1.0-lts';

const STREAMS = [
  {
    name: 'traceability',
    command: 'node',
    args: ['tests/traceability/run_traceability.js'],
    logFile: 'ci/logs/traceability.log'
  },
  {
    name: 'integration',
    command: 'node',
    args: ['tests/integration/cross_module_workflow_suite.js'],
    logFile: 'ci/logs/integration.log'
  },
  {
    name: 'enterprise',
    command: 'node',
    args: ['tests/enterprise/enterprise_qualification_suite.js'],
    logFile: 'ci/logs/enterprise.log'
  },
  {
    name: 'security',
    command: 'node',
    args: ['tests/security/security_qualification_suite.js'],
    logFile: 'ci/logs/security.log'
  },
  {
    name: 'commercial',
    command: 'node',
    args: ['tests/commercial/commercial_qualification_suite.js'],
    logFile: 'ci/logs/commercial.log'
  },
  {
    name: 'compliance',
    command: 'node',
    args: ['tests/integration/run_compliance.js'],
    logFile: 'ci/logs/compliance.log'
  },
  {
    name: 'lifecycle',
    command: 'node',
    args: ['tests/lifecycle/run_lifecycle.js'],
    logFile: 'ci/logs/lifecycle.log'
  },
  {
    name: 'governance',
    command: 'node',
    args: ['tests/governance/run_governance.js'],
    logFile: 'ci/logs/governance.log'
  },
  {
    name: 'cross-domain',
    command: 'node',
    args: ['tests/cross-domain/run_cross_domain.js'],
    logFile: 'ci/logs/cross_domain.log'
  },
  {
    name: 'enterprise-expanded',
    command: 'node',
    args: ['tests/enterprise/run_enterprise_expanded.js'],
    logFile: 'ci/logs/enterprise_expanded.log'
  },
  {
    name: 'specification-intelligence',
    command: 'node',
    args: ['tests/spec/run_pillar0_suite.js'],
    logFile: 'ci/logs/specification_intelligence.log'
  },
  {
    name: 'production-hardening',
    command: 'node',
    args: ['tests/phase6/run_phase6_master_suite.js'],
    logFile: 'ci/logs/production_hardening.log'
  },
  {
    name: 'operational-validation',
    command: 'node',
    args: ['tests/phase7/run_phase7_master_suite.js'],
    logFile: 'ci/logs/operational_validation.log'
  },
  {
    name: 'trust-network-validation',
    command: 'node',
    args: ['tests/phase8/run_phase8_master_suite.js'],
    logFile: 'ci/logs/trust_network_validation.log'
  },
  {
    name: 'release-build',
    command: 'node',
    args: ['release/run_release.js', `--version=${TARGET_VERSION}`],
    logFile: 'ci/logs/release_build.log'
  },
  {
    name: 'release-certify',
    command: 'node',
    args: ['release/run_certification.js', `--version=${TARGET_VERSION}`],
    logFile: 'ci/logs/release_certify.log'
  }
];

function runCertify() {
  const rootDir = process.cwd();
  const ciLogsDir = path.join(rootDir, 'ci', 'logs');
  const docsDir = path.join(rootDir, 'docs');

  if (!fs.existsSync(ciLogsDir)) {
    fs.mkdirSync(ciLogsDir, { recursive: true });
  }
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  console.log('\n' + '='.repeat(80));
  console.log('  EAORCS MASTER QUALIFICATION & CERTIFICATION PIPELINE');
  console.log(`  Target Version: ${TARGET_VERSION}`);
  console.log('  Authority: Systems Engineering & Governance Authority');
  console.log('='.repeat(80) + '\n');

  const results = [];
  let passCount = 0;
  let failCount = 0;
  let skipCount = 0;
  const pipelineStartTime = Date.now();

  STREAMS.forEach((stream, index) => {
    const streamNum = `[STREAM ${index + 1}/${STREAMS.length}]`;
    const fullCommandStr = `${stream.command} ${stream.args.join(' ')}`;
    console.log(`${streamNum} Running: ${stream.name}...`);

    const runnerScriptRelative = stream.args[0];
    const runnerScriptAbsolute = path.resolve(rootDir, runnerScriptRelative);

    const logFilePathAbsolute = path.resolve(rootDir, stream.logFile);
    const streamLogDir = path.dirname(logFilePathAbsolute);
    if (!fs.existsSync(streamLogDir)) {
      fs.mkdirSync(streamLogDir, { recursive: true });
    }

    if (!fs.existsSync(runnerScriptAbsolute)) {
      console.log(`         ⏭️  SKIP: Runner file does not exist (${runnerScriptRelative})\n`);
      const skipLogContent = `[SKIP] Runner script file '${runnerScriptRelative}' was not found in checkout.\n`;
      fs.writeFileSync(logFilePathAbsolute, skipLogContent, 'utf8');

      skipCount++;
      results.push({
        name: stream.name,
        command: stream.command,
        args: stream.args,
        fullCommand: fullCommandStr,
        exitCode: null,
        durationMs: 0,
        logFile: stream.logFile,
        passed: false,
        skipped: true,
        status: 'SKIP'
      });
      return;
    }

    const streamStart = Date.now();
    const child = spawnSync(stream.command, stream.args, {
      cwd: rootDir,
      stdio: 'pipe',
      encoding: 'utf8',
      env: process.env
    });
    const durationMs = Date.now() - streamStart;

    const exitCode = child.status !== null ? child.status : (child.error ? 1 : 0);
    const stdout = child.stdout || '';
    const stderr = child.stderr || '';
    const combinedLog = stdout + (stderr ? ('\n=== STDERR ===\n' + stderr) : '');

    fs.writeFileSync(logFilePathAbsolute, combinedLog, 'utf8');

    const passed = exitCode === 0;
    if (passed) {
      passCount++;
      console.log(`         ✅ PASS (${durationMs}ms)\n`);
    } else {
      failCount++;
      console.log(`         ❌ FAIL (Exit code ${exitCode}) (${durationMs}ms)\n`);
    }

    results.push({
      name: stream.name,
      command: stream.command,
      args: stream.args,
      fullCommand: fullCommandStr,
      exitCode,
      durationMs,
      logFile: stream.logFile,
      passed,
      skipped: false,
      status: passed ? 'PASS' : 'FAIL'
    });
  });

  const totalDurationMs = Date.now() - pipelineStartTime;

  // Print Summary Table
  console.log('='.repeat(95));
  console.log('                              QUALIFICATION SUMMARY TABLE');
  console.log('='.repeat(95));
  console.log(
    'Stream Name'.padEnd(22) + ' | ' +
    'Exit Code'.padEnd(10) + ' | ' +
    'Duration (ms)'.padEnd(15) + ' | ' +
    'Status'
  );
  console.log('-'.repeat(95));

  results.forEach(r => {
    const exitCodeStr = r.skipped ? 'N/A (SKIP)' : String(r.exitCode);
    const statusStr = r.status === 'PASS' ? '✅ PASS' : (r.status === 'SKIP' ? '⏭️ SKIP' : '❌ FAIL');
    console.log(
      r.name.padEnd(22) + ' | ' +
      exitCodeStr.padEnd(10) + ' | ' +
      `${r.durationMs}ms`.padEnd(15) + ' | ' +
      statusStr
    );
  });

  console.log('='.repeat(95));
  console.log(
    `Total Streams: ${STREAMS.length} | ` +
    `Passed: ${passCount} | ` +
    `Failed: ${failCount} | ` +
    `Skipped: ${skipCount} | ` +
    `Total Duration: ${(totalDurationMs / 1000).toFixed(2)}s (${totalDurationMs}ms)`
  );
  console.log('='.repeat(95) + '\n');

  // Structured JSON output object
  const outputData = {
    timestamp: new Date().toISOString(),
    version: TARGET_VERSION,
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version
    },
    summary: {
      totalStreams: STREAMS.length,
      passCount,
      failCount,
      skipCount,
      totalDurationMs,
      success: failCount === 0
    },
    streams: results.map(r => ({
      name: r.name,
      command: r.command,
      args: r.args,
      fullCommand: r.fullCommand,
      exitCode: r.exitCode,
      durationMs: r.durationMs,
      logFile: r.logFile,
      passed: r.passed,
      skipped: r.skipped,
      status: r.status
    }))
  };

  const jsonOutputPath = path.join(docsDir, 'certify_run_output.json');
  fs.writeFileSync(jsonOutputPath, JSON.stringify(outputData, null, 2), 'utf8');
  console.log(`📄 Qualification structured report saved to: ${jsonOutputPath}\n`);

  if (failCount === 0) {
    console.log('🎉 CERTIFICATION SUCCESSFUL: All qualification streams passed cleanly.');
    process.exit(0);
  } else {
    console.error(`💥 CERTIFICATION FAILED: ${failCount} stream(s) encountered failures.`);
    process.exit(1);
  }
}

if (require.main === module) {
  runCertify();
}

module.exports = { runCertify, STREAMS };
