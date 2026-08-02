/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Kernel / Feature Flags
 * File           : FeatureFlags.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
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
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

class FeatureFlags {
  constructor(initialFlags = {}) {
    this.flags = new Map();
    for (const [key, val] of Object.entries(initialFlags)) {
      this.setFlag(key, val);
    }
  }

  setFlag(flagName, value, rules = {}) {
    let enabled = false;
    if (typeof value === 'boolean') {
      enabled = value;
    } else if (typeof value === 'object' && value !== null) {
      enabled = !!value.enabled;
      rules = value.rules || rules;
    }

    this.flags.set(flagName, {
      enabled,
      rules,
      updatedAt: new Date().toISOString()
    });
    return this;
  }

  isEnabled(flagName, context = {}) {
    if (!this.flags.has(flagName)) {
      return false;
    }

    const flag = this.flags.get(flagName);
    if (!flag.enabled) return false;

    // Rule evaluation
    const { rules } = flag;
    if (rules.allowedTenants && context.tenant) {
      if (!rules.allowedTenants.includes(context.tenant)) return false;
    }

    if (rules.percentage && context.userId) {
      const hash = this._hashString(context.userId + flagName);
      if ((hash % 100) >= rules.percentage) return false;
    }

    if (rules.environment && context.environment) {
      if (rules.environment !== context.environment) return false;
    }

    return true;
  }

  getFlags() {
    const result = {};
    for (const [key, entry] of this.flags.entries()) {
      result[key] = entry.enabled;
    }
    return result;
  }

  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

module.exports = FeatureFlags;
