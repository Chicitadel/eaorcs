/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Stream H — Readiness & DRI Governance
 * File           : verify_version_sync.js
 * Version        : 2026.2.0-LTS
 * Author         : Ujomor Engineering Governance Authority
 * Organization   : Ujomor Systems & EAORCS Ecosystem Governance
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
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
 * Copyright (c) 2026 Ujomor Systems & EAORCS Ecosystem Governance
 * All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');

function verifyVersionSync() {
  console.log('================================================================');
  console.log('  EAORCS Stream H — Version Synchronization Verification Engine');
  console.log('================================================================\n');

  const baseDir = process.cwd();
  let passedChecks = 0;
  let totalChecks = 0;

  function assertCheck(description, condition, details = '') {
    totalChecks++;
    if (condition) {
      passedChecks++;
      console.log(`  [PASS] ${description}${details ? ' -> ' + details : ''}`);
    } else {
      console.error(`  [FAIL] ${description}${details ? ' -> ' + details : ''}`);
    }
  }

  // 1. Verify Root version_synchronization.json
  const rootSyncPath = path.join(baseDir, 'version_synchronization.json');
  const rootExists = fs.existsSync(rootSyncPath);
  assertCheck('Root version_synchronization.json presence', rootExists, rootSyncPath);

  let rootData = {};
  if (rootExists) {
    try {
      rootData = JSON.parse(fs.readFileSync(rootSyncPath, 'utf8'));
    } catch (e) {
      assertCheck('Root version_synchronization.json parseable', false, e.message);
    }
  }

  // 2. Verify Docs audit version_synchronization.json
  const docsSyncPath = path.join(baseDir, 'docs/audit/version_synchronization.json');
  const docsExists = fs.existsSync(docsSyncPath);
  assertCheck('Docs audit version_synchronization.json presence', docsExists, docsSyncPath);

  let docsData = {};
  if (docsExists) {
    try {
      docsData = JSON.parse(fs.readFileSync(docsSyncPath, 'utf8'));
    } catch (e) {
      assertCheck('Docs audit version_synchronization.json parseable', false, e.message);
    }
  }

  // 3. Assert specific version parameters in root manifest
  const expectedVersions = {
    blueprintVersion: 'v1.0',
    dpaPdaVersion: 'v1.1.0-FROZEN',
    architectureIndexVersion: 'v1.0',
    uaegosVersion: 'v3.0.0',
    productVersion: '2026.2.0-LTS',
    packageVersion: '2026.2.0-LTS'
  };

  for (const [key, expectedVal] of Object.entries(expectedVersions)) {
    const actualVal = rootData[key] || (rootData.versions && rootData.versions[key.replace(/([A-Z])/g, '_$1').toLowerCase()]);
    assertCheck(`Root Manifest Version Parameter [${key}]`, actualVal === expectedVal, `Expected: ${expectedVal}, Got: ${actualVal}`);
  }

  // 4. Assert root & docs manifests synchronization parity
  const parityMatch = JSON.stringify(rootData) === JSON.stringify(docsData);
  assertCheck('Root & Docs Version Synchronization Parity', parityMatch);

  // 5. Verify package.json synchronization
  const pkgPath = path.join(baseDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    assertCheck('package.json version matches Product/Package Version (2026.2.0-LTS)',
      pkg.version && pkg.version.toUpperCase() === expectedVersions.packageVersion.toUpperCase(),
      `package.json version: ${pkg.version}`
    );
  } else {
    assertCheck('package.json presence', false);
  }

  // 6. Verify product.manifest.yaml & distribution_manifest.yaml
  const productManifestPath = path.join(baseDir, 'product.manifest.yaml');
  if (fs.existsSync(productManifestPath)) {
    const content = fs.readFileSync(productManifestPath, 'utf8');
    const hasSpec = content.includes('DPA/PDA v1.1.0-FROZEN');
    const hasVer = content.includes('2026.2.0-LTS');
    assertCheck('product.manifest.yaml alignment', hasSpec && hasVer, 'v1.1.0-FROZEN & 2026.2.0-LTS verified');
  }

  const distManifestPath = path.join(baseDir, 'distribution_manifest.yaml');
  if (fs.existsSync(distManifestPath)) {
    const content = fs.readFileSync(distManifestPath, 'utf8');
    const hasSpec = content.includes('DPA/PDA v1.1.0-FROZEN');
    const hasVer = content.includes('2026.2.0-LTS');
    assertCheck('distribution_manifest.yaml alignment', hasSpec && hasVer, 'v1.1.0-FROZEN & 2026.2.0-LTS verified');
  }

  // 7. Verify compatibility_matrix.json
  const matrixPath = path.join(baseDir, 'compatibility_matrix.json');
  if (fs.existsSync(matrixPath)) {
    const content = fs.readFileSync(matrixPath, 'utf8');
    const hasBlueprint = content.includes('EAORCS Blueprint v1.0');
    assertCheck('compatibility_matrix.json Blueprint & Spec alignment', hasBlueprint, 'Blueprint v1.0 verified');
  }

  console.log(`\n----------------------------------------------------------------`);
  console.log(`Results: ${passedChecks} / ${totalChecks} checks passed (${Math.round((passedChecks / totalChecks) * 100)}%)`);
  console.log(`----------------------------------------------------------------\n`);

  if (passedChecks === totalChecks) {
    console.log('🎉 VERIFICATION SUCCESS: All version synchronization assertions PASSED.');
    if (require.main === module) {
      process.exit(0);
    }
    return true;
  } else {
    console.error('❌ VERIFICATION FAILURE: Version synchronization assertions FAILED.');
    if (require.main === module) {
      process.exit(1);
    }
    return false;
  }
}

if (require.main === module) {
  verifyVersionSync();
}

module.exports = { verifyVersionSync };
