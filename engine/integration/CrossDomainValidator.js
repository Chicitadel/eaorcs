/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Cross-Domain Integration Verification / CrossDomainValidator
 * File           : CrossDomainValidator.js
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

const RULES = [
  {
    id: 'CDR-01',
    origin: 'Support',
    target: 'Products',
    allowed: ['GET /v1/products'],
    prohibited: ['direct_db_query', 'direct DB query to products table']
  },
  {
    id: 'CDR-02',
    origin: 'Support',
    target: 'Identity',
    allowed: ['GET /v1/identity/verify'],
    prohibited: ['store_user_passwords', 'modify_roles', 'store user passwords or modify roles']
  },
  {
    id: 'CDR-03',
    origin: 'Support',
    target: 'Workspace',
    allowed: ['GET /v1/workspace/{id}'],
    prohibited: ['create_workspaces', 'delete_workspaces', 'create or delete workspaces']
  },
  {
    id: 'CDR-04',
    origin: 'Support',
    target: 'Licensing',
    allowed: ['GET /v1/licensing/check'],
    prohibited: ['issue_license_keys', 'renew_license_keys', 'issue or renew license keys']
  },
  {
    id: 'CDR-05',
    origin: 'Support',
    target: 'Downloads',
    allowed: ['GET /v1/downloads/link'],
    prohibited: ['host_binary_files', 'host binary files on Support disk']
  },
  {
    id: 'CDR-06',
    origin: 'Support',
    target: 'Billing',
    allowed: ['GET /v1/billing/status'],
    prohibited: ['process_credit_cards', 'issue_invoices', 'process credit cards or issue invoices']
  },
  {
    id: 'CDR-07',
    origin: 'Support',
    target: 'Notifications',
    allowed: ['async_events'],
    prohibited: ['configure_raw_smtp', 'configure raw SMTP servers']
  },
  {
    id: 'CDR-08',
    origin: 'Support',
    target: 'Operations',
    allowed: ['async_events', 'api_poll'],
    prohibited: ['scrape_system_metrics', 'scrape host node system metrics']
  }
];

class CrossDomainValidator {
  static get RULES() {
    return RULES;
  }

  constructor() {
    this.rules = RULES;
  }

  validateInteraction(origin, target, action) {
    if (!origin || !target || !action) {
      return { compliant: false, violation: 'Origin, target, and action must be specified.' };
    }

    const rule = this.rules.find(
      r => r.origin.toLowerCase() === origin.toLowerCase() && r.target.toLowerCase() === target.toLowerCase()
    );

    if (!rule) {
      return { compliant: true };
    }

    const actionLower = action.toLowerCase();
    const isProhibited = rule.prohibited.some(p => {
      const pLower = p.toLowerCase();
      return actionLower.includes(pLower) || pLower.includes(actionLower);
    });

    if (isProhibited) {
      return {
        compliant: false,
        violation: `Rule ${rule.id}: Action '${action}' is prohibited for ${rule.origin} -> ${rule.target}`
      };
    }

    return { compliant: true };
  }

  validateAllRules() {
    const results = this.rules.map(rule => {
      const testAllowed = rule.allowed.length > 0 ? rule.allowed[0] : 'valid_action';
      const check = this.validateInteraction(rule.origin, rule.target, testAllowed);
      return {
        id: rule.id,
        origin: rule.origin,
        target: rule.target,
        status: check.compliant ? 'PASS' : 'FAIL',
        allowed: rule.allowed,
        prohibited: rule.prohibited
      };
    });

    const passed = results.filter(r => r.status === 'PASS').length;
    return {
      totalRules: this.rules.length,
      passed,
      failed: this.rules.length - passed,
      results
    };
  }

  detectDriftPatterns(codebaseDescriptor) {
    const interactions = Array.isArray(codebaseDescriptor)
      ? codebaseDescriptor
      : (codebaseDescriptor && codebaseDescriptor.interactions) || [];

    const violations = [];
    let totalScanned = 0;

    for (const item of interactions) {
      totalScanned++;
      const result = this.validateInteraction(item.origin, item.target, item.action);
      if (!result.compliant) {
        violations.push({
          origin: item.origin,
          target: item.target,
          action: item.action,
          violation: result.violation
        });
      }
    }

    return {
      totalScanned,
      driftDetected: violations.length > 0,
      violations
    };
  }
}

module.exports = CrossDomainValidator;
module.exports.CrossDomainValidator = CrossDomainValidator;
module.exports.RULES = RULES;
