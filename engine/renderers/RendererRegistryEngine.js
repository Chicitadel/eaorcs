/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Plugin-Based Renderer Registry Engine
 * File           : RendererRegistryEngine.js
 * Version        : 2026.3.0-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

class RendererRegistryEngine {
    constructor(options = {}) {
        this.options = options;
        this.renderers = new Map();
        this._registerDefaultRenderers();
    }

    _registerDefaultRenderers() {
        const builtIns = [
            { id: 'render.console', name: 'Console Renderer', category: 'CLI' },
            { id: 'render.desktop', name: 'Desktop Renderer', category: 'GUI' },
            { id: 'render.web', name: 'Web Dashboard Renderer', category: 'WEB' },
            { id: 'render.ide', name: 'IDE Diagnostics Renderer', category: 'IDE' },
            { id: 'render.agent', name: 'Agent Protocol Renderer', category: 'AGENT' },
            { id: 'render.rest', name: 'REST API Renderer', category: 'API' },
            { id: 'render.flutter', name: 'Flutter Native Renderer', category: 'FLUTTER' }
        ];

        for (const r of builtIns) {
            this.registerRenderer(r);
        }
    }

    registerRenderer(rendererDescriptor) {
        if (!rendererDescriptor || !rendererDescriptor.id) {
            throw new Error('Invalid renderer descriptor');
        }
        this.renderers.set(rendererDescriptor.id, rendererDescriptor);
        return rendererDescriptor;
    }

    getRenderer(id) {
        return this.renderers.get(id);
    }

    listRenderers() {
        return Array.from(this.renderers.values());
    }
}

module.exports = RendererRegistryEngine;
