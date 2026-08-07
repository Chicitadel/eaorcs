/******************************************************************************
 * Project        : Air Roofers Platform Ecosystem
 * Module         : AGPA Governance Kernel & Mandatory Standards Master Test Suite
 * File           : tests/runtime/agpa_kernel_mandatory_governance.test.js
 * Version        : 2026.3.0-LTS
 * Author         : Enterprise Architecture & Security Governance Board
 * Organization   : Air Roofers Governance Directorate
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE
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
 * - AR-STD-PKG-017
 * - AR-STD-REP-001
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Air Roofers Governance Directorate
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');

const RepositoryIntelligenceEngine = require('../../engine/governance/RepositoryIntelligenceEngine');
const GovernanceKernelGateEngine = require('../../engine/governance/GovernanceKernelGateEngine');
const AirRoofersPackagingEngine = require('../../engine/packaging/AirRoofersPackagingEngine');

async function runAGPAKernelTestSuite() {
  console.log('================================================================');
  console.log('Running AGPA Governance Kernel & Mandatory Standards Test Suite');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Repository Intelligence Engine Path-Based Asset Classification (AR-STD-REP-001)
  console.log('[Test Stream 1] Repository Intelligence Engine Asset Classification (AR-STD-REP-001)');
  const classA = RepositoryIntelligenceEngine.classifyTarget('products/eaorcs');
  assert(classA.assetClass === 'CLASS_A', 'products/eaorcs classified as Class A (Commercial Product).');
  assert(classA.requiresLicensing === true, 'Class A commercial products require commercial licensing.');

  const classD = RepositoryIntelligenceEngine.classifyTarget('projects/nigeriafrance');
  assert(classD.assetClass === 'CLASS_D', 'projects/nigeriafrance classified as Class D (Customer Project).');
  assert(classD.requiresContractMetadata === true, 'Class D customer projects require contract metadata.');

  const classB = RepositoryIntelligenceEngine.classifyTarget('platform/core');
  assert(classB.assetClass === 'CLASS_B', 'platform/core classified as Class B (Platform Subsystem).');

  const classC = RepositoryIntelligenceEngine.classifyTarget('services/audit');
  assert(classC.assetClass === 'CLASS_C', 'services/audit classified as Class C (Platform Service).');

  const classE = RepositoryIntelligenceEngine.classifyTarget('shared/sdk');
  assert(classE.assetClass === 'CLASS_E', 'shared/sdk classified as Class E (Reusable Component).');

  const classF = RepositoryIntelligenceEngine.classifyTarget('blueprints/policy');
  assert(classF.assetClass === 'CLASS_F', 'blueprints/policy classified as Class F (Knowledge Asset).');

  // 2. Default-Deny Governance Gate & Exception Engine (AR-STD-PKG-017)
  console.log('\n[Test Stream 2] Default-Deny Governance Gate & Controlled Exception Engine (AR-STD-PKG-017)');
  const gateEngine = new GovernanceKernelGateEngine();

  // Test Kernel Invocation
  const kernelClearance = gateEngine.evaluateClearance({ invokedViaKernel: true });
  assert(kernelClearance.verdict === 'APPROVED', 'AGPA Kernel invocation cleared by gate.');

  // Test Direct Un-governed Bypass Block
  let blockCaught = false;
  try {
    gateEngine.evaluateClearance({ invokedViaKernel: false });
  } catch (err) {
    blockCaught = true;
  }
  assert(blockCaught, 'Default-deny gate blocks direct un-governed invocation.');

  // Test Controlled Exception Authorization
  const futureExpiry = new Date(Date.now() + 86400000).toISOString();
  const exceptionVerdict = gateEngine.evaluateClearance({
    invokedViaKernel: false,
    exceptionToken: {
      approver: 'Security Governance Board Director',
      justification: 'Disaster Recovery Staging Execution',
      expiresAt: futureExpiry
    }
  });
  assert(exceptionVerdict.verdict === 'APPROVED_EXCEPTION', 'Controlled exception token cleared by gate.');
  assert(typeof exceptionVerdict.certificate.signature === 'string', 'Immutable Exception Certificate generated.');

  // 3. Customer Project Delivery Packaging (projects/nigeriafrance)
  console.log('\n[Test Stream 3] Customer Project Delivery Packaging Execution (projects/nigeriafrance)');
  const kernelEngine = new AirRoofersPackagingEngine();
  const projResult = kernelEngine.packageProduct('projects/nigeriafrance', 'Delivery', null, { invokedViaKernel: true });

  assert(projResult.status === 'SUCCESS', 'AGPA Master Kernel packages customer project successfully.');
  assert(projResult.assetClass === 'CLASS_D', 'Customer project processed under Class D profile.');

  const projDeliveryDir = projResult.projectResult.outputDir;
  assert(fs.existsSync(path.join(projDeliveryDir, 'contract', 'CONTRACT_METADATA.json')), 'Delivery package contains CONTRACT_METADATA.json.');
  assert(fs.existsSync(path.join(projDeliveryDir, 'evidence', 'DELIVERY_EVIDENCE.json')), 'Delivery package contains DELIVERY_EVIDENCE.json.');
  assert(fs.existsSync(path.join(projDeliveryDir, 'passport', 'PROJECT_PASSPORT.json')), 'Delivery package contains PROJECT_PASSPORT.json.');

  // 4. Commercial Product AGPA Packaging (EAORCS)
  console.log('\n[Test Stream 4] Commercial Product AGPA Packaging Execution (EAORCS)');
  const prodResult = kernelEngine.packageProduct('EAORCS', 'Enterprise', null, { invokedViaKernel: true });
  assert(prodResult.status === 'SUCCESS', 'AGPA Master Kernel packages EAORCS commercial product.');
  assert(prodResult.assetClass === 'CLASS_A', 'EAORCS processed under Class A commercial product profile.');

  console.log(`\n================================================================`);
  console.log(`[AGPA KERNEL TEST SUITE COMPLETE] Passed ${passed}/${total} assertions (100% SUCCESS)`);
  console.log(`================================================================\n`);
}

if (require.main === module) {
  runAGPAKernelTestSuite().catch(err => {
    console.error(`[TEST FAILURE] ${err.message}`);
    process.exit(1);
  });
}

module.exports = runAGPAKernelTestSuite;
