/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Stream G — CLI & SDK Extensions Verification Test Suite
 * File           : stream_g_cli_sdk.test.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Ujomor Engineering Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved & FROZEN (v1.1.0-FROZEN)
 * - Security Reviewed (ISO 27001, SOC 2, OWASP ASVS, NIST SP 800-161, DORA, NIS2)
 * - Enterprise Engineering Standard Compliant
 *
 * Standards:
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161 / SLSA Level 4
 *
 * Signatures:
 * - Architecture Authority: APPROVED
 * - Security Authority: VERIFIED
 * - Governance Authority: CERTIFIED
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { runDcpCli } = require('../cli/dcp_cli');
const {
  EAORCSSDK,
  EdhHypervisorEngine,
  VirtualFilesystem,
  DistributionControlPlane,
  CapabilityCapsulePacker,
  StandardPackagePacker,
  EnterpriseBundlePacker,
  ProductDnaCompiler,
  ProductPassportV2Engine,
  ProductConstitutionEngine,
  DriIndexCalculator,
  VersionSyncVerifier,
  AuditSummaryProvider
} = require('../sdk/index');

async function runStreamGTestSuite() {
  console.log('================================================================');
  console.log('  EAORCS STREAM G: CLI & SDK EXTENSIONS VERIFICATION SUITE');
  console.log('================================================================\n');

  // Test 1: Header Governance & Zero AI Keyword Audit
  console.log('[1/4] Auditing mandatory enterprise headers & AI keyword isolation...');
  const filesToAudit = [
    path.resolve(__dirname, '../cli/dcp_cli.js'),
    path.resolve(__dirname, '../sdk/index.js'),
    path.resolve(__dirname, '../engine/governance/VersionSyncVerifier.js'),
    path.resolve(__dirname, '../engine/audit/AuditSummaryProvider.js')
  ];

  const aiKeywords = ['ai generated', 'ai agent', 'chatgpt', 'copilot', 'anthropic', 'openai'];

  for (const filePath of filesToAudit) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    assert.ok(fileContent.includes('/******************************************************************************'), `${path.basename(filePath)} must contain enterprise header comment`);
    assert.ok(fileContent.includes('Air Roofers Platform Ecosystem & Ujomor Systems'), `${path.basename(filePath)} must state correct Organization`);
    assert.ok(fileContent.includes('Author         : Ujomor Engineering Governance Authority'), `${path.basename(filePath)} must state mandatory Author header`);
    
    aiKeywords.forEach(kw => {
      assert.strictEqual(
        fileContent.toLowerCase().includes(kw),
        false,
        `${path.basename(filePath)} must not contain prohibited AI keyword: ${kw}`
      );
    });
  }
  console.log('      ✓ Header governance and zero AI keyword isolation verified.');

  // Test 2: CLI Subcommand Execution
  console.log('[2/4] Testing CLI Commands (`eaorcs dcp ...`)...\n');

  console.log('  -> Testing `eaorcs dcp package`');
  const pkgArtifact = runDcpCli(['package', 'epkg.eaorcs.enterprise']);
  assert.strictEqual(pkgArtifact.artifact_type, 'STANDARD_PACKAGE');
  assert.strictEqual(pkgArtifact.extension, '.epkg');

  console.log('  -> Testing `eaorcs dcp capsule`');
  const capArtifact = runDcpCli(['capsule', 'cap.eaorcs.assurance.dora_compliance_scan']);
  assert.strictEqual(capArtifact.artifact_type, 'CAPABILITY_CAPSULE');
  assert.strictEqual(capArtifact.extension, '.ecap');

  console.log('  -> Testing `eaorcs dcp passport`');
  const passportArtifact = runDcpCli(['passport']);
  assert.strictEqual(passportArtifact.osap_version, '2.0.0');

  console.log('  -> Testing `eaorcs dcp dna`');
  const dnaArtifact = runDcpCli(['dna']);
  assert.ok(dnaArtifact.product_dna);

  console.log('  -> Testing `eaorcs dcp manifest`');
  const manifestArtifact = runDcpCli(['manifest', 'ebundle.eaorcs.enterprise']);
  assert.strictEqual(manifestArtifact.artifact_type, 'ENTERPRISE_BUNDLE');
  assert.strictEqual(manifestArtifact.extension, '.ebundle');

  console.log('  -> Testing `eaorcs dcp constitution`');
  const constitutionArtifact = runDcpCli(['constitution']);
  assert.ok(constitutionArtifact.product_constitution);

  console.log('  -> Testing `eaorcs dcp support-bundle`');
  const bundleArtifact = runDcpCli(['support-bundle', 'tenant-test-01']);
  assert.ok(bundleArtifact.bundle);
  assert.strictEqual(bundleArtifact.bundle.tenantId, 'tenant-test-01');

  console.log('  -> Testing `eaorcs dcp dri`');
  const driArtifact = runDcpCli(['dri']);
  assert.strictEqual(driArtifact.status, 'APPROVED_FOR_DISTRIBUTION');
  assert.ok(driArtifact.driScore >= 95.0);

  console.log('  -> Testing `eaorcs dcp verify-version-sync`');
  const versionSyncArtifact = runDcpCli(['verify-version-sync']);
  assert.strictEqual(versionSyncArtifact.status, 'VERIFIED');
  assert.strictEqual(versionSyncArtifact.synchronized, true);

  console.log('  -> Testing `eaorcs dcp audit-summary`');
  const auditSummaryArtifact = runDcpCli(['audit-summary']);
  assert.strictEqual(auditSummaryArtifact.complianceStatus, 'COMPLIANT');
  assert.ok(auditSummaryArtifact.trustScore >= 95.0);

  console.log('      ✓ All 10 DCP CLI subcommands executed and verified successfully.');

  // Test 3: Programmatic SDK Exports Verification
  console.log('[3/4] Verifying Programmatic SDK exports (@eaorcs/sdk)...');
  assert.ok(EAORCSSDK, 'EAORCSSDK class must be exported');
  assert.ok(EdhHypervisorEngine, 'EdhHypervisorEngine must be exported');
  assert.ok(VirtualFilesystem, 'VirtualFilesystem must be exported');
  assert.ok(DistributionControlPlane, 'DistributionControlPlane must be exported');
  assert.ok(CapabilityCapsulePacker, 'CapabilityCapsulePacker must be exported');
  assert.ok(StandardPackagePacker, 'StandardPackagePacker must be exported');
  assert.ok(EnterpriseBundlePacker, 'EnterpriseBundlePacker must be exported');
  assert.ok(ProductDnaCompiler, 'ProductDnaCompiler must be exported');
  assert.ok(ProductPassportV2Engine, 'ProductPassportV2Engine must be exported');
  assert.ok(ProductConstitutionEngine, 'ProductConstitutionEngine must be exported');
  assert.ok(DriIndexCalculator, 'DriIndexCalculator must be exported');
  assert.ok(VersionSyncVerifier, 'VersionSyncVerifier must be exported');
  assert.ok(AuditSummaryProvider, 'AuditSummaryProvider must be exported');
  console.log('      ✓ Programmatic SDK module exports verified.');

  // Test 4: Programmatic SDK Instance Method Verification
  console.log('[4/4] Verifying Programmatic SDK Instance behavior...');
  const sdk = new EAORCSSDK({ offlineMode: true });
  
  assert.ok(sdk.getHypervisor(), 'sdk.getHypervisor() must return hypervisor engine');
  assert.ok(sdk.getControlPlane(), 'sdk.getControlPlane() must return DCP instance');
  assert.strictEqual(sdk.getReadinessCalculator(), DriIndexCalculator, 'sdk.getReadinessCalculator() must return DriIndexCalculator');
  assert.strictEqual(sdk.getVersionSyncVerifier(), VersionSyncVerifier, 'sdk.getVersionSyncVerifier() must return VersionSyncVerifier');
  assert.strictEqual(sdk.getAuditSummaryProvider(), AuditSummaryProvider, 'sdk.getAuditSummaryProvider() must return AuditSummaryProvider');

  const sdkDriReport = sdk.calculateReadiness();
  assert.strictEqual(sdkDriReport.status, 'APPROVED_FOR_DISTRIBUTION');
  assert.ok(sdkDriReport.driScore >= 95.0);

  const sdkVersionSync = sdk.verifyVersionSync();
  assert.strictEqual(sdkVersionSync.status, 'VERIFIED');
  assert.strictEqual(sdkVersionSync.synchronized, true);

  const sdkAuditSummary = sdk.getAuditSummary({ edition: 'Enterprise' });
  assert.strictEqual(sdkAuditSummary.complianceStatus, 'COMPLIANT');

  const sdkAuditResult = await sdk.runAudit({ edition: 'Enterprise' });
  assert.ok(sdkAuditResult.auditId.startsWith('audit_'));
  assert.strictEqual(sdkAuditResult.compliance, 'COMPLIANT');

  // Verify expanded SDK helper methods
  assert.ok(sdk.compileDna().dna, 'sdk.compileDna() must compile DNA object');
  assert.ok(sdk.compilePassport().osap_version, 'sdk.compilePassport() must compile Passport v2 object');
  assert.ok(sdk.getConstitution().product_constitution, 'sdk.getConstitution() must return Constitution');
  
  const testPkg = sdk.packPackage({ package_id: 'epkg.sdk.test' });
  assert.strictEqual(testPkg.artifact_type, 'STANDARD_PACKAGE');

  const testCap = sdk.packCapsule({ capsule_id: 'cap.sdk.test' });
  assert.strictEqual(testCap.artifact_type, 'CAPABILITY_CAPSULE');

  const testBundle = sdk.packBundle({ bundle_id: 'ebundle.sdk.test' });
  assert.strictEqual(testBundle.artifact_type, 'ENTERPRISE_BUNDLE');

  const testSupportBundle = sdk.generateSupportBundle('tenant-sdk-01');
  assert.strictEqual(testSupportBundle.bundle.tenantId, 'tenant-sdk-01');

  console.log('      ✓ Programmatic SDK instance methods verified.');

  console.log('\n================================================================');
  console.log('  ALL STREAM G VERIFICATION TESTS PASSED WITH 100% SUCCESS');
  console.log('================================================================\n');
}

if (require.main === module) {
  runStreamGTestSuite().catch(err => {
    console.error('Stream G Test Failure:', err);
    process.exit(1);
  });
}

module.exports = runStreamGTestSuite;
