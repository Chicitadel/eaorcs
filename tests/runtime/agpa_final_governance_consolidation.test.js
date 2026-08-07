/******************************************************************************
 * Project        : Air Roofers Platform Ecosystem
 * Module         : AGPA Final Governance Consolidation Master Test Suite
 * File           : tests/runtime/agpa_final_governance_consolidation.test.js
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
 * - AR-STD-PKG-001 to AR-STD-PKG-020
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

const WorkspaceRegistryEngine = require('../../engine/governance/WorkspaceRegistryEngine');
const AutomaticGovernanceDiscoveryEngine = require('../../engine/governance/AutomaticGovernanceDiscoveryEngine');
const FederatedAutoRegistrationEngine = require('../../engine/federation/FederatedAutoRegistrationEngine');
const AirRoofersPackagingEngine = require('../../engine/packaging/AirRoofersPackagingEngine');

async function runFinalConsolidationTestSuite() {
  console.log('================================================================');
  console.log('Running AGPA Final Governance Consolidation Master Test Suite');
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

  const rootDir = path.join(__dirname, '../..');

  // 1. Complete Standards Lineage File Check (PKG-017, PKG-018, PKG-019, PKG-020, REP-001, INDEX)
  console.log('[Test Stream 1] Complete Standards Lineage Index (AR-STD-PKG-001 to PKG-020)');
  assert(fs.existsSync(path.join(rootDir, 'docs/governance/AR-STD-PKG-017-MandatoryGovernanceInvocation.md')), 'AR-STD-PKG-017 document exists.');
  assert(fs.existsSync(path.join(rootDir, 'docs/governance/AR-STD-PKG-018-PackagingCapabilitySpecification.md')), 'AR-STD-PKG-018 document exists.');
  assert(fs.existsSync(path.join(rootDir, 'docs/governance/AR-STD-PKG-019-VersionCompatibilityMatrix.md')), 'AR-STD-PKG-019 document exists.');
  assert(fs.existsSync(path.join(rootDir, 'docs/governance/AR-STD-PKG-020-GovernanceMeshAndFederation.md')), 'AR-STD-PKG-020 document exists.');
  assert(fs.existsSync(path.join(rootDir, 'docs/governance/AR-STD-REP-001-RepositoryAssetGovernance.md')), 'AR-STD-REP-001 document exists.');
  assert(fs.existsSync(path.join(rootDir, 'docs/governance/AGPA_STANDARDS_LINEAGE_INDEX.md')), 'AGPA Standards Lineage Index exists.');

  // 2. Authoritative Workspace Registry Engine (11 Asset Types)
  console.log('\n[Test Stream 2] Workspace Registry Engine (11 Asset Types)');
  const assetTypes = Object.keys(WorkspaceRegistryEngine.assetTypes);
  assert(assetTypes.length === 11, 'Workspace Registry tracks all 11 workspace asset types.');
  assert(WorkspaceRegistryEngine.resolveEntry('projects/nigeriafrance').type.id === 'Customer Project', 'Resolves Customer Project asset type.');
  assert(WorkspaceRegistryEngine.resolveEntry('products/eaorcs').type.id === 'Product', 'Resolves Product asset type.');

  // 3. Automatic Governance Discovery Engine
  console.log('\n[Test Stream 3] Automatic Governance Discovery Workflow');
  const discovery = AutomaticGovernanceDiscoveryEngine.discoverContext('products/eaorcs');
  assert(discovery.status === 'AUTO_DISCOVERED', 'Runtime context auto-discovered.');
  assert(discovery.loadedStandards.includes('AR-STD-PKG-020'), 'Discovery loads AR-STD-PKG-020 standard automatically.');

  // 4. Federated Auto-Registration Pipeline (9 Manifests)
  console.log('\n[Test Stream 4] Federated Auto-Registration Pipeline (9 Manifests)');
  const tmpDist = path.join(rootDir, 'dist/tmp_test_federation');
  if (fs.existsSync(tmpDist)) fs.rmSync(tmpDist, { recursive: true, force: true });
  fs.mkdirSync(tmpDist, { recursive: true });

  const fedRes = FederatedAutoRegistrationEngine.emitFederatedManifests({ id: 'EAORCS', version: '2026.3.0-LTS' }, tmpDist);
  assert(fedRes.totalManifests === 9, 'Emits all 9 canonical federated manifests.');
  assert(fs.existsSync(path.join(tmpDist, 'federation', 'federation_manifest.json')), 'Federation manifest emitted.');
  assert(fs.existsSync(path.join(tmpDist, 'federation', 'product_manifest.json')), 'Product manifest emitted.');
  assert(fs.existsSync(path.join(tmpDist, 'federation', 'package_manifest.json')), 'Package manifest emitted.');
  assert(fs.existsSync(path.join(tmpDist, 'federation', 'sdk_manifest.json')), 'SDK manifest emitted.');
  assert(fs.existsSync(path.join(tmpDist, 'federation', 'marketplace_manifest.json')), 'Marketplace manifest emitted.');
  assert(fs.existsSync(path.join(tmpDist, 'federation', 'developer_hub_manifest.json')), 'Developer Hub manifest emitted.');
  assert(fs.existsSync(path.join(tmpDist, 'federation', 'licensing_registration.json')), 'Licensing registration emitted.');
  assert(fs.existsSync(path.join(tmpDist, 'federation', 'billing_registration.json')), 'Billing registration emitted.');
  assert(fs.existsSync(path.join(tmpDist, 'federation', 'telemetry_registration.json')), 'Telemetry registration emitted.');

  fs.rmSync(tmpDist, { recursive: true, force: true });

  // 5. AGPA Master Kernel Integrated Packaging Execution
  console.log('\n[Test Stream 5] AGPA Master Kernel Integrated Execution (EAORCS Enterprise)');
  const kernel = new AirRoofersPackagingEngine();
  const pkgRes = kernel.packageProduct('EAORCS', 'Enterprise', null, { invokedViaKernel: true });
  assert(pkgRes.status === 'SUCCESS', 'AGPA Master Kernel completes packaging with 9-manifest registration.');
  assert(fs.existsSync(path.join(pkgRes.packageDir, 'federation', 'federation_manifest.json')), 'Packaged release contains federation manifest directory.');

  console.log(`\n================================================================`);
  console.log(`[FINAL CONSOLIDATION TEST SUITE COMPLETE] Passed ${passed}/${total} assertions (100% SUCCESS)`);
  console.log(`================================================================\n`);
}

if (require.main === module) {
  runFinalConsolidationTestSuite().catch(err => {
    console.error(`[TEST FAILURE] ${err.message}`);
    process.exit(1);
  });
}

module.exports = runFinalConsolidationTestSuite;
