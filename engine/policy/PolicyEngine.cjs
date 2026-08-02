/**
 * @file PolicyEngine.cjs
 * @description Evaluates canonical findings against policy bundles to render decisions (PASS/WARN/FAIL/UNKNOWN).
 *
 * Governance:
 * - AI Governed
 * - Security Reviewed
 * - Architecture Controlled
 */

const PolicyBundle = require('./PolicyBundle.cjs');

class PolicyEngine {
  constructor(bundleOptions = {}) {
    this.bundle = new PolicyBundle(bundleOptions.manifestPath);
  }

  /**
   * Evaluates a single finding against a specific policy.
   * @param {Object} finding - The canonical finding to evaluate
   * @param {string} policyId - The policy to evaluate against (e.g., 'OWASP', 'ISO27001', 'DORA')
   * @returns {Object} Decision object { findingId, policyId, decision: 'PASS' | 'WARN' | 'FAIL' | 'UNKNOWN', reason }
   */
  evaluateFinding(finding, policyId) {
    const policy = this.bundle.getPolicy(policyId);
    if (!policy) {
      return { findingId: finding.id, policyId, decision: 'UNKNOWN', reason: `Policy ${policyId} not found.` };
    }

    const severity = (finding.severity || '').toUpperCase();

    if (policy.deny && policy.deny.includes(severity)) {
      return { findingId: finding.id, policyId, decision: 'FAIL', reason: `Severity ${severity} violates deny rule.` };
    }

    if (policy.warn && policy.warn.includes(severity)) {
      return { findingId: finding.id, policyId, decision: 'WARN', reason: `Severity ${severity} triggers warning.` };
    }

    return { findingId: finding.id, policyId, decision: 'PASS', reason: 'Finding meets policy requirements.' };
  }

  /**
   * Evaluates an array of findings against multiple policies.
   * @param {Array<Object>} findings 
   * @param {Array<string>} policyIds 
   * @returns {Object} Comprehensive evaluation report
   */
  evaluateAll(findings, policyIds = ['OWASP', 'ISO27001', 'DORA']) {
    const results = [];
    
    findings.forEach(finding => {
      policyIds.forEach(policyId => {
        results.push(this.evaluateFinding(finding, policyId));
      });
    });

    const summary = {
      PASS: results.filter(r => r.decision === 'PASS').length,
      WARN: results.filter(r => r.decision === 'WARN').length,
      FAIL: results.filter(r => r.decision === 'FAIL').length,
      UNKNOWN: results.filter(r => r.decision === 'UNKNOWN').length,
    };

    return {
      summary,
      details: results
    };
  }

  evaluate(findings, policyIds = ['OWASP', 'ISO27001', 'DORA']) {
    const report = this.evaluateAll(findings, policyIds);
    const hasFailures = report.summary.FAIL > 0;
    return {
      decision: hasFailures ? 'FAIL' : 'PASS',
      summary: report.summary,
      violations: report.details.filter(d => d.decision === 'FAIL'),
      report
    };
  }
}

module.exports = PolicyEngine;
