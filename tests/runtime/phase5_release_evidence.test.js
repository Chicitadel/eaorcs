/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Phase 5 Release Evidence Generator Test Suite
 * File           : phase5_release_evidence.test.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Platform Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

async function runPhase5EvidenceSuite() {
  console.log('\n=== PHASE 5: Release Evidence Manifest Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  // 1. ReleaseEvidenceGenerator Manifest Generation
  try {
    const ReleaseEvidenceGenerator = require('../../engine/release/ReleaseEvidenceGenerator');
    const generator = new ReleaseEvidenceGenerator();

    const manifest = generator.generateEvidenceManifest({
      tests: '37/37 PASSED',
      federationScore: '100/100 (A+)',
      driScore: '100/100 PASS',
    });

    assert.ok(manifest.releaseId.startsWith('rel-2026.3.0-LTS-'));
    assert.strictEqual(manifest.version, '2026.3.0-LTS');
    assert.ok(manifest.hashes.sbomHash.length === 64);
    assert.ok(manifest.hashes.openApiHash.length === 64);
    assert.ok(manifest.signature.length === 64);
    assert.strictEqual(manifest.approvalChain.length, 3);

    console.log('✅ 1. ReleaseEvidenceGenerator PASSED (Signed Manifest Generated Successfully)');
    passed++;
  } catch (err) {
    console.error('❌ 1. ReleaseEvidenceGenerator FAILED:', err.message);
    failed++;
  }

  // 2. Export `release.evidence.json` File
  try {
    const ReleaseEvidenceGenerator = require('../../engine/release/ReleaseEvidenceGenerator');
    const generator = new ReleaseEvidenceGenerator();

    const docsDir = path.join(__dirname, '../../docs');
    const result = generator.exportEvidenceFile(docsDir, { tests: '37/37 PASSED' });

    assert.ok(fs.existsSync(result.filePath), 'release.evidence.json must exist in docs dir');
    const fileContent = JSON.parse(fs.readFileSync(result.filePath, 'utf-8'));
    assert.strictEqual(fileContent.version, '2026.3.0-LTS');
    assert.ok(fileContent.signature.length === 64);

    console.log('✅ 2. Export release.evidence.json PASSED (File Written & Verified)');
    passed++;
  } catch (err) {
    console.error('❌ 2. Export release.evidence.json FAILED:', err.message);
    failed++;
  }

  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} PHASE 5 RELEASE EVIDENCE TESTS PASSED!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runPhase5EvidenceSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runPhase5EvidenceSuite };
