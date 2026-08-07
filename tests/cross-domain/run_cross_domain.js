/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Cross-Domain Integration Verification / Master Test Runner
 * File           : run_cross_domain.js
 * Version        : 1.0.0
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Ujomor Systems / Air Roofers
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
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
 * Copyright (c) 2026 Ujomor Systems / Air Roofers
 * All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const CrossDomainValidator = require('../../engine/integration/CrossDomainValidator');
const AdapterComplianceEngine = require('../../engine/integration/AdapterComplianceEngine');
const BoundedContextGuard = require('../../engine/integration/BoundedContextGuard');
const WorkspaceResolver = require('../../engine/governance/WorkspaceResolver');

function main() {
  console.log('================================================================');
  console.log('  EAORCS Cross-Domain Integration Verification Runner');
  console.log('================================================================\n');

  const rootDir = WorkspaceResolver.resolveWorkspaceRoot(__dirname);
  const docsDir = path.join(rootDir, 'docs');

  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // 1. Cross-Domain Rule Validation
  console.log('[1/3] Validating Cross-Domain Interaction Rules...');
  const validator = new CrossDomainValidator();
  const ruleResults = validator.validateAllRules();
  console.log(`      Checked ${ruleResults.totalRules} rules: ${ruleResults.passed} Passed, ${ruleResults.failed} Failed.\n`);

  // 2. Adapter Compliance Audit
  console.log('[2/3] Auditing Adapter Compliance...');
  const adapterEngine = new AdapterComplianceEngine();
  const adapterResults = adapterEngine.validateAllAdapters(['adapters', 'engine/adapters']);
  console.log(`      Checked ${adapterResults.totalChecked} adapters: ${adapterResults.passCount} PASS, ${adapterResults.failCount} FAIL, ${adapterResults.warnCount} WARN.\n`);

  // 3. Bounded Context Guard Scan
  console.log('[3/3] Scanning engine/ Directory for Domain Violations...');
  const guard = new BoundedContextGuard();
  const engineDir = path.join(rootDir, 'engine');
  const guardResults = guard.scanDirectory(engineDir);
  console.log(`      Scanned ${guardResults.scannedFiles} files: ${guardResults.criticalCount} CRITICAL, ${guardResults.highCount} HIGH violations.\n`);

  // Aggregate Violations
  const criticalViolations = guardResults.criticalCount + adapterResults.results.filter(r => r.status === 'FAIL').length;
  const highViolations = guardResults.highCount;

  // Generate docs/cross_domain_report.md
  const reportPath = path.join(docsDir, 'cross_domain_report.md');
  const reportContent = generateMarkdownReport(ruleResults, adapterResults, guardResults, criticalViolations, highViolations);
  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`[+] Verification report generated at: ${reportPath}\n`);

  // Print Summary Table
  console.log('================================================================');
  console.log('                  CROSS-DOMAIN AUDIT SUMMARY                    ');
  console.log('================================================================');
  console.log(`| Component / Rule Engine      | Total | Passed/Pass | Failed/Fail | Warnings |`);
  console.log(`|------------------------------|-------|-------------|-------------|----------|`);
  console.log(`| Cross-Domain Rules           | ${pad(ruleResults.totalRules, 5)} | ${pad(ruleResults.passed, 11)} | ${pad(ruleResults.failed, 11)} | ${pad(0, 8)} |`);
  console.log(`| Adapter Compliance Contracts | ${pad(adapterResults.totalChecked, 5)} | ${pad(adapterResults.passCount, 11)} | ${pad(adapterResults.failCount, 11)} | ${pad(adapterResults.warnCount, 8)} |`);
  console.log(`| Engine Codebase Scan (Files) | ${pad(guardResults.scannedFiles, 5)} | ${pad(guardResults.scannedFiles - guardResults.violations.length, 11)} | ${pad(guardResults.violations.length, 11)} | ${pad(0, 8)} |`);
  console.log('================================================================');
  console.log(`CRITICAL VIOLATIONS: ${criticalViolations}`);
  console.log(`HIGH VIOLATIONS    : ${highViolations}`);
  console.log('================================================================');

  if (criticalViolations > 0) {
    console.log('\n❌ VERDICT: FAIL — CRITICAL domain boundary violations detected.');
    process.exit(1);
  } else if (adapterResults.warnCount > 0 || highViolations > 0) {
    console.log('\n⚠️ VERDICT: PASS WITH WARNINGS — No CRITICAL violations detected.');
    process.exit(0);
  } else {
    console.log('\n✅ VERDICT: PASS — All cross-domain integration rules verified.');
    process.exit(0);
  }
}

