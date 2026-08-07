/******************************************************************************
 * Project        : EAORCS
 * Module         : Software Distribution Protection Architecture Test Suite
 * File           : tests/runtime/sdpa_protection_architecture.test.js
 * Version        : 2026.3.0-LTS
 * Author         : Enterprise Architecture & Security Governance Board
 * Organization   : Air Roofers Governance Directorate
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
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

const { EAORCSSDK } = require('../../sdk/services/UnifiedServiceLayer');
const AirPackageEngine = require('../../engine/security/AirPackageEngine');
const DualPassportEngine = require('../../engine/passport/DualPassportEngine');
const DistributionAuditGateEngine = require('../../engine/release/DistributionAuditGateEngine');
const buildProtectedRelease = require('../../ci/package-protected-release');

async function runSDPATestSuite() {
  console.log('================================================================');
  console.log('Running Software Distribution Protection Architecture (SDPA) Test Suite');
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

  // 1. Unified Service Layer & Public SDK Contract Test
  console.log('[Test Stream 1] Unified SDK Service Layer Facades');
  const sdk = new EAORCSSDK();
  const govScore = await sdk.getGovernanceScore({ baseScore: 99.2 });
  assert(govScore.status === 'VERIFIED', 'GovernanceScore returns VERIFIED status.');
  assert(govScore.score === 99.2, 'GovernanceScore preserves evaluated numerical score.');

  const policyRes = await sdk.evaluatePolicy('eu-ai-act', { compliant: true });
  assert(policyRes.result === 'PASS', 'Policy evaluation produces expected PASS result.');

  const pubPassport = await sdk.generatePassport({ subject: 'Customer SDK Verification' });
  assert(pubPassport.type === 'PUBLIC_DIGITAL_PASSPORT', 'SDK generates Public Digital Passport.');

  // 2. Encrypted .airpkg Containerization & Capability Entitlement Test
  console.log('\n[Test Stream 2] Encrypted AirPackage (.airpkg) & Entitlement Verification');
  const airEngine = new AirPackageEngine();
  const pkgManifest = {
    capabilityId: 'cap.solution.banking_pci_dss',
    version: '3.1.0',
    issuer: 'Air Roofers Governance Directorate',
    licenseTier: 'ENTERPRISE'
  };
  const pkgContents = { rules: ['PCI_ENCRYPTION', 'TOKENIZATION_AUDIT'] };

  const encryptedPkg = airEngine.createPackage(pkgManifest, pkgContents);
  assert(encryptedPkg.format === 'AIRPKG_V1', 'AirPackage creates AIRPKG_V1 format.');
  assert(typeof encryptedPkg.encryptedData === 'string', 'Payload is encrypted as hex string.');

  const unpacked = airEngine.verifyAndUnpack(encryptedPkg, 'ENTERPRISE');
  assert(unpacked.contents.rules.includes('PCI_ENCRYPTION'), 'Unpacked AirPackage matches original contents.');

  let errorCaught = false;
  try {
    airEngine.verifyAndUnpack(encryptedPkg, 'COMMUNITY'); // insufficient tier
  } catch (err) {
    errorCaught = true;
  }
  assert(errorCaught, 'AirPackage rejects unpacking under insufficient license tier.');

  // 3. Dual Passport Separation & IP Leakage Prevention Test
  console.log('\n[Test Stream 3] Dual Passport Isolation & IP Leakage Prevention');
  const dualEngine = new DualPassportEngine();
  const rawProv = {
    subject: 'Release e418a93',
    version: '2026.3.0-LTS',
    graphData: { privateWeights: [0.99, 0.45] },
    adrLinks: ['ADR-001']
  };
  const dual = dualEngine.generateDualPassport(rawProv);

  assert(dual.publicPassport.classification === 'PUBLIC_CUSTOMER_AUDITOR', 'Public passport has customer classification.');
  assert(dual.internalPassport.classification === 'AIR_ROOFERS_SOVEREIGN_PRIVATE', 'Internal passport has sovereign private classification.');
  assert(!('graphData' in dual.publicPassport), 'Public passport strictly excludes private internal graph data.');
  assert('internalKnowledgeGraph' in dual.internalPassport, 'Internal passport preserves internal knowledge graph data.');

  // 4. Distribution Audit Gate Engine Test
  console.log('\n[Test Stream 4] Distribution Audit Gate Inspection');
  const auditGate = new DistributionAuditGateEngine();

  // Test cleanly packaged release
  const releaseBuild = buildProtectedRelease('Enterprise');
  const gateResult = auditGate.auditDirectory(releaseBuild.distDir);
  assert(gateResult.status === 'PASSED', 'Protected distribution directory passes audit gate.');
  assert(gateResult.violationsCount === 0, 'Zero violations detected in clean release.');

  // Test intentionally compromised release directory
  const dirtyDir = path.join(__dirname, '../../dist/EAORCS-DirtyTest');
  if (fs.existsSync(dirtyDir)) fs.rmSync(dirtyDir, { recursive: true, force: true });
  fs.mkdirSync(dirtyDir, { recursive: true });
  fs.mkdirSync(path.join(dirtyDir, 'engine'), { recursive: true }); // prohibited folder
  fs.writeFileSync(path.join(dirtyDir, 'engine', 'secret.test.js'), 'console.log("leak");');

  const dirtyResult = auditGate.auditDirectory(dirtyDir);
  assert(dirtyResult.status === 'FAILED_GATE', 'Distribution audit gate successfully detects prohibited directory.');
  assert(dirtyResult.violationsCount > 0, 'Audit gate flags violation for prohibited engine directory.');

  fs.rmSync(dirtyDir, { recursive: true, force: true });

  console.log(`\n================================================================`);
  console.log(`[SDPA TEST SUITE COMPLETE] Passed ${passed}/${total} assertions (100% SUCCESS)`);
  console.log(`================================================================\n`);
}

if (require.main === module) {
  runSDPATestSuite().catch(err => {
    console.error(`[TEST FAILURE] ${err.message}`);
    process.exit(1);
  });
}

module.exports = runSDPATestSuite;
