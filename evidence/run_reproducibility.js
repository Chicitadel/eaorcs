/******************************************************************************
 * Project        : EAORCS
 * Module         : Evidence / Reproducibility
 * File           : run_reproducibility.js
 * Version        : 2026.1.0-LTS
 * Author         : Enterprise Architecture Authority
 * Organization   : Ujomor Platform
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE
 *
 * Governance:
 * - Policy Governed
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
 * Copyright (c) 2026 Ujomor Platform
 * All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const HashManifestGenerator = require('./HashManifestGenerator');
const ReproducibilityVerifier = require('./ReproducibilityVerifier');
const SignedEvidenceBundle = require('./SignedEvidenceBundle');

function main() {
  console.log('================================================================================');
  console.log('  EAORCS STREAM DELTA — PHASE 3: REPRODUCIBILITY & EVIDENCE VERIFIER');
  console.log('================================================================================');

  const docsDir = 'docs';
  const manifestPath = 'evidence/hash_manifest.json';
  const bundlePath = 'evidence/signed_evidence_bundle.json';

  // 1. HashManifestGenerator.generate('docs/')
  console.log('\n[STEP 1] Generating Cryptographic Hash Manifest...');
  const manifest = HashManifestGenerator.generate(docsDir);
  console.log(`  - Target Directory : ${docsDir}`);
  console.log(`  - Hashed Files     : ${manifest.fileCount}`);
  console.log(`  - Merkle Root      : ${manifest.merkleRoot}`);
  console.log(`  - Manifest ID      : ${manifest.manifestId}`);
  console.log(`  - Manifest File    : ${manifestPath}`);

  // 2. ReproducibilityVerifier.verify(...)
  console.log('\n[STEP 2] Verifying Reproducibility & Integrity...');
  const verification = ReproducibilityVerifier.verify(manifestPath, docsDir);
  console.log(`  - Total Files      : ${verification.totalFiles}`);
  console.log(`  - Matched Files    : ${verification.matched}`);
  console.log(`  - Drifted Files    : ${verification.drifted.length}`);
  console.log(`  - Stored Root      : ${verification.storedMerkleRoot}`);
  console.log(`  - Recomputed Root  : ${verification.recomputedMerkleRoot}`);
  console.log(`  - Merkle Match     : ${verification.merkleMatch}`);
  console.log(`  - Verdict          : ${verification.verdict}`);

  if (verification.drifted.length > 0) {
    console.error('  - Drift Details    :');
    verification.drifted.forEach(d => {
      console.error(`    * File: ${d.file} | Reason: ${d.reason}`);
    });
  }

  // 3. SignedEvidenceBundle.generate(...)
  console.log('\n[STEP 3] Generating Ed25519 Signed Evidence Bundle...');
  const bundleResult = SignedEvidenceBundle.generate(manifestPath);
  console.log(`  - Bundle ID        : ${bundleResult.bundle.bundleId}`);
  console.log(`  - Algorithm        : Ed25519 (RFC 8032)`);
  console.log(`  - Signature Hex    : ${bundleResult.bundle.signature.substring(0, 32)}...`);
  console.log(`  - Initial Verify   : ${bundleResult.verified ? 'PASSED' : 'FAILED'}`);
  console.log(`  - Saved Bundle     : ${bundlePath}`);

  // 4. SignedEvidenceBundle.verify(...)
  console.log('\n[STEP 4] Verifying Signed Evidence Bundle Disk Artifact...');
  const bundleVerification = SignedEvidenceBundle.verify(bundlePath);
  const signatureStatus = bundleVerification.valid ? 'VERIFIED' : 'FAILED';
  console.log(`  - Valid Signature  : ${bundleVerification.valid}`);
  console.log(`  - Verified BundleID: ${bundleVerification.bundleId}`);
  console.log(`  - Verified Root    : ${bundleVerification.merkleRoot}`);
  console.log(`  - Status           : ${signatureStatus}`);

  // 5. Write docs/reproducibility_report.md
  console.log('\n[STEP 5] Writing Documentation Report (docs/reproducibility_report.md)...');
  const reportLines = [];
  reportLines.push('# EAORCS Cryptographic Hash Manifest & Reproducibility Report');
  reportLines.push('');
  reportLines.push('## Executive Summary');
  reportLines.push('');
  reportLines.push('| Property | Value |');
  reportLines.push('| :--- | :--- |');
  reportLines.push(`| **Generated At** | ${new Date().toISOString()} |`);
  reportLines.push(`| **Merkle Root** | \`${manifest.merkleRoot}\` |`);
  reportLines.push(`| **File Count** | ${manifest.fileCount} |`);
  reportLines.push(`| **Reproducibility Verdict** | **${verification.verdict}** |`);
  reportLines.push(`| **Evidence Bundle ID** | \`${bundleResult.bundle.bundleId}\` |`);
  reportLines.push(`| **Signature Verification** | **${signatureStatus}** |`);
  reportLines.push(`| **Algorithm** | Ed25519 |`);
  reportLines.push('');
  reportLines.push('## Hashed Files Manifest');
  reportLines.push('');
  reportLines.push('| Relative Path | SHA-256 Hash | Size (Bytes) | Generated At |');
  reportLines.push('| :--- | :--- | :--- | :--- |');

  for (const file of manifest.files) {
    reportLines.push(`| \`${file.relativePath}\` | \`${file.sha256}\` | ${file.sizeBytes} | ${file.generatedAt} |`);
  }

  reportLines.push('');
  reportLines.push('---');
  reportLines.push('*Report automatically generated by `evidence/run_reproducibility.js` under UAIGOS Governance Policy.*');

  const reportPath = path.resolve(process.cwd(), 'docs/reproducibility_report.md');
  fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf8');
  console.log(`  - Written Report   : ${reportPath}`);

  // Final Summary
  console.log('\n================================================================================');
  console.log('  FINAL VERIFICATION SUMMARY');
  console.log('================================================================================');
  console.log(`  - File Count Hashed      : ${manifest.fileCount}`);
  console.log(`  - Merkle Root            : ${manifest.merkleRoot}`);
  console.log(`  - Reproducibility Verdict: ${verification.verdict}`);
  console.log(`  - Evidence Bundle ID     : ${bundleResult.bundle.bundleId}`);
  console.log(`  - Signature Status       : ${signatureStatus}`);
  console.log('================================================================================\n');

  const success = (verification.verdict === 'REPRODUCIBLE') && (signatureStatus === 'VERIFIED');
  if (!success) {
    console.error('ERROR: Reproducibility verification failed.');
    process.exit(1);
  }
}

main();
