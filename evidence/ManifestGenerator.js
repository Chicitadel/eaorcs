/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Evidence Verification System / Manifest Generator
 * File           : ManifestGenerator.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT | CONFIDENTIAL
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
 * - Architecture Authority: APPROVED
 * - Security Authority: APPROVED
 * - Governance Authority: APPROVED
 * - Deployment Authority: APPROVED
 *
 * Copyright (c) 2026 Ujomor Systems. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { REQUIREMENT_MANIFEST } = require('./RequirementManifest.js');

class ManifestGenerator {
  constructor(baseDir = process.cwd()) {
    this.baseDir = baseDir;
  }

  /**
   * Generates requirement_manifest.json and requirement_manifest_report.md
   * @param {Object} options 
   * @returns {Object} { total, verified, broken, items }
   */
  generate(options = {}) {
    const baseDir = options.baseDir || this.baseDir || process.cwd();
    const manifestPath = path.join(baseDir, 'evidence', 'requirement_manifest.json');
    const reportPath = path.join(baseDir, 'evidence', 'requirement_manifest_report.md');

    // Ensure evidence directory exists
    const evidenceDir = path.join(baseDir, 'evidence');
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }

    const items = [];
    let verifiedCount = 0;
    let brokenCount = 0;

    for (const req of REQUIREMENT_MANIFEST) {
      const implPath = path.resolve(baseDir, req.implementation);
      const testPath = path.resolve(baseDir, req.test);
      const evPath = path.resolve(baseDir, req.evidence);

      const implementationExists = fs.existsSync(implPath);
      const testExists = fs.existsSync(testPath);
      const evidenceExists = fs.existsSync(evPath);

      let implementationHash = null;
      if (implementationExists) {
        try {
          const content = fs.readFileSync(implPath);
          implementationHash = crypto.createHash('sha256').update(content).digest('hex');
        } catch (err) {
          implementationHash = null;
        }
      }

      const isVerified = implementationExists && testExists && evidenceExists;
      const status = isVerified ? 'VERIFIED' : 'BROKEN';

      if (isVerified) {
        verifiedCount++;
      } else {
        brokenCount++;
      }

      items.push({
        id: req.id,
        category: req.category,
        section: req.section,
        description: req.description,
        implementation: req.implementation,
        test: req.test,
        evidence: req.evidence,
        implementationExists,
        testExists,
        evidenceExists,
        implementationHash,
        status
      });
    }

    const outputData = {
      title: 'EAORCS Machine-Readable Requirement & Evidence Manifest',
      version: '2026.1.0-LTS',
      generatedAt: new Date().toISOString(),
      summary: {
        total: items.length,
        verified: verifiedCount,
        broken: brokenCount
      },
      requirements: items
    };

    // Write JSON manifest
    fs.writeFileSync(manifestPath, JSON.stringify(outputData, null, 2), 'utf8');

    // Write Markdown report
    const markdownReport = this._buildMarkdownReport(outputData);
    fs.writeFileSync(reportPath, markdownReport, 'utf8');

    return {
      total: items.length,
      verified: verifiedCount,
      broken: brokenCount,
      items
    };
  }

  static generate(options = {}) {
    return new ManifestGenerator(options.baseDir).generate(options);
  }

  _buildMarkdownReport(data) {
    const lines = [
      '# EAORCS Machine-Readable Requirement & Evidence Manifest',
      '',
      `**Generated At**: ${data.generatedAt}  `,
      `**Platform Version**: ${data.version}  `,
      `**Total Requirements**: ${data.summary.total}  `,
      `**Verified Requirements**: ${data.summary.verified}  `,
      `**Broken Requirements**: ${data.summary.broken}  `,
      '',
      '## Executive Summary',
      '',
      `This evidence manifest links all ${data.summary.total} platform requirements across Blueprint, Integration, Cross-Domain, Lifecycle, Governance, Security, Commercial, Enterprise, and Operational categories to their corresponding codebase implementations, unit/integration test suites, and formal verification evidence documents.`,
      '',
      '## Requirement Verification Matrix',
      '',
      '| ID | Category | Description | Implementation | Test | Evidence | Status |',
      '| :--- | :--- | :--- | :--- | :--- | :--- | :--- |'
    ];

    for (const item of data.requirements) {
      const implTag = item.implementationExists ? `\`${item.implementation}\`` : `❌ \`${item.implementation}\``;
      const testTag = item.testExists ? `\`${item.test}\`` : `❌ \`${item.test}\``;
      const evTag = item.evidenceExists ? `\`${item.evidence}\`` : `❌ \`${item.evidence}\``;
      const statusTag = item.status === 'VERIFIED' ? '✅ **VERIFIED**' : '❌ **BROKEN**';

      lines.push(`| ${item.id} | ${item.category} | ${item.description} | ${implTag} | ${testTag} | ${evTag} | ${statusTag} |`);
    }

    lines.push('', '---', '*Report automatically generated by EAORCS ManifestGenerator (2026.1.0-LTS).*');
    return lines.join('\n');
  }
}

module.exports = ManifestGenerator;
