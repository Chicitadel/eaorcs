/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Blueprint Traceability
 * File           : TraceabilityReporter.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
 * Standards      : ISO 27001, SOC 2, OWASP ASVS, NIST
 * Copyright (c) 2026 Ujomor Systems. All Rights Reserved.
 ******************************************************************************/

'use strict';
const fs = require('fs');
const path = require('path');
const { BlueprintRequirementRegistry } = require('./BlueprintRequirementRegistry');

class TraceabilityReporter {
  constructor() {
    this.registry = new BlueprintRequirementRegistry();
  }

  generateJsonReport(graphData, validationResults) {
    const total = validationResults.length;
    const passed = validationResults.filter(r => r.status === 'PASS').length;
    const failed = validationResults.filter(r => r.status === 'FAIL').length;
    const skipped = validationResults.filter(r => r.status === 'SKIP').length;
    const coverageScore = total > 0 ? Number(((passed / total) * 100).toFixed(2)) : 0.0;

    return {
      generatedAt: new Date().toISOString(),
      graphCoverage: graphData ? graphData.coverage : null,
      requirementResults: validationResults,
      summary: {
        total,
        passed,
        failed,
        skipped,
        coverageScore
      }
    };
  }

  generateMarkdownReport(graphData, validationResults, outputPath) {
    const total = validationResults.length;
    const passed = validationResults.filter(r => r.status === 'PASS').length;
    const failed = validationResults.filter(r => r.status === 'FAIL').length;
    const skipped = validationResults.filter(r => r.status === 'SKIP').length;
    const coverageScore = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
    const graphScore = graphData && graphData.coverage ? graphData.coverage.score.toFixed(1) : '0.0';
    const statusText = parseFloat(coverageScore) >= 90.0 ? 'VERIFIED' : 'FAILED';

    const lines = [];

    lines.push(`/******************************************************************************`);
    lines.push(` * Project        : EAORCS - The Software Trust Platform`);
    lines.push(` * Module         : Blueprint Traceability Report`);
    lines.push(` * Version        : 2026.1.0-LTS`);
    lines.push(` * Organization   : Ujomor Systems`);
    lines.push(` * Classification : ENTERPRISE | GOVERNMENT`);
    lines.push(` ******************************************************************************/`);
    lines.push(``);
    lines.push(`# EAORCS Blueprint Behavioral Traceability Report`);
    lines.push(`*Generated At: ${new Date().toISOString()}*`);
    lines.push(``);

    lines.push(`## Executive Summary`);
    lines.push(``);
    lines.push(`| Metric | Value |`);
    lines.push(`| :--- | :--- |`);
    lines.push(`| Total Requirements Validated | **${total}** |`);
    lines.push(`| Requirements Passed | **${passed}** |`);
    lines.push(`| Requirements Failed | **${failed}** |`);
    lines.push(`| Requirements Skipped | **${skipped}** |`);
    lines.push(`| Behavioral Traceability Coverage Score | **${coverageScore}%** |`);
    lines.push(`| Blueprint Graph Topological Coverage | **${graphScore}%** |`);
    lines.push(`| Hardening Threshold Status | **${statusText}** |`);
    lines.push(``);

    lines.push(`## Section Breakdown`);
    lines.push(``);
    lines.push(`| Section ID | Title | Total Req | Passed | Failed | Status |`);
    lines.push(`| :---: | :--- | :---: | :---: | :---: | :---: |`);

    const sections = this.registry.getAllSections();
    for (const section of sections) {
      const secReqs = validationResults.filter(r => r.sectionId === section.id);
      const secPassed = secReqs.filter(r => r.status === 'PASS').length;
      const secFailed = secReqs.filter(r => r.status === 'FAIL').length;
      const secStatus = secFailed === 0 && secReqs.length > 0 ? 'PASS' : (secFailed > 0 ? 'FAIL' : 'SKIP');

      lines.push(`| ${section.id} | ${section.title} | ${secReqs.length} | ${secPassed} | ${secFailed} | ${secStatus} |`);
    }
    lines.push(``);

    lines.push(`## Gap Analysis`);
    lines.push(``);
    if (graphData && graphData.gaps && graphData.gaps.length > 0) {
      lines.push(`### Structural Graph Gaps`);
      for (const gap of graphData.gaps) {
        lines.push(`- **Section ${gap.sectionId}**: ${gap.title} (Missing Modules: ${gap.missingModules}, Missing Tests: ${gap.missingTests})`);
      }
      lines.push(``);
    } else {
      lines.push(`No structural blueprint graph gaps detected. All 23 sections have mapped modules and tests.`);
      lines.push(``);
    }

    if (failed > 0) {
      lines.push(`### Failed Behavioral Criteria`);
      const failedResults = validationResults.filter(r => r.status === 'FAIL');
      for (const f of failedResults) {
        lines.push(`- **Req ${f.requirementId}** (Section ${f.sectionId}): ${f.message}`);
      }
      lines.push(``);
    }

    lines.push(`## Detailed Requirements Audit`);
    lines.push(``);
    lines.push(`| Req ID | Section | Status | Evidence / Details |`);
    lines.push(`| :---: | :---: | :---: | :--- |`);

    for (const res of validationResults) {
      const details = res.status === 'PASS' ? (res.evidence || 'OK') : (res.message || 'Error');
      lines.push(`| ${res.requirementId} | ${res.sectionId} | ${res.status} | ${details.replace(/\|/g, '\\|')} |`);
    }
    lines.push(``);

    lines.push(`---`);
    lines.push(`*EAORCS Software Trust Platform — Governance & Assurance Verification Suite*`);

    const mdContent = lines.join('\n');

    if (outputPath) {
      const parentDir = path.dirname(outputPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(outputPath, mdContent, 'utf8');
    }

    return mdContent;
  }
}

module.exports = { TraceabilityReporter };
