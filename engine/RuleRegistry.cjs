/******************************************************************************
 * Project        : EAORCS Engine
 * Module         : Analyzer Platform
 * File           : RuleRegistry.cjs
 * Version        : 1.0.0
 * Author         : UAIGOS
 * Organization   : Airroofers
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE | INTERNAL
 *
 * Governance:
 * - AI Governed
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Copyright (c) 2026 Airroofers
 * All Rights Reserved.
 ******************************************************************************/

class RuleRegistry {
    constructor() {
        this.rules = new Map();
    }

    registerRule(ruleId, version, ruleDefinition) {
        const key = `${ruleId}@${version}`;
        if (this.rules.has(key)) {
            throw new Error(`Rule ${key} is already registered.`);
        }
        this.rules.set(key, { ruleId, version, ruleDefinition });
    }

    getRule(ruleId, version) {
        const key = `${ruleId}@${version}`;
        return this.rules.get(key);
    }

    listRules() {
        return Array.from(this.rules.values());
    }

    removeRule(ruleId, version) {
        const key = `${ruleId}@${version}`;
        return this.rules.delete(key);
    }
}

module.exports = RuleRegistry;
