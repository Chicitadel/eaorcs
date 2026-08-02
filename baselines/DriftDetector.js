/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness Certification System (EAORCS)
 * Module         : Versioned Qualification Baselines (Stream Epsilon)
 * File           : DriftDetector.js
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

/**
 * Drift Analysis Engine
 * Evaluates documentation state drift against stored qualification baselines.
 */
class DriftDetector {
  /**
   * @param {Object} baselineManager Instance of BaselineManager
   */
  constructor(baselineManager) {
    if (!baselineManager) {
      throw new Error('DriftDetector requires a valid BaselineManager instance.');
    }
    this.baselineManager = baselineManager;
  }

  /**
   * Performs drift detection for a specified version.
   *
   * @param {string} version Target version to evaluate against
   * @param {string} docsDir Path to documentation directory
   * @returns {Object} Drift detection summary object
   */
  detect(version, docsDir = 'docs') {
    const compareResult = this.baselineManager.compare(version, docsDir);
    const summary = this.formatReport(compareResult);

    const getPath = f => (typeof f === 'string' ? f : f.relativePath);

    return {
      verdict: compareResult.verdict,
      driftCount: compareResult.driftCount,
      details: {
        added: compareResult.added.map(getPath),
        removed: compareResult.removed.map(getPath),
        changed: compareResult.changed.map(getPath)
      },
      summary
    };
  }

  /**
   * Formats comparison results into a Markdown report.
   *
   * @param {Object} driftResult Comparison or drift result object
   * @returns {string} Markdown-formatted report string
   */
  formatReport(driftResult) {
    const lines = [];
    const matchedCount = driftResult.matched ? driftResult.matched.length : 0;

    lines.push(`# EAORCS Baseline Drift Detection Report`);
    lines.push(``);
    lines.push(`- **Target Version**: \`${driftResult.version}\``);
    lines.push(`- **Verdict**: **\`${driftResult.verdict}\`**`);
    lines.push(`- **Matched Files**: ${matchedCount}`);
    lines.push(`- **Total Drift Count**: ${driftResult.driftCount}`);
    lines.push(``);

    if (driftResult.driftCount === 0) {
      lines.push(`> [!NOTE]`);
      lines.push(`> Baseline match verified. Zero drift detected across all qualification documents.`);
    } else {
      lines.push(`### Drift Details Table`);
      lines.push(``);
      lines.push(`| Change Type | Relative File Path | Description |`);
      lines.push(`|---|---|---|`);

      if (driftResult.added && driftResult.added.length > 0) {
        for (const item of driftResult.added) {
          const pathStr = typeof item === 'string' ? item : item.relativePath;
          lines.push(`| ADDED | \`${pathStr}\` | File present in workspace but absent from baseline |`);
        }
      }

      if (driftResult.removed && driftResult.removed.length > 0) {
        for (const item of driftResult.removed) {
          const pathStr = typeof item === 'string' ? item : item.relativePath;
          lines.push(`| REMOVED | \`${pathStr}\` | File present in baseline but absent from workspace |`);
        }
      }

      if (driftResult.changed && driftResult.changed.length > 0) {
        for (const item of driftResult.changed) {
          const pathStr = typeof item === 'string' ? item : item.relativePath;
          lines.push(`| CHANGED | \`${pathStr}\` | SHA-256 hash mismatch detected against baseline |`);
        }
      }
    }

    return lines.join('\n');
  }
}

module.exports = DriftDetector;
