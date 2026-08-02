/**
 * @file FindingModel.cjs
 * @description Canonical finding schema for EAORCS. Standardizes findings from various analyzers.
 * 
 * Governance:
 * - AI Governed
 * - Security Reviewed
 * - Architecture Controlled
 */

class FindingModel {
  /**
   * @param {Object} data
   * @param {string} data.id - Unique identifier for the finding
   * @param {string} data.title - Title of the finding
   * @param {string} data.description - Description of the finding
   * @param {string} data.severity - Severity level (e.g., CRITICAL, HIGH, MEDIUM, LOW, INFO)
   * @param {string} data.source - Source analyzer (e.g., 'bandit', 'trufflehog', 'eslint')
   * @param {Object} data.location - Location object { file, line, column }
   * @param {Array<string>} data.tags - Tags for mapping (e.g., ['owasp', 'iso27001'])
   * @param {Object} data.raw - Raw finding data from the source analyzer
   */
  constructor(data) {
    this.id = data.id || `FND-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.title = data.title || 'Unknown Finding';
    this.description = data.description || '';
    this.severity = data.severity || 'INFO';
    this.source = data.source || 'unknown';
    this.location = data.location || {};
    this.tags = data.tags || [];
    this.raw = data.raw || null;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      severity: this.severity,
      source: this.source,
      location: this.location,
      tags: this.tags,
      raw: this.raw
    };
  }
}

module.exports = FindingModel;
