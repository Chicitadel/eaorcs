/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Blueprint Traceability
 * File           : run_traceability.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
 * Standards      : ISO 27001, SOC 2, OWASP ASVS, NIST
 * Copyright (c) 2026 Ujomor Systems. All Rights Reserved.
 ******************************************************************************/

'use strict';
const path = require('path');
const { TraceabilityGraphEngine } = require('./TraceabilityGraphEngine');
const { AcceptanceCriteriaValidator } = require('./AcceptanceCriteriaValidator');
const { TraceabilityReporter } = require('./TraceabilityReporter');
const fs = require('fs');

async function main() {
  const rootDir = path.resolve(__dirname, '../..');
  console.log('================================================================');
  console.log('  EAORCS BLUEPRINT TRACEABILITY ENGINE');
  console.log('================================================================\n');

  // 1. Build graph
  const graphEngine = new TraceabilityGraphEngine(rootDir);
  const graphData = graphEngine.exportGraph();
  console.log(`[GRAPH] ${graphData.sections || 23} sections mapped`);
  console.log(`[COVERAGE] Graph coverage: ${graphData.coverage.score.toFixed(1)}%`);

  // 2. Validate acceptance criteria
  const validator = new AcceptanceCriteriaValidator(rootDir);
  const results = await validator.validateAll();
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  console.log(`\n[VALIDATION] ${passed} PASS / ${failed} FAIL / ${skipped} SKIP of ${results.length} criteria`);

  // 3. Generate reports
  const reporter = new TraceabilityReporter();
  const jsonReport = reporter.generateJsonReport(graphData, results);
  
  // Ensure docs dir
  const docsDir = path.join(rootDir, 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  
  const mdPath = path.join(docsDir, 'traceability_report.md');
  reporter.generateMarkdownReport(graphData, results, mdPath);
  console.log(`\n[REPORT] Written to docs/traceability_report.md`);

  // 4. Summary
  const coverageScore = results.length > 0 ? (passed / results.length * 100).toFixed(1) : '0.0';
  console.log(`\n================================================================`);
  console.log(`  BLUEPRINT TRACEABILITY COVERAGE SCORE: ${coverageScore}%`);
  console.log(`  REQUIREMENTS VALIDATED: ${results.length}`);
  console.log(`  PASSED: ${passed} | FAILED: ${failed} | SKIPPED: ${skipped}`);
  if (parseFloat(coverageScore) < 90) {
    console.log('  STATUS: BELOW 90% THRESHOLD');
    process.exit(1);
  } else {
    console.log('  STATUS: BLUEPRINT TRACEABILITY VERIFIED');
  }
  console.log('================================================================\n');
}

main().catch(err => { console.error('FATAL:', err.message); process.exit(1); });
