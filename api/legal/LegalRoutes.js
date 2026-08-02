/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : api/legal
 * File           : LegalRoutes.js
 * Version        : 2026.1.0-GA
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const LegalRegistryEngine = require('../../engine/legal/LegalRegistryEngine');

class LegalRoutes {
    constructor(options = {}) {
        this.registryEngine = new LegalRegistryEngine(options);
    }

    getDocuments() {
        const registry = this.registryEngine.loadRegistry();
        return { status: 200, data: registry.documents };
    }

    getLatest() {
        const registry = this.registryEngine.loadRegistry();
        return { status: 200, version: registry.version || registry.registryVersion || '1.0.0', lastUpdated: registry.lastUpdated };
    }

    getTerms() {
        const registry = this.registryEngine.loadRegistry();
        const doc = registry.documents.find(d => d.id === 'doc-trm-01');
        return { status: 200, data: doc };
    }

    getPrivacy() {
        const registry = this.registryEngine.loadRegistry();
        const doc = registry.documents.find(d => d.id === 'doc-prv-01');
        return { status: 200, data: doc };
    }

    getLicenses() {
        const registry = this.registryEngine.loadRegistry();
        const doc = registry.documents.find(d => d.id === 'doc-lic-01');
        return { status: 200, data: doc };
    }

    getSignatures() {
        const registry = this.registryEngine.loadRegistry();
        const signatures = registry.documents.map(d => ({ id: d.id, title: d.title, signature: d.signature }));
        return { status: 200, data: signatures };
    }

    handleRequest(reqPath) {
        if (reqPath === '/documents' || reqPath === '/api/v1/legal/documents') return this.getDocuments();
        if (reqPath === '/latest' || reqPath === '/api/v1/legal/latest') return this.getLatest();
        if (reqPath === '/terms' || reqPath === '/api/v1/legal/terms') return this.getTerms();
        if (reqPath === '/privacy' || reqPath === '/api/v1/legal/privacy') return this.getPrivacy();
        if (reqPath === '/licenses' || reqPath === '/api/v1/legal/licenses') return this.getLicenses();
        if (reqPath === '/signatures' || reqPath === '/api/v1/legal/signatures') return this.getSignatures();
        return { status: 404, error: 'Not Found' };
    }
}

module.exports = LegalRoutes;
