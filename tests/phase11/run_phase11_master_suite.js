/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 11 Master Qualification Suite (Enterprise Operational Execution)
 * File           : tests/phase11/run_phase11_master_suite.js
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const { spawnSync } = require('child_process');

const STREAMS = [
  { id: 'Stream 1', name: 'Independent Validation & Lab Attestation', script: 'tests/phase11/stream_1_independent_validation.test.js' },
  { id: 'Stream 2', name: 'Enterprise Deployments & Customer Outcomes', script: 'tests/phase11/stream_2_enterprise_deployments.test.js' },
  { id: 'Stream 3', name: 'Platform Operations & Live Trust Infrastructure', script: 'tests/phase11/stream_3_platform_operations.test.js' },
  { id: 'Stream 4', name: 'Standards & Interoperability Suites', script: 'tests/phase11/stream_4_standards.test.js' },
  { id: 'Stream 5', name: 'Developer Ecosystem & Marketplace', script: 'tests/phase11/stream_5_developer_ecosystem.test.js' },
  { id: 'Stream 6', name: 'Product Analytics & Operational Metrics', script: 'tests/phase11/stream_6_product_analytics.test.js' },
  { id: 'Stream 7', name: 'Continuous Assurance & Autonomous CI/CD', script: 'tests/phase11/stream_7_continuous_assurance.test.js' }
];

function runMasterSuite() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 11: ENTERPRISE OPERATIONAL EXECUTION MASTER SUITE');
  console.log('  Target Release: 2026.1.0-LTS');
  console.log('  Scope: Streams 1 through 7 (Validation, Deployments, Trust Ops, Standards, Ecosystem, Analytics, CI/CD)');
  console.log('================================================================================\n');

  let passedSuites = 0;
  let failedSuites = 0;
  const results = [];

  for (let i = 0; i < STREAMS.length; i++) {
    const stream = STREAMS[i];
    console.log(`[${stream.id}] Executing: ${stream.name}...`);

    const start = Date.now();
    const proc = spawnSync('node', [stream.script], {
      cwd: process.cwd(),
      stdio: 'pipe',
      encoding: 'utf8'
    });
    const durationMs = Date.now() - start;

    const passed = proc.status === 0;
    if (passed) {
      passedSuites++;
      console.log(`         ✅ PASS (${durationMs}ms)`);
    } else {
      failedSuites++;
      console.log(`         ❌ FAIL (${durationMs}ms)`);
      console.error(proc.stderr || proc.stdout);
    }

    results.push({
      id: stream.id,
      name: stream.name,
      script: stream.script,
      exitCode: proc.status,
      durationMs,
      passed
    });
  }

  console.log('\n===============================================================================================');
  console.log('                    PHASE 11 OPERATIONAL EXECUTION SUITE SUMMARY');
  console.log('===============================================================================================');
  console.log('Stream ID | Stream Name                                      | Exit Code | Duration | Status');
  console.log('-----------------------------------------------------------------------------------------------');
  for (const r of results) {
    const padId = r.id.padEnd(9, ' ');
    const padName = r.name.padEnd(48, ' ');
    const padCode = String(r.exitCode).padEnd(9, ' ');
    const padDur = `${r.durationMs}ms`.padEnd(9, ' ');
    const status = r.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${padId} | ${padName} | ${padCode} | ${padDur} | ${status}`);
  }
  console.log('-----------------------------------------------------------------------------------------------');
  console.log(`Total Streams: ${STREAMS.length} | Passed: ${passedSuites} | Failed: ${failedSuites}`);
  console.log('===============================================================================================\n');

  if (failedSuites === 0) {
    console.log('🎉 PHASE 11 OPERATIONAL EXECUTION SUITE: ALL 7 CONCURRENT STREAMS PASSED 100% CLEANLY.\n');
    process.exit(0);
  } else {
    console.error('❌ PHASE 11 SUITE FAILED: One or more streams encountered errors.\n');
    process.exit(1);
  }
}

runMasterSuite();