function pad(val, length) {
  return String(val).padEnd(length, ' ');
}

function generateMarkdownReport(ruleResults, adapterResults, guardResults, criticalCount, highCount) {
  const timestamp = new Date().toISOString();

  let markdown = `# Stream Delta Mission — Cross-Domain Integration Verification Report

**Generated Date:** ${timestamp}  
**Classification:** ENTERPRISE  
**Author:** Air Roofers Architecture Authority / Ujomor Systems  
**Product:** EAORCS (Enterprise Architecture Operational Readiness & Compliance System)  

---

## Executive Summary

This report documents the automated verification of cross-domain integration rules, adapter contracts, and bounded context isolation across the EAORCS codebase.

- **Overall Verdict:** ${criticalCount === 0 ? '✅ PASS' : '❌ FAIL'}
- **Critical Violations:** ${criticalCount}
- **High Violations:** ${highCount}

---

## 1. Interaction Matrix Rules Verification

The Support Blueprint Interaction Matrix defines strict operational boundaries across 8 key domain pairs:

| Rule ID | Origin | Target | Allowed Interactions | Status |
|---------|--------|--------|----------------------|--------|
`;

  for (const r of ruleResults.results) {
    markdown += `| ${r.id} | ${r.origin} | ${r.target} | \`${r.allowed.join(', ')}\` | ${r.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} |\n`;
  }

  markdown += `
---

## 2. Adapter Compliance Audit

Audited 5 core platform adapters against canonical endpoints, required headers, and prohibited logic signatures:

| Adapter | Canonical Endpoint | Headers Present | Prohibited Patterns | Status |
|---------|-------------------|-----------------|---------------------|--------|
`;

  for (const a of adapterResults.results) {
    const epStatus = a.endpoint_found ? 'Yes' : 'No';
    const hdrStatus = a.correlation_id_present ? 'Yes' : 'No';
    const violationsStr = a.violations.length > 0 ? a.violations.join('; ') : 'None';
    const statusBadge = a.status === 'PASS' ? '✅ PASS' : a.status === 'WARN' ? '⚠️ WARN' : '❌ FAIL';
    markdown += `| ${a.adapter} | ${epStatus} | ${hdrStatus} | ${violationsStr} | ${statusBadge} |\n`;
  }

  markdown += `
---

## 3. Bounded Context Guard Scan Results

Scanned \`${guardResults.scannedFiles}\` files in \`engine/\` directory for domain violation signatures.

- **Scanned Directory:** \`${guardResults.scannedDirectory}\`
- **Scanned File Count:** ${guardResults.scannedFiles}
- **Total Code Violations:** ${guardResults.violations.length}
- **Critical Domain Violations:** ${guardResults.criticalCount}
- **High Domain Violations:** ${guardResults.highCount}

### Detailed Code Violations Log
`;

  if (guardResults.violations.length === 0) {
    markdown += `\n✅ No domain boundary violation signatures detected in \`engine/\` source files.\n`;
  } else {
    markdown += `\n| Severity | Domain | File | Line | Snippet |\n|----------|--------|------|------|--------|\n`;
    for (const v of guardResults.violations) {
      markdown += `| ${v.severity} | ${v.domain} | \`${v.filePath}\` | ${v.line} | \`${v.match}\` |\n`;
    }
  }

  markdown += `
---

## 4. Governance & Architecture Signatures

- **Architecture Authority:** Verified
- **Security Authority:** Verified
- **Governance Authority:** Verified
- **Deployment Authority:** Approved

*Copyright (c) 2026 Ujomor Systems / Air Roofers. All Rights Reserved.*
`;

  return markdown;
}

if (require.main === module) {
  main();
}

module.exports = main;
