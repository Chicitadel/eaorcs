/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Security Certification Package Test Suite
 * File           : eaorcs_security_certification_package.test.js
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
 * CORP: Stream G - Security Package Verification Test
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

const SecurityCertificationPackageEngine = require('../../engine/security/SecurityCertificationPackageEngine');

function runSecurityPackageTestSuite() {
  console.log('================================================================');
  console.log('  EAORCS STREAM G TEST: SECURITY CERTIFICATION PACKAGE');
  console.log('================================================================\n');

  const engine = new SecurityCertificationPackageEngine();
  const testOutputPath = path.join(__dirname, '../../release/SECURITY_CERTIFICATION_PACKAGE.json');

  console.log('[Stream G] Generating Security Certification Package...');
  const pkg = engine.generateSecurityPackage(testOutputPath);

  assert.ok(pkg, 'Package payload must be returned');
  assert.ok(pkg.packageId.startsWith('SEC-PKG-'), 'Package ID must start with SEC-PKG-');
  assert.strictEqual(pkg.status, 'CERTIFIED');
  assert.strictEqual(pkg.version, '2026.3.1-LTS');
  assert.ok(pkg.signedAttestationDigest.length > 0, 'Signed attestation digest must be present');

  // Zero Trust Assertions
  assert.strictEqual(pkg.zeroTrust.architectureModel, 'ZERO_TRUST_NEVER_TRUST_ALWAYS_VERIFY');
  assert.strictEqual(pkg.zeroTrust.mtlsEnforcement.enabled, true);
  assert.strictEqual(pkg.zeroTrust.mtlsEnforcement.tlsVersion, 'TLSv1.3');
  assert.strictEqual(pkg.zeroTrust.rbacPolicies.defaultPolicy, 'DENY_ALL');

  // SBOM Assertions
  assert.strictEqual(pkg.sbom.format, 'SPDX-2.3');
  assert.ok(pkg.sbom.packages.length >= 2, 'Must contain SBOM packages');
  assert.strictEqual(pkg.sbom.vulnerabilityScanResults.critical, 0);

  // RBOM Assertions
  assert.strictEqual(pkg.rbom.processProfile.executionSandbox, 'SECCOMP_STRICT');
  assert.strictEqual(pkg.rbom.containerSpecs.readOnlyRootFilesystem, true);

  // Secrets Isolation Assertions
  assert.strictEqual(pkg.secretsIsolation.vaultIntegration.status, 'CONNECTED');
  assert.strictEqual(pkg.secretsIsolation.kmsKeyRotation.policy, '90_DAYS_ROTATION');

  // Audit Logs Assertions
  assert.strictEqual(pkg.auditLogs.tamperEvidentChain.hashAlgorithm, 'SHA-256');
  assert.strictEqual(pkg.auditLogs.retentionPolicy.auditLogRetentionYears, 7);

  // Verify file on disk
  assert.ok(fs.existsSync(testOutputPath), 'SECURITY_CERTIFICATION_PACKAGE.json must exist on disk');
  const diskContent = JSON.parse(fs.readFileSync(testOutputPath, 'utf8'));
  assert.strictEqual(diskContent.packageId, pkg.packageId);

  console.log('  ✓ Stream G 100% PASS: Security Certification Package verified.\n');
}

runSecurityPackageTestSuite();
