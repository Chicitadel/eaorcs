/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 8 Trust Network Master Suite
 * File           : tests/phase8/run_phase8_master_suite.js
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

const { spawnSync } = require('child_process');

const SUITES = [
  { name: 'Streams 1 & 2: Benchmark Vault & Federated Trust Network', script: 'tests/phase8/benchmark_federation.test.js' },
  { name: 'Streams 3 & 4: Public Trust Portal & Independent CA', script: 'tests/phase8/portal_ca_engine.test.js' },
  { name: 'Streams 5 & 6: Developer Playground & AI Corpus', script: 'tests/phase8/playground_ai_corpus.test.js' },
  { name: 'Streams 7 & 8: Lab Attestation & Research Exporter', script: 'tests/phase8/attestation_research.test.js' },
  { name: 'Streams 9 & 10: DID Bridge & Sovereign Release', script: 'tests/phase8/did_sovereign_release.test.js' }
];

function runMasterSuite() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 8: TRUST NETWORK & SOVEREIGN RELEASE MASTER SUITE');
  console.log('  Target Release: 2026.1.0-LTS');
  console.log('  Scope: Streams 1 through 10 (P2P Trust, Public Portal, CA, DID, Research Exporter)');
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
  console.log('                    PHASE 8 TRUST NETWORK SUITE SUMMARY');
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
    console.log('🎉 PHASE 8 TRUST NETWORK SUITE: ALL 5 STREAMS PASSED 100% CLEANLY.\n');
    process.exit(0);
  } else {
    console.error('❌ PHASE 8 SUITE FAILED: One or more streams encountered errors.\n');
    process.exit(1);
  }
}

runMasterSuite();
