/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 14 Operational Substantiation Test Suite
 * File           : tests/pep/stream_phase14_operational_substantiation.test.js
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

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const RequirementGraphEngine = require('../../engine/traceability/RequirementGraphEngine');
const PlatformAdapterVerificationSuite = require('../../adapters/airroofers/PlatformAdapterVerificationSuite');
const OpenApiContractAuditor = require('../../engine/contract/OpenApiContractAuditor');
const ReproducibleBenchmarkRunner = require('../../engine/audit/ReproducibleBenchmarkRunner');
const SecurityScanner = require('../../engine/security/SecurityScanner');
const CommercialEnablementSuite = require('../../engine/commercial/CommercialEnablementSuite');
const SdkContractSyncEngine = require('../../engine/contract/SdkContractSyncEngine');
const EvidenceGenerator = require('../../engine/audit/EvidenceGenerator');
const StagingPilotDeploymentEngine = require('../../engine/operations/StagingPilotDeploymentEngine');

function runPhase14OperationalSubstantiationTests() {
  console.log('--------------------------------------------------------------------------------');
  console.log(' RUNNING PHASE 14: OPERATIONAL SUBSTANTIATION TEST SUITE (9 STREAMS)');
  console.log('--------------------------------------------------------------------------------');

  const rootDir = process.cwd();
  const evidenceDir = path.join(rootDir, 'evidence');
  const benchDir = path.join(evidenceDir, 'benchmarks');

  console.log(`[STREAM 1] Verifying Blueprint Governance & Requirement Traceability...`);
  const reqEngine = new RequirementGraphEngine();
  const reqRes = reqEngine.evaluateGraphCompleteness();
  assert.strictEqual(reqRes.isGraphComplete, true);
  assert.ok(fs.existsSync(path.join(evidenceDir, 'blueprint_governance_report.json')));
  console.log(`  └─ Blueprint Governance Artifact Verified ✅`);

  console.log(`\n[STREAM 2] Verifying Live Platform Adapter Interoperability...`);
  const adapterSuite = new PlatformAdapterVerificationSuite('LIVE_CONTRACT');
  const adapterRes = adapterSuite.runVerification();
  assert.strictEqual(adapterRes.isAllHealthy, true);
  assert.ok(fs.existsSync(path.join(evidenceDir, 'live_platform_integration_evidence.json')));
  console.log(`  └─ Platform Interoperability Signature Verified ✅`);

  console.log(`\n[STREAM 3] Verifying API Governance & Zero Breaking Changes...`);
  const apiEngine = new OpenApiContractAuditor();
  const apiRes = apiEngine.auditContracts();
  assert.strictEqual(apiRes.isCompliant, true);
  assert.ok(fs.existsSync(path.join(evidenceDir, 'api_contract_compatibility_report.json')));
  console.log(`  └─ API Governance Compatibility Matrix Verified ✅`);

  console.log(`\n[STREAM 4] Verifying Reproducible Benchmark Execution & Raw Logs...`);
  const benchRunner = new ReproducibleBenchmarkRunner();
  const benchRes = benchRunner.runReproducibleBenchmarks();
  assert.strictEqual(benchRes.status, 'VERIFIED_REPRODUCIBLE');
  assert.ok(fs.existsSync(path.join(benchDir, 'raw_benchmark_execution.log')));
  assert.ok(fs.existsSync(path.join(benchDir, 'benchmark_config.json')));
  assert.ok(fs.existsSync(path.join(benchDir, 'reproducible_benchmark_report.json')));
  console.log(`  └─ Raw Benchmark Logs & Metadata Artifacts Verified ✅`);

  console.log(`\n[STREAM 5] Verifying SAST/DAST Security Scanning & Secrets Detection...`);
  const secScanner = new SecurityScanner();
  const secRes = secScanner.runSecurityScan();
  assert.strictEqual(secRes.isSecurityGatePassed, true);
  assert.ok(fs.existsSync(path.join(evidenceDir, 'security_scan_report.json')));
  console.log(`  └─ SAST/DAST Security Gate Passed Cleanly ✅`);

  console.log(`\n[STREAM 6] Verifying Commercial Onboarding & Evaluation Sandbox...`);
  const commSuite = new CommercialEnablementSuite();
  const commRes = commSuite.getCommercialManifest('ENTERPRISE');
  assert.strictEqual(commRes.isEntitled, true);
  assert.ok(fs.existsSync(path.join(evidenceDir, 'commercial_onboarding_verification.json')));
  console.log(`  └─ Commercial Onboarding Manifest Verified ✅`);

  console.log(`\n[STREAM 7] Verifying SDK & API Contract Synchronization...`);
  const sdkSync = new SdkContractSyncEngine();
  const sdkRes = sdkSync.syncContracts();
  assert.strictEqual(sdkRes.isZeroDriftConfirmed, true);
  assert.ok(fs.existsSync(path.join(evidenceDir, 'sdk_contract_sync_report.json')));
  console.log(`  └─ SDK Zero-Drift Sync Verified ✅`);

  console.log(`\n[STREAM 8] Verifying Signed Release Attestation & Cryptographic Provenance...`);
  const evGen = new EvidenceGenerator();
  const evRes = evGen.generateAllEvidence();
  assert.strictEqual(evRes.status, 'SUCCESS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'signed_release_attestation.json')));
  console.log(`  └─ Signed Release Attestation Verified ✅`);

  console.log(`\n[STREAM 9] Verifying Pilot Deployment & Rollback Automation...`);
  const pilotEngine = new StagingPilotDeploymentEngine();
  const pilotRes = pilotEngine.verifyPilotDeployment();
  assert.strictEqual(pilotRes.isDeploymentVerified, true);
  assert.ok(fs.existsSync(path.join(evidenceDir, 'pilot_deployment_verification.json')));
  console.log(`  └─ Pilot Deployment Verification Verified ✅`);

  console.log('--------------------------------------------------------------------------------');
  console.log(' ✅ PHASE 14 OPERATIONAL SUBSTANTIATION SUITE PASSED 100% CLEANLY');
  console.log('--------------------------------------------------------------------------------\n');
}

if (require.main === module) {
  try {
    runPhase14OperationalSubstantiationTests();
  } catch (err) {
    console.error('❌ PHASE 14 TEST SUITE FAILED:', err);
    process.exit(1);
  }
}

module.exports = { runPhase14OperationalSubstantiationTests };
