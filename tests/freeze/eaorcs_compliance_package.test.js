/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Compliance Package Test Suite
 * File           : eaorcs_compliance_package.test.js
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
 * CORP: Stream H - Compliance Package Verification Test
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

const CompliancePackageEngine = require('../../engine/compliance/CompliancePackageEngine');

function runCompliancePackageTestSuite() {
  console.log('================================================================');
  console.log('  EAORCS STREAM H TEST: COMPLIANCE PACKAGE');
  console.log('================================================================\n');

  const engine = new CompliancePackageEngine();
  const testOutputPath = path.join(__dirname, '../../release/COMPLIANCE_PACKAGE.json');

  console.log('[Stream H] Generating Compliance Package...');
  const pkg = engine.generateCompliancePackage(testOutputPath);

  assert.ok(pkg, 'Compliance package payload must be returned');
  assert.ok(pkg.packageId.startsWith('CMP-PKG-'), 'Package ID must start with CMP-PKG-');
  assert.strictEqual(pkg.complianceStatus, 'COMPLIANT_VERIFIED');
  assert.strictEqual(pkg.complianceVersion, '2026.3.1-LTS');
  assert.ok(pkg.signedAttestationDigest.length > 0, 'Signed attestation digest must be present');

  // GDPR Retention Assertions
  assert.strictEqual(pkg.gdpr7YearRetention.dataRetentionPeriodYears, 7);
  assert.strictEqual(pkg.gdpr7YearRetention.rightToErasureWorkflow.automatedErasureTrigger, true);
  assert.strictEqual(pkg.gdpr7YearRetention.evidenceArchive.immutableWormStorage, true);

  // EU DORA Assertions
  assert.strictEqual(pkg.euDora.ictRiskManagement.disasterRecoveryRtoMinutes, 15);
  assert.strictEqual(pkg.euDora.ictRiskManagement.disasterRecoveryRpoMinutes, 0);
  assert.strictEqual(pkg.euDora.incidentReporting.initialNotificationWindowHours, 4);

  // NIS2 Attestation Assertions
  assert.strictEqual(pkg.nis2Attestation.networkSystemSecurity.zeroTrustNetworkArchitecture, 'ENFORCED');
  assert.strictEqual(pkg.nis2Attestation.executiveLiabilityAttestation.attestationStatus, 'VERIFIED_COMPLIANT');
  assert.strictEqual(pkg.nis2Attestation.cryptographyPolicies.encryptionInTransit, 'TLS_1_3_ONLY');

  // Mappings Assertions
  assert.strictEqual(pkg.isoSoc2OwaspMappings.iso27001AnnexA.compliancePercentage, 100);
  assert.strictEqual(pkg.isoSoc2OwaspMappings.soc2TrustServicesCriteria.security, '100% COMPLIANT');
  assert.strictEqual(pkg.isoSoc2OwaspMappings.owaspAsvs.verificationLevel, 'LEVEL_3_ADVANCED');

  // Verify file on disk
  assert.ok(fs.existsSync(testOutputPath), 'COMPLIANCE_PACKAGE.json must exist on disk');
  const diskContent = JSON.parse(fs.readFileSync(testOutputPath, 'utf8'));
  assert.strictEqual(diskContent.packageId, pkg.packageId);

  console.log('  ✓ Stream H 100% PASS: Compliance Package verified.\n');
}

runCompliancePackageTestSuite();
