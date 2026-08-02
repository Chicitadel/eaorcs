/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Pillar 0 Specification Intelligence Master Suite
 * File           : tests/spec/run_pillar0_suite.js
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

const path = require('path');
const { spawnSync } = require('child_process');

const SUITES = [
  { name: 'Streams A & B: Spec Intelligence & Knowledge Graph', script: 'tests/spec/specification_knowledge_graph.test.js' },
  { name: 'Streams C & D: Traceability & Business Drift', script: 'tests/spec/traceability_drift.test.js' },
  { name: 'Streams E & F: Epistemic Confidence & IDE Integration', script: 'tests/spec/confidence_ide.test.js' },
  { name: 'Streams G & H: AI Interview & Industry Constitutions', script: 'tests/spec/ai_interview_constitutions.test.js' },
  { name: 'Streams I & J: Universal Constitution & Remediation', script: 'tests/spec/constitution_remediation.test.js' }
];

function runMasterSuite() {
  console.log('================================================================================');
  console.log('  EAORCS PILLAR 0: SPECIFICATION INTELLIGENCE MASTER QUALIFICATION SUITE');
  console.log('  Target Release: 2026.1.0-LTS');
  console.log('  Blueprint Target: EAORCS Blueprint v1.1');
  console.log('================================================================================\n');

  let passedSuites = 0;
  let failedSuites = 0;
  const results = [];

  for (let i = 0; i < SUITES.length; i++) {
    const suite = SUITES[i];
    console.log(`[SUITE ${i + 1}/${SUITES.length}] Executing: ${suite.name}...`);

    const start = Date.now();
    const proc = spawnSync('node', [suite.script], {
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
      name: suite.name,
      script: suite.script,
      exitCode: proc.status,
      durationMs,
      passed
    });
  }

  console.log('\n===============================================================================================');
  console.log('                       PILLAR 0 SPECIFICATION INTELLIGENCE SUMMARY');
  console.log('===============================================================================================');
  console.log('Suite Name                                           | Exit Code | Duration | Status');
  console.log('-----------------------------------------------------------------------------------------------');
  for (const r of results) {
    const padName = r.name.padEnd(52, ' ');
    const padCode = String(r.exitCode).padEnd(9, ' ');
    const padDur = `${r.durationMs}ms`.padEnd(9, ' ');
    const status = r.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${padName} | ${padCode} | ${padDur} | ${status}`);
  }
  console.log('-----------------------------------------------------------------------------------------------');
  console.log(`Total Suites: ${SUITES.length} | Passed: ${passedSuites} | Failed: ${failedSuites}`);
  console.log('===============================================================================================\n');

  if (failedSuites === 0) {
    console.log('🎉 PILLAR 0 SPECIFICATION INTELLIGENCE SUITE: ALL 5 STREAMS PASSED 100% CLEANLY.\n');
    process.exit(0);
  } else {
    console.error('❌ PILLAR 0 SUITE FAILED: One or more streams encountered errors.\n');
    process.exit(1);
  }
}

runMasterSuite();
