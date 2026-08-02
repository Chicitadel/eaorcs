/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Air Roofers Product Execution Program (PEP) Master Qualification Suite
 * File           : tests/pep/run_pep_master_suite.js
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
  { id: 'Stream A', name: 'Core Engineering & Kernel Performance', script: 'tests/pep/stream_a_core_engineering.test.js' },
  { id: 'Stream B', name: 'Platform Integration Verification', script: 'tests/pep/stream_b_platform_integration.test.js' },
  { id: 'Stream C', name: 'API & Contract Governance', script: 'tests/pep/stream_c_api_governance.test.js' },
  { id: 'Stream D', name: 'Ecosystem Non-Duplication Audit', script: 'tests/pep/stream_d_ecosystem_audit.test.js' },
  { id: 'Stream E', name: 'Commercial Product Readiness', script: 'tests/pep/stream_e_product_readiness.test.js' },
  { id: 'Stream F', name: 'Enterprise Documentation Portal', script: 'tests/pep/stream_f_documentation.test.js' },
  { id: 'Stream G', name: 'Pre-Launch Operations & Automation', script: 'tests/pep/stream_g_prelaunch_operations.test.js' },
  { id: 'Stream H', name: 'Automated Evidence Generation', script: 'tests/pep/stream_h_evidence_generation.test.js' },
  { id: 'Stream ACC', name: '9-Stream Autonomous Product Assurance', script: 'tests/pep/stream_acceleration_suite.test.js' },
  { id: 'Stream P13', name: 'Phase 13 Evidence-Driven Completion', script: 'tests/pep/stream_phase13_evidence_completion.test.js' },
  { id: 'Stream P14', name: 'Phase 14 Operational Substantiation', script: 'tests/pep/stream_phase14_operational_substantiation.test.js' },
  { id: 'Stream P15', name: 'Phase 15 Launch Readiness & Observability', script: 'tests/pep/stream_phase15_launch_readiness.test.js' },
  { id: 'Stream P16', name: 'Phase 16 Launch Management & Production Rollout', script: 'tests/pep/stream_phase16_launch_management.test.js' },
  { id: 'Stream CV', name: 'Continuous Verification Build Gates', script: 'tests/pep/stream_continuous_verification.test.js' }
];

function runMasterSuite() {
  console.log('================================================================================');
  console.log('  AIR ROOFERS ENTERPRISE PRODUCT EXECUTION PROGRAM (PEP) MASTER SUITE');
  console.log('  Target Release: 2026.1.0-LTS');
  console.log('  Scope: Streams A through G + Continuous Verification Stream');
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
  console.log('             AIR ROOFERS PRODUCT EXECUTION PROGRAM (PEP) SUITE SUMMARY');
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
    console.log('🎉 AIR ROOFERS PRODUCT EXECUTION PROGRAM: ALL 8 STREAMS PASSED 100% CLEANLY.\n');
    process.exit(0);
  } else {
    console.error('❌ PEP SUITE FAILED: One or more streams encountered errors.\n');
    process.exit(1);
  }
}

runMasterSuite();
