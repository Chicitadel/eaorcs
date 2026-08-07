/******************************************************************************
 * Project        : EAORCS
 * Module         : Distribution Audit Gate Engine
 * File           : engine/release/DistributionAuditGateEngine.js
 * Version        : 2026.3.0-LTS
 * Author         : Enterprise Architecture & Security Governance Board
 * Organization   : Air Roofers Governance Directorate
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
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
 * Copyright (c) 2026 Air Roofers Governance Directorate
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');

class DistributionAuditGateEngine {
  constructor(options = {}) {
    this.options = options;
    
    // Prohibited folder names in distributed release packages
    this.prohibitedDirectories = [
      'engine',
      'kernel',
      'governance',
      '.governance',
      'tests',
      'specifications',
      'blueprints',
      'internal',
      'architecture',
      'adr'
    ];

    // Prohibited file extensions & patterns in release packages
    this.prohibitedPatterns = [
      /\.map$/i,
      /\.test\.js$/i,
      /\.spec\.js$/i,
      /ADR-.*\.md$/i,
      /blueprints.*\.yaml$/i,
      /secret/i,
      /credentials/i
    ];

    // Allowed top-level directories in commercial distribution
    this.allowedTopDirectories = [
      'bin',
      'runtime',
      'sdk',
      'policies',
      'plugins',
      'examples',
      'docs',
      'licenses',
      'config',
      'public'
    ];
  }

  /**
   * Audit a directory structure against SDPA distribution compliance rules
   * @param {string} targetDir Absolute path to the build directory
   * @returns {Object} Audit summary report
   */
  auditDirectory(targetDir) {
    if (!fs.existsSync(targetDir)) {
      throw new Error(`Distribution Audit Failure: Target directory does not exist: ${targetDir}`);
    }

    const violations = [];
    const scannedEntries = [];

    const scan = (currentDir, relativePath = '') => {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const item of items) {
        const itemRelPath = path.join(relativePath, item.name).replace(/\\/g, '/');
        scannedEntries.push(itemRelPath);

        if (item.isDirectory()) {
          const dirName = item.name.toLowerCase();
          if (this.prohibitedDirectories.includes(dirName)) {
            violations.push({
              path: itemRelPath,
              type: 'PROHIBITED_DIRECTORY',
              reason: `Directory '${item.name}' contains private engineering implementation or blueprints.`
            });
          } else {
            scan(path.join(currentDir, item.name), itemRelPath);
          }
        } else if (item.isFile()) {
          for (const pattern of this.prohibitedPatterns) {
            if (pattern.test(item.name)) {
              violations.push({
                path: itemRelPath,
                type: 'PROHIBITED_FILE_PATTERN',
                reason: `File '${item.name}' matches prohibited distribution pattern (${pattern}).`
              });
              break;
            }
          }
        }
      }
    };

    scan(targetDir);

    const isPassed = violations.length === 0;

    return {
      status: isPassed ? 'PASSED' : 'FAILED_GATE',
      scannedPath: targetDir,
      totalScanned: scannedEntries.length,
      violationsCount: violations.length,
      violations,
      timestamp: new Date().toISOString(),
      governanceClearance: isPassed 
        ? 'APPROVED_FOR_COMMERCIAL_DISTRIBUTION' 
        : 'REJECTED_SDPA_PROTECTION_VIOLATION'
    };
  }
}

// Allow CLI execution if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const targetPath = args[0] || path.join(__dirname, '../../dist/EAORCS-Enterprise');
  const gate = new DistributionAuditGateEngine();

  console.log(`[SDPA] Initiating Distribution Audit Gate inspection on: ${targetPath}`);
  try {
    const report = gate.auditDirectory(targetPath);
    console.log(JSON.stringify(report, null, 2));
    if (report.status !== 'PASSED') {
      process.exit(1);
    }
  } catch (err) {
    console.error(`[SDPA GATE ERROR] ${err.message}`);
    process.exit(1);
  }
}

module.exports = DistributionAuditGateEngine;
