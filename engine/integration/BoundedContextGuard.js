/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Cross-Domain Integration Verification / BoundedContextGuard
 * File           : BoundedContextGuard.js
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

const VIOLATION_SIGNATURES = [
  { pattern: /issueInvoice|createInvoice|chargeCard/i, domain: 'Billing', severity: 'CRITICAL' },
  { pattern: /createUser|storePassword|updateRole/i, domain: 'Identity', severity: 'CRITICAL' },
  { pattern: /issueLicense|renewLicense|generateLicenseKey/i, domain: 'Licensing', severity: 'CRITICAL' },
  { pattern: /scrapeSystemMetrics|collectNodeMetrics/i, domain: 'Operations', severity: 'HIGH' },
  { pattern: /hostBinaryFile|serveArtifact|storeDownload/i, domain: 'Downloads', severity: 'HIGH' },
  { pattern: /configureSmtp|sendRawEmail/i, domain: 'Notifications', severity: 'HIGH' }
];

class BoundedContextGuard {
  static get VIOLATION_SIGNATURES() {
    return VIOLATION_SIGNATURES;
  }

  constructor() {
    this.signatures = VIOLATION_SIGNATURES;
  }

  scanContent(content, filePath = 'inline') {
    if (typeof content !== 'string') {
      return { filePath, violations: [] };
    }

    const lines = content.split('\n');
    const violations = [];

    lines.forEach((line, index) => {
      for (const sig of this.signatures) {
        const match = line.match(sig.pattern);
        if (match) {
          violations.push({
            filePath,
            line: index + 1,
            domain: sig.domain,
            severity: sig.severity,
            match: match[0],
            lineContent: line.trim()
          });
        }
      }
    });

    return { filePath, violations };
  }

  scanFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return { filePath, violations: [], error: 'File not found' };
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return this.scanContent(content, filePath);
    } catch (err) {
      return { filePath, violations: [], error: err.message };
    }
  }

  scanDirectory(dirPath, excludes = ['node_modules', '.git', 'dist', 'build', 'coverage', 'scratch', 'integration']) {
    const rootPath = path.isAbsolute(dirPath) ? dirPath : path.resolve(process.cwd(), dirPath);
    const fileResults = [];
    const allViolations = [];
    let scannedFiles = 0;

    const walk = (currentDir) => {
      if (!fs.existsSync(currentDir)) return;

      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (excludes.includes(entry.name)) continue;
          walk(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.js', '.cjs', '.mjs', '.ts'].includes(ext)) {
            scannedFiles++;
            const result = this.scanFile(fullPath);
            fileResults.push(result);
            if (result.violations && result.violations.length > 0) {
              allViolations.push(...result.violations);
            }
          }
        }
      }
    };

    walk(rootPath);

    return {
      scannedDirectory: rootPath,
      scannedFiles,
      violations: allViolations,
      criticalCount: allViolations.filter(v => v.severity === 'CRITICAL').length,
      highCount: allViolations.filter(v => v.severity === 'HIGH').length,
      fileResults
    };
  }

  generateViolationReport(results) {
    const violations = Array.isArray(results) ? results : (results && results.violations) || [];
    const scannedFiles = results && typeof results.scannedFiles === 'number' ? results.scannedFiles : 'N/A';

    const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
    const highViolations = violations.filter(v => v.severity === 'HIGH');

    const reportLines = [
      '# Bounded Context Violation Report',
      `\n**Total Files Scanned:** ${scannedFiles}`,
      `**Total Violations Found:** ${violations.length}`,
      `**CRITICAL Violations:** ${criticalViolations.length}`,
      `**HIGH Violations:** ${highViolations.length}\n`,
      '## Breakdown by Severity\n'
    ];

    if (violations.length === 0) {
      reportLines.push('✅ No domain boundary violations detected.');
    } else {
      if (criticalViolations.length > 0) {
        reportLines.push('### 🚨 CRITICAL Violations');
        criticalViolations.forEach(v => {
          reportLines.push(`- **Domain [${v.domain}]** in \`${v.filePath}\` (Line ${v.line}): Matched \`${v.match}\``);
        });
        reportLines.push('');
      }

      if (highViolations.length > 0) {
        reportLines.push('### ⚠️ HIGH Violations');
        highViolations.forEach(v => {
          reportLines.push(`- **Domain [${v.domain}]** in \`${v.filePath}\` (Line ${v.line}): Matched \`${v.match}\``);
        });
        reportLines.push('');
      }
    }

    return {
      summary: {
        scannedFiles,
        totalViolations: violations.length,
        criticalCount: criticalViolations.length,
        highCount: highViolations.length
      },
      markdown: reportLines.join('\n'),
      criticalViolations,
      highViolations
    };
  }
}

module.exports = BoundedContextGuard;
module.exports.BoundedContextGuard = BoundedContextGuard;
module.exports.VIOLATION_SIGNATURES = VIOLATION_SIGNATURES;
