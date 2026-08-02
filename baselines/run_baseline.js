/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness Certification System (EAORCS)
 * Module         : Versioned Qualification Baselines (Stream Epsilon)
 * File           : run_baseline.js
 * Version        : 2026.1.0-LTS
 * Author         : EAORCS Platform Engineering Team & Architectural Governance Council
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
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
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const BaselineManager = require('./BaselineManager');
const DriftDetector = require('./DriftDetector');

function main() {
  console.log('================================================================');
  console.log('  EAORCS Qualification Baseline Lifecycle & Drift Detection');
  console.log('================================================================\n');

  const VERSION = '2026.1.0-lts';
  const manager = new BaselineManager('baselines');
  const detector = new DriftDetector(manager);

  // Step 1: List existing baselines
  console.log('[1/4] Listing existing baselines...');
  const existing = manager.list();
  if (existing.length === 0) {
    console.log('  No prior baselines found.');
  } else {
    existing.forEach(b => {
      console.log(`  - Version: ${b.version} | ID: ${b.baselineId} | Files: ${b.fileCount} | Merkle: ${b.merkleRoot}`);
    });
  }
  console.log('');

  // Step 2: Capture baseline from docs/
  console.log(`[2/4] Capturing ${VERSION} baseline from docs/...`);
  const baseline = manager.capture(VERSION, 'docs');
  console.log(`  Baseline ID : ${baseline.baselineId}`);
  console.log(`  File Count  : ${baseline.fileCount}`);
  console.log(`  Merkle Root : ${baseline.merkleRoot}`);
  console.log(`  Captured At : ${baseline.capturedAt}\n`);

  // Step 3: Verify baseline integrity via drift detection
  console.log('[3/4] Verifying baseline integrity (drift detection)...');
  const driftResult = detector.detect(VERSION, 'docs');
  console.log(`  Drift Verdict: ${driftResult.verdict}`);
  console.log(`  Drift Count  : ${driftResult.driftCount}\n`);

  // Step 4: Promote version baseline to canonical release baseline
  console.log(`[4/4] Promoting ${VERSION} as canonical release baseline...`);
  const promoted = manager.promote(VERSION);
  console.log(`  Promoted To : baselines/current.json`);
  console.log(`  Promoted At : ${promoted.promotedAt}\n`);

  // Step 5: Write docs/baseline_report.md
  console.log('Generating baseline qualification report at docs/baseline_report.md...');
  const first20 = baseline.files.slice(0, 20);

  let reportMd = `/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness Certification System (EAORCS)
 * Module         : Versioned Qualification Baseline Report
 * File           : baseline_report.md
 * Version        : 2026.1.0-LTS
 * Author         : EAORCS Platform Engineering Team & Architectural Governance Council
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : ${new Date().toISOString().split('T')[0]}
 * Last Modified  : ${new Date().toISOString().split('T')[0]}
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

# EAORCS Qualification Baseline Report

## Qualification Baseline Summary

- **Baseline ID**: \`${baseline.baselineId}\`
- **Version**: \`${VERSION}\`
- **Files Captured**: ${baseline.fileCount}
- **Merkle Root**: \`${baseline.merkleRoot}\`
- **Captured At**: \`${baseline.capturedAt}\`
- **Drift Verdict**: \`${driftResult.verdict}\`

---

## File Fingerprint Manifest (First 20 Entries)

| Index | Relative File Path | SHA-256 Digest | Size (Bytes) |
|---|---|---|---|
`;

  first20.forEach((f, idx) => {
    reportMd += `| ${idx + 1} | \`${f.relativePath}\` | \`${f.sha256}\` | ${f.sizeBytes} |\n`;
  });

  if (baseline.files.length > 20) {
    reportMd += `\n*... and ${baseline.files.length - 20} additional files captured in complete baseline manifest.*\n`;
  }

  reportMd += `
---

## Governance & Verification Statement

This baseline represents the immutable, cryptographic qualification snapshot for version **${VERSION}**.
All documented specifications, schemas, architectural blueprints, and verification reports contained within \`docs/\` have been frozen and Merkle-hashed.

This baseline is the authoritative reference for EAORCS 2026.1.0-LTS
`;

  const reportPath = path.join('docs', 'baseline_report.md');
  fs.writeFileSync(reportPath, reportMd, 'utf8');
  console.log(`Report successfully written to ${reportPath}.\n`);

  // Final Summary Output
  console.log('================================================================');
  console.log('  QUALIFICATION BASELINE CAPTURE SUMMARY');
  console.log('================================================================');
  console.log(`  Version       : ${VERSION}`);
  console.log(`  Baseline ID   : ${baseline.baselineId}`);
  console.log(`  File Count    : ${baseline.fileCount}`);
  console.log(`  Merkle Root   : ${baseline.merkleRoot}`);
  console.log(`  Drift Verdict : ${driftResult.verdict}`);
  console.log('================================================================\n');

  if (driftResult.verdict === 'BASELINE_MATCH') {
    process.exit(0);
  } else {
    console.error('ERROR: Baseline drift detected immediately after capture!');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
