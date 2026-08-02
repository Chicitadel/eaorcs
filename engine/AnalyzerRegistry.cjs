/******************************************************************************
 * Project        : EAORCS Engine
 * Module         : Analyzer Platform
 * File           : AnalyzerRegistry.cjs
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

class AnalyzerRegistry {
    constructor() {
        this.analyzers = new Map();
    }

    register(name, version, analyzerClass) {
        if (typeof name === 'object' && name.name) {
            const instance = name;
            const key = `${instance.name}@${instance.version || '1.0.0'}`;
            this.analyzers.set(key, instance);
            return;
        }
        const key = `${name}@${version}`;
        if (this.analyzers.has(key)) {
            throw new Error(`Analyzer ${key} is already registered.`);
        }
        this.analyzers.set(key, { name, version, analyzerClass });
    }

    get(name, version) {
        const key = `${name}@${version}`;
        return this.analyzers.get(key);
    }

    list() {
        return Array.from(this.analyzers.values());
    }

    remove(name, version) {
        const key = `${name}@${version}`;
        return this.analyzers.delete(key);
    }
}

module.exports = AnalyzerRegistry;
