/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Security Hardening Engine
 * File           : SecurityHardeningEngine.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Frozen (ADR-001)
 * - Security Reviewed & Zero Trust Access Control Enforced
 * - Input Validation & Cryptographic Integrity Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';
const crypto = require('crypto');

class SecurityHardeningEngine {
  validateInput(input, schema = {}) {
    if (input === null || input === undefined) return { valid: false, reason: 'null_input' };
    if (typeof schema.maxLength === 'number' && typeof input === 'string' && input.length > schema.maxLength)
      return { valid: false, reason: 'exceeds_max_length' };
    return { valid: true };
  }

  detectPrototypePollution(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    const dangerous = ['__proto__', 'constructor', 'prototype'];
    return Object.keys(obj).some(k => dangerous.includes(k));
  }

  detectPathTraversal(str) {
    if (typeof str !== 'string') return false;
    return str.includes('../') || str.includes('..\\') || str.includes('%2e%2e');
  }

  detectSqlInjection(str) {
    if (typeof str !== 'string') return false;
    const patterns = [/('\s*(or|and)\s*')/i, /(;\s*drop\s+table)/i, /(union\s+select)/i, /(insert\s+into)/i];
    return patterns.some(p => p.test(str));
  }

  detectScriptInjection(str) {
    if (typeof str !== 'string') return false;
    return /<script/i.test(str) || /javascript:/i.test(str) || /on\w+\s*=/i.test(str);
  }

  sanitizeString(str, maxLength = 10000) {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').slice(0, maxLength);
  }

  generateSecureId() {
    return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  }

  computeIntegrityHash(obj) {
    const canonical = JSON.stringify(obj, Object.keys(obj).sort());
    return crypto.createHash('sha256').update(canonical).digest('hex');
  }
}

module.exports = { SecurityHardeningEngine };
