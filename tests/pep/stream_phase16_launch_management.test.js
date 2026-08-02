/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 16 Launch Management & Production Rollout Test Suite
 * File           : tests/pep/stream_phase16_launch_management.test.js
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

const Phase16LaunchManagementOrchestrator = require('../../engine/audit/Phase16LaunchManagementOrchestrator');

function runPhase16LaunchManagementTests() {
  console.log('--------------------------------------------------------------------------------');
  console.log(' RUNNING PHASE 16: LAUNCH MANAGEMENT & PRODUCTION ROLLOUT TEST SUITE (9 STREAMS)');
  console.log('--------------------------------------------------------------------------------');

  const rootDir = process.cwd();
  const evidenceDir = path.join(rootDir, 'evidence');

  const orchestrator = new Phase16LaunchManagementOrchestrator({ rootDir, evidenceDir });
  const summary = orchestrator.executeLaunchManagementAudit();

  console.log(`[STREAM A] Production Deployment: ${summary.streamA_ProductionDeployment.status} (${summary.streamA_ProductionDeployment.environment})`);
  assert.strictEqual(summary.streamA_ProductionDeployment.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'production_deployment_rollout_manifest.json')));

  console.log(`[STREAM B] Live Observability: ${summary.streamB_LiveObservability.status}`);
  assert.strictEqual(summary.streamB_LiveObservability.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'live_observability_telemetry_stack.json')));

  console.log(`[STREAM C] External Security Assurance: ${summary.streamC_ExternalSecurity.status}`);
  assert.strictEqual(summary.streamC_ExternalSecurity.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'external_security_assurance_report.json')));

  console.log(`[STREAM D] CI/CD API Governance: ${summary.streamD_CiCdApiGovernance.status}`);
  assert.strictEqual(summary.streamD_CiCdApiGovernance.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'cicd_api_contract_enforcement_report.json')));

  console.log(`[STREAM E] Commercial Operations: ${summary.streamE_CommercialOperations.status}`);
  assert.strictEqual(summary.streamE_CommercialOperations.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'commercial_operations_verification.json')));

  console.log(`[STREAM F] Pilot Expansion Assurance: ${summary.streamF_PilotExpansion.status} (${summary.streamF_PilotExpansion.activePilots} tenants)`);
  assert.strictEqual(summary.streamF_PilotExpansion.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'pilot_expansion_assurance_report.json')));

  console.log(`[STREAM G] Release Governance: ${summary.streamG_ReleaseGovernance.status} (${summary.streamG_ReleaseGovernance.slsaLevel})`);
  assert.strictEqual(summary.streamG_ReleaseGovernance.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'release_governance_provenance_manifest.json')));

  console.log(`[STREAM H] Compliance Procurement Package: ${summary.streamH_ComplianceProcurement.status}`);
  assert.strictEqual(summary.streamH_ComplianceProcurement.status, 'PASS');
  assert.ok(fs.existsSync(path.join(evidenceDir, 'compliance_procurement_package.json')));

  console.log(`[STREAM I] Launch Management Gate: ${summary.streamI_LaunchManagementGate.status}`);
  assert.strictEqual(summary.streamI_LaunchManagementGate.isGoLiveApproved, true);
  assert.ok(fs.existsSync(path.join(evidenceDir, 'phase16_launch_management_report.json')));

  console.log('--------------------------------------------------------------------------------');
  console.log(' ✅ PHASE 16 LAUNCH MANAGEMENT TEST SUITE PASSED 100% CLEANLY');
  console.log('    🎉 COMMERCIAL_GO_LIVE_APPROVED');
  console.log('--------------------------------------------------------------------------------\n');
}

if (require.main === module) {
  try {
    runPhase16LaunchManagementTests();
  } catch (err) {
    console.error('❌ PHASE 16 TEST SUITE FAILED:', err);
    process.exit(1);
  }
}

module.exports = { runPhase16LaunchManagementTests };
