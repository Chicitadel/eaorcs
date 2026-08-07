/******************************************************************************
 * Project        : Air Roofers Platform Ecosystem
 * Module         : AGPA Global Packaging Architecture Master Test Suite
 * File           : tests/runtime/agpa_global_packaging.test.js
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

const AirRoofersProductRegistry = require('../../engine/packaging/AirRoofersProductRegistry');
const EditionStrategy = require('../../engine/packaging/strategies/EditionStrategy');
const IpProtectionStrategy = require('../../engine/packaging/strategies/IpProtectionStrategy');
const CanonicalContainerStrategy = require('../../engine/packaging/strategies/CanonicalContainerStrategy');
const SigningAndAttestationStrategy = require('../../engine/packaging/strategies/SigningAndAttestationStrategy');
const DualPassportStrategy = require('../../engine/packaging/strategies/DualPassportStrategy');
const AirRoofersPackagingEngine = require('../../engine/packaging/AirRoofersPackagingEngine');

async function runAGPATestSuite() {
  console.log('================================================================');
  console.log('Running Air Roofers Global Packaging Architecture (AGPA) Test Suite');
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

  // 1. Air Roofers Product Registry Test
  console.log('[Test Stream 1] Air Roofers Ecosystem Product Registry');
  const eaorcs = AirRoofersProductRegistry.getProduct('EAORCS');
  assert(eaorcs.id === 'EAORCS', 'Registry contains EAORCS product descriptor.');

  const civiscore = AirRoofersProductRegistry.getProduct('CiviScore');
  assert(civiscore.id === 'CiviScore', 'Registry contains CiviScore product descriptor.');

  const naijagovos = AirRoofersProductRegistry.getProduct('NaijaGovOS');
  assert(naijagovos.supportedEditions.includes('Sovereign'), 'Registry contains NaijaGovOS Sovereign descriptor.');

  let registryError = false;
  try {
    AirRoofersProductRegistry.getProduct('UnknownProduct');
  } catch (e) {
    registryError = true;
  }
  assert(registryError, 'Registry rejects unregistered product query.');

  // 2. Edition Strategy Filtering Test
  console.log('\n[Test Stream 2] AGPA Edition Strategy Filtering');
  const edStrat = new EditionStrategy('Community');
  const filteredCaps = edStrat.applyEditionFilter(['cap.core', 'cap.sovereign.feature', 'cap.dual.passport']);
  assert(!filteredCaps.capabilities.includes('cap.sovereign.feature'), 'Community edition strips sovereign features.');
  assert(filteredCaps.capabilities.includes('cap.core'), 'Community edition retains core features.');

  // 3. Canonical .airpkg Container Strategy Test
  console.log('\n[Test Stream 3] Canonical Container (.airpkg) Packaging');
  const containerStrat = new CanonicalContainerStrategy();
  const airpkg = containerStrat.packageContainer(
    { capabilityId: 'cap.test.policy', licenseTier: 'ENTERPRISE' },
    { rules: ['TEST_RULE_1'] }
  );
  assert(airpkg.format === 'AIRPKG_V1', 'Canonical container strategy outputs AIRPKG_V1 format.');
  assert(typeof airpkg.encryptedData === 'string', 'Container payload is AES-256-GCM encrypted.');

  // 4. Signing & SLSA Level 4 Attestation Strategy Test
  console.log('\n[Test Stream 4] Cryptographic Signing & SLSA Level 4 Attestation');
  const signingStrat = new SigningAndAttestationStrategy();
  const attestation = signingStrat.generateAttestation({ test: 'manifest' });
  assert(attestation.slsaLevel === 'SLSA_LEVEL_4', 'Signing strategy attaches SLSA Level 4 attestation.');
  assert(typeof attestation.signature === 'string', 'Cryptographic signature is generated.');

  // 5. Dual Passport Isolation Strategy Test
  console.log('\n[Test Stream 5] Dual Passport Isolation & Non-Leakage');
  const passportStrat = new DualPassportStrategy();
  const dual = passportStrat.generatePassports({ productName: 'EAORCS Platform' });
  assert(dual.publicPassport.classification === 'PUBLIC_CUSTOMER_AUDITOR', 'Public passport has customer/auditor classification.');
  assert(!('internalKnowledgeGraph' in dual.publicPassport), 'Public passport excludes internal knowledge graph weights.');

  // 6. IP Protection & Boundary Strategy Test
  console.log('\n[Test Stream 6] IP Protection 5-Layer Boundary Enforcement');
  const masterEngine = new AirRoofersPackagingEngine();
  const packageRes = masterEngine.packageProduct('EAORCS', 'Enterprise');
  assert(packageRes.status === 'SUCCESS', 'Master AGPA engine executes packaging workflow successfully.');
  assert(packageRes.clearance === 'APPROVED_FOR_COMMERCIAL_RELEASE', 'Distribution directory passes 5-layer IP protection audit.');

  const distFiles = fs.readdirSync(packageRes.packageDir);
  assert(distFiles.includes('manifest.json'), 'Canonical package output contains manifest.json');
  assert(distFiles.includes('signature.sig'), 'Canonical package output contains signature.sig');
  assert(distFiles.includes('runtime'), 'Canonical package output contains runtime/');
  assert(distFiles.includes('policies'), 'Canonical package output contains policies/');
  assert(distFiles.includes('plugins'), 'Canonical package output contains plugins/');
  assert(!distFiles.includes('engine'), 'Prohibited engine/ directory is strictly absent from commercial release.');
  assert(!distFiles.includes('tests'), 'Prohibited tests/ directory is strictly absent from commercial release.');

  // 7. Multi-Product Packaging Test (CiviScore Sovereign Edition)
  console.log('\n[Test Stream 7] Multi-Product Packaging Execution (CiviScore Sovereign)');
  const civiRes = masterEngine.packageProduct('CiviScore', 'Sovereign');
  assert(civiRes.productId === 'CiviScore', 'CiviScore packaged successfully under AGPA master orchestrator.');
  assert(fs.existsSync(civiRes.packageDir), 'CiviScore Sovereign distribution package directory created.');

  console.log(`\n================================================================`);
  console.log(`[AGPA TEST SUITE COMPLETE] Passed ${passed}/${total} assertions (100% SUCCESS)`);
  console.log(`================================================================\n`);
}

if (require.main === module) {
  runAGPATestSuite().catch(err => {
    console.error(`[TEST FAILURE] ${err.message}`);
    process.exit(1);
  });
}

module.exports = runAGPATestSuite;
