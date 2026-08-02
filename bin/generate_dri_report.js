/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Stream H — Readiness & DRI Governance
 * File           : generate_dri_report.js
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
const DriIndexCalculator = require('../engine/readiness/DriIndexCalculator');
const HtmlDashboardGenerator = require('../engine/reports/HtmlDashboardGenerator');

function main() {
  console.log('================================================================');
  console.log('  EAORCS Quantitative Distribution Readiness Index (DRI) Generator');
  console.log('================================================================\n');

  const report = DriIndexCalculator.calculateReport();
  report.productName = 'EAORCS Master Platform';

  console.log(`[DRI EVALUATION SUMMARY]`);
  console.log(`- Version            : ${report.version}`);
  console.log(`- Evaluated At       : ${report.evaluatedAt}`);
  console.log(`- DRI Score          : ${report.driScore} / 100.0`);
  console.log(`- Mandatory Threshold: ${report.thresholdRequired} / 100.0`);
  console.log(`- Status             : ${report.status}`);
  console.log(`\n[ATTESTATION EVIDENCE]`);
  console.log(`- Architecture Auth  : ${report.attestation.architectureAuthority}`);
  console.log(`- Security Authority : ${report.attestation.securityAuthority}`);
  console.log(`- Ratified           : ${report.attestation.ratified}`);
  console.log(`\n[CRITERIA BREAKDOWN]`);

  for (const c of report.evaluations) {
    console.log(`  [${c.status}] ${c.id.padEnd(32)}: ${c.name} (${c.score}/100, W:${c.weight}%)`);
  }

  const outputPath = path.resolve(process.cwd(), 'docs/distribution_readiness_report.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');

  // Generate Deterministic HTML Dashboard Report
  const htmlDashboardPath = HtmlDashboardGenerator.generate(report, process.cwd());

  console.log(`\n✅ DRI Report exported to: ${outputPath}`);
  console.log(`✅ Deterministic HTML Dashboard View generated at: ${htmlDashboardPath}`);

  if (report.driScore < report.thresholdRequired) {
    console.error(`\n❌ ERROR: DRI score (${report.driScore}) is below required threshold (${report.thresholdRequired}).`);
    if (require.main === module) {
      process.exit(1);
    }
  } else {
    console.log(`\n🎉 VERIFICATION SUCCESSFUL: DRI Score (${report.driScore}) >= ${report.thresholdRequired}.`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };

