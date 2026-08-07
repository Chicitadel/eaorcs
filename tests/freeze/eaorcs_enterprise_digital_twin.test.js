/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Enterprise Digital Twin Test Suite
 * File           : eaorcs_enterprise_digital_twin.test.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Stream I - Enterprise Digital Twin Verification Test
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

const EnterpriseDigitalTwinEngine = require('../../engine/platform/EnterpriseDigitalTwinEngine');

function runEnterpriseDigitalTwinTestSuite() {
  console.log('================================================================');
  console.log('  EAORCS STREAM I TEST: ENTERPRISE DIGITAL TWIN');
  console.log('================================================================\n');

  const engine = new EnterpriseDigitalTwinEngine();
  const testOutputPath = path.join(__dirname, '../../release/ENTERPRISE_DIGITAL_TWIN.yaml');

  console.log('[Stream I] Exporting Enterprise Digital Twin YAML...');
  const result = engine.exportEnterpriseDigitalTwinYaml(testOutputPath);

  assert.ok(result, 'Result payload must be returned');
  assert.ok(result.twinData, 'twinData must be present');
  assert.ok(result.twinData.metadata.twinId.startsWith('EDT-'), 'Twin ID must start with EDT-');

  // Operational Model Assertions
  assert.ok(result.twinData.liveOperationalModel.systemNodes.length >= 3);
  assert.strictEqual(result.twinData.liveOperationalModel.operationalHealthStatus, '100% OPERATIONAL');

  // Dependency Graph Assertions
  assert.ok(result.twinData.dependencyGraph.coreModules.length >= 3);
  assert.strictEqual(result.twinData.dependencyGraph.internalExternalBindings.nodeBuiltinsOnly, true);

  // Governance Graph Assertions
  assert.strictEqual(result.twinData.governanceGraph.constitutionalLaws.length, 14);
  assert.strictEqual(result.twinData.governanceGraph.arbControlPoints.architectureReviewBoardApproved, true);

  // Runtime / Procurement Visualization Assertions
  assert.strictEqual(result.twinData.runtimeProcurementVisualization.procurementPackageStatus.securityPackage, 'GENERATED_CERTIFIED');
  assert.strictEqual(result.twinData.runtimeProcurementVisualization.procurementPackageStatus.compliancePackage, 'GENERATED_VERIFIED');

  // Verify YAML output file on disk
  assert.ok(fs.existsSync(testOutputPath), 'ENTERPRISE_DIGITAL_TWIN.yaml must exist on disk');
  const yamlContent = fs.readFileSync(testOutputPath, 'utf8');
  assert.ok(yamlContent.includes('UNIVERSAL AUTONOMOUS AI GOVERNANCE OPERATING SYSTEM'), 'YAML header must be present');
  assert.ok(yamlContent.includes('liveOperationalModel:'), 'YAML content must include liveOperationalModel');
  assert.ok(yamlContent.includes('dependencyGraph:'), 'YAML content must include dependencyGraph');
  assert.ok(yamlContent.includes('governanceGraph:'), 'YAML content must include governanceGraph');
  assert.ok(yamlContent.includes('runtimeProcurementVisualization:'), 'YAML content must include runtimeProcurementVisualization');

  console.log('  ✓ Stream I 100% PASS: Enterprise Digital Twin verified.\n');
}

runEnterpriseDigitalTwinTestSuite();
