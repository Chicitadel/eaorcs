/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Dynamic Runtime Report Path Resolver
 * File           : ReportPathResolver.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved & FROZEN (v1.1.0-FROZEN)
 * - Security & Compliance Reviewed (ISO 27001, SOC 2, OWASP ASVS, NIST, DORA, NIS2, EU AI Act)
 * - UAIGOS 3.0.0 Protocol Compliant
 *
 * Standards:
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161 / DORA / NIS2 / EU AI Act / SLSA Level 4
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');

class ReportPathResolver {
  /**
   * Dynamically resolves and creates the output directory for audit reports at runtime.
   * Precedence:
   * 1. Custom options.outputDir or CLI --output-dir argument
   * 2. Environment variable EAORCS_REPORT_DIR
   * 3. Dynamic Run ID: <baseDir>/reports/run_<timestamp>_<hash>/
   *
   * @param {string} baseDir Base product or ecosystem directory
   * @param {Object} options Dynamic runtime execution options ({ outputDir, runId })
   * @returns {Object} { reportDir, runId, isLatestPointerUpdated }
   */
  static resolve(baseDir, options = {}) {
    const timestampStr = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const randomHash = Math.random().toString(36).substring(2, 7);
    const runId = options.runId || `run_${timestampStr}_${randomHash}`;

    let reportDir;

    if (options.outputDir) {
      reportDir = path.resolve(options.outputDir);
    } else if (process.env.EAORCS_REPORT_DIR) {
      reportDir = path.resolve(process.env.EAORCS_REPORT_DIR, runId);
    } else {
      reportDir = path.join(baseDir, 'reports', runId);
    }

    // Create target directory dynamically on-demand
    fs.mkdirSync(reportDir, { recursive: true });

    // Dynamically update latest pointer metadata (latest.json)
    const baseReportsDir = path.dirname(reportDir);
    const latestPointerFile = path.join(baseReportsDir, 'latest.json');
    const latestMeta = {
      latestRunId: runId,
      latestReportDir: reportDir,
      updatedAt: new Date().toISOString()
    };

    try {
      if (fs.existsSync(baseReportsDir)) {
        fs.writeFileSync(latestPointerFile, JSON.stringify(latestMeta, null, 2), 'utf8');
      }
    } catch (err) {
      // Non-blocking pointer update
    }

    return {
      reportDir,
      runId,
      latestPointerFile
    };
  }
}

module.exports = ReportPathResolver;
