/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 9 Master Suite (Operationalization & Ecosystem Streams A-F)
 * File           : tests/phase9/run_phase9_master_suite.js
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
  { id: 'Stream A', name: 'Independent Validation', script: 'tests/phase9/stream_a_independent_validation.test.js' },
  { id: 'Stream B', name: 'Enterprise Deployment', script: 'tests/phase9/stream_b_enterprise_deployment.test.js' },
  { id: 'Stream C', name: 'Trust Operations', script: 'tests/phase9/stream_c_trust_operations.test.js' },
  { id: 'Stream D', name: 'Standards & OSAP Conformance', script: 'tests/phase9/stream_d_standards_conformance.test.js' },
  { id: 'Stream E', name: 'Ecosystem & Partner Certification', script: 'tests/phase9/stream_e_ecosystem.test.js' },
  { id: 'Stream F', name: 'Operational Intelligence & Telemetry', script: 'tests/phase9/stream_f_operational_intelligence.test.js' }
];

function runMasterSuite() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 9: ENTERPRISE OPERATIONALIZATION & ECOSYSTEM MASTER SUITE');
  console.log('  Target Release: 2026.1.0-LTS');
  console.log('  Scope: Streams A through F (Validation, Deployment, Trust Ops, Standards, Ecosystem, Telemetry)');
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
  console.log('                    PHASE 9 OPERATIONALIZATION SUITE SUMMARY');
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
    console.log('🎉 PHASE 9 OPERATIONALIZATION SUITE: ALL 6 CONCURRENT STREAMS PASSED 100% CLEANLY.\n');
    process.exit(0);
  } else {
    console.error('❌ PHASE 9 SUITE FAILED: One or more streams encountered errors.\n');
    process.exit(1);
  }
}

runMasterSuite();
