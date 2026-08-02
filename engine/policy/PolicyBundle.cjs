/**
 * @file PolicyBundle.cjs
 * @description Manages policy manifests (OWASP, ISO 27001, DORA) and provides rules for evaluation.
 *
 * Governance:
 * - AI Governed
 * - Security Reviewed
 * - Architecture Controlled
 */

class PolicyBundle {
  constructor(manifestPath) {
    this.manifestPath = manifestPath;
    this.policies = {
      OWASP: this._loadDefaultPolicy('OWASP'),
      ISO27001: this._loadDefaultPolicy('ISO27001'),
      DORA: this._loadDefaultPolicy('DORA')
    };
  }

  _loadDefaultPolicy(type) {
    // Defines baseline rules for evaluation against canonical findings.
    const basePolicies = {
      OWASP: {
        id: 'OWASP-10',
        deny: ['CRITICAL', 'HIGH'],
        warn: ['MEDIUM']
      },
      ISO27001: {
        id: 'ISO27001-ISMS',
        deny: ['CRITICAL'],
        warn: ['HIGH', 'MEDIUM']
      },
      DORA: {
        id: 'DORA-ICT',
        deny: ['CRITICAL', 'HIGH'],
        warn: ['MEDIUM', 'LOW']
      }
    };
    return basePolicies[type] || null;
  }

  getPolicy(policyId) {
    return this.policies[policyId] || null;
  }

  getAllPolicies() {
    return this.policies;
  }
}

module.exports = PolicyBundle;
