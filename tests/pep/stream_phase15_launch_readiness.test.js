/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 15 Launch Readiness & Operational Observability Test Suite
 * File           : tests/pep/stream_phase15_launch_readiness.test.js
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

const Phase15LaunchReadinessOrchestrator = require('../../engine/audit/Phase15LaunchReadinessOrchestrator');

function runPhase15LaunchReadinessTests() {
  console.log('--------------------------------------------------------------------------------');
  console.log(' RUNNING PHASE 15: LAUNCH READINESS & OPERATIONAL OBSERVABILITY TEST SUITE');
  console.log('--------------------------------------------------------------------------------');

  const rootDir = process.cwd();
  const evidenceDir = path.join(rootDir, 'evidence');

  const orchestrator = new Phase15LaunchReadinessOrchestrator({ rootDir, evidenceDir });
  const summary = orchestrator.executeLaunchReadinessAudit();

  console.log(`[STREAM A] Live Platform Validation: ${summary.streamA_LivePlatformValidation.status} (${summary.streamA_LivePlatformValidation.verifiedAdapters} Adapters)`);
  assert.strictEqual(summary.streamA_LivePlatformValidation.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'live_platform_interoperability_attestation.json')));

  console.log(`[STREAM B] Operational Observability: ${summary.streamB_OperationalObservability.status}`);
  assert.strictEqual(summary.streamB_OperationalObservability.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'opentelemetry_observability_manifest.json')));

  console.log(`[STREAM C] Security Assurance: ${summary.streamC_SecurityAssurance.status}`);
  assert.strictEqual(summary.streamC_SecurityAssurance.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'signed_security_assurance_report.json')));

  console.log(`[STREAM D] Release Engineering: ${summary.streamD_ReleaseEngineering.status}`);
  assert.strictEqual(summary.streamD_ReleaseEngineering.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'reproducible_release_manifest.json')));

  console.log(`[STREAM E] Commercial Operations Lifecycle: ${summary.streamE_CommercialOperations.status}`);
  assert.strictEqual(summary.streamE_CommercialOperations.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'commercial_lifecycle_manifest.json')));

  console.log(`[STREAM F] Documentation & SDK Lifecycle: ${summary.streamF_DocumentationAndSdk.status}`);
  assert.strictEqual(summary.streamF_DocumentationAndSdk.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'sdk_documentation_lifecycle_report.json')));

  console.log(`[STREAM G] Pilot Deployment Observatory: ${summary.streamG_PilotDeployments.status} (${summary.streamG_PilotDeployments.pilotSuccessRate})`);
  assert.strictEqual(summary.streamG_PilotDeployments.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'pilot_deployment_observatory_report.json')));

  console.log(`[STREAM H] Signed Compliance Evidence Packager: ${summary.streamH_EvidenceAndCompliance.status}`);
  assert.strictEqual(summary.streamH_EvidenceAndCompliance.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'signed_compliance_bundle.json')));

  console.log(`[STREAM I] Launch Readiness Gate: ${summary.streamI_LaunchReadinessGate.status}`);
  assert.strictEqual(summary.streamI_LaunchReadinessGate.isReadyForLaunch, true);
  assert.ok(fs.existsSync(path.join(evidenceDir, 'launch_readiness_report.json')));

  console.log('--------------------------------------------------------------------------------');
  console.log(' ✅ PHASE 15 LAUNCH READINESS TEST SUITE PASSED 100% CLEANLY');
  console.log('--------------------------------------------------------------------------------\n');
}

if (require.main === module) {
  try {
    runPhase15LaunchReadinessTests();
  } catch (err) {
    console.error('❌ PHASE 15 TEST SUITE FAILED:', err);
    process.exit(1);
  }
}

module.exports = { runPhase15LaunchReadinessTests };
