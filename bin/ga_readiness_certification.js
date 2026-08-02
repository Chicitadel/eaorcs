/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : bin
 * File           : ga_readiness_certification.js
 * Version        : 2026.1.0-GA
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

const rootDir = path.resolve(__dirname, '..');

const MASTER_SUITES = [
  { name: 'PEP Master Suite', script: 'tests/pep/run_pep_master_suite.js' },
  { name: 'Phase 27 Master Suite', script: 'tests/phase27/run_phase27_master_suite.js' },
  { name: 'Phase 28 Master Suite', script: 'tests/phase28/run_phase28_master_suite.js' },
  { name: 'Phase 29 Master Suite', script: 'tests/phase29/run_phase29_master_suite.js' },
  { name: 'Phase 30 Master Suite', script: 'tests/phase30/run_phase30_master_suite.js' },
  { name: 'Phase 31 Master Suite', script: 'tests/phase31/run_phase31_master_suite.js' },
  { name: 'Phase 32 Master Suite', script: 'tests/phase32/run_phase32_master_suite.js' },
  { name: 'Phase 33 Master Suite', script: 'tests/phase33/run_phase33_master_suite.js' },
  { name: 'Phase 34 Master Suite', script: 'tests/phase34/run_phase34_master_suite.js' },
  { name: 'Phase 35 Master Suite', script: 'tests/phase35/run_phase35_master_suite.js' },
  { name: 'Phase 36 Master Suite', script: 'tests/phase36/run_phase36_master_suite.js' },
  { name: 'Phase 37 Master Suite', script: 'tests/phase37/run_phase37_master_suite.js' },
  { name: 'Five-Stream Release Engineering Suite', script: 'tests/release/run_five_stream_release_suite.js' },
  { name: 'Legal & Governance Subsystem Suite', script: 'tests/legal/run_legal_governance_suite.js' },
  { name: 'Nine-Stream GA Intelligence Suite', script: 'tests/ga/run_ga_intelligence_suite.js' }
];

function runMasterSuites() {
  console.log('\n================================================================================');
  console.log(`  1. EXECUTING ALL ${MASTER_SUITES.length} MASTER QUALIFICATION & LEGAL GOVERNANCE SUITES`);
  console.log('================================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  for (const suite of MASTER_SUITES) {
    const fullPath = path.join(rootDir, suite.script);
    console.log(`[RUNNING] ${suite.name} (${suite.script})...`);

    const proc = spawnSync('node', [fullPath], { cwd: rootDir, encoding: 'utf8' });

    if (proc.status === 0) {
      passedCount++;
      console.log(`  ✅ PASSED: ${suite.name}\n`);
    } else {
      failedCount++;
      console.log(`  ❌ FAILED: ${suite.name}`);
      console.error(proc.stderr || proc.stdout);
      console.log('\n');
    }
  }

  console.log(`Master Suites Execution Summary: ${passedCount} Passed, ${failedCount} Failed out of ${MASTER_SUITES.length}.\n`);

  if (failedCount > 0) {
    console.error('❌ GENERAL AVAILABILITY (GA) CERTIFICATION FAILED: One or more master suites failed.\n');
    process.exit(1);
  }
}

function verifyLegalRegistry() {
  console.log('================================================================================');
  console.log('  2. VERIFYING LEGAL REGISTRY & POLICY DOCUMENTS');
  console.log('================================================================================\n');

  const registryPath = path.join(rootDir, 'legal', 'registry.json');
  if (!fs.existsSync(registryPath)) {
    console.error('❌ Missing legal/registry.json');
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  if (!registry.documents || registry.documents.length !== 8) {
    console.error(`❌ Expected 8 legal documents in legal/registry.json, but found ${registry.documents ? registry.documents.length : 0}`);
    process.exit(1);
  }

  console.log(`  ✅ Verified legal/registry.json: ${registry.documents.length} legal documents registered.`);
}

function runCertification() {
  console.log('================================================================================');
  console.log('  EAORCS GENERAL AVAILABILITY (GA) READINESS CERTIFICATION PIPELINE');
  console.log('  Target Release: 2026.1.0-GA');
  console.log('================================================================================');

  runMasterSuites();
  verifyLegalRegistry();

  console.log('================================================================================');
  console.log('  EAORCS GENERAL AVAILABILITY (GA) CERTIFICATION PASSED');
  console.log('================================================================================\n');
}

if (require.main === module) {
  runCertification();
}

module.exports = runCertification;
