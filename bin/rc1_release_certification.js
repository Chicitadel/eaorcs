/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : RC1 Release Certification Pipeline
 * File           : bin/rc1_release_certification.js
 * Version        : 2026.1.0-RC1
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Systems Governance Approved
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
  { name: 'Five-Stream Release Engineering Suite', script: 'tests/release/run_five_stream_release_suite.js' }
];

function runMasterSuites() {
  console.log('\n================================================================================');
  console.log('  1. EXECUTING MASTER QUALIFICATION SUITES (PEP & PHASES 27-37)');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  for (const suite of MASTER_SUITES) {
    const scriptPath = path.join(rootDir, suite.script);
    console.log(`[RUNNING] ${suite.name} (${suite.script})...`);

    if (!fs.existsSync(scriptPath)) {
      console.error(`  ❌ Error: Suite script file does not exist: ${suite.script}`);
      failed++;
      continue;
    }

    const start = Date.now();
    const result = spawnSync('node', [scriptPath], {
      cwd: rootDir,
      stdio: 'inherit',
      encoding: 'utf8'
    });
    const duration = Date.now() - start;

    if (result.status === 0) {
      console.log(`  ✅ PASSED: ${suite.name} (${duration}ms)\n`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${suite.name} (exit code ${result.status}) (${duration}ms)\n`);
      failed++;
    }
  }

  console.log(`Master Suites Execution Summary: ${passed} Passed, ${failed} Failed out of ${MASTER_SUITES.length}.\n`);
  return failed === 0;
}

function verifyArchitectureFreeze() {
  console.log('================================================================================');
  console.log('  2. VERIFYING ARCHITECTURE FREEZE & GOVERNANCE ATTESTATION');
  console.log('================================================================================\n');

  const statePath = path.join(rootDir, '.governance', 'state', 'project.state.yaml');
  const decisionsPath = path.join(rootDir, '.governance', 'state', 'frozen.decisions.yaml');
  const attestationPath = path.join(rootDir, 'release', 'RC1_ARCHITECTURE_FREEZE_ATTESTATION.json');

  if (!fs.existsSync(statePath)) {
    throw new Error('project.state.yaml does not exist');
  }
  const stateContent = fs.readFileSync(statePath, 'utf8');
  if (!stateContent.includes('RC1_RELEASE_CANDIDATE')) {
    throw new Error('project.state.yaml does not set active_phase to RC1_RELEASE_CANDIDATE');
  }
  if (!stateContent.includes('engineering_expansion_frozen: true') || !stateContent.includes('feature_freeze: true')) {
    throw new Error('project.state.yaml does not confirm engineering expansion & feature freeze');
  }
  console.log('  ✅ project.state.yaml verified: Active Phase RC1_RELEASE_CANDIDATE & Frozen Status.');

  if (!fs.existsSync(decisionsPath)) {
    throw new Error('frozen.decisions.yaml does not exist');
  }
  const decisionsContent = fs.readFileSync(decisionsPath, 'utf8');
  if (!decisionsContent.includes('ADR-RC1-01')) {
    throw new Error('frozen.decisions.yaml missing ADR-RC1-01');
  }
  console.log('  ✅ frozen.decisions.yaml verified: ADR-RC1-01 present and approved.');

  if (!fs.existsSync(attestationPath)) {
    throw new Error('RC1_ARCHITECTURE_FREEZE_ATTESTATION.json does not exist');
  }
  const attestation = JSON.parse(fs.readFileSync(attestationPath, 'utf8'));
  if (attestation.releaseVersion !== '2026.1.0-RC1' || attestation.architectureFrozen !== true) {
    throw new Error('RC1_ARCHITECTURE_FREEZE_ATTESTATION.json invalid');
  }
  console.log('  ✅ RC1_ARCHITECTURE_FREEZE_ATTESTATION.json verified: Version 2026.1.0-RC1 Attested.\n');
  return true;
}

function checkDocumentationCompleteness() {
  console.log('================================================================================');
  console.log('  3. CHECKING DOCUMENTATION COMPLETENESS');
  console.log('================================================================================\n');

  const requiredDocs = [
    'docs/EAORCS_Architecture_Specification.md',
    'docs/EAORCS_Operations_Manual.md',
    'docs/EAORCS_COMMERCIALIZATION_STRATEGY.md',
    'docs/EAORCS_Verification_Standard.md',
    'docs/release_notes_2026.1.0-lts.md',
    'docs/user-manual',
    'docs/developer-guide',
    'docs/administrator-guide',
    'docs/security-guide',
    'docs/api-manual',
    'docs/deployment-guide'
  ];

  let missing = 0;
  for (const doc of requiredDocs) {
    const fullPath = path.join(rootDir, doc);
    if (fs.existsSync(fullPath)) {
      console.log(`  ✓ Verified documentation item: ${doc}`);
    } else {
      console.error(`  ❌ Missing documentation item: ${doc}`);
      missing++;
    }
  }

  if (missing > 0) {
    throw new Error(`${missing} required documentation item(s) are missing.`);
  }

  console.log('\n  ✅ Documentation Completeness Check Passed: All core documentation present.\n');
  return true;
}

function main() {
  console.log('\n================================================================================');
  console.log('  EAORCS 2026.1.0-LTS RC1 RELEASE CERTIFICATION PIPELINE');
  console.log('  Authority: Ujomor Systems Engineering & Governance Authority');
  console.log('================================================================================\n');

  try {
    const suitesPassed = runMasterSuites();
    if (!suitesPassed) {
      console.error('\n❌ RELEASE CERTIFICATION FAILED: One or more master suites failed.');
      process.exit(1);
    }

    verifyArchitectureFreeze();
    checkDocumentationCompleteness();

    console.log('================================================================================');
    console.log('  EAORCS 2026.1.0-LTS RC1 CERTIFICATION PASSED');
    console.log('================================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ RELEASE CERTIFICATION FAILED: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
